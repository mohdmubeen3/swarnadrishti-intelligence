import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowDown,
  Layers,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { attributionService } from '../services';
import { formatPrice } from '../utils/formatters';
import {
  LoadingState,
  EmptyState,
  ErrorState,
  MetricCard,
  SignalBadge,
  ExplanationPanel
} from '../components/common/States';

export function EdgeSurvival() {
  const { selectedPair } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchEdgeSurvival = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await attributionService.getEdgeSurvival();
      setData(res);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEdgeSurvival();
  }, [selectedPair]);

  if (loading) {
    return <LoadingState message="Tracing step-by-step edge survival pipeline across friction and constraint filters..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchEdgeSurvival} />;
  }

  const pipeline = data?.stages || [];
  const pairTitle = data?.pair || 'GOLDM / GOLDTEN (Nov-2026 Expiry)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <GitBranch size={22} style={{ color: 'var(--accent-cyan)' }} />
            Edge Survival Analysis
          </h1>
          <p className="page-subtitle">
            Visual pipeline deconstructing how an apparent pricing difference shrinks under realistic market frictions and risk rules.
          </p>
        </div>
        <div className="page-actions">
          <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
            Pair: {pairTitle}
          </span>
        </div>
      </div>

      {/* Main Core Question Card */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-md)',
        padding: '18px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20
      }}>
        <div>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Core Quantitative Question
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>
            Does this apparent pricing difference remain meaningful after applicable costs, constraints, and risk checks?
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Final Pipeline Verdict</div>
          <div style={{ marginTop: 4 }}>
            <SignalBadge status="ACTIONABLE" reason="Net edge survives all hurdles" />
          </div>
        </div>
      </div>

      {/* Step-by-Step Survival Pipeline Waterfall */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <Layers size={16} style={{ color: 'var(--accent-cyan)' }} />
            Analytical Survival Pipeline (7 Discrete Filtering Stages)
          </div>
          <span className="panel-meta">No Double-Counting Guarantee</span>
        </div>
        <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {pipeline.map((stage, idx) => {
            const isLast = idx === pipeline.length - 1;
            const isPassed = stage.status === 'PASSED' || stage.status === 'ACTIONABLE';

            return (
              <React.Fragment key={stage.step}>
                <div style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: `1px solid ${isPassed ? 'var(--border-subtle)' : 'var(--status-risk-border)'}`,
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      backgroundColor: isPassed ? 'var(--status-actionable-bg)' : 'var(--status-risk-bg)',
                      color: isPassed ? 'var(--status-actionable)' : 'var(--status-risk)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)'
                    }}>
                      {stage.step}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        {stage.title}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                        {stage.explanation}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div className="font-mono" style={{
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      color: isLast ? 'var(--status-actionable)' : stage.value.includes('-') ? 'var(--status-risk)' : 'var(--text-primary)'
                    }}>
                      {stage.value}
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <span className={`badge ${isPassed ? 'badge-actionable' : 'badge-risk'}`}>
                        {stage.status}
                      </span>
                    </div>
                  </div>
                </div>

                {!isLast && (
                  <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    <ArrowDown size={16} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <ExplanationPanel
        title="Prevention of Fictional Alpha"
        explanation="Many trading strategies show high theoretical profits on paper because they ignore exchange statutory taxes (CTT on sell side), clearing costs, and bid-ask slippage. SwarnaDrishti's Edge Survival pipeline proves that ₹14.20/10g of friction is deducted before an opportunity is considered actionable."
      />
    </div>
  );
}
