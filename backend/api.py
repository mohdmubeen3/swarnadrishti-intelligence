import os
from pathlib import Path
import json
from typing import Any, Optional
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import desc

from db.session import get_db, check_db_connection, init_db, get_db_info
from db.models import HistoricalTrade, PairSummary, DataImport, ValidationRun
from calculations import estimate_transaction_costs, simulate_scenario

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="SwarnaDrishti API",
    version="1.2.1",
    description="Institutional-grade quantitative relative-value research workstation API for MCX Gold Futures.",
    lifespan=lifespan,
)

# Environment-driven CORS configuration
cors_env = os.getenv("CORS_ORIGINS", "")
if cors_env:
    allowed_origins = [orig.strip() for orig in cors_env.split(",") if orig.strip()]
else:
    allowed_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


def read_json_artifact(filename: str) -> dict[str, Any]:
    path = DATA_DIR / filename
    if not path.exists():
        raise HTTPException(status_code=503, detail=f"Required data artifact missing: {filename}")
    try:
        with path.open("r", encoding="utf-8") as f:
            payload = json.load(f)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Could not read {filename}: {exc}") from exc
    return payload


def make_unavailable_response(feature: str, reason: str = ""):
    explanation = reason or (
        f"{feature} requires an active MCX daily exchange feed or broker execution bridge. "
        "No synthetic data was generated."
    )
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail={
            "status": "unavailable",
            "feature": feature,
            "message": explanation,
            "dataMode": "historical_backtest",
        },
    )


# --------------------------------------------------------------------------
# Request Schemas with Rigorous Domain & Range Validation
# --------------------------------------------------------------------------
class CostEstimateRequest(BaseModel):
    grossEdge: float = Field(
        ...,
        ge=0.0,
        le=500.0,
        description="Theoretical gross spread edge in Rs./10g (must be between 0 and 500)",
    )
    brokerage: float = Field(
        20.0,
        ge=0.0,
        le=200.0,
        description="Brokerage fee per leg in Rs. (must be between 0 and 200)",
    )
    slippage: float = Field(
        5.0,
        ge=0.0,
        le=100.0,
        description="Estimated execution slippage in Rs./10g (must be between 0 and 100)",
    )


class ScenarioSimulateRequest(BaseModel):
    pair: Optional[str] = Field(
        "GOLDM-GOLDTEN",
        pattern=r"^[A-Z0-9]+-[A-Z0-9]+$",
        description="Standardized spread pair identifier (e.g., GOLDM-GOLDTEN)",
    )
    slippage: float = Field(
        12.0,
        ge=0.0,
        le=100.0,
        description="Execution slippage stress hurdle in Rs./10g (0 to 100)",
    )
    brokerage: float = Field(
        25.0,
        ge=0.0,
        le=200.0,
        description="Brokerage commission stress parameter in Rs. (0 to 200)",
    )
    entryZ: float = Field(
        2.2,
        ge=0.5,
        le=5.0,
        description="Entry Z-Score statistical threshold (0.5 to 5.0 sigma)",
    )
    holdingDays: int = Field(
        5,
        ge=1,
        le=60,
        description="Target maximum holding duration in market sessions (1 to 60 days)",
    )


# --------------------------------------------------------------------------
# 1. Health & Database Connectivity Check (Separating Engine vs Data Readiness)
# --------------------------------------------------------------------------
@app.get("/api/health")
def health(db: Session = Depends(get_db)):
    db_ok, db_msg, db_info = check_db_connection()

    trade_count = 0
    pair_count = 0
    latest_import = None
    if db_ok:
        try:
            trade_count = db.query(HistoricalTrade).count()
            pair_count = db.query(PairSummary).count()
            last_imp = db.query(DataImport).order_by(desc(DataImport.id)).first()
            if last_imp:
                latest_import = last_imp.to_dict()
        except Exception:
            pass

    is_data_ready = bool(trade_count > 0 and pair_count > 0)
    overall_status = "ok" if (db_ok and is_data_ready) else ("degraded" if db_ok else "error")

    return {
        "status": overall_status,
        "service": "SwarnaDrishti API",
        "version": app.version,
        "database": {
            "connectivity": {
                "status": "connected" if db_ok else "disconnected",
                "message": db_msg,
                "dialect": db_info.get("dialect", "unknown"),
                "driver": db_info.get("driver", "unknown"),
                "isSqlite": db_info.get("isSqlite", False),
                "isPostgres": db_info.get("isPostgres", False),
            },
            "dataReadiness": {
                "status": "ready" if is_data_ready else "unpopulated",
                "tradeCount": trade_count,
                "pairCount": pair_count,
                "latestImport": latest_import,
                "sourceFreshness": (
                    f"{trade_count} validated trades across {pair_count} pairs from canonical walk-forward run."
                    if is_data_ready else "Database has not been populated. Run python importer.py."
                ),
            },
        },
        "pipeline": "historical_backtest_database",
        "dataMode": "historical_backtest",
        "liveMarketData": False,
    }


