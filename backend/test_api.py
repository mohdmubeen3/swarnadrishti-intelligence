import pytest
from fastapi.testclient import TestClient
from api import app
from importer import import_historical_trades, validate_trade_rows
from db.session import get_db_info

client = TestClient(app)


# --------------------------------------------------------------------------
# 1. Health & Database Connectivity vs Readiness
# --------------------------------------------------------------------------
def test_health_checks_separated_connectivity_and_readiness():
    response = client.get("/api/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["liveMarketData"] is False

    # Connectivity Check
    conn = payload["database"]["connectivity"]
    assert conn["status"] == "connected"
    assert conn["dialect"] == "sqlite"
    assert conn["isSqlite"] is True
    assert conn["isPostgres"] is False

    # Data Readiness Check
    readiness = payload["database"]["dataReadiness"]
    assert readiness["status"] == "ready"
    assert readiness["tradeCount"] == 78
    assert readiness["pairCount"] == 3
    assert readiness["latestImport"] is not None
    assert "78 validated trades" in readiness["sourceFreshness"]


def test_postgresql_dialect_detection():
    # Verify get_db_info behavior
    info = get_db_info()
    assert "dialect" in info
    assert "driver" in info
    assert "isSqlite" in info
    assert "isPostgres" in info


# --------------------------------------------------------------------------
# 2. Database-backed Summary & Strict Non-fallback Behavior
# --------------------------------------------------------------------------
def test_summary_reflects_canonical_database_trades():
    response = client.get("/api/summary")
    assert response.status_code == 200
    payload = response.json()
    assert payload["source"] == "database"
    assert payload["tradeCount"] == 78
    assert payload["pairCount"] == 3
    assert len(payload["pairs"]) == 3

    pair_names = {p["pair"] for p in payload["pairs"]}
    assert "GOLDGUINEA-GOLDPETAL" in pair_names
    assert "GOLDTEN-GOLDGUINEA" in pair_names
    assert "GOLDTEN-GOLDPETAL" in pair_names


# --------------------------------------------------------------------------
# 3. Scanner Zero-Match Filtering (Regression: No Static Fallback)
# --------------------------------------------------------------------------
def test_scanner_zero_matches_returns_empty_paginated_list():
    # When filtering by a pair that does not exist, it MUST return total: 0 and trades: []
    response = client.get("/api/scanner?pair=NON_EXISTENT_PAIR")
    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] == 0
    assert payload["trades"] == []
    assert payload["isLiveSignal"] is False


def test_scanner_with_valid_filtering_and_pagination():
    response = client.get("/api/scanner?limit=10&offset=0")
    assert response.status_code == 200
    payload = response.json()
    assert payload["isLiveSignal"] is False
    assert len(payload["trades"]) == 10
    assert payload["total"] == 78

    # Filter by specific valid pair
    res_pair = client.get("/api/scanner?pair=GOLDGUINEA-GOLDPETAL")
    assert res_pair.status_code == 200
    assert res_pair.json()["total"] == 29
    assert all(t["pair"] == "GOLDGUINEA-GOLDPETAL" for t in res_pair.json()["trades"])

    # Filter by exit reason
    res_reason = client.get("/api/scanner?exitReason=Expiry%20Buffer")
    assert res_reason.status_code == 200
    assert res_reason.json()["total"] == 7
    assert all(t["exitReason"] == "Expiry Buffer" for t in res_reason.json()["trades"])


