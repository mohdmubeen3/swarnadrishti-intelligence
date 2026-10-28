import argparse
import csv
import hashlib
import json
import logging
from pathlib import Path
from datetime import datetime
from typing import Optional

from db.session import SessionLocal, init_db
from db.models import HistoricalTrade, PairSummary, DataImport, ValidationRun

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("swarnadrishti.importer")

BASE_DIR = Path(__file__).resolve().parent
DEFAULT_CSV = BASE_DIR / "data" / "walk_forward_spread_trades.csv"

EXPECTED_HEADERS = [
    "Pair", "ExpiryDate", "EntryDate", "ExitDate", "Direction",
    "EntryZ", "ExitZ", "HoldingObservations", "EntryLogSpread",
    "ExitLogSpread", "GrossSpreadChangePct", "EstimatedCostPct",
    "NetSpreadChangePct", "ExitReason"
]

VALID_EXIT_REASONS = {
    "Mean Reversion", "Max Holding", "Expiry Buffer", "End of Segment", "Stop Loss"
}


def compute_file_sha256(file_path: Path) -> str:
    sha = hashlib.sha256()
    with file_path.open("rb") as f:
        while chunk := f.read(65536):
            sha.update(chunk)
    return sha.hexdigest()


def generate_trade_key(row: dict) -> str:
    raw = f"{row['Pair']}_{row['ExpiryDate']}_{row['EntryDate']}_{row['ExitDate']}_{row['Direction']}_{row['NetSpreadChangePct']}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:24]


def validate_trade_rows(rows: list[dict]) -> tuple[bool, list[str], dict]:
    issues = []
    pairs = set()
    exit_reason_counts = {}
    entry_zs = []
    exit_zs = []

    for i, row in enumerate(rows, start=1):
        pair = row.get("Pair", "").strip()
        if not pair:
            issues.append(f"Row {i}: Missing pair")
        pairs.add(pair)

        try:
            entry_z = float(row.get("EntryZ", 0))
            exit_z = float(row.get("ExitZ", 0))
            entry_zs.append(entry_z)
            exit_zs.append(exit_z)
            if abs(entry_z) >= 4.0:
                issues.append(f"Row {i} ({pair}): Entry Z-score {entry_z} exceeds guard |z| < 4")
            if abs(exit_z) > 4.0:
                issues.append(f"Row {i} ({pair}): Exit Z-score {exit_z} exceeds guard |z| <= 4")
        except ValueError:
            issues.append(f"Row {i}: Invalid numeric Z-score")

        entry_date = row.get("EntryDate", "").strip()
        exit_date = row.get("ExitDate", "").strip()
        expiry_date = row.get("ExpiryDate", "").strip()

        if exit_date > expiry_date:
            issues.append(f"Row {i} ({pair}): Trade exited after expiry ({exit_date} > {expiry_date})")

        reason = row.get("ExitReason", "").strip()
        if reason not in VALID_EXIT_REASONS:
            issues.append(f"Row {i}: Unrecognized exit reason '{reason}'")
        exit_reason_counts[reason] = exit_reason_counts.get(reason, 0) + 1

    checks_summary = {
        "tradeCount": len(rows),
        "pairCount": len(pairs),
        "pairs": sorted(list(pairs)),
        "exitReasonCounts": exit_reason_counts,
        "entryZMin": min(entry_zs) if entry_zs else None,
        "entryZMax": max(entry_zs) if entry_zs else None,
        "exitZMin": min(exit_zs) if exit_zs else None,
        "exitZMax": max(exit_zs) if exit_zs else None,
    }

    status = "PASS" if not issues else "FAIL"
    return (status == "PASS"), issues, checks_summary


def compute_pair_summary(trades: list[dict]) -> dict:
    total = len(trades)
    if total == 0:
        return {}

    net_returns = [t["net_spread_change_pct"] for t in trades]
    wins = sum(1 for r in net_returns if r > 0)
    total_net = sum(net_returns)
    mean_net = total_net / total

    # Additive cumulative proxy drawdown
    cum = 0.0
    peak = 0.0
    max_dd = 0.0
    for r in net_returns:
        cum += r
        if cum > peak:
            peak = cum
        dd = cum - peak
        if dd < max_dd:
            max_dd = dd

    exit_counts = {r: 0 for r in VALID_EXIT_REASONS}
    for t in trades:
        reason = t["exit_reason"]
        if reason in exit_counts:
            exit_counts[reason] += 1

    return {
        "pair": trades[0]["pair"],
        "trades": total,
        "win_rate_pct": (wins / total) * 100.0,
        "total_net_return_pct": total_net,
        "mean_net_return_pct": mean_net,
        "max_drawdown_pct": max_dd,
        "mean_reversion_exits": exit_counts["Mean Reversion"],
        "stop_loss_exits": exit_counts["Stop Loss"],
        "expiry_buffer_exits": exit_counts["Expiry Buffer"],
        "max_holding_exits": exit_counts["Max Holding"],
        "end_of_segment_exits": exit_counts["End of Segment"],
    }