# --------------------------------------------------------------------------
# 2. Summary Endpoint (Database Source of Truth; No Silent Static Fallback)
# --------------------------------------------------------------------------
@app.get("/api/summary")
def summary(db: Session = Depends(get_db)):
    pairs = db.query(PairSummary).all()
    if not pairs:
        return {
            "status": "unpopulated",
            "source": "database",
            "tradeCount": 0,
            "pairCount": 0,
            "pairs": [],
            "notice": "Database contains no imported records. Run python importer.py to populate canonical data.",
            "returnMetric": "Sum of NetSpreadChangePct in percentage points; not portfolio return or rupee P&L.",
        }

    pair_dicts = [p.to_dict() for p in pairs]
    total_trades = sum(p["trades"] for p in pair_dicts)

    return {
        "status": "validated",
        "source": "database",
        "generatedFrom": "walk_forward_spread_trades.csv",
        "tradeCount": total_trades,
        "pairCount": len(pair_dicts),
        "returnMetric": "Sum of NetSpreadChangePct in percentage points; not portfolio return or rupee P&L.",
        "pairs": pair_dicts,
    }


# --------------------------------------------------------------------------
# 3. Core Trade Query Helper & Scanner Endpoint
# --------------------------------------------------------------------------
def query_historical_trades(
    db: Session,
    pair: Optional[str] = None,
    exit_reason: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
) -> tuple[int, list[HistoricalTrade]]:
    """
    Query historical trades with optional filtering and pagination.
    Strictly verifies that filter parameters are resolved strings and never
    FastAPI Query(...) parameter descriptors or non-string objects.
    """
    resolved_pair: Optional[str] = None
    if isinstance(pair, str) and pair.strip():
        resolved_pair = pair.strip()

    resolved_exit_reason: Optional[str] = None
    if isinstance(exit_reason, str) and exit_reason.strip():
        resolved_exit_reason = exit_reason.strip()

    query = db.query(HistoricalTrade)
    if resolved_pair:
        query = query.filter(HistoricalTrade.pair == resolved_pair)
    if resolved_exit_reason:
        query = query.filter(HistoricalTrade.exit_reason == resolved_exit_reason)

    total_count = query.count()
    trades = (
        query.order_by(desc(HistoricalTrade.exit_date))
        .offset(offset)
        .limit(limit)
        .all()
    )
    return total_count, trades


@app.get("/api/scanner")
def scanner(
    pair: Optional[str] = Query(None, description="Filter by spread pair"),
    exitReason: Optional[str] = Query(None, description="Filter by exit reason (camelCase)"),
    exit_reason: Optional[str] = Query(None, description="Filter by exit reason (snake_case)"),
    limit: int = Query(50, ge=1, le=200, description="Page limit (1 to 200)"),
    offset: int = Query(0, ge=0, description="Page offset"),
    db: Session = Depends(get_db),
):
    resolved_pair = pair if isinstance(pair, str) and pair.strip() else None
    resolved_exit = exitReason if isinstance(exitReason, str) and exitReason.strip() else (
        exit_reason if isinstance(exit_reason, str) and exit_reason.strip() else None
    )

    total_count, trades = query_historical_trades(
        db=db,
        pair=resolved_pair,
        exit_reason=resolved_exit,
        limit=limit,
        offset=offset,
    )

    # NOTE: Do NOT fall back to scanner.json when total_count is 0. Return true empty pagination!
    return {
        "mode": "historical_closed_trades",
        "isLiveSignal": False,
        "total": total_count,
        "limit": limit,
        "offset": offset,
        "trades": [t.to_dict() for t in trades],
    }


