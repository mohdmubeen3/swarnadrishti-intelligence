import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingState({ message = 'Loading quantitative settlement data...' }) {
  return (
    <div className="state-box">
      <Loader2 className="spinner state-box-icon" />
      <div className="state-box-title">Retrieving Analytical Data</div>
      <p className="state-box-desc">{message}</p>
    </div>
  );
}

export function EmptyState({ title = 'No Eligible Records Found', description = 'No contract or pair met the specified mathematical and liquidity criteria.', action }) {
  return (
    <div className="state-box">
      <div className="state-box-title">{title}</div>
      <p className="state-box-desc">{description}</p>
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  const isUnavailable = error?.status === 501 || error?.data?.detail?.status === 'unavailable';
  const unavailableDetail = error?.data?.detail;

  if (isUnavailable) {
    const featureName = unavailableDetail?.feature || 'Analytical Module';
    const explanation = unavailableDetail?.message || error?.message || 'Feature requires active live MCX market data feed.';
    return (
      <div className="state-box" style={{ borderColor: 'var(--border-medium)', backgroundColor: 'var(--bg-surface-elevated)' }}>
        <div className="state-box-title" style={{ color: 'var(--accent-gold)' }}>
          {featureName} — Live Feed Required
        </div>
        <p className="state-box-desc" style={{ color: 'var(--text-secondary)' }}>
          {explanation}
        </p>
        <div className="state-box-meta" style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
          <span><strong>Data Mode:</strong> Historical Backtest Only</span>
          <span><strong>Exchange Feed:</strong> MCX Real-Time Disconnected</span>
          {error?.endpoint && <span><strong>Endpoint:</strong> {error.endpoint}</span>}
        </div>
      </div>
    );
  }

  const message = error?.message || 'Failed to communicate with the analytical service.';
  const endpoint = error?.endpoint || '';
  const isNetwork = error?.isNetworkError;

  return (
    <div className="state-box" style={{ borderColor: 'var(--status-risk-border)', backgroundColor: 'var(--status-risk-bg)' }}>
      <div className="state-box-title" style={{ color: 'var(--status-risk)' }}>
        {isNetwork ? 'Backend Connection Offline' : 'Calculation Error'}
      </div>
      <p className="state-box-desc" style={{ color: 'var(--text-primary)' }}>
        {message}
      </p>
      {endpoint && (
        <div className="state-box-meta">
          Endpoint: {endpoint}
        </div>
      )}
      {onRetry && (
        <button className="btn btn-secondary btn-sm" onClick={onRetry} style={{ marginTop: 8 }}>
          Retry Request
        </button>
      )}
    </div>
  );
}

export function UnavailableState({ feature = 'Analytical Module', requirement = 'Requires active MCX Bhavcopy ingestion backend' }) {
  return (
    <div className="state-box" style={{ borderColor: 'var(--border-medium)' }}>
      <div className="state-box-title">Integration Pending / Unavailable</div>
      <p className="state-box-desc">
        {feature} is designed for live backend computation. {requirement}.
      </p>
      <div className="state-box-meta">
        Status: Awaiting backend endpoint or historical data
      </div>
    </div>
  );
}

export function StaleDataWarning({ dataDate, requestedDate, syncTimestamp }) {
  return (
    <div className="stale-banner">
      <div className="stale-banner-left">
        <span>⚠ Stale Market Data: Displaying settlement from {dataDate || 'previous session'}.</span>
        {requestedDate && requestedDate !== dataDate && (
          <span style={{ opacity: 0.85 }}>(Requested: {requestedDate})</span>
        )}
      </div>
      {syncTimestamp && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
          Last Exchange Sync: {syncTimestamp}
        </div>
      )}
    </div>
  );
}

export function SignalBadge({ status, reason }) {
  const normalized = (status || '').toUpperCase();
  let className = 'badge badge-nosignal';
  let label = 'NO SIGNAL';

  if (normalized === 'ACTIONABLE' || normalized === 'PASSED') {
    className = 'badge badge-actionable';
    label = 'ACTIONABLE';
  } else if (normalized === 'WATCH' || normalized === 'WARNING') {
    className = 'badge badge-watch';
    label = 'WATCH';
  } else if (normalized === 'RISK' || normalized === 'REJECTED') {
    className = 'badge badge-risk';
    label = 'REJECTED';
  }

  return (
    <span className={className} title={reason || label}>
      ● {label}
    </span>
  );
}

export function MetricCard({ title, value, unit, subtext, statusColor, tooltip }) {
  return (
    <div className="metric-card">
      <div className="metric-card-header">
        <span className={tooltip ? 'tooltip-trigger' : ''} title={tooltip}>
          {title}
        </span>
      </div>
      <div className="metric-card-value" style={statusColor ? { color: statusColor } : {}}>
        {value}
        {unit && <span className="metric-card-unit">{unit}</span>}
      </div>
      {subtext && <div className="metric-card-sub">{subtext}</div>}
    </div>
  );
}

export function ExplanationPanel({ title = 'Analytical Explanation', explanation, formula, children }) {
  return (
    <div className="explanation-panel">
      <div className="explanation-panel-title">
        {title}
      </div>
      {explanation && <div className="explanation-panel-desc">{explanation}</div>}
      {formula && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: 4 }}>
          Formula: {formula}
        </div>
      )}
      {children}
    </div>
  );
}
