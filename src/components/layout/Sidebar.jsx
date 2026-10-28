import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Radar,
  Activity,
  Dna,
  ShieldAlert,
  Calculator,
  ShieldCheck,
  Sliders,
  History,
  Scale,
  GitBranch,
  Bell,
  BookOpen,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  Home as HomeIcon,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function Sidebar({ mobileOpen, onCloseMobile }) {
  const [collapsed, setCollapsed] = useState(false);
  const { backendStatus, isTestMode } = useApp();

  const navItems = [
    { section: 'Discovery & Analytics' },
    { to: '/app', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/app/scanner', label: 'Opportunity Scanner', icon: Radar },
    { to: '/app/rv-lab', label: 'Relative Value Lab', icon: Activity },
    { to: '/app/fair-value', label: 'Fair Value & DNA', icon: Dna },
    { to: '/app/liquidity-lifecycle', label: 'Liquidity & Lifecycle', icon: ShieldAlert },
    
    { section: 'Risk & Strategy Validation' },
    { to: '/app/cost-estimator', label: 'Cost Estimator', icon: Calculator },
    { to: '/app/survival-signalguard', label: 'SignalGuard Engine', icon: ShieldCheck },
    { to: '/app/simulator', label: 'What-If Simulator', icon: Sliders },
    { to: '/app/backtesting', label: 'Walk-Forward Backtesting', icon: History },
    { to: '/app/attribution', label: 'Gold-Neutral Attribution', icon: Scale },
    { to: '/app/edge-survival', label: 'Edge Survival Analysis', icon: GitBranch },

    { section: 'Operations & Audit' },
    { to: '/app/alerts', label: 'Alerts & Monitor', icon: Bell },
    { to: '/app/methodology', label: 'Methodology & Data Quality', icon: BookOpen },
    { to: '/app/settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <Link to="/" className="brand-link" onClick={onCloseMobile} title="Back to Public Homepage">
          <div className="brand-logo-wrap">
            <img
              src="/assets/swarnadrishti-logo.png"
              alt="SwarnaDrishti Logo"
              className="official-logo-img"
            />
          </div>
          {!collapsed && (
            <div className="brand-title-wrap">
              <span className="brand-name">SwarnaDrishti</span>
              <span className="brand-tag">MCX Gold Intelligence</span>
            </div>
          )}
        </Link>

        <button
          className="sidebar-collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label="Toggle Sidebar"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {/* Link back to public homepage */}
        <Link
          to="/"
          className="nav-link"
          style={{ marginBottom: 4, color: 'var(--gold-bright)' }}
          title={collapsed ? 'Public Homepage' : undefined}
          onClick={onCloseMobile}
        >
          <HomeIcon className="nav-icon" style={{ color: 'var(--gold-bright)' }} />
          {!collapsed && <span>Public Homepage</span>}
        </Link>

        {navItems.map((item, idx) => {
          if (item.section) {
            if (collapsed) return null;
            return (
              <div key={`sec-${idx}`} className="nav-section-title">
                {item.section}
              </div>
            );
          }

          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              title={collapsed ? item.label : undefined}
              onClick={onCloseMobile}
            >
              <Icon className="nav-icon" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="system-status-indicator" title={isTestMode ? 'Operating on isolated benchmark test dataset' : backendStatus.isConnected ? 'Connected to live MCX pipeline' : 'Backend connection error'}>
          <div className={`pulse-dot ${backendStatus.isConnected ? '' : 'error'}`} />
          {!collapsed && (
            <span>
              {isTestMode ? 'Test Harness Mode' : backendStatus.isConnected ? 'API Connected' : 'Backend Disconnected'}
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}