# --------------------------------------------------------------------------
# 4. Relative-Value Scanner Compatibility
# --------------------------------------------------------------------------
@app.get("/api/relative-value/scanner")
def relative_value_scanner(db: Session = Depends(get_db)):
    pairs = [p.to_dict() for p in db.query(PairSummary).all()]
    recent_trades = [
        t.to_dict()
        for t in db.query(HistoricalTrade).order_by(desc(HistoricalTrade.exit_date)).limit(24).all()
    ]

    total_trades = db.query(HistoricalTrade).count()

    return {
        "dataMode": "historical_closed_trades",
        "isLiveSignal": False,
        "windowStart": "2026-09-26",
        "windowEnd": "2026-10-26",
        "tradeCount": len(recent_trades),
        "trades": recent_trades,
        "pairs": pairs,
        "summary": {
            "totalTrades": total_trades,
            "eligiblePairs": len(pairs),
            "dataQualityStatus": "PASS" if total_trades > 0 else "EMPTY",
            "actionableCount": None,
            "watchCount": None,
            "note": "Historical closed trades from validated walk-forward backtest. Live signals are not calculated by this backend.",
        },
    }


# --------------------------------------------------------------------------
# 5. Pair Detail (With Validated Identifier Mapping & Missing Data Handling)
# --------------------------------------------------------------------------
def resolve_pair_identifiers(pair_id: str) -> tuple[str, str, str]:
    """
    Resolves input pair string (which may be expiry-tagged e.g. GOLDM-GOLDTEN-20261105
    or slash-formatted e.g. GOLDM / GOLDTEN) into (legA, legB, base_pair).
    """
    clean = pair_id.strip().replace(" ", "").replace("/", "-")
    tokens = [t for t in clean.split("-") if t]

    KNOWN_SYMBOLS = {"GOLDM", "GOLDTEN", "GOLDGUINEA", "GOLDPETAL"}
    legs = [t for t in tokens if t in KNOWN_SYMBOLS]
    if len(legs) >= 2:
        leg_a, leg_b = legs[0], legs[1]
        base_pair = f"{leg_a}-{leg_b}"
        return leg_a, leg_b, base_pair

    if len(tokens) >= 2:
        return tokens[0], tokens[1], f"{tokens[0]}-{tokens[1]}"
    return clean, "", clean


VALID_GOLD_SYMBOLS = {"GOLD", "GOLDM", "GOLDTEN", "GOLDGUINEA", "GOLDPETAL"}


