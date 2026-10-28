import React, { useEffect, useMemo, useState } from 'react';
import { Radar, RefreshCw, Search, Download, History } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { relativeValueService } from '../services';
import { LoadingState, EmptyState, ErrorState } from '../components/common/States';

const fmt = (v, d = 4) => Number.isFinite(Number(v)) ? Number(v).toFixed(d) : '—';

export function OpportunityScanner() {
  const { selectedDate } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [search, setSearch] = useState('');

  const fetchScanner = async () => {
    setLoading(true);
    setError(null);
    try { setData(await relativeValueService.getOpportunityScanner(selectedDate)); }
    catch (err) { setError(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchScanner(); }, [selectedDate]);

  const trades = useMemo(() => {
    const all = Array.isArray(data?.trades) ? data.trades : [];
    const q = search.trim().toLowerCase();
    return q ? all.filter(t => [t.pair, t.direction, t.exitReason, t.status].some(v => String(v || '').toLowerCase().includes(q))) : all;
  }, [data, search]);

  const exportCSV = () => {
    if (!trades.length) return;
    const columns = ['pair','entryDate','exitDate','expiryDate','direction','entryZ','exitZ','netReturnPct','exitReason','status'];
    const quote = (v) => `"${String(v ?? '').replaceAll('"', '""')}"`;
    const csv = [columns.join(','), ...trades.map(t => columns.map(c => quote(t[c])).join(','))].join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a'); link.href = url; link.download = 'SwarnaDrishti_Historical_Closed_Trades.csv'; link.click(); URL.revokeObjectURL(url);
  };

  if (loading) return <LoadingState message="Loading recorded historical closed trades…" />;
  if (error) return <ErrorState error={error} onRetry={fetchScanner} />;

  return <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
    <div className="page-header">
      <div className="page-title-group">
        <h1><Radar size={22} style={{ color: 'var(--accent-cyan)' }} /> Historical Trade Scanner</h1>
        <p className="page-subtitle">Browse closed trades from the saved walk-forward backtest. This is not a live signal scanner and does not generate entry recommendations.</p>
      </div>
      <div style={{ display: 'flex', gap: 8 }}><button className="btn btn-secondary btn-sm" onClick={fetchScanner}><RefreshCw size={13} /> Refresh</button><button className="btn btn-secondary btn-sm" onClick={exportCSV} disabled={!trades.length}><Download size={13} /> Export CSV</button></div>
    </div>

    <div className="grid-metrics">
      <div className="metric-card"><div className="metric-label">Historical records in window</div><div className="metric-value">{data?.tradeCount ?? trades.length}</div><div className="metric-subtext">{data?.windowStart || '—'} to {data?.windowEnd || '—'}</div></div>
      <div className="metric-card"><div className="metric-label">Signal mode</div><div className="metric-value" style={{ fontSize: '1.1rem' }}>Historical only</div><div className="metric-subtext">No live market feed connected</div></div>
      <div className="metric-card"><div className="metric-label">Unique pairs in summary</div><div className="metric-value">{data?.summary?.eligiblePairs ?? data?.pairs?.length ?? '—'}</div><div className="metric-subtext">Pairs in supplied trade log</div></div>
    </div>

    <section className="panel">
      <div className="panel-header"><div className="panel-title"><History size={16} style={{ color: 'var(--accent-cyan)' }} /> Closed Trades</div><span className="panel-meta">{trades.length} shown</span></div>
      <div style={{ padding: '12px 16px' }}><div style={{ display: 'flex', alignItems: 'center', gap: 8, maxWidth: 440, border: '1px solid var(--border-subtle)', borderRadius: 6, padding: '7px 10px' }}><Search size={15} /><input aria-label="Search historical trades" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pair, direction, exit reason…" style={{ border: 0, outline: 0, width: '100%', background: 'transparent', color: 'var(--text-primary)' }} /></div></div>
      <div className="table-wrapper"><table className="financial-table"><thead><tr><th>Pair</th><th>Entry date</th><th>Exit date</th><th>Expiry</th><th>Direction</th><th className="num-col">Entry Z</th><th className="num-col">Exit Z</th><th className="num-col">Net spread proxy (pp)</th><th>Exit reason</th><th>Status</th></tr></thead><tbody>
        {trades.map((t, i) => <tr key={`${t.pair}-${t.entryDate}-${i}`}><td>{t.pair}</td><td>{t.entryDate}</td><td>{t.exitDate}</td><td>{t.expiryDate || '—'}</td><td>{t.direction || '—'}</td><td className="num-col">{fmt(t.entryZ, 3)}</td><td className="num-col">{fmt(t.exitZ, 3)}</td><td className="num-col">{fmt(t.netReturnPct, 5)}</td><td>{t.exitReason || '—'}</td><td>{t.status || 'Closed'}</td></tr>)}
        {!trades.length && <tr><td colSpan="10"><EmptyState title="No matching historical trades" description="Try a different search term or refresh the saved backtest artifacts." /></td></tr>}
      </tbody></table></div>
      <div style={{ padding: '10px 16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Net return values are spread-return proxies in percentage points, not rupee P&amp;L. Saved scanner window: {data?.windowStart || '—'} through {data?.windowEnd || '—'}.</div>
    </section>
  </div>;
}
