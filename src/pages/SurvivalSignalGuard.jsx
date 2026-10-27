import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { relativeValueService } from '../services';
import { formatPrice, formatZScore } from '../utils/formatters';
import {
  LoadingState,
  EmptyState,
  ErrorState,
  MetricCard,
  SignalBadge,
  ExplanationPanel
} from '../components/common/States';

export function SurvivalSignalGuard() {
  const { selectedPair, selectedDate } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pair, setPair] = useState(null);

  const fetchPair = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await relativeValueService.getPairDetail(selectedPair);
      setPair(data.pair);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPair();
  }, [selectedPair, selectedDate]);

  if (loading) {
    return <LoadingState message="Evaluating SignalGuard multi-stage risk and friction hurdles..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchPair} />;
  }

  const p = pair || {};

  // Check definitions
  const checks = [
    {
      name: 'Statistical Unusualness Hurdle',
      hurdle: '|Robust Z-Score| ≥ 2.0σ',
      observed: `${formatZScore(p.robustZScore)} (Residual: ₹${formatPrice(p.residual)})`,
      status: Math.abs(p.robustZScore) >= 2.0 ? 'PASSED' : 'FAILED',
      reason: Math.abs(p.robustZScore) >= 2.0
        ? 'Divergence exceeds 2.0σ threshold relative to rolling median.'
        : 'Residual is within normal random market fluctuation band.'
    },
    {
      name: 'Transaction Cost Survival Hurdle',
      hurdle: 'Estimated Net Edge > ₹10.00 / 10g',
      observed: `₹${formatPrice(p.estimatedNetEdge)} (Frictions: ₹${formatPrice(p.estimatedTotalCost)})`,
      status: p.estimatedNetEdge > 10 ? 'PASSED' : p.estimatedNetEdge > 0 ? 'WATCH' : 'FAILED',
      reason: p.estimatedNetEdge > 10
        ? 'Positive economic edge survives all brokerage, CTT, GST, and slippage.'
        : 'Transaction costs consume the majority or entirety of theoretical edge.'
    },
    {
      name: 'Liquidity & Turnover Hurdle',
      hurdle: 'Liquidity Proxy Score ≥ 60.0 / 100',
      observed: `${p.liquidityScore?.toFixed(1) || '—'} / 100`,
      status: (p.liquidityScore || 0) >= 60 ? 'PASSED' : 'WATCH',
      reason: 'Active volume and Open Interest support simulated two-way execution.'
    },
    {
      name: 'Contract Lifecycle & Tender Window',
      hurdle: 'Days to Expiry / Tender > 5 Days',
      observed: `${p.daysToExpiry} Days Remaining`,
      status: p.daysToExpiry > 5 ? 'PASSED' : 'FAILED',
      reason: 'Contract is safely outside MCX 5-day physical tender window.'
    },
    {
      name: 'Contract Expiry Alignment',
      hurdle: 'Maturity Mismatch Δ = 0 days',
      observed: p.isExpiryMatched ? 'Matched Expiry' : 'Calendar Mismatch',
      status: p.isExpiryMatched ? 'PASSED' : 'WATCH',
      reason: p.isExpiryMatched
        ? 'Both legs expire on identical contract date; zero calendar roll risk.'
        : 'Cross-expiry calendar spread introduces term structure slope risk.'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <ShieldCheck size={22} style={{ color: 'var(--accent-cyan)' }} />
            Opportunity Survival Score & SignalGuard
          </h1>
          <p className="page-subtitle">
            Systematic gatekeeper preventing premature trade generation by auditing statistical, cost, and lifecycle constraints.
          </p>
        </div>
      </div>

      {/* Top Survival Metrics */}
      <div className="grid-metrics">
        <MetricCard
          title="Overall Opportunity Survival Score"
          value={p.survivalScore ? `${p.survivalScore.toFixed(1)} / 100` : '—'}
          statusColor={p.survivalScore >= 70 ? 'var(--status-actionable)' : p.survivalScore >= 50 ? 'var(--status-watch)' : 'var(--status-risk)'}
          subtext="Composite multi-hurdle rating"
          tooltip="Validated composite index of statistical divergence, cost survivability, and liquidity"
        />
        <MetricCard
          title="Final SignalGuard Status"
          value={<SignalBadge status={p.signalStatus} />}
          subtext={p.signalStatus === 'ACTIONABLE' ? 'All mandatory gates cleared' : 'Action suppressed by gatekeeper'}
          tooltip="Authoritative recommendation status from backend analytical engine"
        />
        <MetricCard
          title="Surviving Net Economic Edge"
          value={`₹${formatPrice(p.estimatedNetEdge)}`}
          unit="/ 10g"
          statusColor={p.estimatedNetEdge > 0 ? 'var(--status-actionable)' : 'var(--status-risk)'}
          subtext="Net of all fees & slippage"
        />
      </div>

      {/* SignalGuard Gatekeeper Audit Table */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <Layers size={16} style={{ color: 'var(--accent-cyan)' }} />
            SignalGuard Multi-Stage Gatekeeper Checks
          </div>
          <span className="panel-meta">Analyzed Pair: {p.pair}</span>
        </div>
        <div className="table-wrapper">
          <table className="financial-table">
            <thead>
              <tr>
                <th>Gatekeeper Hurdle</th>
                <th>Prescribed Threshold</th>
                <th>Observed Metric</th>
                <th>Check Result</th>
                <th>Audit Rationale</th>
              </tr>
            </thead>
            <tbody>
              {checks.map((c, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td className="font-mono">{c.hurdle}</td>
                  <td className="font-mono">{c.observed}</td>
                  <td>
                    {c.status === 'PASSED' ? (
                      <span className="badge badge-actionable">
                        <CheckCircle2 size={11} /> PASSED
                      </span>
                    ) : c.status === 'WATCH' ? (
                      <span className="badge badge-watch">
                        <AlertTriangle size={11} /> WATCH
                      </span>
                    ) : (
                      <span className="badge badge-risk">
                        <XCircle size={11} /> REJECTED
                      </span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{c.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Explanation Box */}
      <ExplanationPanel
        title="Why A 'No Signal' Status Is A Valid Research Outcome"
        explanation="Statistical anomalies frequently occur in illiquid or mismatched contracts where executing two legs would incur bid-ask slippage and CTT taxes greater than the mispricing. SignalGuard suppresses unprofitable ideas, protecting capital from illusory opportunities."
      />
    </div>
  );
}
