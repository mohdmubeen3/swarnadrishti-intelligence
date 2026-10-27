/**
 * Centralized API Configuration
 * Supports environment configuration without exposing credentials.
 */

export const API_CONFIG = {
  // Configured backend URL, defaults to local API server
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  
  // Timeout in milliseconds for quantitative calculation endpoints
  TIMEOUT_MS: 15000,

  // Endpoints mapping
  ENDPOINTS: {
    HEALTH: '/health',
    MARKET_DATA: '/market-data',
    CONTRACTS: '/contracts',
    PAIRS_SCANNER: '/relative-value/scanner',
    PAIR_DETAIL: '/relative-value/pair',
    FAIR_VALUE: '/fair-value',
    CONTRACT_DNA: '/contract-dna',
    LIQUIDITY_LIFECYCLE: '/liquidity-lifecycle',
    COST_ESTIMATE: '/transaction-costs/estimate',
    SCENARIO_SIMULATE: '/scenarios/simulate',
    BACKTEST_RUN: '/backtesting/run',
    BACKTEST_STATUS: '/backtesting/jobs',
    ATTRIBUTION: '/attribution/gold-neutral',
    EDGE_SURVIVAL: '/edge-survival',
    ALERTS: '/alerts',
    DATA_QUALITY: '/data-quality',
  },

  // Storage key for client preferences
  STORAGE_KEYS: {
    THEME: 'swarnadrishti_theme',
    TEST_MODE: 'swarnadrishti_offline_test_mode',
    SELECTED_DATE: 'swarnadrishti_selected_date',
    ACTIVE_CONTRACT: 'swarnadrishti_active_contract',
    SETTINGS: 'swarnadrishti_user_settings',
  }
};
