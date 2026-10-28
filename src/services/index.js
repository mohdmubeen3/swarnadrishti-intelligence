/**
 * Market Data & Contract Services
 */
import { apiRequest } from './apiClient';
import { API_CONFIG } from '../config/apiConfig';


export const historicalResultsService = {
  async getResults(signal) {
    const res = await apiRequest('/historical-results', { signal });
    return res.data;
  },
};

export const marketDataService = {
  async getMarketData(date, signal) {
    const res = await apiRequest(API_CONFIG.ENDPOINTS.MARKET_DATA, {
      params: { date },
      signal
    });
    return res.data;
  },

  async getAvailableContracts(signal) {
    const res = await apiRequest(API_CONFIG.ENDPOINTS.CONTRACTS, { signal });
    return res.data;
  },

  async getHealthStatus(signal) {
    const res = await apiRequest(API_CONFIG.ENDPOINTS.HEALTH, { signal });
    return res.data;
  }
};

export const relativeValueService = {
  async getOpportunityScanner(date, filters = {}, signal) {
    const res = await apiRequest(API_CONFIG.ENDPOINTS.PAIRS_SCANNER, {
      params: { date, ...filters },
      signal
    });
    return res.data;
  },

  async getPairDetail(pairId, signal) {
    const res = await apiRequest(API_CONFIG.ENDPOINTS.PAIR_DETAIL, {
      params: { pairId },
      signal
    });
    return res.data;
  }
};

export const fairValueService = {
  async getFairValueAnalysis(pairId, signal) {
    const res = await apiRequest(API_CONFIG.ENDPOINTS.FAIR_VALUE, {
      params: { pairId },
      signal
    });
    return res.data;
  },

  async getContractDNA(pairId, signal) {
    const res = await apiRequest(API_CONFIG.ENDPOINTS.CONTRACT_DNA, {
      params: { pairId },
      signal
    });
    return res.data;
  }
};

export const liquidityService = {
  async getLiquidityLifecycle(signal) {
    const res = await apiRequest(API_CONFIG.ENDPOINTS.LIQUIDITY_LIFECYCLE, { signal });
    return res.data;
  }
};

export const costService = {
  async calculateCosts(costParams, signal) {
    const res = await apiRequest(API_CONFIG.ENDPOINTS.COST_ESTIMATE, {
      method: 'POST',
      body: costParams,
      signal
    });
    return res.data;
  },

  async simulateScenario(scenarioParams, signal) {
    const res = await apiRequest(API_CONFIG.ENDPOINTS.SCENARIO_SIMULATE, {
      method: 'POST',
      body: scenarioParams,
      signal
    });
    return res.data;
  }
};

export const backtestService = {
  async runBacktest(config, signal) {
    const res = await apiRequest(API_CONFIG.ENDPOINTS.BACKTEST_RUN, {
      method: 'POST',
      body: config,
      signal
    });
    return res.data;
  }
};

export const attributionService = {
  async getAttribution(params = {}, signal) {
    const res = await apiRequest(API_CONFIG.ENDPOINTS.ATTRIBUTION, {
      params,
      signal
    });
    return res.data;
  },

  async getEdgeSurvival(params = {}, signal) {
    const res = await apiRequest(API_CONFIG.ENDPOINTS.EDGE_SURVIVAL, {
      params,
      signal
    });
    return res.data;
  }
};

export const alertService = {
  async getAlerts(signal) {
    const res = await apiRequest(API_CONFIG.ENDPOINTS.ALERTS, { signal });
    return res.data;
  }
};

export const dataQualityService = {
  async getDataQuality(date, signal) {
    const res = await apiRequest(API_CONFIG.ENDPOINTS.DATA_QUALITY, {
      params: { date },
      signal
    });
    return res.data;
  }
};
