import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_CONFIG } from '../config/apiConfig';
import { isOfflineTestModeActive, setOfflineTestMode } from '../services/apiClient';
import { marketDataService } from '../services';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(API_CONFIG.STORAGE_KEYS.THEME) || 'dark';
  });

  // Offline Benchmark Test Mode toggle
  const [isTestMode, setIsTestMode] = useState(() => isOfflineTestModeActive());

  // Global Date Selection
  const [selectedDate, setSelectedDate] = useState('2026-10-26');
  const [availableDates, setAvailableDates] = useState(['2026-10-26', '2026-10-23', '2026-10-22', '2026-10-21', '2026-10-20']);

  // Global Contract Selection
  const [selectedContract, setSelectedContract] = useState('ALL');
  const [selectedPair, setSelectedPair] = useState('GOLDGUINEA-GOLDPETAL');

  // Backend Health and Connection State
  const [backendStatus, setBackendStatus] = useState({
    isConnected: false,
    lastChecked: null,
    latencyMs: null,
    version: null,
    pipeline: null,
    error: null
  });

  // User configurable cost assumptions
  const [costAssumptions, setCostAssumptions] = useState({
    brokeragePerOrder: 20.0, // Rs per executed leg
    slippageEstimate: 5.0, // Rs per 10g fine gold
    exchangeTurnoverBps: 0.00325, // MCX standard
    cttRate: 0.0001, // Commodity Transaction Tax on sell side (0.01%)
    gstRate: 0.18 // 18% on brokerage & transaction charges
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(API_CONFIG.STORAGE_KEYS.THEME, theme);
  }, [theme]);

  // Toggle theme
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Toggle Test Mode
  const toggleTestMode = (val) => {
    const nextVal = typeof val === 'boolean' ? val : !isTestMode;
    setIsTestMode(nextVal);
    setOfflineTestMode(nextVal);
    // Re-verify backend ping
    checkBackendHealth();
  };

  // Check backend health
  const checkBackendHealth = async () => {
    const start = performance.now();
    try {
      const res = await marketDataService.getHealthStatus();
      const latency = Math.round(performance.now() - start);
      setBackendStatus({
        isConnected: res?.status === 'ok' || res?.status === 'UP',
        lastChecked: new Date().toISOString(),
        latencyMs: latency,
        version: res?.version || '1.1.0',
        pipeline: res?.pipeline || 'historical_backtest_artifacts',
        error: null
      });
    } catch (err) {
      setBackendStatus({
        isConnected: false,
        lastChecked: new Date().toISOString(),
        latencyMs: null,
        version: null,
        pipeline: null,
        error: err.message
      });
    }
  };

  useEffect(() => {
    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 30000);
    return () => clearInterval(interval);
  }, [isTestMode]);

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        isTestMode,
        toggleTestMode,
        selectedDate,
        setSelectedDate,
        availableDates,
        setAvailableDates,
        selectedContract,
        setSelectedContract,
        selectedPair,
        setSelectedPair,
        backendStatus,
        checkBackendHealth,
        costAssumptions,
        setCostAssumptions
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
