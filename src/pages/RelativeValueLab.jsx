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
  ShieldCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  AreaChart,
  Area
} from 'recharts';
import { useApp } from '../context/AppContext';
import { relativeValueService } from '../services';
import { formatPrice, formatZScore, formatDate } from '../utils/formatters';
import { MCX_GOLD_CONTRACTS, ELIGIBLE_PAIRS } from '../utils/contractSpecs';
import {
  LoadingState,
  EmptyState,
  ErrorState,
  MetricCard,
  SignalBadge,
  ExplanationPanel
} from '../components/common/States';

export function RelativeValueLab() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedDate } = useApp();

  const pairParam = searchParams.get('pair') || 'GOLDM-GOLDTEN-20261105';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pairData, setPairData] = useState(null);
  const [timeSeries, setTimeSeries] = useState([]);

  // Selected pair legs
  const [selectedLegA, setSelectedLegA] = useState('GOLDM');
  const [selectedLegB, setSelectedLegB] = useState('GOLDTEN');
  const [lookbackDays, setLookbackDays] = useState(30);

  const fetchPairDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await relativeValueService.getPairDetail(pairParam);
      setPairData(data.pair);
      setTimeSeries(data.timeSeries || []);
      if (data.pair) {
        setSelectedLegA(data.pair.legA || 'GOLDM');
        setSelectedLegB(data.pair.legB || 'GOLDTEN');
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPairDetail();
  }, [pairParam, selectedDate]);

  const handlePairChange = (e) => {
    const newPairId = e.target.value;
    setSearchParams({ pair: newPairId });
  };

  if (loading) {
    return <LoadingState message="Computing normalized fine-gold price relationships and rolling residual deviation..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchPairDetail} />;
  }

  const pair = pairData || {};
  const specA = MCX_GOLD_CONTRACTS[selectedLegA] || {};
  const specB = MCX_GOLD_CONTRACTS[selectedLegB] || {};

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
            <select
              value={pairParam}
              onChange={handlePairChange}
              style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}
            >
              <option value="GOLDM-GOLDTEN-20261105">GOLDM / GOLDTEN (Nov-2026)</option>
              <option value="GOLDM-GOLDGUINEA-202611">GOLDM / GOLDGUINEA (Nov-2026)</option>
              <option value="GOLDTEN-GOLDPETAL-202611">GOLDTEN / GOLDPETAL (Nov-2026)</option>
              <option value="GOLDM-GOLDPETAL-202611">GOLDM / GOLDPETAL (Nov-2026)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Analytical Pair Summary Metrics */}
      <div className="grid-metrics">
        <MetricCard
          title="Observed Basis Spread"
          value={`₹${formatPrice(pair.observedSpread)}`}
          unit="/ 10g"
          subtext={`Normalized ${pair.legA} - ${pair.legB}`}
          tooltip="Difference between normalized settlement price of Leg A and Leg B on fine gold basis"
        />
        <MetricCard
          title="Model Fair Spread"
          value={`₹${formatPrice(pair.estimatedFairSpread)}`}
          unit="/ 10g"
          subtext="30-day rolling median baseline"
          tooltip="Expected historical median spread value using rolling window without look-ahead bias"
        />
        <MetricCard
          title="Observed Residual"
          value={`₹${formatPrice(pair.residual)}`}
          unit="/ 10g"
          statusColor="var(--accent-cyan)"
          subtext="Spread minus Fair Spread"
          tooltip="Pricing anomaly: positive means Leg A is rich; negative means Leg A is cheap relative to Leg B"
        />
        <MetricCard
          title="Robust Z-Score"
          value={formatZScore(pair.robustZScore)}
          subtext={`Percentile: ${pair.historicalPercentile != null ? pair.historicalPercentile + '%' : '—'}`}
          tooltip="Standard deviation distance from rolling median using Median Absolute Deviation (MAD)"
        />
        <MetricCard
          title="Estimated Net Edge"
          value={`₹${formatPrice(pair.estimatedNetEdge)}`}
          unit="/ 10g"
          statusColor={pair.estimatedNetEdge > 0 ? 'var(--status-actionable)' : 'var(--status-risk)'}
          subtext="Gross Edge - Friction Costs"
          tooltip="Surviving economic edge after subtracting brokerage, CTT, GST, and bid-ask slippage"
        />
      </div>

      {/* Main Charts Grid: 4-Chart Deep Dive */}
      <div className="grid-2col">
        {/* Chart A: Normalized Price Relationship */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <Activity size={16} style={{ color: 'var(--accent-cyan)' }} />
              A. Normalized Fine-Gold Settlement Prices
            </div>
            <span className="panel-meta">Rs. / 10 grams (999 Fine Basis)</span>
          </div>
          <div className="panel-body" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={10} tickFormatter={formatDate} />
                <YAxis stroke="var(--text-muted)" fontSize={10} domain={['auto', 'auto']} tickFormatter={(v) => `₹${(v/1000).toFixed(1)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--bg-surface-elevated)', borderColor: 'var(--border-medium)', color: 'var(--text-primary)' }}
                  formatter={(val, name) => [`₹${formatPrice(val)}`, name]}
                />
                <Line type="monotone" dataKey={selectedLegA} stroke="#F59E0B" strokeWidth={2} dot={false} name={selectedLegA} />
                <Line type="monotone" dataKey={selectedLegB} stroke="#00E5FF" strokeWidth={2} dot={false} name={selectedLegB} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart B: Observed Spread History */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <Layers size={16} style={{ color: 'var(--accent-gold)' }} />
              B. Observed Basis Spread (Leg A - Leg B)
            </div>
            <span className="panel-meta">Raw Price Spread (Rs. / 10g)</span>
          </div>
          <div className="panel-body" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={10} tickFormatter={formatDate} />
                <YAxis stroke="var(--text-muted)" fontSize={10} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--bg-surface-elevated)', borderColor: 'var(--border-medium)', color: 'var(--text-primary)' }}
                  formatter={(val) => [`₹${formatPrice(val)} / 10g`, 'Spread']}
                />
                <Line type="monotone" dataKey="spread" stroke="#38BDF8" strokeWidth={2} dot={false} name="Observed Spread" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart C: Fair Spread and Residual */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <TrendingDown size={16} style={{ color: 'var(--accent-cyan)' }} />
              C. Fair Value Model & Observed Residual
            </div>
            <span className="panel-meta">Spread vs. Rolling Median</span>
          </div>
          <div className="panel-body" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={10} tickFormatter={formatDate} />
                <YAxis stroke="var(--text-muted)" fontSize={10} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--bg-surface-elevated)', borderColor: 'var(--border-medium)', color: 'var(--text-primary)' }}
                  formatter={(val, name) => [`₹${formatPrice(val)}`, name]}
                />
                <Line type="monotone" dataKey="spread" stroke="#94A3B8" strokeWidth={1.5} dot={false} name="Observed Spread" />
                <Line type="monotone" dataKey="fair" stroke="#F59E0B" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Fair Spread" />
                <Line type="monotone" dataKey="residual" stroke="#00E5FF" strokeWidth={2} dot={false} name="Residual" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart D: Residual Deviation History with Standard Deviation Bands */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <ShieldCheck size={16} style={{ color: 'var(--status-actionable)' }} />
              D. Robust Residual Z-Score with ±2.0σ Bands
            </div>
            <span className="panel-meta">Signal Bounds</span>
          </div>
          <div className="panel-body" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={10} tickFormatter={formatDate} />
                <YAxis stroke="var(--text-muted)" fontSize={10} domain={[-3.5, 3.5]} tickFormatter={(v) => `${v}σ`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--bg-surface-elevated)', borderColor: 'var(--border-medium)', color: 'var(--text-primary)' }}
                  formatter={(val) => [`${val}σ`, 'Robust Z-Score']}
                />
                <ReferenceLine y={2.0} stroke="var(--status-watch)" strokeDasharray="3 3" label={{ value: '+2σ Entry', fill: 'var(--status-watch)', fontSize: 10 }} />
                <ReferenceLine y={-2.0} stroke="var(--status-watch)" strokeDasharray="3 3" label={{ value: '-2σ Entry', fill: 'var(--status-watch)', fontSize: 10 }} />
                <ReferenceLine y={0} stroke="var(--text-muted)" strokeWidth={1} />
                <Line type="monotone" dataKey="zScore" stroke="#00E5FF" strokeWidth={2.5} dot={{ r: 2 }} name="Robust Z-Score" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Contract DNA Comparison Panel */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <Info size={16} style={{ color: 'var(--accent-cyan)' }} />
            Contract DNA Specifications Comparison
          </div>
          <span className="panel-meta">MCX Rulebook Metadata</span>
        </div>
        <div className="table-wrapper">
          <table className="financial-table">
            <thead>
              <tr>
                <th>Attribute</th>
                <th>Leg A: {selectedLegA}</th>
                <th>Leg B: {selectedLegB}</th>
                <th>Relative-Value Analytical Significance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Trading Unit / Lot Size</td>
                <td className="font-mono">{specA.tradingUnit || '—'}</td>
                <td className="font-mono">{specB.tradingUnit || '—'}</td>
                <td>Affects lot-matching ratio and execution granularity.</td>
              </tr>
              <tr>
                <td>Quotation Basis</td>
                <td className="font-mono">{specA.priceQuotationBasis || '—'}</td>
                <td className="font-mono">{specB.priceQuotationBasis || '—'}</td>
                <td>Normalized mathematically to Rs. per 10 grams before comparison.</td>
              </tr>
              <tr>
                <td>Deliverable Purity</td>
                <td className="font-mono">{specA.purity || '—'}</td>
                <td className="font-mono">{specB.purity || '—'}</td>
                <td>Purity factor adjusted to fine gold equivalent (0.999).</td>
              </tr>
              <tr>
                <td>Tick Size</td>
                <td className="font-mono">₹{specA.tickSize} / {specA.quotationUnit}</td>
                <td className="font-mono">₹{specB.tickSize} / {specB.quotationUnit}</td>
                <td>Determines minimum price step and slippage quantum.</td>
              </tr>
              <tr>
                <td>Tender Period</td>
                <td className="font-mono">5 trading days prior to expiry</td>
                <td className="font-mono">5 trading days prior to expiry</td>
                <td>Positions must be squared off or rolled before tender period starts.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