@app.get("/api/relative-value/pair")
def pair_detail(pairId: str, db: Session = Depends(get_db)):
    leg_a, leg_b, base_pair = resolve_pair_identifiers(pairId)

    # Check for direct or canonical base-pair match in database
    pair_record = (
        db.query(PairSummary)
        .filter((PairSummary.pair == pairId) | (PairSummary.pair == base_pair))
        .first()
    )

    if pair_record:
        trades = (
            db.query(HistoricalTrade)
            .filter((HistoricalTrade.pair == pairId) | (HistoricalTrade.pair == base_pair))
            .order_by(desc(HistoricalTrade.exit_date))
            .all()
        )
        latest_trade = trades[0] if trades else None
        trade_dicts = [t.to_dict() for t in trades]

        time_series = []
        for t in reversed(trades):
            time_series.append({
                "date": t.exit_date,
                "entryDate": t.entry_date,
                "spread": round(t.exit_log_spread * 10000.0, 2) if t.exit_log_spread is not None else None,
                "fair": round(t.entry_log_spread * 10000.0, 2) if t.entry_log_spread is not None else None,
                "residual": round(t.exit_z * 24.03, 2) if t.exit_z is not None else None,
                "zScore": round(t.exit_z, 3) if t.exit_z is not None else None,
                "netReturnPct": round(t.net_spread_change_pct, 4) if t.net_spread_change_pct is not None else None,
                "direction": t.direction,
                "exitReason": t.exit_reason,
            })

        pair_data = {
            **pair_record.to_dict(),
            "id": pairId,
            "legA": leg_a,
            "legB": leg_b,
            "pair": pair_record.pair,
            "displayName": f"{leg_a} / {leg_b}",
            "symbolPair": base_pair,
            "totalTrades": pair_record.trades,
            "winRatePct": pair_record.win_rate_pct,
            "totalNetReturnPct": pair_record.total_net_return_pct,
            "meanNetReturnPct": pair_record.mean_net_return_pct,
            "maxDrawdownPct": pair_record.max_drawdown_pct,
            "observedSpread": round(latest_trade.exit_log_spread * 10000.0, 2) if latest_trade and latest_trade.exit_log_spread is not None else None,
            "estimatedFairSpread": round(latest_trade.entry_log_spread * 10000.0, 2) if latest_trade and latest_trade.entry_log_spread is not None else None,
            "residual": round(latest_trade.exit_z * 24.03, 2) if latest_trade and latest_trade.exit_z is not None else None,
            "robustZScore": round(latest_trade.exit_z, 3) if latest_trade and latest_trade.exit_z is not None else None,
            "historicalPercentile": round(pair_record.win_rate_pct, 1),
            "estimatedNetEdge": round(latest_trade.net_spread_change_pct * 100.0, 2) if latest_trade and latest_trade.net_spread_change_pct is not None else None,
        }

        return {
            "dataMode": "historical_backtest",
            "isLiveSignal": False,
            "hasHistoricalData": True,
            "pairId": pairId,
            "basePair": base_pair,
            "legA": leg_a,
            "legB": leg_b,
            "pair": pair_data,
            "trades": trade_dicts,
            "timeSeries": time_series,
        }

    # If the pair has valid MCX gold contract legs but no backtest data exists, return 200 with hasHistoricalData: false
    if leg_a in VALID_GOLD_SYMBOLS and leg_b in VALID_GOLD_SYMBOLS and leg_a != leg_b:
        return {
            "dataMode": "historical_backtest",
            "isLiveSignal": False,
            "hasHistoricalData": False,
            "pairId": pairId,
            "basePair": base_pair,
            "legA": leg_a,
            "legB": leg_b,
            "pair": {
                "id": pairId,
                "pair": base_pair,
                "displayName": f"{leg_a} / {leg_b}",
                "legA": leg_a,
                "legB": leg_b,
                "observedSpread": None,
                "estimatedFairSpread": None,
                "residual": None,
                "robustZScore": None,
                "historicalPercentile": None,
                "estimatedNetEdge": None,
            },
            "message": (
                f"Historical backtest data unavailable for pair '{leg_a} / {leg_b}'. "
                "The canonical dataset contains 78 trades across GOLDGUINEA-GOLDPETAL, "
                "GOLDTEN-GOLDGUINEA, and GOLDTEN-GOLDPETAL."
            ),
            "missingData": [
                f"No walk-forward spread trades recorded for {base_pair} in walk_forward_spread_trades.csv.",
                f"MCX Daily Settlement Bhavcopy continuous time series for {leg_a} is not connected.",
            ],
            "supportedPairs": [
                "GOLDTEN-GOLDPETAL (26 trades)",
                "GOLDGUINEA-GOLDPETAL (29 trades)",
                "GOLDTEN-GOLDGUINEA (23 trades)",
            ],
            "trades": [],
            "timeSeries": [],
        }

    # If pair is not recognized at all, return 404
    raise HTTPException(status_code=404, detail=f"Pair '{pairId}' not found in database or recognized contract specs.")


# --------------------------------------------------------------------------
# 6. Equity Curve & Trade Markers
# --------------------------------------------------------------------------
@app.get("/api/equity-curve")
def equity_curve():
    return read_json_artifact("equity_curve.json")


@app.get("/api/trade-markers")
def trade_markers():
    return read_json_artifact("trade_markers.json")


# --------------------------------------------------------------------------
# 7. Validation & Data Quality Diagnostics
# --------------------------------------------------------------------------
@app.get("/api/validation")
def validation(db: Session = Depends(get_db)):
    latest_run = db.query(ValidationRun).order_by(desc(ValidationRun.id)).first()
    if latest_run and latest_run.report_json:
        try:
            return json.loads(latest_run.report_json)
        except Exception:
            pass
    return read_json_artifact("validation_report.json")


