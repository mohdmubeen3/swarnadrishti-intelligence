import sys
import json
from pathlib import Path
from fastapi.testclient import TestClient

from api import app
from db.session import SessionLocal, check_db_connection
from db.models import HistoricalTrade, PairSummary, DataImport
from importer import import_historical_trades

client = TestClient(app)

def run_smoke_test():
    print("=" * 60)
    print("SWARNADRISHTI END-TO-END SMOKE TEST")
    print("=" * 60)

    # 1. Database Connection Check
    print("\n[1/6] Testing SQLite Database Connection...")
    db_ok, db_msg, db_info = check_db_connection()
    assert db_ok, f"Database connection failed: {db_msg}"
    print(f"  --> PASS: Database connected successfully ({db_msg}, dialect: {db_info.get('dialect')})")

    # 2. Database Record Verification
    print("\n[2/6] Verifying Stored Records & Canonical Trade Counts...")
    db = SessionLocal()
    try:
        trade_count = db.query(HistoricalTrade).count()
        pair_count = db.query(PairSummary).count()
        import_count = db.query(DataImport).count()
        assert trade_count == 78, f"Expected 78 trades, found {trade_count}"
        assert pair_count == 3, f"Expected 3 pairs, found {pair_count}"
        assert import_count >= 1, "Expected at least 1 import audit record"
        print(f"  --> PASS: Verified {trade_count} trades across {pair_count} pairs in database.")
    finally:
        db.close()

    # 3. Idempotent Import Check
    print("\n[3/6] Verifying Import Idempotency...")
    res = import_historical_trades()
    assert res["tradeCount"] == 78
    assert res["inserted"] == 0
    assert res["updated"] == 78
    print("  --> PASS: Repeated import executed with 0 duplicate rows created.")

    # 4. API Endpoints Check
    print("\n[4/6] Verifying API Contracts & Calculations...")
    health_res = client.get("/api/health")
    assert health_res.status_code == 200
    assert health_res.json()["database"]["connectivity"]["status"] == "connected"
    assert health_res.json()["database"]["dataReadiness"]["status"] == "ready"

    summary_res = client.get("/api/summary")
    assert summary_res.status_code == 200
    assert summary_res.json()["tradeCount"] == 78

    scanner_res = client.get("/api/scanner?limit=10")
    assert scanner_res.status_code == 200
    assert len(scanner_res.json()["trades"]) == 10

    # Verify zero-match regression test
    zero_res = client.get("/api/scanner?pair=NON_EXISTENT_PAIR")
    assert zero_res.status_code == 200
    assert zero_res.json()["total"] == 0 and len(zero_res.json()["trades"]) == 0

    cost_res = client.post("/api/transaction-costs/estimate", json={"grossEdge": 52.87, "brokerage": 20.0, "slippage": 5.0})
    assert cost_res.status_code == 200
    assert cost_res.json()["totalEstimatedCost"] > 0
    assert cost_res.json()["estimatedNetEdge"] > 0
    assert cost_res.json()["isActionable"] is True

    sim_res = client.post("/api/scenarios/simulate", json={"slippage": 12.0, "brokerage": 25.0, "entryZ": 2.2, "holdingDays": 5})
    assert sim_res.status_code == 200
    assert "signalStatus" in sim_res.json()

    unavail_res = client.get("/api/fair-value")
    assert unavail_res.status_code == 501
    assert unavail_res.json()["detail"]["status"] == "unavailable"
    print("  --> PASS: All core API endpoints, calculations, and structured 501s verified.")

    # 5. Frontend Production Bundle Check
    print("\n[5/6] Verifying Frontend Production Artifacts...")
    dist_dir = Path(__file__).resolve().parent.parent / "dist"
    index_html = dist_dir / "index.html"
    assert dist_dir.exists(), f"Frontend dist directory missing at: {dist_dir}"
    assert index_html.exists(), "Frontend index.html missing from dist"
    assets = list((dist_dir / "assets").glob("*.*"))
    assert len(assets) > 0, "No built assets found in dist/assets"
    print(f"  --> PASS: Production frontend build verified ({len(assets)} assets in dist/).")

    # 6. Overall Summary
    print("\n[6/6] Overall Status: ALL CHECKS PASSED")
    print("=" * 60)
    print("SWARNADRISHTI INTEGRATION IS COMPLETE AND VERIFIED.")
    print("=" * 60)

if __name__ == "__main__":
    try:
        run_smoke_test()
    except Exception as exc:
        print(f"\n[FAIL] Smoke test failed: {exc}", file=sys.stderr)
        sys.exit(1)
