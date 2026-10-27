import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Activity,
  ShieldCheck,
  Eye,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { useApp } from '../context/AppContext';
import { marketDataService, relativeValueService } from '../services';
import { formatINR, formatPrice, formatPercent, formatZScore, formatDate } from '../utils/formatters';
import {
  LoadingState,
  EmptyState,
  ErrorState,
  MetricCard,
  SignalBadge,
  StaleDataWarning
} from '../components/common/States';

export function Overview() {
  const navigate = useNavigate();
  const { selectedDate, selectedContract } = useApp();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [scannerData, setScannerData] = useState(null);

  // Active chart series visibility toggles
  const [seriesVisibility, setSeriesVisibility] = useState({
    GOLDM: true,
    GOLDTEN: true,
    GOLDGUINEA: true,
    GOLDPETAL: true
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [mkt, scn] = await Promise.all([
        marketDataService.getMarketData(selectedDate),
        relativeValueService.getOpportunityScanner(selectedDate)
      ]);
      setMarketData(mkt);
      setScannerData(scn);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const toggleSeries = (symbol) => {
    setSeriesVisibility(prev => ({ ...prev, [symbol]: !prev[symbol] }));
  };

  if (loading) {
    return <LoadingState message={`Fetching MCX settlement records for date: ${selectedDate}...`} />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchData} />;
  }

  const contracts = marketData?.contracts || [];
  const pairs = scannerData?.pairs || [];
  const timeSeries = marketData?.timeSeries || [];
  const summary = scannerData?.summary || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <TrendingUp size={22} style={{ color: 'var(--accent-cyan)' }} />
            Market Overview
          </h1>
          <p className="page-subtitle">
            Understand normalized gold prices, relative-value behaviour, and analytical data quality across MCX contracts.
          </p>
        </div>
        <div className="page-actions">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Settlement Session: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{selectedDate}</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchData} title="Re-fetch settlement data">
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Indicators */}
      <div className="grid-metrics">
        <MetricCard
          title="Available Contracts"
          value={contracts.length}
          unit="instruments"
          subtext="GOLDM, GOLDTEN, GOLDGUINEA, GOLDPETAL"
          tooltip="Verified MCX gold futures contracts with active bhavcopy data"
        />
        <MetricCard
          title="Eligible Pairs"
          value={summary.eligiblePairs != null ? summary.eligiblePairs : '—'}
          unit="spreads"
          subtext="Mathematically comparable pairs"
          tooltip="Pairs with verified trading activity and normalized fine-gold basis"
        />
        <MetricCard
          title="Actionable Signals"
          value={summary.actionableCount != null ? summary.actionableCount : '—'}
          unit="signals"
          statusColor="var(--status-actionable)"
          subtext="Net edge survives all hurdles"
          tooltip="Deviations where residual > entry threshold and estimated net edge > 0 after costs"
        />
        <MetricCard
          title="Watch Candidates"
          value={summary.watchCount != null ? summary.watchCount : '—'}
          unit="pairs"
          statusColor="var(--status-watch)"
          subtext="Requires confirmation or carry check"
          tooltip="Statistically anomalous but with lifecycle or calendar mismatch considerations"
        />
        <MetricCard
          title="Data Ingestion Quality"
          value={summary.dataQualityStatus || 'VERIFIED'}
          statusColor="var(--status-actionable)"
          subtext="Bhavcopy settlement verified"
          tooltip="Audit checks on settlement prices, non-zero volume, and normalization"
        />
      </div>

      {/* Main Visualizations Grid */}
      <div className="grid-2col">
        {/* A. Normalized Price Landscape */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <Activity size={16} style={{ color: 'var(--accent-cyan)' }} />
              Normalized Price Landscape (Rs. / 10g Fine Gold)
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['GOLDM', 'GOLDTEN', 'GOLDGUINEA', 'GOLDPETAL'].map(sym => (
                <button
                  key={sym}
                  onClick={() => toggleSeries(sym)}
                  style={{
                    fontSize: '0.68rem',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-xs)',
                    fontFamily: 'var(--font-mono)',
                    backgroundColor: seriesVisibility[sym] ? 'var(--bg-surface-elevated)' : 'transparent',
                    color: seriesVisibility[sym] ? 'var(--accent-cyan)' : 'var(--text-muted)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>
          <div className="panel-body" style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickFormatter={formatDate} />
                <YAxis
                  stroke="var(--text-muted)"
                  fontSize={11}
                  domain={['auto', 'auto']}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(1)}k`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--bg-surface-elevated)', borderColor: 'var(--border-medium)', color: 'var(--text-primary)' }}
                  labelFormatter={(val) => `Date: ${formatDate(val)}`}
                  formatter={(val, name) => [`₹${formatPrice(val)}`, name]}
                />
                {seriesVisibility.GOLDM && <Line type="monotone" dataKey="GOLDM" stroke="#F59E0B" dot={false} strokeWidth={2} name="GOLDM" />}
                {seriesVisibility.GOLDTEN && <Line type="monotone" dataKey="GOLDTEN" stroke="#00E5FF" dot={false} strokeWidth={2} name="GOLDTEN" />}
                {seriesVisibility.GOLDGUINEA && <Line type="monotone" dataKey="GOLDGUINEA" stroke="#10B981" dot={false} strokeWidth={1.5} name="GOLDGUINEA" />}
                {seriesVisibility.GOLDPETAL && <Line type="monotone" dataKey="GOLDPETAL" stroke="#EC4899" dot={false} strokeWidth={1.5} name="GOLDPETAL" />}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ padding: '8px 18px', fontSize: '0.72rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)' }}>
            All prices normalized to 999 fine gold equivalent basis (₹ / 10 grams) to allow direct mathematical comparison.
          </div>
        </div>

        {/* B. Relative-Value Scatter Map */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <ShieldCheck size={16} style={{ color: 'var(--accent-gold)' }} />
              Relative-Value Opportunity Map
            </div>
            <span className="panel-meta">Z-Score vs. Net Edge</span>
          </div>
          <div className="panel-body" style={{ height: 320 }}>
            {pairs.length === 0 ? (
              <EmptyState title="No Plotted Pairs" description="No eligible pairs available for the scatter map." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 10, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis
                    type="number"
                    dataKey="robustZScore"
                    name="Robust Z-Score"
                    unit="σ"
                    stroke="var(--text-muted)"
                    fontSize={11}
                  />
                  <YAxis
                    type="number"
                    dataKey="estimatedNetEdge"
                    name="Net Edge"
                    unit="₹"
                    stroke="var(--text-muted)"
                    fontSize={11}
                  />
                  <ZAxis type="number" dataKey="liquidityScore" range={[60, 200]} name="Liquidity Score" />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{ backgroundColor: 'var(--bg-surface-elevated)', borderColor: 'var(--border-medium)', color: 'var(--text-primary)' }}
                    formatter={(val, name) => [val, name]}
                  />
                  <Scatter
                    name="Eligible Pairs"
                    data={pairs.map(p => ({
                      ...p,
                      fill: p.signalStatus === 'ACTIONABLE' ? 'var(--status-actionable)' : p.signalStatus === 'WATCH' ? 'var(--status-watch)' : 'var(--status-nosignal)'
                    }))}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            )}
          </div>
          <div style={{ padding: '8px 18px', fontSize: '0.72rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)' }}>
            Each plotted point reflects an eligible contract pair. Bubble size represents verified liquidity proxy.
          </div>
        </div>
      </div>

      {/* C. Latest Pair Activity Table */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <TrendingUp size={16} style={{ color: 'var(--accent-cyan)' }} />
            Latest Relative-Value Pair Activity
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/app/scanner')}
          >
            Open Full Scanner &rarr;
          </button>
        </div>
        <div className="table-wrapper">
          <table className="financial-table">
            <thead>
              <tr>
                <th>Contract Pair</th>
                <th className="num-col">Observed Spread</th>
                <th className="num-col">Fair Spread</th>
                <th className="num-col">Residual</th>
                <th className="num-col">Robust Z-Score</th>
                <th>Liquidity</th>
                <th className="num-col">Estimated Net Edge</th>
                <th>Lifecycle Status</th>
                <th>Signal Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pairs.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '30px' }}>
                    No eligible pair records available for this session.
                  </td>
                </tr>
              ) : (
                pairs.map(pair => (
                  <tr key={pair.id}>
                    <td style={{ fontWeight: 600 }}>{pair.pair}</td>
                    <td className="num-col">₹{formatPrice(pair.observedSpread)}</td>
                    <td className="num-col">₹{formatPrice(pair.estimatedFairSpread)}</td>
                    <td className="num-col" style={{ color: Math.abs(pair.residual) > 30 ? 'var(--accent-cyan)' : 'inherit' }}>
                      ₹{formatPrice(pair.residual)}
                    </td>
                    <td className="num-col font-mono" style={{ fontWeight: 600 }}>
                      {formatZScore(pair.robustZScore)}
                    </td>
                    <td>
                      <span className="badge badge-neutral">
                        {pair.liquidityAssessment}
                      </span>
                    </td>
                    <td className="num-col font-mono" style={{ color: pair.estimatedNetEdge > 0 ? 'var(--status-actionable)' : 'var(--status-risk)', fontWeight: 600 }}>
                      ₹{formatPrice(pair.estimatedNetEdge)}
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {pair.lifecycleAssessment}
                    </td>
                    <td>
                      <SignalBadge status={pair.signalStatus} reason={pair.explanation} />
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/app/rv-lab?pair=${pair.id}`)}
                        title="Investigate in Relative Value Lab"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