def test_relative_value_pair_detail():
    # 1. Canonical pair with direct database match
    response = client.get("/api/relative-value/pair?pairId=GOLDGUINEA-GOLDPETAL")
    assert response.status_code == 200
    payload = response.json()
    assert payload["pair"]["pair"] == "GOLDGUINEA-GOLDPETAL"
    assert payload["hasHistoricalData"] is True
    assert len(payload["trades"]) == 29

    # 2. Dropdown Option: GOLDTEN / GOLDPETAL (Nov-2026) -> maps to canonical GOLDTEN-GOLDPETAL
    res_goldten_petal = client.get("/api/relative-value/pair?pairId=GOLDTEN-GOLDPETAL-202611")
    assert res_goldten_petal.status_code == 200
    payload_goldten_petal = res_goldten_petal.json()
    assert payload_goldten_petal["hasHistoricalData"] is True
    assert payload_goldten_petal["basePair"] == "GOLDTEN-GOLDPETAL"
    assert len(payload_goldten_petal["trades"]) == 26

    # 3. Dropdown Option: GOLDM / GOLDTEN (Nov-2026) -> forward spec without backtest trades
    res_goldm_ten = client.get("/api/relative-value/pair?pairId=GOLDM-GOLDTEN-202611")
    assert res_goldm_ten.status_code == 200
    payload_goldm_ten = res_goldm_ten.json()
    assert payload_goldm_ten["hasHistoricalData"] is False
    assert payload_goldm_ten["legA"] == "GOLDM"
    assert payload_goldm_ten["legB"] == "GOLDTEN"
    assert len(payload_goldm_ten["missingData"]) > 0

    # 4. Dropdown Option: GOLDM / GOLDGUINEA (Nov-2026) -> forward spec without backtest trades
    res_goldm_guinea = client.get("/api/relative-value/pair?pairId=GOLDM-GOLDGUINEA-202611")
    assert res_goldm_guinea.status_code == 200
    payload_goldm_guinea = res_goldm_guinea.json()
    assert payload_goldm_guinea["hasHistoricalData"] is False
    assert payload_goldm_guinea["legA"] == "GOLDM"
    assert payload_goldm_guinea["legB"] == "GOLDGUINEA"

    # 5. Dropdown Option: GOLDM / GOLDPETAL (Nov-2026) -> forward spec without backtest trades
    res_goldm_petal = client.get("/api/relative-value/pair?pairId=GOLDM-GOLDPETAL-202611")
    assert res_goldm_petal.status_code == 200
    payload_goldm_petal = res_goldm_petal.json()
    assert payload_goldm_petal["hasHistoricalData"] is False
    assert payload_goldm_petal["legA"] == "GOLDM"
    assert payload_goldm_petal["legB"] == "GOLDPETAL"

    # 6. Unrecognized pair must return 404, not fallback
    res_404 = client.get("/api/relative-value/pair?pairId=UNKNOWN-PAIR")
    assert res_404.status_code == 404


