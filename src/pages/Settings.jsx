import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Server,
  Radio,
  Sliders,
  CheckCircle2,
  Save,
  RotateCcw,
  ShieldCheck,
  Moon,
  Sun
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { API_CONFIG } from '../config/apiConfig';
import { ExplanationPanel } from '../components/common/States';

export function Settings() {
  const {
    theme,
    toggleTheme,
    isTestMode,
    toggleTestMode,
    backendStatus,
    checkBackendHealth,
    costAssumptions,
    setCostAssumptions
  } = useApp();

  const [apiUrl, setApiUrl] = useState(API_CONFIG.BASE_URL);
  const [brokerage, setBrokerage] = useState(costAssumptions.brokeragePerOrder);
  const [slippage, setSlippage] = useState(costAssumptions.slippageEstimate);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setCostAssumptions(prev => ({
      ...prev,
      brokeragePerOrder: Number(brokerage),
      slippageEstimate: Number(slippage)
    }));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <SettingsIcon size={22} style={{ color: 'var(--accent-cyan)' }} />
            System Settings & Preferences
          </h1>
          <p className="page-subtitle">
            Configure backend connection endpoints, analytical friction defaults, and display modes.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div style={{
          backgroundColor: 'var(--status-actionable-bg)',
          border: '1px solid var(--status-actionable-border)',
          color: 'var(--status-actionable)',
          padding: '10px 16px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.82rem',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <CheckCircle2 size={16} />
          Settings updated and stored in active session memory.
        </div>
      )}

      <div className="grid-2col">
        {/* API & Data Source Mode */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <Server size={16} style={{ color: 'var(--accent-cyan)' }} />
              Backend Connectivity & Data Source
            </div>
          </div>
          <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">
                <span>Active Operating Mode:</span>
              </label>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  className={`btn ${isTestMode ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1 }}
                  onClick={() => toggleTestMode(true)}
                >
                  <Radio size={14} />
                  Offline Test Harness
                </button>
                <button
                  type="button"
                  className={`btn ${!isTestMode ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1 }}
                  onClick={() => toggleTestMode(false)}
                >
                  <Server size={14} />
                  Live MCX Backend
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Configured Backend Base URL:</span>
              </label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                disabled={isTestMode}
                className="font-mono"
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Configured via environment variable <code>VITE_API_BASE_URL</code>
              </span>
            </div>

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
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Connection Status:</span>
                <span style={{ color: backendStatus.isConnected ? 'var(--status-actionable)' : 'var(--status-risk)', fontWeight: 600 }}>
                  {backendStatus.isConnected ? 'CONNECTED' : 'DISCONNECTED / OFFLINE'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Active Mode:</span>
                <span className="font-mono">
                  {isTestMode ? 'BENCHMARK TEST HARNESS' : 'PRODUCTION BACKEND'}
                </span>
              </div>
            </div>

            <button className="btn btn-secondary btn-sm" onClick={checkBackendHealth} style={{ alignSelf: 'flex-start' }}>
              Ping Backend Health
            </button>
          </div>
        </div>

        {/* Display & Default Analytical Assumptions */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <Sliders size={16} style={{ color: 'var(--accent-gold)' }} />
              Analytical Defaults & Theme
            </div>
          </div>
          <div className="panel-body">
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">
                  <span>Interface Theme:</span>
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1 }}
                    onClick={() => theme !== 'dark' && toggleTheme()}
                  >
                    <Moon size={14} /> Dark Workstation
                  </button>
                  <button
                    type="button"
                    className={`btn ${theme === 'light' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1 }}
                    onClick={() => theme !== 'light' && toggleTheme()}
                  >
                    <Sun size={14} /> Light Editorial
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Default Brokerage Assumption (Rs. per Leg):</span>
                  <span className="val-display">₹{Number(brokerage).toFixed(2)}</span>
                </label>
                <input
                  type="number"
                  step="1"
                  value={brokerage}
                  onChange={(e) => setBrokerage(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Default Execution Slippage (Rs. / 10g):</span>
                  <span className="val-display">₹{Number(slippage).toFixed(2)}</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={slippage}
                  onChange={(e) => setSlippage(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>
                <Save size={14} />
                Save Preferences
              </button>
            </form>
          </div>
        </div>
      </div>

      <ExplanationPanel
        title="Zero-Secret Architecture"
        explanation="SwarnaDrishti never stores exchange credentials, database passwords, or private API keys in client-side code. All queries pass through the centralized backend service layer."
      />
    </div>
  );
}
