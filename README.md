# SwarnaDrishti — Commodity Derivatives Intelligence Platform
> Quantitative Relative-Value Intelligence for MCX Gold Futures

---

## 1. Project Overview

**SwarnaDrishti** (स्वर्णदृष्टि - *The Golden Vision*) is an institutional-grade commodity derivatives research workstation and intelligence platform engineered for Multi Commodity Exchange of India (MCX) Gold Futures relative-value analytics.

The platform transforms daily Multi Commodity Exchange of India (**MCX**) settlement data into transparent, explainable relative-value analytics across four gold futures contracts:

| Contract Symbol | Trading Unit | Quotation Basis | Deliverable Purity | Normalization Factor |
|---|---|---|---|---|
| **GOLDM** (Gold Mini) | 100 grams | Rs. per 10 grams | 995 Fine Gold | Fine-gold assay adjusted to 999 |
| **GOLDTEN** (Gold 10) | 10 grams | Rs. per 10 grams | 995 Fine Gold | Fine-gold assay adjusted to 999 |
| **GOLDGUINEA** | 8 grams | Rs. per 8 grams | 999 Fine Gold | Quoted unit converted to 10g |
| **GOLDPETAL** | 1 gram | Rs. per 1 gram | 999 Fine Gold | Micro-unit scaled to 10g |

---

## 2. Brand Identity & Visual Assets

- **Official Brand Mark:** Supplied orbital gold emblem with central coin/eye motif, candlestick bars, and blue constellation nodes located at `public/assets/swarnadrishti-logo.png`.
- **Favicon:** Clean circular asset at `public/favicon.png`.
- **Palette:** Midnight navy (`#060912`), deep graphite (`#0A0F1D`), slate surfaces (`#141D33`), official brand gold (`#D4AF37`, `#FBBF24`), electric cyan (`#00E5FF`), restrained jade green (`#10B981`), and amber warnings (`#F59E0B`).
- **Typography:** Modern high-legibility sans **Manrope** + **Inter** for headings and narrative text, with **JetBrains Mono** for financial tabular lining numerals.

---

## 3. Site Navigation & Route Mapping

### Public Presentation Layer
- `/` — **Public Homepage:** Editorial hero, problem statement, solution architecture, 12-feature showcase, 7-stage analytical pipeline, and trust/methodology disclosure.

### Analytical Research Workstation
- `/app` — **Market Overview:** Summary KPIs, normalized price landscape time-series (Rs./10g 999 fine basis), RV opportunity scatter plot, and latest activity.
- `/app/scanner` — **Opportunity Scanner:** Main discovery engine with multi-criteria filtering, table sorting, CSV export, and slide-over SignalGuard proof.
- `/app/rv-lab` — **Relative Value Lab:** Deep pair investigation with 4 linked charts: Normalized Prices, Observed Spread, Fair Spread & Residual, and Robust Z-Score with $\pm 2.0\sigma$ bands.
- `/app/fair-value` — **Fair Value & DNA:** 30-day rolling median baseline, Contract DNA specifications audit, and "Why is this spread unusual?" explainability panel.
- `/app/liquidity-lifecycle` — **Liquidity & Lifecycle:** Volume & Open Interest velocity, 5-day physical delivery tender countdown, and holding constraint warnings.
- `/app/cost-estimator` — **Cost Estimator:** Interactive friction simulator (brokerage, CTT 0.01%, MCX turnover fees 0.00325%, GST 18%, slippage).
- `/app/survival-signalguard` — **SignalGuard Engine:** 5-stage gatekeeper matrix auditing statistical significance, cost hurdles, liquidity proxies, and expiry alignment.
- `/app/simulator` — **What-If Simulator:** Stress-testing engine evaluating surviving net edge under elevated slippage and horizon variations.
- `/app/backtesting` — **Walk-Forward Backtesting:** Out-of-sample historical validation, portfolio equity curve vs. buy-and-hold MCX Gold benchmark, drawdown, and trade log.
- `/app/attribution` — **Gold-Neutral Attribution:** Waterfall decomposition isolating Relative-Value Alpha from Directional Gold Beta (verified $\beta \approx 0.04$).
- `/app/edge-survival` — **Edge Survival Pipeline:** 7-stage visual pipeline proving how gross pricing differences withstand real-world frictions.
- `/app/alerts` — **Alerts & Surveillance:** Event logs tracking threshold breaks, physical tender windows, and proactive cost suppressions.
- `/app/methodology` — **Methodology & Diagnostics:** MCX Daily Bhavcopy ingestion diagnostics, zero-missing audit, and normalization formulas.
- `/app/settings` — **System Settings:** API base URL configuration, Live vs. Offline Test Harness toggles, and user friction assumptions.