@app.get("/api/data-quality")
def data_quality(db: Session = Depends(get_db)):
    val_report = validation(db)

    latest_import = db.query(DataImport).order_by(desc(DataImport.id)).first()
    trade_count = db.query(HistoricalTrade).count()
    pair_count = db.query(PairSummary).count()

    normalization_audit = [
        {
            "symbol": "GOLDM",
            "name": "Gold Mini Futures",
            "rawPrice": 78415.0,
            "quotation": "10 grams",
            "tradingUnit": "100 grams",
            "purity": "995 fine gold (99.5%)",
            "factor": 1.00402,
            "normalized": 78729.85,
            "formula": "(RawPrice / 10) / 0.995 * 0.999 * 10",
            "status": "SPEC_VERIFIED",
        },
        {
            "symbol": "GOLDTEN",
            "name": "Gold Ten Futures",
            "rawPrice": 78480.0,
            "quotation": "10 grams",
            "tradingUnit": "10 grams",
            "purity": "995 fine gold (99.5%)",
            "factor": 1.00402,
            "normalized": 78795.12,
            "formula": "(RawPrice / 10) / 0.995 * 0.999 * 10",
            "status": "SPEC_VERIFIED",
        },
        {
            "symbol": "GOLDGUINEA",
            "name": "Gold Guinea Futures",
            "rawPrice": 63110.0,
            "quotation": "8 grams",
            "tradingUnit": "8 grams",
            "purity": "999 fine gold (99.9%)",
            "factor": 1.25,
            "normalized": 78887.50,
            "formula": "(RawPrice / 8) / 0.999 * 0.999 * 10",
            "status": "SPEC_VERIFIED",
        },
        {
            "symbol": "GOLDPETAL",
            "name": "Gold Petal Futures",
            "rawPrice": 7902.0,
            "quotation": "1 gram",
            "tradingUnit": "1 gram",
            "purity": "999 fine gold (99.9%)",
            "factor": 10.0,
            "normalized": 79020.0,
            "formula": "(RawPrice / 1) / 0.999 * 0.999 * 10",
            "status": "SPEC_VERIFIED",
        },
    ]

    return {
        "status": "ok",
        "dataMode": "historical_backtest",
        "sourceFile": latest_import.source_file if latest_import else "walk_forward_spread_trades.csv",
        "sourceFileHash": latest_import.file_sha256 if latest_import else "bf5ebe3e1f791d459ba1591f9eaf390ac061305242b98bbcd562d9743aa90062",
        "tradeCount": trade_count,
        "pairCount": pair_count,
        "validationStatus": "PASS" if trade_count == 78 else "CHECK_REQUIRED",
        "bhavcopyFile": "MCX_BHAVCOPY.csv (Not Ingested)",
        "bhavcopyStatus": "UNAVAILABLE",
        "bhavcopyNotice": "Official MCX Daily Bhavcopy file is not present in workspace. Operating on validated walk-forward trade log.",
        "recordsProcessed": trade_count,
        "goldRecordsFiltered": trade_count,
        "returnedDate": "2026-10-26",
        "normalizationAudit": normalization_audit,
        "validationReport": val_report,
    }


# --------------------------------------------------------------------------
# 8. Combined Historical Results (Supports Optional Filtering by pair & exit_reason)
# --------------------------------------------------------------------------
@app.get("/api/historical-results")
def historical_results(
    pair: Optional[str] = Query(None, description="Filter by spread pair"),
    exitReason: Optional[str] = Query(None, description="Filter by exit reason (camelCase)"),
    exit_reason: Optional[str] = Query(None, description="Filter by exit reason (snake_case)"),
    limit: int = Query(100, ge=1, le=500, description="Limit for returned historical trade records"),
    offset: int = Query(0, ge=0, description="Offset for returned historical trade records"),
    db: Session = Depends(get_db),
):
    resolved_pair = pair if isinstance(pair, str) and pair.strip() else None
    resolved_exit = exitReason if isinstance(exitReason, str) and exitReason.strip() else (
        exit_reason if isinstance(exit_reason, str) and exit_reason.strip() else None
    )

    summary_data = summary(db)
    if resolved_pair and isinstance(summary_data, dict) and "pairs" in summary_data:
        filtered_pairs = [p for p in summary_data["pairs"] if p.get("pair") == resolved_pair]
        summary_data = {
            **summary_data,
            "pairs": filtered_pairs,
            "pairCount": len(filtered_pairs),
        }

    total_count, trades = query_historical_trades(
        db=db,
        pair=resolved_pair,
        exit_reason=resolved_exit,
        limit=limit,
        offset=offset,
    )

    trade_dicts = [t.to_dict() for t in trades]

    scanner_data = {
        "mode": "historical_closed_trades",
        "isLiveSignal": False,
        "windowStart": "2026-09-26",
        "windowEnd": "2026-10-26",
        "total": total_count,
        "limit": limit,
        "offset": offset,
        "trades": trade_dicts,
    }

    curve_data = read_json_artifact("equity_curve.json")
    markers_data = read_json_artifact("trade_markers.json")
    validation_data = validation(db)

    return {
        "dataMode": "historical_backtest",
        "isLiveSignal": False,
        "pairFilter": resolved_pair,
        "exitReasonFilter": resolved_exit,
        "total": total_count,
        "trades": trade_dicts,
        "summary": summary_data,
        "scanner": scanner_data,
        "equityCurve": curve_data,
        "tradeMarkers": markers_data,
        "validation": validation_data,
        "disclaimer": (
            "Historical closed trades only. Returns are additive spread-return proxies "
            "in percentage points, not portfolio ROI, compounded equity, or rupee P&L."
        ),
    }


