import React, { useEffect, useState } from 'react';
import { RefreshCw, TrendingUp, ShieldCheck, History, FileCheck2 } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { historicalResultsService } from '../services';
import { LoadingState, EmptyState, ErrorState, MetricCard } from '../components/common/States';
import { formatDate } from '../utils/formatters';

const number = (value, digits = 2) => Number.isFinite(Number(value)) ? Number(value).toFixed(digits) : '—';

export function Overview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      setResults(await historicalResultsService.getResults());
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <LoadingState message="Loading validated historical spread-backtest artifacts…" />;
  if (error) return <ErrorState error={error} onRetry={fetchData} />;

  const summary = results?.summary || {};
  const pairs = Array.isArray(summary.pairs) ? summary.pairs : [];
  const curvePayload = results?.equityCurve || {};
  const curve = Array.isArray(curvePayload.data) ? curvePayload.data : [];
  const scanner = results?.scanner || {};
  const trades = Array.isArray(scanner.trades) ? scanner.trades : [];
  const validation = results?.validation || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <div className="page-title-group">
          <h1><TrendingUp size={22} style={{ color: 'var(--accent-cyan)' }} /> Historical Backtest Overview</h1>
          <p className="page-subtitle">Validated closed-trade results from the supplied walk-forward spread backtest. This dashboard does not show live market prices or current trading signals.</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchData}><RefreshCw size={13} /> Refresh</button>
      </div>

      <div className="panel" style={{ padding: '12px 16px', borderColor: 'var(--border-medium)' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <ShieldCheck size={18} style={{ color: validation.status === 'PASS' ? 'var(--status-actionable)' : 'var(--status-risk)', flexShrink: 0 }} />
          <div>
            <strong>Data mode: Historical closed trades · Validation: {validation.status || 'UNKNOWN'}</strong>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 4 }}>{results?.disclaimer || curvePayload.note}</div>
          </div>
        </div>
      </div>

      <div className="grid-metrics">
        <MetricCard title="Completed Trades" value={summary.tradeCount ?? '—'} unit="trades" subtext="Source: walk_forward_spread_trades.csv" />
        <MetricCard title="Historical Pairs" value={summary.pairCount ?? pairs.length} unit="pairs" subtext="Pairs present in supplied trade log" />
        <MetricCard title="Cumulative Spread-Return Proxy" value={number(curve.at(-1)?.cumulativeNetReturnPct)} unit="percentage points" subtext="Additive proxy; not portfolio ROI" />
        <MetricCard title="Validation Checks" value={validation.status || '—'} unit="status" subtext={`${Array.isArray(validation.issues) ? validation.issues.length : '—'} reported issues`} />
      </div>

      <div className="grid-2col">
        <section className="panel">
          <div className="panel-header"><div className="panel-title"><TrendingUp size={16} style={{ color: 'var(--accent-cyan)' }} /> Cumulative Net Spread-Return Proxy</div><span className="panel-meta">{curvePayload.units || 'percentage points'}</span></div>
          <div className="panel-body" style={{ height: 320 }}>
            {curve.length ? <ResponsiveContainer width="100%" height="100%"><LineChart data={curve} margin={{ top: 12, right: 18, left: 4, bottom: 4 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" /><XAxis dataKey="date" tickFormatter={formatDate} stroke="var(--text-muted)" fontSize={11} /><YAxis stroke="var(--text-muted)" fontSize={11} /><Tooltip labelFormatter={(v) => `Date: ${v}`} formatter={(v) => [`${number(v, 4)} pp`, 'Cumulative proxy']} contentStyle={{ backgroundColor: 'var(--bg-surface-elevated)', borderColor: 'var(--border-medium)', color: 'var(--text-primary)' }} /><Line type="monotone" dataKey="cumulativeNetReturnPct" name="Cumulative proxy" stroke="#00E5FF" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer> : <EmptyState title="No equity-curve data" description="The backend returned no historical curve points." />}
          </div>
          <div style={{ padding: '8px 18px', fontSize: '0.72rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)' }}>{curvePayload.note || 'Historical additive spread-return proxy.'}</div>
        </section>

        <section className="panel">
          <div className="panel-header"><div className="panel-title"><FileCheck2 size={16} style={{ color: 'var(--accent-gold)' }} /> Pair-Level Historical Summary</div><span className="panel-meta">{summary.status || 'unverified'}</span></div>
          <div className="table-wrapper"><table className="financial-table"><thead><tr><th>Pair</th><th className="num-col">Trades</th><th className="num-col">Win rate</th><th className="num-col">Net spread proxy (pp)</th><th className="num-col">Max drawdown (pp)</th></tr></thead><tbody>
            {pairs.map((p) => <tr key={p.pair}><td>{p.pair}</td><td className="num-col">{p.trades}</td><td className="num-col">{number(p.winRatePct)}%</td><td className="num-col">{number(p.totalNetReturnPct, 4)}</td><td className="num-col">{number(p.maxDrawdownPct, 4)}</td></tr>)}
            {!pairs.length && <tr><td colSpan="5">No pair summary available.</td></tr>}
          </tbody></table></div>
        </section>
      </div>

      <section className="panel">
        <div className="panel-header"><div className="panel-title"><History size={16} style={{ color: 'var(--accent-cyan)' }} /> Recent Historical Closed Trades</div><span className="panel-meta">{scanner.windowStart || '—'} to {scanner.windowEnd || '—'} · {trades.length} records</span></div>
        <div className="table-wrapper"><table className="financial-table"><thead><tr><th>Pair</th><th>Entry</th><th>Exit</th><th>Direction</th><th className="num-col">Entry Z</th><th className="num-col">Exit Z</th><th className="num-col">Net spread proxy (pp)</th><th>Exit reason</th></tr></thead><tbody>
          {trades.slice(0, 12).map((t, i) => <tr key={`${t.pair}-${t.entryDate}-${i}`}><td>{t.pair}</td><td>{t.entryDate}</td><td>{t.exitDate}</td><td>{t.direction}</td><td className="num-col">{number(t.entryZ, 3)}</td><td className="num-col">{number(t.exitZ, 3)}</td><td className="num-col">{number(t.netReturnPct, 4)}</td><td>{t.exitReason}</td></tr>)}
          {!trades.length && <tr><td colSpan="8">No recent historical trades available.</td></tr>}
        </tbody></table></div>
        <div style={{ padding: '10px 18px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>These are recorded historical trades, not recommendations or current entry signals. Only the latest 12 records are shown here.</div>
      </section>
    </div>
  );
}
