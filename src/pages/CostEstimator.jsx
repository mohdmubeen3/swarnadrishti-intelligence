import React, { useState } from 'react';
import {
  Calculator,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { costService } from '../services';
import { formatPrice, formatPercent } from '../utils/formatters';
import {
  MetricCard,
  ExplanationPanel
} from '../components/common/States';

export function CostEstimator() {
  const { costAssumptions, setCostAssumptions } = useApp();

  // Local interactive input state
  const [brokerage, setBrokerage] = useState(costAssumptions.brokeragePerOrder);
  const [slippage, setSlippage] = useState(costAssumptions.slippageEstimate);
  const [grossEdge, setGrossEdge] = useState(52.87); // Baseline residual for GOLDM / GOLDTEN

  // Calculation Results
  const [calculating, setCalculating] = useState(false);
  const [results, setResults] = useState({
    grossTheoreticalEdge: 52.87,
    brokerageAndFees: 4.0,
    statutoryTaxesAndCTT: 5.20,
    estimatedSlippage: 5.0,
    totalEstimatedCost: 14.20,
    estimatedNetEdge: 38.67,
    costToEdgeRatio: 0.268,
    isActionable: true
  });

  const handleRecalculate = async (e) => {
    e?.preventDefault();
    setCalculating(true);
    try {
      const res = await costService.calculateCosts({
        grossEdge: Number(grossEdge),
        brokerage: Number(brokerage),
        slippage: Number(slippage)
      });
      setResults(res);
      setCostAssumptions(prev => ({
        ...prev,
        brokeragePerOrder: Number(brokerage),
        slippageEstimate: Number(slippage)
      }));
    } catch (err) {
      console.error('Cost calculation failed', err);
    } finally {
      setCalculating(false);
    }
  };

  const handleReset = () => {
    setBrokerage(20.0);
    setSlippage(5.0);
    setGrossEdge(52.87);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Calculator size={22} style={{ color: 'var(--accent-cyan)' }} />
            Transaction Cost Estimator
          </h1>
          <p className="page-subtitle">
            Simulate realistic exchange fees, CTT statutory levies, brokerage, and bid-ask slippage against theoretical spread edge.
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={handleReset}>
            <RotateCcw size={13} />
            Reset Defaults
          </button>
        </div>
      </div>

      {/* Main Grid: Inputs vs Results */}
      <div className="grid-2col">
        {/* Input Configuration Panel */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <Calculator size={16} style={{ color: 'var(--accent-cyan)' }} />
              Configurable Cost Assumptions
            </div>
            <span className="panel-meta">Per 10g Fine Gold Basis</span>
          </div>
          <div className="panel-body">
            <form onSubmit={handleRecalculate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">
                  <span>Gross Theoretical Edge (Residual):</span>
                  <span className="val-display">₹{Number(grossEdge).toFixed(2)} / 10g</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="150"
                  step="0.5"
                  value={grossEdge}
                  onChange={(e) => setGrossEdge(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Brokerage Assumption (Flat per Leg):</span>
                  <span className="val-display">₹{Number(brokerage).toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={brokerage}
                  onChange={(e) => setBrokerage(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Bid-Ask Execution Slippage (Rs. / 10g):</span>
                  <span className="val-display">₹{Number(slippage).toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="0.5"
                  value={slippage}
                  onChange={(e) => setSlippage(e.target.value)}
                />
              </div>

              {/* Statutory Fee Breakdown Display */}
              <div style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px',
                fontSize: '0.78rem',
                display: 'flex',
                flexDirection: 'column',
                gap: 6
              }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Verified Exchange & Statutory Tariffs:</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>MCX Exchange Turnover Fee:</span>
                  <span className="font-mono">0.00325% (₹2.55/10g)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Commodity Transaction Tax (CTT):</span>
                  <span className="font-mono">0.01% on sell side (₹7.84/10g)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>GST on Brokerage & Turnover:</span>
                  <span className="font-mono">18.00% (₹0.85/10g)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>SEBI Regulatory & Stamp Duty:</span>
                  <span className="font-mono">₹0.30/10g</span>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={calculating}>
                {calculating ? 'Calculating Engine...' : 'Recalculate Net Edge'}
              </button>
            </form>
          </div>
        </div>

        {/* Calculation Output Panel */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <DollarSign size={16} style={{ color: 'var(--accent-gold)' }} />
              Economic Viability Output
            </div>
            <span className="panel-meta">Net Edge vs Cost Hurdle</span>
          </div>
          <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="grid-metrics" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <MetricCard
                title="Total Frictions & Costs"
                value={`₹${formatPrice(results.totalEstimatedCost)}`}
                unit="/ 10g"
                statusColor="var(--status-risk)"
                subtext="All fees, taxes & slippage"
              />
              <MetricCard
                title="Surviving Net Edge"
                value={`₹${formatPrice(results.estimatedNetEdge)}`}
                unit="/ 10g"
                statusColor={results.estimatedNetEdge > 0 ? 'var(--status-actionable)' : 'var(--status-risk)'}
                subtext="Gross Edge - Total Frictions"
              />
            </div>

            <div style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              fontSize: '0.82rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Cost-to-Gross Edge Ratio:</span>
                <span className="font-mono" style={{ fontWeight: 600 }}>
                  {formatPercent(results.costToEdgeRatio * 100, 1)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Signal Viability Hurdle:</span>
                <span style={{ color: results.estimatedNetEdge > 10 ? 'var(--status-actionable)' : results.estimatedNetEdge > 0 ? 'var(--status-watch)' : 'var(--status-risk)', fontWeight: 600 }}>
                  {results.estimatedNetEdge > 10 ? 'VIABLE ARBITRAGE (Passed)' : results.estimatedNetEdge > 0 ? 'MARGINAL (Watch)' : 'UNVIABLE (Costs exceed edge)'}
                </span>
              </div>
            </div>

            <ExplanationPanel
              title="Execution Assumption Distinction"
              explanation="User-configured slippage and brokerage values are assumptions. Statutory MCX turnover fees and CTT are authoritative regulatory schedules. Settlement prices do not guarantee executable fills."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
