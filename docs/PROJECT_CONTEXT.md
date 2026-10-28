# SwarnaDrishti — Project Context & Guardrails

## 1. Product Vision & Mission
**SwarnaDrishti** (स्वर्णदृष्टि - *The Golden Vision*) is an institutional-grade commodity derivatives research workstation engineered for Multi Commodity Exchange of India (MCX) Gold Futures relative-value analytics.

The platform provides quantitative decision support for relative-value spread traders, isolating pricing anomalies across normalized MCX gold futures contracts.

---

## 2. MCX Gold Contract Normalization Specifications

MCX trades multiple gold contracts with differing lot sizes, quotation bases, and deliverable purities. To compare spreads accurately, prices are normalized to a standard **10 grams of 999 fine gold** basis:

| Contract Symbol | Trading Unit | Quotation Basis | Deliverable Purity | Normalization Method |
| :--- | :--- | :--- | :--- | :--- |
| **GOLDM** (Gold Mini) | 100 grams | Rs. per 10 grams | 995 Fine Gold | Assay adjustment: $\text{Price} \times \frac{999}{995}$ |
| **GOLDTEN** (Gold 10) | 10 grams | Rs. per 10 grams | 995 Fine Gold | Assay adjustment: $\text{Price} \times \frac{999}{995}$ |
| **GOLDGUINEA** | 8 grams | Rs. per 8 grams | 999 Fine Gold | Unit scaling: $\text{Price} \times \frac{10}{8}$ |
| **GOLDPETAL** | 1 gram | Rs. per 1 gram | 999 Fine Gold | Unit scaling: $\text{Price} \times 10$ |

---

## 3. Backtest Dataset & Lineage

* **Canonical Source File:** `backend/data/walk_forward_spread_trades.csv`
* **Cryptographic File Hash:** `bf5ebe3e1f791d459ba1591f9eaf390ac061305242b98bbcd562d9743aa90062`
* **Verified Volume:** 78 completed closed trades across 3 spread pairs:
  1. `GOLDGUINEA-GOLDPETAL`: 29 trades
  2. `GOLDTEN-GOLDGUINEA`: 23 trades
  3. `GOLDTEN-GOLDPETAL`: 26 trades
* **Validation Baseline:**
  * Entry Z-Score Guard: $|EntryZ| < 4.0$ (Max observed: 2.97, Min observed: -3.41).
  * Exit Z-Score Guard: $|ExitZ| \le 4.0$ (Max observed: 3.50, Min observed: -3.05).
  * Expiry Buffer: No trades entered within 5 calendar days of contract expiry.
  * Tender Delivery Constraint: No trades exited on or after physical delivery expiry date ($ExitDate \le ExpiryDate$).
  * Zero Stop-Loss Exits recorded in this walk-forward segment; 7 Expiry Buffer exits executed.

---

## 4. Financial & Operational Disclaimers

1. **Proxy Return Metric:**
   The cumulative performance metric is an **additive cumulative spread-return proxy in percentage points** ($\sum \text{NetSpreadChangePct}$). It is **NOT** portfolio ROI, compounded portfolio equity, or Rupee P&L.
2. **Historical vs. Live Data:**
   The scanner and overview displays historical closed trades from a past backtest window (`2026-09-26` to `2026-10-26`). They do not represent live market signals or active trading advice.
3. **External Feed Status:**
   Live MCX feeds, Level-2 order books, and broker execution channels are not connected. Any feature requiring live market data transparently returns an unavailable state.
