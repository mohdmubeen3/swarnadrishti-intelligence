# SwarnaDrishti (स्वर्णदृष्टि) — Complete Operator's Manual & Runbook

**Workstation Name:** SwarnaDrishti Commodity Derivatives Intelligence Platform  
**Target Domain:** Quantitative Relative-Value Analytics for MCX Gold Futures  
**Audience:** Hackathon Evaluators, Quantitative Researchers, Full-Stack Engineers  
**Document Version:** 1.0 (Production Verified)  

---

## 1. System Architecture Overview

SwarnaDrishti operates as a decoupled three-tier analytical workstation:

```
┌─────────────────────────────────────────────────────────────────┐
│               React 18 + Vite Frontend (Port 3000)              │
│   15 Analytical Pages · Recharts · Lucide Icons · CSS Design   │
└─────────────────────────────────┬───────────────────────────────┘
                                  │ JSON API (CORS enabled)
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                 FastAPI REST Backend (Port 8000)                │
│  Real DB Health Checks · Friction Models · Stress Simulation    │
└─────────────────────────────────┬───────────────────────────────┘
                                  │ SQLAlchemy 2.x
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│              SQLite Persistence (data/swarnadrishti.db)         │
│  78 Canonical Trades · Derived Pair Metrics · Import Ledger     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Prerequisites & Tooling

Before running the application, ensure the following are installed:
* **Python 3.10+** (tested on Python 3.15)
* **Node.js v18+** (tested on Node.js v20.18.0 LTS with npm 10.8.2)

> **Windows Node.js Path Note:**  
> On Windows, if Node.js was extracted locally to `C:\Users\Lenovo\.node\node-v20.18.0-win-x64\`, make sure it is added to your active PowerShell session before running npm commands:
> ```powershell
> $env:PATH = "C:\Users\Lenovo\.node\node-v20.18.0-win-x64;$env:PATH"
> ```

---

## 3. Step-by-Step Setup Guide

### Step 3.1: Navigate to Project Root
```bash
# Windows PowerShell
cd d:\Projects\SwarnaDrishti\SwarnaDrishti_Final_Complete\SwarnaDrishti_Final

# macOS / Linux
cd /path/to/SwarnaDrishti_Final
```

### Step 3.2: Environment Configuration
The `.env` file is already pre-configured with safe local defaults. If needed, you can re-create it from `.env.example`:
```bash
# Windows PowerShell
Copy-Item .env.example .env

# macOS / Linux
cp .env.example .env
```

**Contents of `.env`:**
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_ENV=development
DATABASE_URL=sqlite:///./data/swarnadrishti.db
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173
DATA_MODE=historical_backtest
```

### Step 3.3: Install Frontend Dependencies
```bash
npm install
```
*(Installs React 18, React Router v6, Recharts, and Lucide React icons in ~7 seconds).*

### Step 3.4: Install Backend Dependencies
```bash
cd backend
python -m pip install -r requirements.txt
```
*(Installs FastAPI, Uvicorn, SQLAlchemy, Pydantic, HTTPX, and Pytest).*

---

## 4. Database Ingestion & Verification

The project includes an idempotent ingestion CLI tool that validates the canonical trade CSV, verifies mathematical guardrails, and commits trades to SQLite:

```bash
# From the backend directory:
python importer.py
```

### Expected Console Output:
```text
2026-10-28 14:39:27 [INFO] Starting ingestion of canonical trade log: walk_forward_spread_trades.csv
2026-10-28 14:39:27 [INFO] File SHA-256: bf5ebe3e1f791d459ba1591f9eaf390ac061305242b98bbcd562d9743aa90062
2026-10-28 14:39:27 [INFO] Import successfully committed to database: 78 trades, 3 pairs (Inserted: 78, Updated: 0)
{
  "status": "PASS",
  "fileSHA256": "bf5ebe3e1f791d459ba1591f9eaf390ac061305242b98bbcd562d9743aa90062",
  "tradeCount": 78,
  "pairCount": 3,
  "inserted": 78,
  "updated": 0,
  "isReimport": false,
  "pairs": [
    "GOLDGUINEA-GOLDPETAL",
    "GOLDTEN-GOLDGUINEA",
    "GOLDTEN-GOLDPETAL"
  ]
}
```

