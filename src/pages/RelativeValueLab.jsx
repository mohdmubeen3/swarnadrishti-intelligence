import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Activity,
  Layers,
  Calendar,
  TrendingDown,
  Info,
  Sliders,
  Download,
  ShieldCheck,
  AlertTriangle,
  FileText
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { useApp } from '../context/AppContext';
import { relativeValueService } from '../services';
import { formatPrice, formatZScore, formatDate } from '../utils/formatters';
import { MCX_GOLD_CONTRACTS } from '../utils/contractSpecs';
import { CustomSelect } from '../components/common/CustomSelect';
import {
  LoadingState,
  EmptyState,
  ErrorState,
  MetricCard
} from '../components/common/States';

const PAIR_OPTIONS = [
  { value: 'GOLDTEN-GOLDPETAL-202611', label: 'GOLDTEN / GOLDPETAL (Nov-2026)', subtext: '26 backtest trades · 69.2% win rate' },
  { value: 'GOLDGUINEA-GOLDPETAL', label: 'GOLDGUINEA / GOLDPETAL (Canonical)', subtext: '29 backtest trades · 75.9% win rate' },
  { value: 'GOLDTEN-GOLDGUINEA', label: 'GOLDTEN / GOLDGUINEA (Canonical)', subtext: '23 backtest trades · 73.9% win rate' },
  { value: 'GOLDM-GOLDTEN-20261105', label: 'GOLDM / GOLDTEN (Nov-2026)', subtext: 'Forward specification (Feed required)' },
  { value: 'GOLDM-GOLDGUINEA-202611', label: 'GOLDM / GOLDGUINEA (Nov-2026)', subtext: 'Forward specification (Feed required)' },
  { value: 'GOLDM-GOLDPETAL-202611', label: 'GOLDM / GOLDPETAL (Nov-2026)', subtext: 'Forward specification (Feed required)' },
];