def import_historical_trades(csv_file: Optional[Path] = None) -> dict:
    csv_path = Path(csv_file) if csv_file else DEFAULT_CSV
    if not csv_path.exists():
        raise FileNotFoundError(f"Source trade CSV not found at: {csv_path}")

    logger.info("Starting ingestion of canonical trade log: %s", csv_path)
    file_sha = compute_file_sha256(csv_path)
    logger.info("File SHA-256: %s", file_sha)

    # Read CSV rows
    rows = []
    with csv_path.open("r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append({k.strip(): v.strip() for k, v in row.items()})

    # Validate against baseline guardrails
    is_valid, issues, checks = validate_trade_rows(rows)
    if not is_valid:
        logger.error("Validation failed with %d issues: %s", len(issues), issues)
        raise ValueError(f"CSV validation failed: {'; '.join(issues[:5])}")

    init_db()
    db = SessionLocal()

    try:
        # Check idempotency: check if identical hash is already recorded
        existing_import = db.query(DataImport).filter(DataImport.file_sha256 == file_sha).first()
        is_reimport = existing_import is not None

        # Build trade objects
        trade_dicts_by_pair = {}
        inserted_count = 0
        updated_count = 0

        for r in rows:
            trade_key = generate_trade_key(r)
            trade_data = {
                "trade_key": trade_key,
                "pair": r["Pair"],
                "expiry_date": r["ExpiryDate"],
                "entry_date": r["EntryDate"],
                "exit_date": r["ExitDate"],
                "direction": r["Direction"],
                "entry_z": float(r["EntryZ"]),
                "exit_z": float(r["ExitZ"]),
                "holding_observations": int(r["HoldingObservations"]),
                "entry_log_spread": float(r["EntryLogSpread"]),
                "exit_log_spread": float(r["ExitLogSpread"]),
                "gross_spread_change_pct": float(r["GrossSpreadChangePct"]),
                "estimated_cost_pct": float(r["EstimatedCostPct"]),
                "net_spread_change_pct": float(r["NetSpreadChangePct"]),
                "exit_reason": r["ExitReason"],
                "raw_row_json": json.dumps(r),
            }

            existing_trade = db.query(HistoricalTrade).filter(HistoricalTrade.trade_key == trade_key).first()
            if existing_trade:
                for k, v in trade_data.items():
                    setattr(existing_trade, k, v)
                updated_count += 1
            else:
                db.add(HistoricalTrade(**trade_data))
                inserted_count += 1

            trade_dicts_by_pair.setdefault(r["Pair"], []).append(trade_data)

        db.flush()

        # Compute and persist PairSummaries
        for pair_name, pair_trades in trade_dicts_by_pair.items():
            summary_data = compute_pair_summary(pair_trades)
            existing_summary = db.query(PairSummary).filter(PairSummary.pair == pair_name).first()
            if existing_summary:
                for k, v in summary_data.items():
                    setattr(existing_summary, k, v)
            else:
                db.add(PairSummary(**summary_data))

        # Record validation run
        report_payload = {
            "status": "PASS",
            "sourceFile": str(csv_path),
            "sourceSHA256": file_sha,
            "tradeCount": len(rows),
            "pairCount": len(trade_dicts_by_pair),
            "checks": checks,
            "issues": issues,
            "generatedAtUTC": datetime.utcnow().isoformat(),
        }
        val_run = ValidationRun(
            status="PASS",
            trade_count=len(rows),
            pair_count=len(trade_dicts_by_pair),
            report_json=json.dumps(report_payload),
        )
        db.add(val_run)

        # Record data import
        import_record = DataImport(
            source_file=str(csv_path.name),
            file_sha256=file_sha,
            row_count=len(rows),
            pair_count=len(trade_dicts_by_pair),
            validation_status="PASS",
            data_mode="historical_backtest",
            notes=f"Inserted: {inserted_count}, Updated/Preserved: {updated_count}, Total: {len(rows)}",
        )
        db.add(import_record)

        db.commit()
        logger.info(
            "Import successfully committed to database: %d trades, %d pairs (Inserted: %d, Updated: %d)",
            len(rows), len(trade_dicts_by_pair), inserted_count, updated_count
        )

        return {
            "status": "PASS",
            "fileSHA256": file_sha,
            "tradeCount": len(rows),
            "pairCount": len(trade_dicts_by_pair),
            "inserted": inserted_count,
            "updated": updated_count,
            "isReimport": is_reimport,
            "pairs": list(trade_dicts_by_pair.keys()),
        }
    except Exception as exc:
        db.rollback()
        logger.error("Database transaction rolled back due to error: %s", exc)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Import canonical historical spread trades into SwarnaDrishti database.")
    parser.add_argument("--file", type=Path, default=DEFAULT_CSV, help="Path to walk_forward_spread_trades.csv")
    args = parser.parse_args()

    res = import_historical_trades(args.file)
    print(json.dumps(res, indent=2))