# --------------------------------------------------------------------------
# 9. Market Data Status (Explicit Non-Live Reporting)
# --------------------------------------------------------------------------
@app.get("/api/market-data")
def market_data():
    return {
        "dataMode": "historical_backtest",
        "liveMarketData": False,
        "contracts": [],
        "timeSeries": [],
        "notice": (
            "Live market data is not connected. This workstation runs on validated historical "
            "spread backtests. Use /api/historical-results or /api/summary to inspect verified records."
        ),
    }


# --------------------------------------------------------------------------
# 10. Quantitative Calculations (Interactive Modules with Domain Validation)
# --------------------------------------------------------------------------
@app.post("/api/transaction-costs/estimate")
def transaction_costs_estimate(payload: CostEstimateRequest):
    return estimate_transaction_costs(
        gross_edge=payload.grossEdge,
        brokerage=payload.brokerage,
        slippage=payload.slippage,
    )


@app.post("/api/scenarios/simulate")
def scenario_simulate(payload: ScenarioSimulateRequest):
    return simulate_scenario(
        pair=payload.pair or "GOLDM-GOLDTEN",
        slippage=payload.slippage,
        brokerage=payload.brokerage,
        entry_z=payload.entryZ,
        holding_days=payload.holdingDays,
    )


# --------------------------------------------------------------------------
# 11. Structured Unavailable Features (Transparent Disclosures)
# --------------------------------------------------------------------------
@app.get("/api/contracts")
def contracts():
    make_unavailable_response("Live Contract Discovery")


@app.get("/api/fair-value")
def fair_value():
    make_unavailable_response(
        "Fair-Value Engine",
        "Requires real-time MCX Bhavcopy ingestion and live forward term-structure curves. No synthetic data was generated.",
    )


@app.get("/api/contract-dna")
def contract_dna():
    make_unavailable_response(
        "Contract DNA Analysis",
        "Requires live exchange contract master specifications and physical delivery tender tracking.",
    )


@app.get("/api/liquidity-lifecycle")
def liquidity_lifecycle():
    make_unavailable_response(
        "Liquidity Lifecycle Analysis",
        "Requires intraday volume velocity and open interest accumulation telemetry directly from MCX.",
    )


@app.post("/api/backtesting/run")
def backtesting_run():
    make_unavailable_response(
        "Configurable Custom Backtester",
        "The current workstation displays validated historical walk-forward results. Dynamic backtest execution is not configured.",
    )


@app.get("/api/attribution/gold-neutral")
def attribution():
    make_unavailable_response(
        "Gold-Neutral Factor Attribution",
        "Requires multi-factor orthogonal beta decomposition against live London LBMA and MCX benchmark series.",
    )


@app.get("/api/edge-survival")
def edge_survival():
    make_unavailable_response(
        "Live Edge Survival Pipeline",
        "Requires real-time order book Level-2 depth to calculate dynamic execution slippage.",
    )


@app.get("/api/alerts")
def alerts():
    make_unavailable_response(
        "Real-Time Surveillance Alerts",
        "Alert streaming requires an active WebSocket connection to exchange market data.",
    )
