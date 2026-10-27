import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Radar,
  Filter,
  ArrowUpDown,
  Search,
  ExternalLink,
  Info,
  X,
  ShieldCheck,
  Activity,
  Layers,
  SlidersHorizontal,
  Download
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
import { formatPrice, formatZScore, formatINR, formatDate } from '../utils/formatters';
import {
  LoadingState,
  EmptyState,
  ErrorState,
  SignalBadge,
  ExplanationPanel
} from '../components/common/States';

export function OpportunityScanner() {
  const navigate = useNavigate();
  const { selectedDate, setSelectedPair } = useApp();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pairs, setPairs] = useState([]);
  const [summary, setSummary] = useState({});

  // Slide-over inspection drawer for selected pair
  const [inspectPair, setInspectPair] = useState(null);

  // Filters
  const [filterSignal, setFilterSignal] = useState('ALL');
  const [filterLegA, setFilterLegA] = useState('ALL');
  const [minZScore, setMinZScore] = useState(0);
  const [minNetEdge, setMinNetEdge] = useState(-50);
  const [searchQuery, setSearchQuery] = useState('');

  // Sorting
  const [sortField, setSortField] = useState('robustZScore');
  const [sortAsc, setSortAsc] = useState(false);

  const fetchScanner = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await relativeValueService.getOpportunityScanner(selectedDate);
      setPairs(data.pairs || []);
      setSummary(data.summary || {});
      if (data.pairs && data.pairs.length > 0 && !inspectPair) {
        setInspectPair(data.pairs[0]);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScanner();
  }, [selectedDate]);

  // Filtering logic
  const filteredPairs = pairs.filter(p => {
    if (filterSignal !== 'ALL' && p.signalStatus !== filterSignal) return false;
    if (filterLegA !== 'ALL' && p.legA !== filterLegA && p.legB !== filterLegA) return false;
    if (Math.abs(p.robustZScore) < Number(minZScore)) return false;
    if (p.estimatedNetEdge < Number(minNetEdge)) return false;
    if (searchQuery && !p.pair.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Sorting logic
  const sortedPairs = [...filteredPairs].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === 'robustZScore') {
      aVal = Math.abs(a.robustZScore);
      bVal = Math.abs(b.robustZScore);
    }

    if (aVal < bVal) return sortAsc ? -1 : 1;
    if (aVal > bVal) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const exportCSV = () => {
    if (sortedPairs.length === 0) return;
    const headers = ['Pair', 'ObservedSpread', 'FairSpread', 'Residual', 'RobustZScore', 'LiquidityScore', 'EstimatedNetEdge', 'DaysToExpiry', 'SignalStatus'];
    const rows = sortedPairs.map(p => [
      p.pair,
      p.observedSpread,
      p.estimatedFairSpread,
      p.residual,
      p.robustZScore,
      p.liquidityScore,
      p.estimatedNetEdge,
      p.daysToExpiry,
      p.signalStatus
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SwarnaDrishti_Scanner_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <LoadingState message="Scanning relative-value pricing models and calculating SignalGuard bounds..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchScanner} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Radar size={22} style={{ color: 'var(--accent-cyan)' }} />
            Opportunity Scanner
          </h1>
          <p className="page-subtitle">
            Statistically anomalous price relationships filtered through rigorous liquidity, transaction cost, and lifecycle hurdles.
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={exportCSV} title="Export current scan records as CSV">
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="filter-bar">
        <div className="filter-group">
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search pair..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: 140 }}
          />
        </div>

        <div className="filter-group">
          <span className="filter-label">Contract:</span>
          <select value={filterLegA} onChange={(e) => setFilterLegA(e.target.value)}>
            <option value="ALL">Any Contract</option>
            <option value="GOLDM">GOLDM</option>
            <option value="GOLDTEN">GOLDTEN</option>
            <option value="GOLDGUINEA">GOLDGUINEA</option>
            <option value="GOLDPETAL">GOLDPETAL</option>
          </select>
        </div>

        <div className="filter-group">
          <span className="filter-label">Signal Status:</span>
          <select value={filterSignal} onChange={(e) => setFilterSignal(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="ACTIONABLE">Actionable Only</option>
            <option value="WATCH">Watch Only</option>
            <option value="NO_SIGNAL">No Signal</option>
          </select>
        </div>

        <div className="filter-group">
          <span className="filter-label">Min |Z|:</span>
          <select value={minZScore} onChange={(e) => setMinZScore(Number(e.target.value))}>
            <option value="0">All (|Z| ≥ 0)</option>
            <option value="1.0">≥ 1.0σ</option>
            <option value="1.5">≥ 1.5σ</option>
            <option value="2.0">≥ 2.0σ (Entry Hurdle)</option>
          </select>
        </div>

        <div className="filter-group">
          <span className="filter-label">Min Net Edge:</span>
          <select value={minNetEdge} onChange={(e) => setMinNetEdge(Number(e.target.value))}>
            <option value="-50">All</option>
            <option value="0">&gt; ₹0 (Profitable)</option>
            <option value="20">&gt; ₹20 / 10g</option>
          </select>
        </div>

        <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          Showing {sortedPairs.length} of {pairs.length} eligible pairs
        </div>
      </div>

      {/* Main Table & Inspection Slide-Over Viewport */}
      <div className={inspectPair ? "grid-main-side" : ""}>
        {/* Table Panel */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <Layers size={16} style={{ color: 'var(--accent-cyan)' }} />
              Eligible Cross-Contract Spread Pairs
            </div>
            <span className="panel-meta">Click row to inspect SignalGuard proof</span>
          </div>

          <div className="table-wrapper">
            <table className="financial-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('pair')} className="sortable">
                    Pair <ArrowUpDown size={11} />
                  </th>
                  <th onClick={() => handleSort('observedSpread')} className="sortable num-col">
                    Observed Spread <ArrowUpDown size={11} />
                  </th>
                  <th onClick={() => handleSort('estimatedFairSpread')} className="sortable num-col">
                    Fair Spread <ArrowUpDown size={11} />
                  </th>
                  <th onClick={() => handleSort('residual')} className="sortable num-col">
                    Residual <ArrowUpDown size={11} />
                  </th>
                  <th onClick={() => handleSort('robustZScore')} className="sortable num-col">
                    Robust Z <ArrowUpDown size={11} />
                  </th>
                  <th onClick={() => handleSort('liquidityScore')} className="sortable num-col">
                    Liquidity <ArrowUpDown size={11} />
                  </th>
                  <th onClick={() => handleSort('estimatedNetEdge')} className="sortable num-col">
                    Net Edge <ArrowUpDown size={11} />
                  </th>
                  <th onClick={() => handleSort('daysToExpiry')} className="sortable num-col">
                    DTE <ArrowUpDown size={11} />
                  </th>
                  <th>SignalGuard</th>
                </tr>
              </thead>
              <tbody>
                {sortedPairs.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '36px' }}>
                      No eligible pairs matched the specified criteria.
                    </td>
                  </tr>
                ) : (
                  sortedPairs.map(p => {
                    const isSelected = inspectPair?.id === p.id;
                    return (
                      <tr
                        key={p.id}
                        className={isSelected ? 'selected' : ''}
                        onClick={() => setInspectPair(p)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td style={{ fontWeight: 600 }}>{p.pair}</td>
                        <td className="num-col">₹{formatPrice(p.observedSpread)}</td>
                        <td className="num-col">₹{formatPrice(p.estimatedFairSpread)}</td>
                        <td className="num-col" style={{ color: Math.abs(p.residual) > 20 ? 'var(--accent-cyan)' : 'inherit', fontWeight: 600 }}>
                          ₹{formatPrice(p.residual)}
                        </td>
                        <td className="num-col font-mono" style={{ fontWeight: 600 }}>
                          {formatZScore(p.robustZScore)}
                        </td>
                        <td className="num-col font-mono">
                          {p.liquidityScore?.toFixed(1) || '—'}
                        </td>
                        <td className="num-col font-mono" style={{ color: p.estimatedNetEdge > 0 ? 'var(--status-actionable)' : 'var(--status-risk)', fontWeight: 600 }}>
                          ₹{formatPrice(p.estimatedNetEdge)}
                        </td>
                        <td className="num-col font-mono">{p.daysToExpiry}d</td>
                        <td>
                          <SignalBadge status={p.signalStatus} reason={p.explanation} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Slide-Over Inspection Panel */}
        {inspectPair && (
          <div className="panel" style={{ height: 'fit-content' }}>
            <div className="panel-header">
              <div className="panel-title">
                <ShieldCheck size={16} style={{ color: 'var(--accent-cyan)' }} />
                SignalGuard Detail: {inspectPair.pair}
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setInspectPair(null)}
                title="Close drawer"
              >
                <X size={14} />
              </button>
            </div>
            <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Signal Badge & Summary */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <SignalBadge status={inspectPair.signalStatus} reason={inspectPair.explanation} />
                <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Expiry: {inspectPair.expiryA}
                </span>
              </div>

              {/* Mathematical Metrics Breakdown */}
              <div style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                fontSize: '0.78rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Observed Basis Spread:</span>
                  <span className="font-mono">₹{formatPrice(inspectPair.observedSpread)} / 10g</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Rolling Fair Spread:</span>
                  <span className="font-mono">₹{formatPrice(inspectPair.estimatedFairSpread)} / 10g</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Residual Deviation:</span>
                  <span className="font-mono" style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
                    ₹{formatPrice(inspectPair.residual)} / 10g
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Robust Z-Score:</span>
                  <span className="font-mono" style={{ fontWeight: 600 }}>{formatZScore(inspectPair.robustZScore)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Estimated Friction Cost:</span>
                  <span className="font-mono" style={{ color: 'var(--status-risk)' }}>-₹{formatPrice(inspectPair.estimatedTotalCost)} / 10g</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Surviving Net Edge:</span>
                  <span className="font-mono" style={{ color: inspectPair.estimatedNetEdge > 0 ? 'var(--status-actionable)' : 'var(--status-risk)', fontWeight: 700 }}>
                    ₹{formatPrice(inspectPair.estimatedNetEdge)} / 10g
                  </span>
                </div>
              </div>

              {/* Explanation Text */}
              <ExplanationPanel title="SignalGuard Rationale" explanation={inspectPair.explanation}>
                <div style={{ marginTop: 8, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <strong>Lifecycle Assessment:</strong> {inspectPair.lifecycleAssessment}
                </div>
              </ExplanationPanel>

              {/* Action Button */}
              <button
                className="btn btn-primary"
                onClick={() => {
                  setSelectedPair(inspectPair.id);
                  navigate(`/app/rv-lab?pair=${inspectPair.id}`);
                }}
              >
                Investigate in RV Lab &rarr;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
