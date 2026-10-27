import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Menu,
  Sun,
  Moon,
  Database,
  Calendar,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Server,
  Home as HomeIcon
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MCX_GOLD_CONTRACTS } from '../../utils/contractSpecs';

export function TopBar({ onOpenMobile }) {
  const location = useLocation();
  const {
    theme,
    toggleTheme,
    isTestMode,
    toggleTestMode,
    selectedDate,
    setSelectedDate,
    availableDates,
    selectedContract,
    setSelectedContract,
    backendStatus
  } = useApp();

  const [showStatusModal, setShowStatusModal] = useState(false);

  // Derive breadcrumb from path
  const pathMap = {
    '/app': 'Market Overview',
    '/app/scanner': 'Opportunity Scanner',
    '/app/rv-lab': 'Relative Value Lab',
    '/app/fair-value': 'Fair Value & Contract DNA',
    '/app/liquidity-lifecycle': 'Liquidity & Lifecycle Radar',
    '/app/cost-estimator': 'Transaction Cost Estimator',
    '/app/survival-signalguard': 'Opportunity Survival & SignalGuard',
    '/app/simulator': 'What-If Fair Value Simulator',
    '/app/backtesting': 'Walk-Forward Strategy Backtesting',
    '/app/attribution': 'Gold-Neutral Performance Attribution',
    '/app/edge-survival': 'Edge Survival Analysis',
    '/app/alerts': 'Alerts & Notifications',
    '/app/methodology': 'Methodology & Data Quality Diagnostics',
    '/app/settings': 'System Settings'
  };

  const currentTitle = pathMap[location.pathname] || 'Analytical Workspace';

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <button
            className="topbar-icon-btn mobile-menu-btn"
            onClick={onOpenMobile}
            aria-label="Open Navigation Menu"
          >
            <Menu size={18} />
          </button>

          <div className="breadcrumb-trail">
            <Link to="/" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }} title="Return to Homepage">
              <HomeIcon size={14} />
              <span>SwarnaDrishti</span>
            </Link>
            <span>/</span>
            <Link to="/app" style={{ color: 'var(--text-muted)' }}>Workstation</Link>
            <span>/</span>
            <span className="active-crumb">{currentTitle}</span>
          </div>
        </div>

        <div className="topbar-right">
          {/* Market Data Settlement Date Selector */}
          <div className="topbar-control-group" title="Select official MCX settlement date">
            <Calendar size={14} style={{ color: 'var(--gold-bright)' }} />
            <span className="topbar-control-label">Date</span>
            <select
              className="topbar-select"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            >
              {availableDates.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Global Contract Filter */}
          <div className="topbar-control-group" title="Filter by MCX Gold contract symbol">
            <Filter size={14} style={{ color: 'var(--accent-cyan)' }} />
            <span className="topbar-control-label">Contract</span>
            <select
              className="topbar-select"
              value={selectedContract}
              onChange={(e) => setSelectedContract(e.target.value)}
            >
              <option value="ALL">ALL CONTRACTS</option>
              {Object.keys(MCX_GOLD_CONTRACTS).map(sym => (
                <option key={sym} value={sym}>{sym}</option>
              ))}
            </select>
          </div>

          {/* Test Mode / Live Backend Status Badge */}
          <button
            className={`topbar-badge ${isTestMode ? 'stale' : backendStatus.isConnected ? 'verified' : 'disconnected'}`}
            onClick={() => setShowStatusModal(true)}
            title="Click to view backend connection diagnostics or toggle source"
          >
            {isTestMode ? (
              <>
                <Radio size={12} />
                <span>Test Mode</span>
              </>
            ) : backendStatus.isConnected ? (
              <>
                <CheckCircle2 size={12} />
                <span>MCX Live</span>
              </>
            ) : (
              <>
                <AlertTriangle size={12} />
                <span>Offline</span>
              </>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            className="topbar-icon-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      {/* Backend Diagnostics Modal */}
      {showStatusModal && (
        <div className="modal-backdrop" style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          backdropFilter: 'blur(4px)'
        }}>
          <div className="panel" style={{ width: '480px', maxWidth: '90vw' }}>
            <div className="panel-header">
              <div className="panel-title">
                <Server size={18} style={{ color: 'var(--gold-bright)' }} />
                <span>Data Source & Connection Diagnostics</span>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowStatusModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                SwarnaDrishti enforces <strong>No Synthetic or Fabricated Market Information</strong>.
                You can toggle between the isolated benchmark test harness (for UI inspection) and the live MCX backend pipeline.
              </div>

              <div style={{
                padding: '14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                fontSize: '0.82rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Configured API URL:</span>
                  <span className="font-mono" style={{ color: 'var(--accent-cyan)' }}>http://localhost:8000/api</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Backend Ping Status:</span>
                  <span style={{ color: backendStatus.isConnected ? 'var(--status-actionable)' : 'var(--status-risk)', fontWeight: 600 }}>
                    {backendStatus.isConnected ? 'RESPONDING (200 OK)' : 'NO RESPONSE / UNREACHABLE'}
                  </span>
                </div>
                {backendStatus.latencyMs && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Round-Trip Latency:</span>
                    <span className="font-mono">{backendStatus.latencyMs} ms</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Current Active Mode:</span>
                  <span className="font-mono" style={{ fontWeight: 700, color: 'var(--gold-bright)' }}>
                    {isTestMode ? 'OFFLINE BENCHMARK HARNESS' : 'LIVE PRODUCTION PIPELINE'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  className={`btn ${isTestMode ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1 }}
                  onClick={() => {
                    toggleTestMode(true);
                    setShowStatusModal(false);
                  }}
                >
                  Enable Offline Test Harness
                </button>
                <button
                  className={`btn ${!isTestMode ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1 }}
                  onClick={() => {
                    toggleTestMode(false);
                    setShowStatusModal(false);
                  }}
                >
                  Connect Live Backend
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