# --------------------------------------------------------------------------
# 4. Calculation Contracts & Pydantic Domain Validation
# --------------------------------------------------------------------------
def test_transaction_cost_estimator_valid_calculation():
    payload = {
        "grossEdge": 52.87,
        "brokerage": 20.0,
        "slippage": 5.0
    }
    response = client.post("/api/transaction-costs/estimate", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["grossTheoreticalEdge"] == 52.87
    assert res["brokerageAndFees"] == 4.0  # (20/10)*2
    assert res["statutoryTaxesAndCTT"] > 0
    assert res["totalEstimatedCost"] > 0
    assert res["estimatedNetEdge"] > 0
    assert "assumptions" in res
    assert res["assumptions"]["mode"] == "illustrative_decision_support"


def test_transaction_cost_estimator_bounds_validation():
    # Negative grossEdge
    res = client.post("/api/transaction-costs/estimate", json={"grossEdge": -5.0, "brokerage": 20.0, "slippage": 5.0})
    assert res.status_code == 422

    # Excessive grossEdge > 500
    res = client.post("/api/transaction-costs/estimate", json={"grossEdge": 600.0, "brokerage": 20.0, "slippage": 5.0})
    assert res.status_code == 422

    # Negative brokerage
    res = client.post("/api/transaction-costs/estimate", json={"grossEdge": 50.0, "brokerage": -10.0, "slippage": 5.0})
    assert res.status_code == 422

    # Negative slippage
    res = client.post("/api/transaction-costs/estimate", json={"grossEdge": 50.0, "brokerage": 20.0, "slippage": -1.0})
    assert res.status_code == 422


def test_scenario_simulator_valid_calculation():
    payload = {
        "pair": "GOLDM-GOLDTEN",
        "slippage": 12.0,
        "brokerage": 25.0,
        "entryZ": 2.2,
        "holdingDays": 5
    }
    response = client.post("/api/scenarios/simulate", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["pair"] == "GOLDM-GOLDTEN"
    assert "recalculatedCost" in res
    assert "recalculatedNetEdge" in res
    assert res["signalStatus"] in {"ACTIONABLE", "WATCH", "REJECTED"}
    assert "modelCaveats" in res
    assert "Z-score reflects statistical deviation" in res["modelCaveats"]["statisticalNotice"]


def test_scenario_simulator_bounds_validation():
    # Negative holding days
    res = client.post("/api/scenarios/simulate", json={"slippage": 10.0, "brokerage": 20.0, "entryZ": 2.0, "holdingDays": -1})
    assert res.status_code == 422

    # Excessive holding days > 60
    res = client.post("/api/scenarios/simulate", json={"slippage": 10.0, "brokerage": 20.0, "entryZ": 2.0, "holdingDays": 90})
    assert res.status_code == 422

    # EntryZ out of bounds
    res = client.post("/api/scenarios/simulate", json={"slippage": 10.0, "brokerage": 20.0, "entryZ": 0.2, "holdingDays": 5})
    assert res.status_code == 422

    res = client.post("/api/scenarios/simulate", json={"slippage": 10.0, "brokerage": 20.0, "entryZ": 8.0, "holdingDays": 5})
    assert res.status_code == 422

    # Invalid pair format
    res = client.post("/api/scenarios/simulate", json={"pair": "invalid_pair", "slippage": 10.0, "brokerage": 20.0, "entryZ": 2.0, "holdingDays": 5})
    assert res.status_code == 422


# --------------------------------------------------------------------------
# 5. Guardrail Checks & Malformed CSV Regression Tests
# --------------------------------------------------------------------------
def test_malformed_csv_validation():
    # Missing pair
    rows_missing_pair = [{
        "Pair": "",
        "ExpiryDate": "2026-10-30",
        "EntryDate": "2026-10-01",
        "ExitDate": "2026-10-05",
        "Direction": "Short A / Long B",
        "EntryZ": "1.5",
        "ExitZ": "0.2",
        "HoldingObservations": "4",
        "EntryLogSpread": "0.001",
        "ExitLogSpread": "0.0002",
        "GrossSpreadChangePct": "0.05",
        "EstimatedCostPct": "0.05",
        "NetSpreadChangePct": "0.01",
        "ExitReason": "Mean Reversion",
    }]
    is_valid, issues, _ = validate_trade_rows(rows_missing_pair)
    assert is_valid is False
    assert any("Missing pair" in i for i in issues)

    # Extreme EntryZ >= 4
    rows_extreme_entry = [{
        "Pair": "GOLDM-GOLDTEN",
        "ExpiryDate": "2026-10-30",
        "EntryDate": "2026-10-01",
        "ExitDate": "2026-10-05",
        "Direction": "Short A / Long B",
        "EntryZ": "4.5",
        "ExitZ": "0.2",
        "HoldingObservations": "4",
        "EntryLogSpread": "0.001",
        "ExitLogSpread": "0.0002",
        "GrossSpreadChangePct": "0.05",
        "EstimatedCostPct": "0.05",
        "NetSpreadChangePct": "0.01",
        "ExitReason": "Mean Reversion",
    }]
    is_valid, issues, _ = validate_trade_rows(rows_extreme_entry)
    assert is_valid is False
    assert any("exceeds guard" in i for i in issues)

    # Exited after expiry
    rows_after_expiry = [{
        "Pair": "GOLDM-GOLDTEN",
        "ExpiryDate": "2026-10-20",
        "EntryDate": "2026-10-01",
        "ExitDate": "2026-10-25",
        "Direction": "Short A / Long B",
        "EntryZ": "2.0",
        "ExitZ": "0.2",
        "HoldingObservations": "4",
        "EntryLogSpread": "0.001",
        "ExitLogSpread": "0.0002",
        "GrossSpreadChangePct": "0.05",
        "EstimatedCostPct": "0.05",
        "NetSpreadChangePct": "0.01",
        "ExitReason": "Mean Reversion",
    }]
    is_valid, issues, _ = validate_trade_rows(rows_after_expiry)
    assert is_valid is False
    assert any("exited after expiry" in i for i in issues)

    # Unknown exit reason
    rows_unknown_reason = [{
        "Pair": "GOLDM-GOLDTEN",
        "ExpiryDate": "2026-10-30",
        "EntryDate": "2026-10-01",
        "ExitDate": "2026-10-05",
        "Direction": "Short A / Long B",
        "EntryZ": "2.0",
        "ExitZ": "0.2",
        "HoldingObservations": "4",
        "EntryLogSpread": "0.001",
        "ExitLogSpread": "0.0002",
        "GrossSpreadChangePct": "0.05",
        "EstimatedCostPct": "0.05",
        "NetSpreadChangePct": "0.01",
        "ExitReason": "Arbitrary Reason",
    }]
    is_valid, issues, _ = validate_trade_rows(rows_unknown_reason)
    assert is_valid is False
    assert any("Unrecognized exit reason" in i for i in issues)


# --------------------------------------------------------------------------
# 6. Structured Unavailable Endpoints (HTTP 501)
# --------------------------------------------------------------------------
def test_structured_unavailable_feature_returns_501():
    response = client.get("/api/fair-value")
    assert response.status_code == 501
    detail = response.json()["detail"]
    assert detail["status"] == "unavailable"
    assert detail["dataMode"] == "historical_backtest"
    assert "Fair-Value Engine" in detail["feature"]

    response_dna = client.get("/api/contract-dna")
    assert response_dna.status_code == 501
    assert response_dna.json()["detail"]["status"] == "unavailable"


# --------------------------------------------------------------------------
# 7. Idempotency Regression Test
# --------------------------------------------------------------------------
def test_idempotent_import():
    res = import_historical_trades()
    assert res["tradeCount"] == 78
    assert res["inserted"] == 0
    assert res["updated"] == 78
    assert res["isReimport"] is True


# --------------------------------------------------------------------------
# 8. Historical Results Filtering & HTTP 500 Regression Tests
# --------------------------------------------------------------------------
def test_historical_results_unfiltered():
    """Verify unfiltered /api/historical-results returns all 78 trades without HTTP 500."""
    response = client.get("/api/historical-results")
    assert response.status_code == 200
    payload = response.json()
    assert payload["dataMode"] == "historical_backtest"
    assert payload["total"] == 78
    assert len(payload["trades"]) == 78
    assert payload["pairFilter"] is None
    assert payload["exitReasonFilter"] is None
    assert payload["summary"]["tradeCount"] == 78
    assert payload["summary"]["pairCount"] == 3
    assert len(payload["scanner"]["trades"]) == 78
    assert "equityCurve" in payload
    assert "tradeMarkers" in payload
    assert "validation" in payload


def test_historical_results_filter_by_pair():
    """Verify pair filtering on /api/historical-results."""
    response = client.get("/api/historical-results?pair=GOLDGUINEA-GOLDPETAL")
    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] == 29
    assert len(payload["trades"]) == 29
    assert payload["pairFilter"] == "GOLDGUINEA-GOLDPETAL"
    assert all(t["pair"] == "GOLDGUINEA-GOLDPETAL" for t in payload["trades"])
    assert payload["summary"]["pairCount"] == 1
    assert payload["summary"]["pairs"][0]["pair"] == "GOLDGUINEA-GOLDPETAL"


def test_historical_results_filter_by_exit_reason():
    """Verify exit_reason filtering on /api/historical-results (both snake_case and camelCase)."""
    # Snake_case: exit_reason
    response = client.get("/api/historical-results?exit_reason=Mean+Reversion")
    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] == 49
    assert len(payload["trades"]) == 49
    assert payload["exitReasonFilter"] == "Mean Reversion"
    assert all(t["exitReason"] == "Mean Reversion" for t in payload["trades"])

    # CamelCase: exitReason
    response_camel = client.get("/api/historical-results?exitReason=Max+Holding")
    assert response_camel.status_code == 200
    payload_camel = response_camel.json()
    assert payload_camel["total"] == 19
    assert len(payload_camel["trades"]) == 19
    assert payload_camel["exitReasonFilter"] == "Max Holding"
    assert all(t["exitReason"] == "Max Holding" for t in payload_camel["trades"])


def test_historical_results_combined_filters():
    """Verify combined pair and exit_reason filters."""
    response = client.get("/api/historical-results?pair=GOLDGUINEA-GOLDPETAL&exit_reason=Mean+Reversion")
    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] == 20
    assert len(payload["trades"]) == 20
    assert payload["pairFilter"] == "GOLDGUINEA-GOLDPETAL"
    assert payload["exitReasonFilter"] == "Mean Reversion"
    assert all(
        t["pair"] == "GOLDGUINEA-GOLDPETAL" and t["exitReason"] == "Mean Reversion"
        for t in payload["trades"]
    )


def test_historical_results_zero_match_filter():
    """Verify filter with zero matches returns empty trades list and total 0 without error or fallback."""
    response = client.get("/api/historical-results?pair=NON_EXISTENT_PAIR")
    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] == 0
    assert payload["trades"] == []
    assert payload["scanner"]["total"] == 0
    assert payload["scanner"]["trades"] == []
    assert payload["pairFilter"] == "NON_EXISTENT_PAIR"