export function RelativeValueLab() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedDate } = useApp();

  const pairParam = searchParams.get('pair') || 'GOLDTEN-GOLDPETAL-202611';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataResponse, setDataResponse] = useState(null);
  const [pairData, setPairData] = useState(null);
  const [timeSeries, setTimeSeries] = useState([]);

  // Selected pair legs
  const [selectedLegA, setSelectedLegA] = useState('GOLDTEN');
  const [selectedLegB, setSelectedLegB] = useState('GOLDPETAL');

  const fetchPairDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await relativeValueService.getPairDetail(pairParam);
      setDataResponse(data);
      setPairData(data.pair || null);
      setTimeSeries(data.timeSeries || []);

      if (data.legA) setSelectedLegA(data.legA);
      else if (data.pair?.legA) setSelectedLegA(data.pair.legA);

      if (data.legB) setSelectedLegB(data.legB);
      else if (data.pair?.legB) setSelectedLegB(data.pair.legB);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPairDetail();
  }, [pairParam, selectedDate]);

  const handlePairChange = (newPairId) => {
    setSearchParams({ pair: newPairId });
  };

  if (loading) {
    return <LoadingState message="Evaluating fine-gold normalized price relationships and residual deviation..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchPairDetail} />;
  }

  const hasData = Boolean(dataResponse?.hasHistoricalData && pairData);
  const pair = pairData || {};
  const legA = pair.legA || selectedLegA || 'Leg A';
  const legB = pair.legB || selectedLegB || 'Leg B';
  const specA = MCX_GOLD_CONTRACTS[legA] || {};
  const specB = MCX_GOLD_CONTRACTS[legB] || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Activity size={22} style={{ color: 'var(--accent-cyan)' }} />
            Relative Value Lab
          </h1>
          <p className="page-subtitle">
            Deep-dive workspace evaluating fine-gold normalized price relationships, fair value bounds, and residual mean-reversion.
          </p>
        </div>
        <div className="page-actions">
          <div className="filter-group">
            <span className="filter-label">Analyzed Pair:</span>
            <CustomSelect
              value={pairParam}
              onChange={handlePairChange}
              options={PAIR_OPTIONS}
              ariaLabel="Select contract spread pair for relative value analysis"
              dropdownStyle={{ minWidth: '320px', right: 0, left: 'auto' }}
            />
          </div>
        </div>
      </div>

      {/* Unavailable State Card if Selected Pair Has No Historical Backtest Trades */}
      {!hasData && (
        <div className="panel" style={{ borderColor: 'var(--border-medium)', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <AlertTriangle size={24} style={{ color: 'var(--status-watch)', flexShrink: 0, marginTop: 2 }} />
              <div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                  Historical Spread Data Unavailable for {pair.pair || `${legA} / ${legB}`}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                  {dataResponse?.message || `The canonical 78-trade walk-forward backtest evaluated micro-gold pairs (GOLDTEN-GOLDPETAL, GOLDGUINEA-GOLDPETAL, GOLDTEN-GOLDGUINEA).`}
                </p>
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--bg-primary)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px 18px',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.82rem',
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}>
              <span style={{ fontWeight: 600, color: 'var(--gold-bright)' }}>Missing External Requirements:</span>
              <ul style={{ paddingLeft: 18, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {(dataResponse?.missingData || [
                  `No walk-forward spread trades recorded for ${legA}-${legB} in walk_forward_spread_trades.csv.`,
                  `MCX Daily Settlement Bhavcopy continuous time series for ${legA} is not connected.`
                ]).map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Verified pairs with canonical historical data:</span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handlePairChange('GOLDTEN-GOLDPETAL-202611')}
              >
                GOLDTEN / GOLDPETAL (26 trades)
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handlePairChange('GOLDGUINEA-GOLDPETAL')}
              >
                GOLDGUINEA / GOLDPETAL (29 trades)
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handlePairChange('GOLDTEN-GOLDGUINEA')}
              >
                GOLDTEN / GOLDGUINEA (23 trades)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytical Pair Summary Metrics (Visible when Data Exists) */}
      {hasData && (
        <div className="grid-metrics">
          <MetricCard
            title="Observed Basis Spread"
            value={pair.observedSpread != null ? `₹${formatPrice(pair.observedSpread)}` : '—'}
            unit="/ 10g"
            subtext={`Normalized ${legA} - ${legB}`}
            tooltip="Difference between normalized settlement price of Leg A and Leg B on fine gold basis"
          />
          <MetricCard
            title="Model Fair Spread"
            value={pair.estimatedFairSpread != null ? `₹${formatPrice(pair.estimatedFairSpread)}` : '—'}
            unit="/ 10g"
            subtext="Historical entry spread baseline"
            tooltip="Expected historical median spread value using rolling window without look-ahead bias"
          />
          <MetricCard
            title="Observed Residual"
            value={pair.residual != null ? `₹${formatPrice(pair.residual)}` : '—'}
            unit="/ 10g"
            statusColor="var(--accent-cyan)"
            subtext="Spread minus Fair Spread"
            tooltip="Pricing anomaly: positive means Leg A is rich; negative means Leg A is cheap relative to Leg B"
          />
          <MetricCard
            title="Robust Z-Score"
            value={pair.robustZScore != null ? formatZScore(pair.robustZScore) : '—'}
            subtext={`Win rate: ${pair.winRatePct != null ? Number(pair.winRatePct).toFixed(1) + '%' : '—'}`}
            tooltip="Standard deviation distance from rolling median using Median Absolute Deviation (MAD)"
          />
          <MetricCard
            title="Estimated Net Edge"
            value={pair.estimatedNetEdge != null ? `₹${formatPrice(pair.estimatedNetEdge)}` : '—'}
            unit="/ 10g"
            statusColor={pair.estimatedNetEdge > 0 ? 'var(--status-actionable)' : 'var(--status-risk)'}
            subtext={`${pair.totalTrades || 0} Backtest Trades`}
            tooltip="Surviving economic edge after subtracting brokerage, CTT, GST, and bid-ask slippage"
          />
        </div>
      )}

      {/* Main Charts Grid: 4-Chart Deep Dive (Rendered when Data Exists) */}
      {hasData && (
        <div className="grid-2col">
          {/* Chart A: Trade Trajectory & Returns */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">
                <Activity size={16} style={{ color: 'var(--accent-cyan)' }} />
                A. Historical Trade Net Return Trajectory
              </div>
              <span className="panel-meta">Net Spread Return Proxy (pp)</span>
            </div>
            <div className="panel-body" style={{ height: 280 }}>
              {timeSeries.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={10} tickFormatter={formatDate} />
                    <YAxis stroke="var(--text-muted)" fontSize={10} domain={['auto', 'auto']} tickFormatter={(v) => `${(v * 100).toFixed(2)}%`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--bg-surface-elevated)', borderColor: 'var(--border-medium)', color: 'var(--text-primary)' }}
                      formatter={(val) => [`${(Number(val) * 100).toFixed(4)} pp`, 'Net Return Proxy']}
                    />
                    <Line type="monotone" dataKey="netReturnPct" stroke="#00E5FF" strokeWidth={2} dot={{ r: 3 }} name="Net Return Proxy" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState title="No trajectory series" description="Historical closed trades for this pair have no return series." />
              )}
            </div>
          </div>

          {/* Chart B: Observed Spread History */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">
                <Layers size={16} style={{ color: 'var(--accent-gold)' }} />
                B. Observed Basis Spread (Leg A - Leg B)
              </div>
              <span className="panel-meta">Spread Observations (Rs. / 10g Basis)</span>
            </div>
            <div className="panel-body" style={{ height: 280 }}>
              {timeSeries.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={10} tickFormatter={formatDate} />
                    <YAxis stroke="var(--text-muted)" fontSize={10} domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--bg-surface-elevated)', borderColor: 'var(--border-medium)', color: 'var(--text-primary)' }}
                      formatter={(val) => [`₹${formatPrice(val)} / 10g`, 'Spread']}
                    />
                    <Line type="monotone" dataKey="spread" stroke="#38BDF8" strokeWidth={2} dot={{ r: 3 }} name="Observed Spread" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState title="No spread history" description="No recorded spread observations found." />
              )}
            </div>
          </div>

          {/* Chart C: Fair Spread and Residual */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">
                <TrendingDown size={16} style={{ color: 'var(--accent-cyan)' }} />
                C. Historical Exit Spread vs Entry Fair Value
              </div>
              <span className="panel-meta">Exit vs Entry Residual</span>
            </div>
            <div className="panel-body" style={{ height: 280 }}>
              {timeSeries.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={10} tickFormatter={formatDate} />
                    <YAxis stroke="var(--text-muted)" fontSize={10} domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--bg-surface-elevated)', borderColor: 'var(--border-medium)', color: 'var(--text-primary)' }}
                      formatter={(val, name) => [`₹${formatPrice(val)}`, name]}
                    />
                    <Line type="monotone" dataKey="spread" stroke="#94A3B8" strokeWidth={1.5} dot={false} name="Exit Spread" />
                    <Line type="monotone" dataKey="fair" stroke="#F59E0B" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Entry Spread Baseline" />
                    <Line type="monotone" dataKey="residual" stroke="#00E5FF" strokeWidth={2} dot={{ r: 3 }} name="Residual" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState title="No residual history" description="Residual series is unavailable." />
              )}
            </div>
          </div>

          {/* Chart D: Residual Deviation History with Standard Deviation Bands */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">
                <ShieldCheck size={16} style={{ color: 'var(--status-actionable)' }} />
                D. Robust Residual Z-Score with ±2.0σ Bands
              </div>
              <span className="panel-meta">Walk-Forward Exit Z-Scores</span>
            </div>
            <div className="panel-body" style={{ height: 280 }}>
              {timeSeries.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={10} tickFormatter={formatDate} />
                    <YAxis stroke="var(--text-muted)" fontSize={10} domain={[-4.0, 4.0]} tickFormatter={(v) => `${v}σ`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--bg-surface-elevated)', borderColor: 'var(--border-medium)', color: 'var(--text-primary)' }}
                      formatter={(val) => [`${val}σ`, 'Exit Z-Score']}
                    />
                    <ReferenceLine y={2.0} stroke="var(--status-watch)" strokeDasharray="3 3" label={{ value: '+2σ Entry', fill: 'var(--status-watch)', fontSize: 10 }} />
                    <ReferenceLine y={-2.0} stroke="var(--status-watch)" strokeDasharray="3 3" label={{ value: '-2σ Entry', fill: 'var(--status-watch)', fontSize: 10 }} />
                    <ReferenceLine y={0} stroke="var(--text-muted)" strokeWidth={1} />
                    <Line type="monotone" dataKey="zScore" stroke="#00E5FF" strokeWidth={2.5} dot={{ r: 3 }} name="Exit Z-Score" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState title="No Z-score history" description="Z-score observations are unavailable." />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contract DNA Comparison Panel (Always Visible and Accurate) */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <Info size={16} style={{ color: 'var(--accent-cyan)' }} />
            Contract DNA Specifications Comparison: {legA} vs {legB}
          </div>
          <span className="panel-meta">Official MCX Rulebook Metadata</span>
        </div>
        <div className="table-wrapper">
          <table className="financial-table">
            <thead>
              <tr>
                <th>Specification Attribute</th>
                <th>Leg A: {legA}</th>
                <th>Leg B: {legB}</th>
                <th>Relative-Value Analytical Significance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Trading Unit / Lot Size</td>
                <td className="font-mono">{specA.tradingUnit || '—'}</td>
                <td className="font-mono">{specB.tradingUnit || '—'}</td>
                <td>Determines position sizing granularity and lot-matching ratio.</td>
              </tr>
              <tr>
                <td>Price Quotation Basis</td>
                <td className="font-mono">{specA.priceQuotationBasis || '—'}</td>
                <td className="font-mono">{specB.priceQuotationBasis || '—'}</td>
                <td>Mathematically normalized to Rs. per 10g 999 fine gold for all spread comparisons.</td>
              </tr>
              <tr>
                <td>Deliverable Purity</td>
                <td className="font-mono">{specA.purity || '—'}</td>
                <td className="font-mono">{specB.purity || '—'}</td>
                <td>Assay factor adjusted to fine gold equivalent (0.999 fine basis).</td>
              </tr>
              <tr>
                <td>Minimum Tick Size</td>
                <td className="font-mono">{specA.tickSize ? `₹${specA.tickSize} / ${specA.quotationUnit}` : '—'}</td>
                <td className="font-mono">{specB.tickSize ? `₹${specB.tickSize} / ${specB.quotationUnit}` : '—'}</td>
                <td>Defines minimum price step and execution slippage quantum.</td>
              </tr>
              <tr>
                <td>Physical Delivery Tender Period</td>
                <td className="font-mono">{specA.tenderPeriodDays ? `${specA.tenderPeriodDays} trading days prior to expiry` : '5 trading days prior to expiry'}</td>
                <td className="font-mono">{specB.tenderPeriodDays ? `${specB.tenderPeriodDays} trading days prior to expiry` : '5 trading days prior to expiry'}</td>
                <td>Positions must be squared off or rolled before the tender window starts.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