> **Idempotency Guarantee:** If you run `python importer.py` a second time, it will report `Inserted: 0, Updated: 78`, proving that zero duplicate trades are created.

---

## 5. How to Run the Application

You will need **two terminal windows**:

### Terminal 1: Start Backend API Server
```bash
# Navigate to the backend directory
cd backend

# Start the FastAPI Uvicorn server
python -m uvicorn api:app --reload --host 127.0.0.1 --port 8000
```
* **API Server:** `http://localhost:8000`
* **Health Check:** `http://localhost:8000/api/health`
* **Interactive Swagger UI:** `http://localhost:8000/docs`

### Terminal 2: Start Frontend Development Server
```bash
# From the project root:
npm run dev
```
* **Workstation UI:** Open **`http://localhost:3000`** in any modern web browser.

---

## 6. How to Build & Run Production Bundle

To build the static production distribution:

```bash
# 1. Compile production bundle into dist/
npm run build

# 2. Preview production build locally
npm run preview
```
The production bundle compiles into `dist/` containing `index.html` and 28 optimized JavaScript and CSS assets.

---

## 7. Automated Testing Suite

### A. Run Backend Unit & Contract Tests
From the `backend` directory:
```bash
python -m pytest -v
```
**Results (11 / 11 Passed):**
1. `test_health_checks_real_database`: Validates live SQLite engine response (`SELECT 1`).
2. `test_summary_reflects_canonical_database_trades`: Confirms 78 trades across 3 pairs.
3. `test_scanner_with_filtering_and_pagination`: Tests pair filters and row limits.
4. `test_relative_value_pair_detail`: Validates pair drill-down data.
5. `test_equity_curve_proxy_interpretation`: Validates cumulative additive proxy curve.
6. `test_trade_markers_zero_stop_loss`: Confirms 0 stop-loss markers in walk-forward segment.
7. `test_validation_report_status`: Confirms statistical checks PASS.
8. `test_transaction_cost_estimator_calculation`: Tests statutory and exchange friction model.
9. `test_scenario_simulator_calculation`: Tests stress testing responses.
10. `test_structured_unavailable_feature_returns_501`: Verifies honest unavailable status for live feeds.
11. `test_idempotent_import`: Verifies duplicate prevention.

### B. Run End-to-End Smoke Test
From the `backend` directory:
```bash
python smoke_test.py
```
**Executes a 6-stage end-to-end integration audit:**
* Stage 1: SQLite connection verification.
* Stage 2: Database record and pair count audit (78 trades, 3 pairs).
* Stage 3: Repeated import idempotency check.
* Stage 4: API endpoint contracts and calculation validation.
* Stage 5: Production build artifact verification (`dist/index.html`).
* Stage 6: Full integration sign-off.

---

## 8. API Endpoints Directory

| Method | Endpoint | Description | Return Type |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service uptime and active database query check (`SELECT 1`) | Status JSON |
| `GET` | `/api/summary` | Aggregate performance across 3 pairs queried from database | Metrics JSON |
| `GET` | `/api/scanner` | Paginated & filterable historical trades (`?pair=...&limit=50`) | Trade List JSON |
| `GET` | `/api/relative-value/pair` | Pair metrics and associated closed trade rows (`?pairId=...`) | Pair Detail JSON |
| `GET` | `/api/equity-curve` | Additive cumulative spread-return proxy in percentage points | Time Series JSON |
| `GET` | `/api/trade-markers` | Event markers from backtest log (0 stop-loss exits) | Marker List JSON |
| `GET` | `/api/validation` | Full mathematical validation and guard report | Audit JSON |
| `GET` | `/api/historical-results` | Complete composite payload for backwards compatibility | Composite JSON |
| `GET` | `/api/market-data` | Explicit notice that live exchange feeds are disconnected | Disclosure JSON |
| `POST`| `/api/transaction-costs/estimate` | Round-trip MCX friction model (brokerage, turnover, CTT, GST) | Calculation JSON |
| `POST`| `/api/scenarios/simulate` | Stress-test edge survival under variable slippage and horizons | Simulation JSON |
| `GET` | `/api/fair-value` | Structured 501 unavailable disclosure (requires live feed) | HTTP 501 JSON |
| `GET` | `/api/contract-dna` | Structured 501 unavailable disclosure (requires live feed) | HTTP 501 JSON |
| `GET` | `/api/liquidity-lifecycle` | Structured 501 unavailable disclosure (requires live feed) | HTTP 501 JSON |
| `GET` | `/api/alerts` | Structured 501 unavailable disclosure (requires live feed) | HTTP 501 JSON |

