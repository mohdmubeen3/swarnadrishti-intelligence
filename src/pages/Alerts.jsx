import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Info,
  Clock,
  Filter,
  ArrowRight,
  ShieldAlert,
  Search
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { alertService } from '../services';
import { formatTimestamp, formatDate } from '../utils/formatters';
import {
  LoadingState,
  EmptyState,
  ErrorState,
  ExplanationPanel
} from '../components/common/States';

export function Alerts() {
  const navigate = useNavigate();
  const { selectedDate } = useApp();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await alertService.getAlerts();
      setAlerts(data.alerts || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [selectedDate]);

  const filteredAlerts = alerts.filter(a => {
    if (filterSeverity !== 'ALL' && a.severity !== filterSeverity) return false;
    return true;
  });

  if (loading) {
    return <LoadingState message="Polling alert surveillance engine and event logs..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchAlerts} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Bell size={22} style={{ color: 'var(--accent-cyan)' }} />
            Alerts & Notification Center
          </h1>
          <p className="page-subtitle">
            Auditable event surveillance logging threshold breaks, physical tender windows, and SignalGuard suppression notices.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <Filter size={14} style={{ color: 'var(--text-muted)' }} />
          <span className="filter-label">Filter Severity:</span>
          <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
            <option value="ALL">All Severities</option>
            <option value="ACTIONABLE">Actionable Signal Alerts</option>
            <option value="WARNING">Lifecycle & Tender Warnings</option>
            <option value="INFO">Cost Suppression Notices</option>
          </select>
        </div>

        <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          Showing {filteredAlerts.length} event records
        </div>
      </div>

      {/* Alerts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredAlerts.length === 0 ? (
          <EmptyState title="No Active Alerts" description="No alerts generated matching the selected severity filter." />
        ) : (
          filteredAlerts.map(alert => {
            let borderColor = 'var(--border-subtle)';
            let iconColor = 'var(--text-muted)';
            let badgeClass = 'badge badge-neutral';

            if (alert.severity === 'ACTIONABLE') {
              borderColor = 'var(--status-actionable-border)';
              iconColor = 'var(--status-actionable)';
              badgeClass = 'badge badge-actionable';
            } else if (alert.severity === 'WARNING') {
              borderColor = 'var(--status-watch-border)';
              iconColor = 'var(--status-watch)';
              badgeClass = 'badge badge-watch';
            }

            return (
              <div
                key={alert.id}
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: `1px solid ${borderColor}`,
                  borderRadius: 'var(--radius-sm)',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 16
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ marginTop: 2, color: iconColor }}>
                    {alert.severity === 'ACTIONABLE' ? (
                      <CheckCircle2 size={18} />
                    ) : alert.severity === 'WARNING' ? (
                      <AlertTriangle size={18} />
                    ) : (
                      <Info size={18} />
                    )}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="font-mono" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                        {alert.pair}
                      </span>
                      <span className={badgeClass}>{alert.severity}</span>
                      <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {alert.category}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-primary)', marginTop: 4 }}>
                      {alert.observedChange}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 3 }}>
                      {alert.explanation}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 6 }}>
                      Event Time: {formatTimestamp(alert.timestamp)} • Market Date: {alert.dataDate}
                    </div>
                  </div>
                </div>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate('/app/scanner')}
                  style={{ flexShrink: 0 }}
                >
                  Inspect &rarr;
                </button>
              </div>
            );
          })
        )}
      </div>

      <ExplanationPanel
        title="Alert Suppression Transparency"
        explanation="Notice ALT-1092 demonstrates proactive suppression: when a residual deviation occurs but transaction costs (₹22.40) exceed the gross edge (₹9.88), SignalGuard logs a suppression notice instead of a false trade signal."
      />
    </div>
  );
}
