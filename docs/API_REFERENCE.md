# SwarnaDrishti — API Reference Manual

**Base URL:** `http://localhost:8000/api`  
**OpenAPI Interactive Docs:** `http://localhost:8000/docs`  
**Data Mode:** `historical_backtest` (Historical closed trades; no live trading recommendations)  

---

## 1. System Health & Connectivity

### `GET /api/health`
Verifies service uptime and executes a live database query (`SELECT 1`) to check SQLite/PostgreSQL engine readiness.

**Response (200 OK):**
```json
{
  "status": "ok",
  "service": "SwarnaDrishti API",
  "version": "1.2.0",
  "database": {
    "status": "connected",
    "driver": "sqlite/sqlalchemy",
    "message": "connected",
    "tradeCount": 78,
    "pairCount": 3
  },
  "pipeline": "historical_backtest_database",
  "dataMode": "historical_backtest",
  "liveMarketData": false
}
```

---

## 2. Analytics & Backtest Endpoints

### `GET /api/summary`
Returns aggregate performance metrics across all 3 spread pairs computed directly from the canonical database records.

**Response (200 OK):**
```json
{
  "status": "validated",
  "source": "database",
  "generatedFrom": "walk_forward_spread_trades.csv",
  "tradeCount": 78,
  "pairCount": 3,
  "returnMetric": "Sum of NetSpreadChangePct in percentage points; not portfolio return or rupee P&L.",
  "pairs": [
    {
      "pair": "GOLDGUINEA-GOLDPETAL",
      "trades": 29,
      "winRatePct": 75.862069,
      "totalNetReturnPct": 1.776956,
      "meanNetReturnPct": 0.061274,
      "maxDrawdownPct": -0.186138,
      "meanReversionExits": 20,
      "stopLossExits": 0,
      "expiryBufferExits": 4,
      "maxHoldingExits": 4,
      "endOfSegmentExits": 1
    }
  ]
}
```

### `GET /api/scanner`
Queries the database for historical closed trades with optional filtering and pagination.

**Query Parameters:**
* `pair` (optional string): Filter by specific spread pair (e.g., `GOLDGUINEA-GOLDPETAL`).
* `exitReason` (optional string): Filter by exit trigger.
* `limit` (integer, default 50, max 200): Maximum records returned.
* `offset` (integer, default 0): Number of records skipped.

**Response (200 OK):**
```json
{
  "mode": "historical_closed_trades",
  "isLiveSignal": false,
  "total": 78,
  "limit": 50,
  "offset": 0,
  "trades": [
    {
      "id": 1,
      "tradeKey": "bf5ebe3e1f791d45",
      "pair": "GOLDGUINEA-GOLDPETAL",
      "expiryDate": "2026-07-31",
      "entryDate": "2026-07-14",
      "exitDate": "2026-07-23",
      "direction": "Short A / Long B",
      "entryZ": 1.500293,
      "exitZ": 0.187737,
      "holdingObservations": 7,
      "netReturnPct": -0.0281748,
      "exitReason": "Mean Reversion",
      "status": "Closed"
    }
  ]
}
```

### `GET /api/relative-value/pair`
Returns pair-level summary and all matching trades.

**Query Parameters:**
* `pairId` (required string): Spread pair symbol (e.g., `GOLDTEN-GOLDGUINEA`).

---

## 3. Interactive Quantitative Models

### `POST /api/transaction-costs/estimate`
Computes complete statutory and exchange friction modeling for MCX futures relative-value pairs.

**Request Body:**
```json
{
  "grossEdge": 52.87,
  "brokerage": 20.0,
  "slippage": 5.0
}
```

**Response (200 OK):**
```json
{
  "grossTheoreticalEdge": 52.87,
  "brokerageAndFees": 4.0,
  "statutoryTaxesAndCTT": 5.2,
  "estimatedSlippage": 5.0,
  "totalEstimatedCost": 14.2,
  "estimatedNetEdge": 38.67,
  "costToEdgeRatio": 0.269,
  "isActionable": true,
  "methodology": "Normalized 10g MCX Gold contract basis; statutory levies include CTT, MCX turnover fee, and 18% GST."
}
```

### `POST /api/scenarios/simulate`
Evaluates edge survival under variable slippage hurdles and target holding horizons.

**Request Body:**
```json
{
  "pair": "GOLDM-GOLDTEN",
  "slippage": 12.0,
  "brokerage": 25.0,
  "entryZ": 2.2,
  "holdingDays": 5
}
```

**Response (200 OK):**
```json
{
  "pair": "GOLDM-GOLDTEN",
  "recalculatedCost": 22.2,
  "recalculatedNetEdge": 30.67,
  "signalStatus": "ACTIONABLE",
  "riskCheck": "Passed: Surviving net edge withstands simulated friction",
  "simulatedGrossEdge": 52.87,
  "holdingDays": 5,
  "entryZ": 2.2
}
```

---

## 4. Structured Unavailable Endpoints (501 Not Implemented)

For modules that genuinely require active exchange telemetry or Level-2 order book feeds not present in the historical backtest snapshot, the API returns transparent HTTP 501 responses:

**Applies to:**
* `GET /api/contracts`
* `GET /api/fair-value`
* `GET /api/contract-dna`
* `GET /api/liquidity-lifecycle`
* `POST /api/backtesting/run`
* `GET /api/attribution/gold-neutral`
* `GET /api/edge-survival`
* `GET /api/alerts`

**Standard Error Structure (501 Not Implemented):**
```json
{
  "detail": {
    "status": "unavailable",
    "feature": "Fair-Value Engine",
    "message": "Requires real-time MCX Bhavcopy ingestion and live forward term-structure curves. No synthetic data was generated.",
    "dataMode": "historical_backtest"
  }
}
```
