import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Layers,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { useApp } from '../context/AppContext';
import { liquidityService } from '../services';
import { formatVolume, formatPrice } from '../utils/formatters';
import {
  LoadingState,
  EmptyState,
  ErrorState,
  MetricCard,
  ExplanationPanel
} from '../components/common/States';

export function LiquidityLifecycle() {
  const { selectedDate } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchLiquidity = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await liquidityService.getLiquidityLifecycle();
      setData(res);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiquidity();
  }, [selectedDate]);

  if (loading) {
    return <LoadingState message="Auditing contract liquidity proxies, turnover depth, and tender delivery windows..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchLiquidity} />;
  }

  const contracts = data?.contracts || [];
  const warnings = data?.lifecycleWarnings || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <ShieldAlert size={22} style={{ color: 'var(--status-watch)' }} />
            Liquidity & Contract Lifecycle Radar
          </h1>
          <p className="page-subtitle">
            Monitor trading volume, open interest velocity, physical delivery tender calendars, and contract roll horizons.
          </p>
        </div>
      </div>

      {/* Warnings Banner if any */}
      {warnings.length > 0 && (
        <div style={{
          backgroundColor: 'var(--status-watch-bg)',
          border: '1px solid var(--status-watch-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--status-watch)', fontWeight: 600, fontSize: '0.85rem' }}>
            <AlertTriangle size={16} />
            Active Physical Tender Period Warnings
          </div>
          {warnings.map((w, idx) => (
            <div key={idx} style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}>
              • <strong>{w.symbol}:</strong> {w.notice} (Days to tender start: {w.daysToTender})
            </div>
          ))}
        </div>
      )}

      {/* Liquidity Chart: Volume & Open Interest */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <Activity size={16} style={{ color: 'var(--accent-cyan)' }} />
            MCX Traded Volume & Open Interest Comparison
          </div>
          <span className="panel-meta">Daily Traded Contracts</span>
        </div>
        <div className="panel-body" style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={contracts} margin={{ top: 20, right: 20, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="symbol" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--bg-surface-elevated)', borderColor: 'var(--border-medium)', color: 'var(--text-primary)' }}
                formatter={(val, name) => [formatVolume(val), name]}
              />
              <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
              <Bar dataKey="volume" fill="#00E5FF" name="Daily Volume (Lots)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="openInterest" fill="#F59E0B" name="Open Interest (Lots)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Contract Lifecycle Audit Table */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <Calendar size={16} style={{ color: 'var(--accent-cyan)' }} />
            Contract Expiry & Delivery Tender Lifecycle Timeline
          </div>
          <span className="panel-meta">Verified MCX Specifications</span>
        </div>
        <div className="table-wrapper">
          <table className="financial-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Contract Expiry</th>
                <th className="num-col">Days Remaining</th>
                <th>Tender Window Starts</th>
                <th className="num-col">Daily Volume</th>
                <th className="num-col">Open Interest</th>
                <th className="num-col">Liquidity Proxy</th>
                <th>Lifecycle Constraint</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map(c => (
                <tr key={c.symbol}>
                  <td style={{ fontWeight: 600 }}>{c.symbol}</td>
                  <td className="font-mono">{c.expiry}</td>
                  <td className="num-col font-mono" style={{ color: c.daysToExpiry <= 15 ? 'var(--status-watch)' : 'inherit' }}>
                    {c.daysToExpiry} days
                  </td>
                  <td className="font-mono">{c.tenderPeriodStart}</td>
                  <td className="num-col font-mono">{formatVolume(c.volume)}</td>
                  <td className="num-col font-mono">{formatVolume(c.openInterest)}</td>
                  <td className="num-col font-mono" style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>
                    {c.liquidityProxyScore?.toFixed(1) || '—'} / 100
                  </td>
                  <td>
                    {c.daysToExpiry <= 14 ? (
                      <span className="badge badge-watch">
                        APPROACHING TENDER
                      </span>
                    ) : (
                      <span className="badge badge-actionable">
                        ACTIVE TRADING
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Methodology Explanations */}
      <ExplanationPanel
        title="Liquidity Proxy Methodology & Limitations"
        explanation="The SwarnaDrishti Liquidity Proxy evaluates trading continuity, turnover volume, and Open Interest depth. Notice: Settlement data reflects closing prices and does NOT prove orderbook depth or executable bid-ask spread at any single microsecond."
      >
        <div style={{ marginTop: 8, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          <strong>Tender Window Rule:</strong> In MCX Gold contracts, physical delivery tender begins 5 trading sessions prior to contract expiry. All non-delivery arbitrage positions must be closed or rolled prior to the tender date to avoid physical delivery penalties.
        </div>
      </ExplanationPanel>
    </div>
  );
}
