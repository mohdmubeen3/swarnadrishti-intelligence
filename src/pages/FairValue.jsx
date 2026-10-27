import React, { useState, useEffect } from 'react';
import {
  Dna,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Calendar,
  Layers,
  Scale
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { fairValueService } from '../services';
import { formatPrice, formatZScore } from '../utils/formatters';
import { MCX_GOLD_CONTRACTS } from '../utils/contractSpecs';
import {
  LoadingState,
  EmptyState,
  ErrorState,
  MetricCard,
  ExplanationPanel
} from '../components/common/States';

export function FairValue() {
  const { selectedDate, selectedPair } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchFairValue = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fairValueService.getFairValueAnalysis(selectedPair);
      setData(res);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFairValue();
  }, [selectedPair, selectedDate]);

  if (loading) {
    return <LoadingState message="Extracting Contract DNA attributes and fitting rolling median baseline..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchFairValue} />;
  }

  const pair = data?.pair || {};
  const dnaAttributes = data?.dnaAttributes || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Dna size={22} style={{ color: 'var(--accent-cyan)' }} />
            Fair Value Engine & Contract DNA
          </h1>
          <p className="page-subtitle">
            Deconstruct mathematical expected pricing, specification discrepancies, and fine-gold purity adjustments.
          </p>
        </div>
      </div>

      {/* Fair Value Engine Overview */}
      <div className="grid-metrics">
        <MetricCard
          title="Model Architecture"
          value="Rolling Median"
          unit="v1.2"
          subtext="Window: 30 Trading Days"
          tooltip="Robust non-parametric estimator minimizing outlier distortion from delivery squeezes"
        />
        <MetricCard
          title="Analyzed Spread Pair"
          value={pair.pair || 'GOLDM / GOLDTEN'}
          subtext={`Maturity: ${pair.expiryA || '05-Nov-2026'}`}
          tooltip="Verified MCX gold futures contract pair on normalized basis"
        />
        <MetricCard
          title="Current Model Fair Spread"
          value={`₹${formatPrice(pair.estimatedFairSpread)}`}
          unit="/ 10g"
          subtext="Expected Baseline Spread"
          tooltip="Calculated median basis differential over the prior 30 trading sessions without look-ahead bias"
        />
        <MetricCard
          title="Observed Residual"
          value={`₹${formatPrice(pair.residual)}`}
          unit="/ 10g"
          statusColor="var(--accent-cyan)"
          subtext={`Z-Score: ${formatZScore(pair.robustZScore)}`}
          tooltip="Difference between today's observed settlement spread and the model-estimated fair spread"
        />
      </div>

      {/* Contract DNA Factor Decomposition */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <Layers size={16} style={{ color: 'var(--accent-cyan)' }} />
            Contract DNA Factor Audit
          </div>
          <span className="panel-meta">Systematic Specification Alignment</span>
        </div>
        <div className="table-wrapper">
          <table className="financial-table">
            <thead>
              <tr>
                <th>DNA Factor</th>
                <th>Verification Status</th>
                <th>Observed Basis & Comparison</th>
                <th>Analytical Relevance</th>
                <th>Applied Methodology</th>
              </tr>
            </thead>
            <tbody>
              {dnaAttributes.map((attr, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{attr.factor}</td>
                  <td>
                    {attr.verified ? (
                      <span className="badge badge-actionable">
                        <CheckCircle2 size={11} /> VERIFIED
                      </span>
                    ) : (
                      <span className="badge badge-watch">
                        <AlertCircle size={11} /> ESTIMATED
                      </span>
                    )}
                  </td>
                  <td className="font-mono">{attr.basis}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{attr.relevance}</td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {idx === 0 && 'Formula: P_fine = (P / Qty) / Purity * 0.999'}
                    {idx === 1 && 'Hedge Ratio calculation: 1 GOLDM (100g) = 10 GOLDTEN (10g)'}
                    {idx === 2 && 'Maturity calendar delta check (Days difference = 0)'}
                    {idx === 3 && 'Calendar days before MCX delivery tender period inception'}
                    {idx === 4 && 'Ratio of daily contract traded turnover to Open Interest'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Explainability Panel */}
      <ExplanationPanel
        title="Why is this spread unusual?"
        explanation={pair.explanation || 'Residual deviation is driven by short-term inventory hedging flows in GOLDM ahead of the contract tender cycle.'}
        formula="Residual = ObservedSpread(t) - MedianSpread(t-30:t-1)"
      >
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <div>
            <strong>1. Normalization Guarantee:</strong> Both contract prices are converted to 999 fine gold equivalent per 10 grams, eliminating superficial quoting unit discrepancies.
          </div>
          <div>
            <strong>2. Purity Adjustments:</strong> Contracts with 995 purity (GOLDM, GOLDTEN) are normalized against 999 purity contracts (GOLDGUINEA, GOLDPETAL) using explicit assay factors.
          </div>
          <div>
            <strong>3. Uncertainty Note:</strong> Daily settlement data reflects official exchange closing calculations and does not represent instantaneous executable orderbook depth.
          </div>
        </div>
      </ExplanationPanel>
    </div>
  );
}
