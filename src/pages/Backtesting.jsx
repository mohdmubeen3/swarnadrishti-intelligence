import React, { useState, useEffect } from 'react';
import {
  History,
  Play,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  Download,
  AlertCircle,
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { useApp } from '../context/AppContext';
import { backtestService } from '../services';
import { formatINR, formatPrice, formatPercent, formatDate } from '../utils/formatters';
import {
  LoadingState,
  EmptyState,
  ErrorState,
  MetricCard,
  ExplanationPanel
} from '../components/common/States';

export function Backtesting() {
  const { selectedPair } = useApp();

  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  // Configuration options
  const [pair, setPair] = useState('GOLDM-GOLDTEN');
  const [trainingWindow, setTrainingWindow] = useState('6_MONTHS');
  const [entryZ, setEntryZ] = useState(2.0);
  const [exitZ, setExitZ] = useState(0.5);
  const [maxHoldingDays, setMaxHoldingDays] = useState(10);
  const [includeCosts, setIncludeCosts] = useState(true);

  const fetchBacktest = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await backtestService.runBacktest({
        pair,
        trainingWindow,
        entryZ: Number(entryZ),
        exitZ: Number(exitZ),
        maxHoldingDays: Number(maxHoldingDays),
        includeCosts
      });
      setResults(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBacktest();
  }, []);

  const handleRun = async (e) => {
    e.preventDefault();
    setRunning(true);
    try {
      const data = await backtestService.runBacktest({
        pair,
        trainingWindow,
        entryZ: Number(entryZ),
        exitZ: Number(exitZ),
        maxHoldingDays: Number(maxHoldingDays),
        includeCosts
      });
      setResults(data);
    } catch (err) {
      setError(err);
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return <LoadingState message="Executing walk-forward historical backtest pipeline and compiling trade log..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchBacktest} />;
  }

  const res = results || {};
  const trades = res.tradeHistory || [];
  const equity = res.equityCurve || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <History size={22} style={{ color: 'var(--accent-cyan)' }} />
            Walk-Forward Strategy Backtesting
          </h1>
          <p className="page-subtitle">
            Validate residual mean-reversion rules across out-of-sample historical MCX contract settlement periods.
          </p>
        </div>
      </div>

      {/* Configuration Form Bar */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <Layers size={16} style={{ color: 'var(--accent-cyan)' }} />
            Walk-Forward Backtest Engine Configuration
          </div>
          <span className="panel-meta">Strict Look-Ahead Bias Prevention</span>
        </div>
        <div className="panel-body">
          <form onSubmit={handleRun} style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>
            <div className="form-group">
              <label className="form-label">Contract Pair:</label>
              <select value={pair} onChange={(e) => setPair(e.target.value)}>
                <option value="GOLDM-GOLDTEN">GOLDM / GOLDTEN</option>
                <option value="GOLDM-GOLDGUINEA">GOLDM / GOLDGUINEA</option>
                <option value="GOLDTEN-GOLDPETAL">GOLDTEN / GOLDPETAL</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Training Period:</label>
              <select value={trainingWindow} onChange={(e) => setTrainingWindow(e.target.value)}>
                <option value="3_MONTHS">Rolling 3 Months</option>
                <option value="6_MONTHS">Rolling 6 Months (Standard)</option>
                <option value="12_MONTHS">Expanding 12 Months</option>
              </select>
            </div>

            <div className="form-group" style={{ width: 120 }}>
              <label className="form-label">Entry Z-Score:</label>
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="3.5"
                value={entryZ}
                onChange={(e) => setEntryZ(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ width: 120 }}>
              <label className="form-label">Exit Z-Score:</label>
              <input
                type="number"
                step="0.1"
                min="0.0"
                max="1.5"
                value={exitZ}
                onChange={(e) => setExitZ(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ width: 130 }}>
              <label className="form-label">Max Holding (Days):</label>
              <input
                type="number"
                min="1"
                max="25"
                value={maxHoldingDays}
                onChange={(e) => setMaxHoldingDays(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={running}>
              <Play size={14} />
              {running ? 'Running Simulation...' : 'Run Walk-Forward Backtest'}
            </button>
          </form>
        </div>
      </div>

      {/* Results KPI Metrics */}
      <div className="grid-metrics">
        <MetricCard
          title="Net Strategy P&L"
          value={formatINR(res.netPnL, 0)}
          statusColor={res.netPnL > 0 ? 'var(--status-actionable)' : 'var(--status-risk)'}
          subtext={`Gross: ${formatINR(res.grossPnL, 0)}`}
          tooltip="Realized portfolio net P&L after subtracting all trading costs, taxes, and slippage"
        />
        <MetricCard
          title="Total Frictions & Taxes"
          value={formatINR(res.totalTradingCosts, 0)}
          statusColor="var(--status-risk)"
          subtext="MCX Fees, CTT, GST & Slippage"
          tooltip="Cumulative transaction costs deducted over the testing window"
        />
        <MetricCard
          title="Win Rate / Profit Factor"
          value={`${res.winRate}% / ${res.profitFactor}`}
          subtext={`${res.profitableTrades} wins / ${res.lossTrades} losses`}
          tooltip="Percentage of profitable trades and ratio of gross profits to gross losses"
        />
        <MetricCard
          title="Sharpe Ratio (Ann.)"
          value={res.sharpeRatio ? res.sharpeRatio.toFixed(2) : '—'}
          subtext="Risk-adjusted return"
          tooltip="Annualized Sharpe ratio computed from daily strategy equity changes"
        />
        <MetricCard
          title="Max Drawdown"
          value={`${res.maxDrawdown}%`}
          statusColor="var(--status-risk)"
          subtext={formatINR(res.maxDrawdownINR, 0)}
          tooltip="Maximum peak-to-trough equity decline"
        />
      </div>

      {/* Equity Curve Visualization */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <TrendingUp size={16} style={{ color: 'var(--accent-cyan)' }} />
            Walk-Forward Equity Curve vs. Buy & Hold Benchmark
          </div>
          <span className="panel-meta">Initial Capital: ₹500,000</span>
        </div>
        <div className="panel-body" style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={equity} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickFormatter={formatDate} />
              <YAxis stroke="var(--text-muted)" fontSize={11} domain={['auto', 'auto']} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--bg-surface-elevated)', borderColor: 'var(--border-medium)', color: 'var(--text-primary)' }}
                formatter={(val, name) => [formatINR(val, 0), name]}
              />
              <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
              <Line type="monotone" dataKey="portfolioEquity" stroke="#00E5FF" strokeWidth={2.5} dot={{ r: 3 }} name="SwarnaDrishti RV Strategy" />
              <Line type="monotone" dataKey="benchmarkEquity" stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="3 3" dot={false} name="Buy & Hold MCX Gold" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trade Log Table */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <History size={16} style={{ color: 'var(--accent-cyan)' }} />
            Completed Trade Log (Out-of-Sample Walk-Forward Sessions)
          </div>
          <span className="panel-meta">{trades.length} Verified Trades</span>
        </div>
        <div className="table-wrapper">
          <table className="financial-table">
            <thead>
              <tr>
                <th>Trade ID</th>
                <th>Entry Date</th>
                <th>Exit Date</th>
                <th>Strategy Direction</th>
                <th className="num-col">Entry Spread</th>
                <th className="num-col">Exit Spread</th>
                <th className="num-col">Gross P&L</th>
                <th className="num-col">Costs</th>
                <th className="num-col">Net P&L</th>
                <th>Exit Reason</th>
              </tr>
            </thead>
            <tbody>
              {trades.map(t => (
                <tr key={t.id}>
                  <td className="font-mono" style={{ fontWeight: 600 }}>{t.id}</td>
                  <td className="font-mono">{t.entryDate}</td>
                  <td className="font-mono">{t.exitDate}</td>
                  <td style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                    {t.direction}
                  </td>
                  <td className="num-col font-mono">₹{formatPrice(t.entrySpread)}</td>
                  <td className="num-col font-mono">₹{formatPrice(t.exitSpread)}</td>
                  <td className="num-col font-mono" style={{ color: t.grossPnL > 0 ? 'var(--status-actionable)' : 'var(--status-risk)' }}>
                    {formatINR(t.grossPnL, 0)}
                  </td>
                  <td className="num-col font-mono" style={{ color: 'var(--text-muted)' }}>
                    -{formatINR(t.costs, 0)}
                  </td>
                  <td className="num-col font-mono" style={{ fontWeight: 700, color: t.netPnL > 0 ? 'var(--status-actionable)' : 'var(--status-risk)' }}>
                    {formatINR(t.netPnL, 0)}
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {t.exitReason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Look-Ahead Bias Safeguards Explanation */}
      <ExplanationPanel
        title="Walk-Forward Validation Principles & Safeguards"
        explanation="Models are fitted solely on historical training windows (e.g. t-180 to t-1). Signals are generated strictly on out-of-sample forward observations. No continuous near-month roll smoothing or look-ahead data was used."
      />
    </div>
  );
}
