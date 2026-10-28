# SwarnaDrishti Member 3 Data Handoff

Generated from: walk_forward_spread_trades.csv
Trades: 78
Pairs: 3
Validation status: PASS

Files:
- walk_forward_spread_trades.csv: source completed-trade log
- summary.json: per-pair metrics
- scanner.json: recent historical closed trades, NOT live signals
- equity_curve.json: cumulative additive spread-return proxy
- trade_markers.json: actual recorded stop-loss exits
- validation_report.json: validation results

Important:
Returns are spread-return proxies, not portfolio ROI or rupee P&L.
Only pairs present in the source trade log are included.
Validation PASS checks configured data constraints only; it does not
guarantee strategy profitability or validate market execution assumptions.
