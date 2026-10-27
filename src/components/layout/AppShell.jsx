import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useApp } from '../../context/AppContext';
import { Radio } from 'lucide-react';

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isTestMode, toggleTestMode } = useApp();

  return (
    <div className="app-shell">
      {mobileOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="main-wrapper">
        <TopBar onOpenMobile={() => setMobileOpen(true)} />

        {isTestMode && (
          <div style={{
            backgroundColor: 'var(--status-watch-bg)',
            borderBottom: '1px solid var(--status-watch-border)',
            color: 'var(--status-watch)',
            padding: '6px 24px',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: 'var(--font-mono)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Radio size={13} />
              <span>TEST HARNESS ACTIVE: Displaying isolated benchmark MCX dataset. No live trade execution.</span>
            </div>
            <button
              onClick={() => toggleTestMode(false)}
              style={{
                color: 'var(--accent-cyan)',
                textDecoration: 'underline',
                fontSize: '0.72rem',
                cursor: 'pointer'
              }}
            >
              Switch to Live MCX Backend &rarr;
            </button>
          </div>
        )}

        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
