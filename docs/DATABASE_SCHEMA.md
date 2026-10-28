# SwarnaDrishti — Database Schema & Architecture

**Database Engine:** SQLite (local default) / PostgreSQL (production configurable via `DATABASE_URL`)  
**ORM:** SQLAlchemy 2.x  
**Default Path:** `backend/data/swarnadrishti.db`  

---

## 1. Entity Relationship Diagram (Mermaid)

```mermaid
erDiagram
    HISTORICAL_TRADES {
        int id PK
        string trade_key UK "Deterministic SHA-256 hash"
        string pair FK "Spread pair symbol"
        string expiry_date "Expiry YYYY-MM-DD"
        string entry_date "Entry YYYY-MM-DD"
        string exit_date "Exit YYYY-MM-DD"
        string direction "Direction: Long/Short spread"
        float entry_z "Entry Z-Score"
        float exit_z "Exit Z-Score"
        int holding_observations "Duration in sessions"
        float entry_log_spread "Entry log spread"
        float exit_log_spread "Exit log spread"
        float gross_spread_change_pct "Gross return proxy"
        float estimated_cost_pct "Modeled friction"
        float net_spread_change_pct "Net spread return proxy"
        string exit_reason "Exit trigger reason"
        text raw_row_json "Complete audit source row"
        datetime created_at "Record creation timestamp"
    }

    PAIR_SUMMARIES {
        string pair PK "Spread pair symbol"
        int trades "Total trade count"
        float win_rate_pct "Win rate percentage"
        float total_net_return_pct "Cumulative net spread return"
        float mean_net_return_pct "Average return per trade"
        float max_drawdown_pct "Max cumulative proxy drawdown"
        int mean_reversion_exits "Exit count: Mean Reversion"
        int stop_loss_exits "Exit count: Stop Loss"
        int expiry_buffer_exits "Exit count: Expiry Buffer"
        int max_holding_exits "Exit count: Max Holding"
        int end_of_segment_exits "Exit count: End of Segment"
        datetime updated_at "Summary timestamp"
    }

    DATA_IMPORTS {
        int id PK
        string source_file "Filename imported"
        string file_sha256 "SHA-256 cryptographic hash"
        int row_count "Rows imported"
        int pair_count "Distinct pairs"
        string validation_status "PASS or FAIL"
        string data_mode "historical_backtest"
        datetime imported_at "Import timestamp"
        text notes "Audit summary notes"
    }

    VALIDATION_RUNS {
        int id PK
        datetime run_at "Run timestamp"
        string status "PASS or FAIL"
        int trade_count "Evaluated trades"
        int pair_count "Evaluated pairs"
        text report_json "Detailed JSON report"
    }

    PAIR_SUMMARIES ||--o{ HISTORICAL_TRADES : "aggregates"
    DATA_IMPORTS ||--o{ HISTORICAL_TRADES : "populates"
```

---

## 2. Table Specifications

### Table: `historical_trades`
Stores the validated canonical trades imported from the walk-forward spread backtest.
* `id` (`INTEGER PRIMARY KEY AUTOINCREMENT`): Unique internal identifier.
* `trade_key` (`VARCHAR(64) UNIQUE NOT NULL`): Deterministic hash computed from `Pair`, `ExpiryDate`, `EntryDate`, `ExitDate`, `Direction`, and `NetSpreadChangePct`. Guarantees idempotency.
* `pair` (`VARCHAR(64) NOT NULL INDEX`): Contract pair (e.g., `GOLDGUINEA-GOLDPETAL`).
* `expiry_date` (`VARCHAR(16) NOT NULL`): Contract expiry date.
* `entry_date` (`VARCHAR(16) NOT NULL INDEX`): Trade entry date.
* `exit_date` (`VARCHAR(16) NOT NULL INDEX`): Trade exit date.
* `direction` (`VARCHAR(32) NOT NULL`): Trade posture (e.g., `Short A / Long B`).
* `entry_z` (`FLOAT NOT NULL`): Z-score on entry ($|z| < 4.0$).
* `exit_z` (`FLOAT NOT NULL`): Z-score on exit ($|z| \le 4.0$).
* `holding_observations` (`INTEGER NOT NULL`): Holding period in market sessions.
* `entry_log_spread` (`FLOAT NOT NULL`): Normalized log price differential at entry.
* `exit_log_spread` (`FLOAT NOT NULL`): Normalized log price differential at exit.
* `gross_spread_change_pct` (`FLOAT NOT NULL`): Gross spread return proxy.
* `estimated_cost_pct` (`FLOAT NOT NULL`): Modeled round-trip friction.
* `net_spread_change_pct` (`FLOAT NOT NULL`): Additive spread return proxy (percentage points).
* `exit_reason` (`VARCHAR(32) NOT NULL INDEX`): Cause for exit.
* `raw_row_json` (`TEXT`): Verbatim source row in JSON format.
* `created_at` (`DATETIME NOT NULL`): Ingestion timestamp.

### Table: `pair_summaries`
Maintains aggregate metrics dynamically derived from `historical_trades`.
* `pair` (`VARCHAR(64) PRIMARY KEY`): The spread pair identifier.
* `trades` (`INTEGER NOT NULL`): Total trade count.
* `win_rate_pct` (`FLOAT NOT NULL`): Percentage of profitable trades.
* `total_net_return_pct` (`FLOAT NOT NULL`): Additive sum of net spread return proxies.
* `mean_net_return_pct` (`FLOAT NOT NULL`): Mean net spread return proxy per trade.
* `max_drawdown_pct` (`FLOAT NOT NULL`): Peak-to-trough maximum drawdown of the additive proxy.
* `mean_reversion_exits` (`INTEGER NOT NULL DEFAULT 0`): Count of mean reversion exits.
* `stop_loss_exits` (`INTEGER NOT NULL DEFAULT 0`): Count of stop-loss exits.
* `expiry_buffer_exits` (`INTEGER NOT NULL DEFAULT 0`): Count of expiry buffer exits.
* `max_holding_exits` (`INTEGER NOT NULL DEFAULT 0`): Count of max holding duration exits.
* `end_of_segment_exits` (`INTEGER NOT NULL DEFAULT 0`): Count of end of segment exits.
* `updated_at` (`DATETIME NOT NULL`): Last derivation timestamp.

### Table: `data_imports`
Maintains an immutable audit ledger of file ingestion runs.
* `id` (`INTEGER PRIMARY KEY AUTOINCREMENT`)
* `source_file` (`VARCHAR(255) NOT NULL`)
* `file_sha256` (`VARCHAR(64) NOT NULL INDEX`)
* `row_count` (`INTEGER NOT NULL`)
* `pair_count` (`INTEGER NOT NULL`)
* `validation_status` (`VARCHAR(32) NOT NULL`)
* `data_mode` (`VARCHAR(64) NOT NULL DEFAULT 'historical_backtest'`)
* `imported_at` (`DATETIME NOT NULL`)
* `notes` (`TEXT`)

### Table: `validation_runs`
Audit history of mathematical and domain guard checks.
* `id` (`INTEGER PRIMARY KEY AUTOINCREMENT`)
* `run_at` (`DATETIME NOT NULL`)
* `status` (`VARCHAR(32) NOT NULL`)
* `trade_count` (`INTEGER NOT NULL`)
* `pair_count` (`INTEGER NOT NULL`)
* `report_json` (`TEXT NOT NULL`)

---

## 3. Database Management Commands

### Initialize Schema
```bash
py -c "from db.session import init_db; init_db()"
```

### Import Canonical Data Idempotently
```bash
py importer.py --file data/walk_forward_spread_trades.csv
```