---

## 9. Frontend Route Mapping

| Route | Page Name | Primary Focus / Analytical Objective |
| :--- | :--- | :--- |
| `/` | **Public Homepage** | Editorial landing page, product architecture, and methodology trust disclosure |
| `/app` | **Market Overview** | Summary KPIs, normalized price landscape time-series, and scatter plot |
| `/app/scanner` | **Opportunity Scanner** | Discovery engine with multi-criteria filtering, table sorting, and CSV export |
| `/app/rv-lab` | **Relative Value Lab** | Deep pair investigation with 4 linked Recharts views ($\pm 2.0\sigma$ bands) |
| `/app/fair-value` | **Fair Value & DNA** | 30-day rolling median baseline and contract specifications audit |
| `/app/liquidity-lifecycle`| **Liquidity & Lifecycle**| Volume velocity, physical tender countdown, and holding constraint warnings |
| `/app/cost-estimator` | **Cost Estimator** | Interactive round-trip friction simulator (brokerage, CTT, turnover, GST) |
| `/app/survival-signalguard`| **SignalGuard Engine** | 5-stage gatekeeper matrix auditing statistical hurdles and expiry alignment |
| `/app/simulator` | **What-If Simulator** | Stress-testing engine evaluating surviving net edge under slippage variations |
| `/app/backtesting` | **Walk-Forward Backtesting** | Out-of-sample historical validation, additive proxy curve, and trade log |
| `/app/attribution` | **Gold-Neutral Attribution**| Factor decomposition isolating spread alpha from directional gold beta |
| `/app/edge-survival` | **Edge Survival Pipeline** | 7-stage visual pipeline proving how gross pricing differences survive costs |
| `/app/alerts` | **Alerts & Surveillance** | Event logs tracking threshold breaks and physical tender windows |
| `/app/methodology` | **Methodology & Diagnostics** | MCX contract normalization formulas and zero-missing data diagnostics |
| `/app/settings` | **System Settings** | API base URL configuration and user friction parameter assumptions |

---

## 10. Troubleshooting & Common Solutions

1. **Port 8000 or 3000 Already in Use:**
   - Stop any existing Python or Node processes:
     ```powershell
     # Windows PowerShell
     Get-Process -Name python, node -ErrorAction SilentlyContinue | Stop-Process -Force
     ```
   - Restart the server.

2. **Node is not recognized in a new terminal:**
   - Run:
     ```powershell
     $env:PATH = "C:\Users\Lenovo\.node\node-v20.18.0-win-x64;$env:PATH"
     ```

3. **CORS Network Error in Browser Console:**
   - Check that `CORS_ORIGINS` in `.env` includes `http://localhost:3000`.
   - Ensure the backend server in Terminal 1 is running on `http://127.0.0.1:8000`.

4. **Offline Test Mode vs Real Mode:**
   - By default, the application runs in **real backend mode** connecting directly to FastAPI and SQLite.
   - If the backend is turned off, the frontend will display a connection offline banner with a **Retry** button.
   - If you want to preview offline demo data without a backend, navigate to `/app/settings` and toggle **Offline Benchmark Mode** on.
