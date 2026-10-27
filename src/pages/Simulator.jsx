import React, { useState } from 'react';
import {
  Sliders,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { costService } from '../services';
import { formatPrice } from '../utils/formatters';
import {
  MetricCard,
  SignalBadge,
  ExplanationPanel
} from '../components/common/States';

export function Simulator() {
  const { selectedPair } = useApp();

  // Baseline Scenario (Unmodified)
  const baseline = {
    slippage: 5.0,
    brokerage: 20.0,
    entryZ: 2.0,
    holdingDays: 10,
    netEdge: 38.67,
    signalStatus: 'ACTIONABLE',
    riskCheck: 'Passed'
  };

  // Scenario Modifiable Inputs
  const [slippage, setSlippage] = useState(12.0);
  const [brokerage, setBrokerage] = useState(25.0);
  const [entryZ, setEntryZ] = useState(2.2);
  const [holdingDays, setHoldingDays] = useState(5);

  const [simulating, setSimulating] = useState(false);
  const [scenarioResult, setScenarioResult] = useState(null);

  const handleRunScenario = async () => {
    setSimulating(true);
    try {
      const res = await costService.simulateScenario({
        pair: selectedPair,
        slippage: Number(slippage),
        brokerage: Number(brokerage),
        entryZ: Number(entryZ),
        holdingDays: Number(holdingDays)
      });
      setScenarioResult(res);
    } catch (err) {
      console.error('Scenario simulation failed', err);
    } finally {
      setSimulating(false);
    }
  };

  const handleReset = () => {
    setSlippage(5.0);
    setBrokerage(20.0);
    setEntryZ(2.0);
    setHoldingDays(10);
    setScenarioResult(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Sliders size={22} style={{ color: 'var(--accent-cyan)' }} />
            What-If Fair Value Simulator
          </h1>
          <p className="page-subtitle">
            Stress-test analytical assumptions and assess how signal survivability responds to increased slippage or altered horizons.
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={handleReset}>
            <RotateCcw size={13} />
            Reset to Baseline
          </button>
        </div>
      </div>

      {/* Grid: Controls vs Side-by-Side Comparison */}
      <div className="grid-2col">
        {/* Controls Panel */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <Sliders size={16} style={{ color: 'var(--accent-cyan)' }} />
              Scenario Stress Parameters
            </div>
            <span className="panel-meta">Adjust variables & run</span>
          </div>
          <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">
                <span>Execution Slippage Stress (Rs. / 10g):</span>
                <span className="val-display">₹{Number(slippage).toFixed(2)}</span>
              </label>
              <input
                type="range"
                min="0"
                max="35"
                step="0.5"
                value={slippage}
                onChange={(e) => setSlippage(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Brokerage per Leg (Rs.):</span>
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
                <span>Entry Z-Score Threshold (Hurdle):</span>
                <span className="val-display">{Number(entryZ).toFixed(1)}σ</span>
              </label>
              <input
                type="range"
                min="1.0"
                max="3.5"
                step="0.1"
                value={entryZ}
                onChange={(e) => setEntryZ(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Max Target Holding Window (Days):</span>
                <span className="val-display">{holdingDays} days</span>
              </label>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={holdingDays}
                onChange={(e) => setHoldingDays(e.target.value)}
              />
            </div>

            <button
              className="btn btn-primary"
              onClick={handleRunScenario}
              disabled={simulating}
              style={{ marginTop: 8 }}
            >
              <Play size={14} />
              {simulating ? 'Calculating Stress Response...' : 'Run Scenario Simulation'}
            </button>
          </div>
        </div>

        {/* Side-by-Side Comparison Panel */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <Layers size={16} style={{ color: 'var(--accent-gold)' }} />
              Baseline vs. Stress Scenario Comparison
            </div>
            <span className="panel-meta">Impact on Surviving Edge</span>
          </div>
          <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="table-wrapper">
              <table className="financial-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Current Baseline</th>
                    <th>Simulated Scenario</th>
                    <th>Net Difference</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Slippage Assumption</td>
                    <td className="font-mono">₹{baseline.slippage.toFixed(2)}</td>
                    <td className="font-mono" style={{ color: 'var(--accent-cyan)' }}>
                      ₹{Number(slippage).toFixed(2)}
                    </td>
                    <td className="font-mono" style={{ color: 'var(--status-risk)' }}>
                      +₹{(slippage - baseline.slippage).toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td>Total Estimated Costs</td>
                    <td className="font-mono">₹14.20</td>
                    <td className="font-mono">
                      {scenarioResult ? `₹${scenarioResult.recalculatedCost?.toFixed(2)}` : 'Awaiting Run'}
                    </td>
                    <td className="font-mono">
                      {scenarioResult ? `+₹${(scenarioResult.recalculatedCost - 14.20).toFixed(2)}` : '—'}
                    </td>
                  </tr>
                  <tr>
                    <td>Surviving Net Edge</td>
                    <td className="font-mono" style={{ color: 'var(--status-actionable)', fontWeight: 600 }}>
                      ₹{baseline.netEdge.toFixed(2)}
                    </td>
                    <td className="font-mono" style={{ fontWeight: 600, color: scenarioResult?.recalculatedNetEdge > 0 ? 'var(--status-actionable)' : 'var(--status-risk)' }}>
                      {scenarioResult ? `₹${scenarioResult.recalculatedNetEdge?.toFixed(2)}` : 'Awaiting Run'}
                    </td>
                    <td className="font-mono">
                      {scenarioResult ? `₹${(scenarioResult.recalculatedNetEdge - baseline.netEdge).toFixed(2)}` : '—'}
                    </td>
                  </tr>
                  <tr>
                    <td>Signal Status</td>
                    <td>
                      <SignalBadge status={baseline.signalStatus} />
                    </td>
                    <td>
                      {scenarioResult ? (
                        <SignalBadge status={scenarioResult.signalStatus} />
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {scenarioResult ? scenarioResult.riskCheck : '—'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <ExplanationPanel
              title="Sensitivity Insights"
              explanation={
                scenarioResult
                  ? `Under elevated execution slippage of ₹${Number(slippage).toFixed(2)}, the surviving net edge changes from ₹${baseline.netEdge.toFixed(2)} to ₹${scenarioResult.recalculatedNetEdge?.toFixed(2)}/10g.`
                  : "Click 'Run Scenario Simulation' to execute the quantitative model on the backend and evaluate whether the spread remains economically viable under elevated frictions."
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