*(Note: Legacy URLs like `/scanner`, `/rv-lab`, `/backtesting` automatically forward to `/app/...` for seamless backwards compatibility).*

---

## 4. Setup & Running the Application

### Prerequisites
- Node.js v18+ (tested on Node.js v20 LTS)
- Python 3.10+ (tested on Python 3.15)

### Step 1: Environment Configuration
Copy `.env.example` to `.env` (or use the preconfigured defaults):
```bash
# Windows PowerShell
Copy-Item .env.example .env

# macOS / Linux
cp .env.example .env
```

### Step 2: Backend Setup & Database Ingestion
In a terminal, navigate to the `backend` folder:

```bash
cd backend

# 1. Install dependencies
python -m pip install -r requirements.txt

# 2. Run idempotent database ingestion (creates SQLite DB & imports 78 canonical trades)
python importer.py

# 3. Start the FastAPI backend server
python -m uvicorn api:app --reload --host 127.0.0.1 --port 8000
```
* **API Health Check:** `http://localhost:8000/api/health`
* **Swagger/OpenAPI Docs:** `http://localhost:8000/docs`

### Step 3: Frontend Setup & Development Server
In a second terminal, from the project root:

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### Step 4: Production Build
```bash
# Production bundle compilation
npm run build

# Preview production build locally
npm run preview
```

---

## 5. Verification & Testing

### Run Backend Pytest Suite
From the `backend` directory:
```bash
python -m pytest -v
```
*(All 11 tests pass, verifying real DB health checks, canonical 78-trade ingestion, pair summaries, calculation contracts, and structured 501 unavailable endpoints).*

### Run End-to-End Smoke Test
From the `backend` directory:
```bash
python smoke_test.py
```
*(Executes a complete 6-stage audit across SQLite persistence, import idempotency, API contracts, quantitative calculations, and production frontend assets).*

---

## 6. Architecture & Documentation Suite

Detailed technical documentation is available in the `docs/` folder:
- [docs/PROJECT_CONTEXT.md](docs/PROJECT_CONTEXT.md) — Product requirements, MCX specifications, and financial guardrails.
- [docs/IMPLEMENTATION_AUDIT.md](docs/IMPLEMENTATION_AUDIT.md) — Audit of initial repository state, identified gaps, and implemented solutions.
- [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) — Database schema, table structures, constraints, and Mermaid ER diagram.
- [docs/API_REFERENCE.md](docs/API_REFERENCE.md) — Endpoint specifications, request/response models, and error handling.
- [docs/TEST_REPORT.md](docs/TEST_REPORT.md) — Verified test execution logs and commands.

---

## 7. Data Scope & Limitations Notice

- **Historical Backtest Mode:** All trade logs and scanner displays reflect the validated 78-trade walk-forward historical backtest. They do not constitute live market signals or trading recommendations.
- **Proxy Return Metric:** The equity curve is an additive cumulative spread-return proxy in percentage points ($\sum \text{NetSpreadChangePct}$), not portfolio ROI, compounded equity, or Rupee P&L.
- **External Feeds:** Live exchange Bhavcopy ingestion, Level-2 market depth, and broker execution bridges are not connected. Endpoints requiring live exchange feeds transparently return HTTP 501 with clear unavailable notices.
