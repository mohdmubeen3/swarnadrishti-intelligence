/**
 * SwarnaDrishti Isolated Benchmark Test Dataset
 * Strictly used ONLY when the application is explicitly toggled to "Offline Test Harness" mode.
 * Contains validated MCX gold contract historical settlement structures.
 */

export const BENCHMARK_MARKET_DATES = [
  '2026-10-24',
  '2026-10-23',
  '2026-10-22',
  '2026-10-21',
  '2026-10-20',
  '2026-10-17'
];

export const BENCHMARK_DATASET = {
  metadata: {
    datasetSource: 'MCX Daily Bhavcopy & Settlement Extract (Benchmark Sample)',
    dataQuality: 'VERIFIED',
    lastSyncTimestamp: '2026-10-24T17:30:00+05:30',
    exchange: 'Multi Commodity Exchange of India (MCX)',
    normalizedBasis: 'Fine Gold 999 purity, Rs. per 10 grams equivalent'
  },

  contracts: [
    {
      symbol: 'GOLDM',
      expiry: '2026-11-05',
      closePrice: 78420.00,
      settlementPrice: 78415.00,
      openPrice: 78150.00,
      highPrice: 78550.00,
      lowPrice: 78100.00,
      volume: 14250,
      openInterest: 28410,
      quotationUnit: '10 grams',
      tradingUnit: '100 grams',
      purity: 0.995,
      normalizedPrice10g: 78729.85,
      daysToExpiry: 12,
      tenderPeriodStart: '2026-10-31',
      liquidityProxyScore: 92.4,
      isEligible: true
    },
    {
      symbol: 'GOLDTEN',
      expiry: '2026-11-05',
      closePrice: 78490.00,
      settlementPrice: 78480.00,
      openPrice: 78200.00,
      highPrice: 78590.00,
      lowPrice: 78180.00,
      volume: 4820,
      openInterest: 9410,
      quotationUnit: '10 grams',
      tradingUnit: '10 grams',
      purity: 0.995,
      normalizedPrice10g: 78795.12,
      daysToExpiry: 12,
      tenderPeriodStart: '2026-10-31',
      liquidityProxyScore: 78.1,
      isEligible: true
    },
    {
      symbol: 'GOLDGUINEA',
      expiry: '2026-11-30',
      closePrice: 63120.00, // per 8 grams
      settlementPrice: 63110.00,
      openPrice: 62900.00,
      highPrice: 63200.00,
      lowPrice: 62850.00,
      volume: 1840,
      openInterest: 4210,
      quotationUnit: '8 grams',
      tradingUnit: '8 grams',
      purity: 0.999,
      normalizedPrice10g: 78887.50, // (63110 / 8) * 10
      daysToExpiry: 37,
      tenderPeriodStart: '2026-11-25',
      liquidityProxyScore: 54.2,
      isEligible: true
    },
    {
      symbol: 'GOLDPETAL',
      expiry: '2026-11-30',
      closePrice: 7905.00, // per 1 gram
      settlementPrice: 7902.00,
      openPrice: 7875.00,
      highPrice: 7915.00,
      lowPrice: 7860.00,
      volume: 6120,
      openInterest: 14820,
      quotationUnit: '1 gram',
      tradingUnit: '1 gram',
      purity: 0.999,
      normalizedPrice10g: 79020.00, // 7902 * 10
      daysToExpiry: 37,
      tenderPeriodStart: '2026-11-25',
      liquidityProxyScore: 68.5,
      isEligible: true
    }
  ],

  pairs: [
    {
      id: 'GOLDM-GOLDTEN-20261105',
      pair: 'GOLDM / GOLDTEN',
      legA: 'GOLDM',
      legB: 'GOLDTEN',
      expiryA: '2026-11-05',
      expiryB: '2026-11-05',
      daysToExpiry: 12,
      isExpiryMatched: true,
      observedSpread: -65.27, // Normalized A - Normalized B (78729.85 - 78795.12)
      estimatedFairSpread: -12.40, // 30-day rolling median
      residual: -52.87,
      robustZScore: -2.34,
      historicalPercentile: 2.1,
      liquidityScore: 85.2,
      liquidityAssessment: 'SUFFICIENT',
      estimatedGrossEdge: 52.87,
      estimatedTotalCost: 14.20,
      estimatedNetEdge: 38.67,
      costToEdgeRatio: 0.268,
      lifecycleAssessment: 'PASSED (12 days to tender start)',
      survivalScore: 84.5,
      signalStatus: 'ACTIONABLE', // ACTIONABLE, WATCH, NO_SIGNAL
      explanation: 'Statistically significant negative residual (-2.34σ) exceeding cost hurdle (Net Edge: ₹38.67/10g) with verified liquidity and 12 days before physical tender period.'
    },
    {
      id: 'GOLDM-GOLDGUINEA-202611',
      pair: 'GOLDM / GOLDGUINEA',
      legA: 'GOLDM',
      legB: 'GOLDGUINEA',
      expiryA: '2026-11-05',
      expiryB: '2026-11-30',
      daysToExpiry: 12,
      isExpiryMatched: false,
      observedSpread: -157.65,
      estimatedFairSpread: -110.00,
      residual: -47.65,
      robustZScore: -1.78,
      historicalPercentile: 7.8,
      liquidityScore: 69.1,
      liquidityAssessment: 'MODERATE',
      estimatedGrossEdge: 47.65,
      estimatedTotalCost: 28.50,
      estimatedNetEdge: 19.15,
      costToEdgeRatio: 0.598,
      lifecycleAssessment: 'EXPIRY MISMATCH WARNING (Leg A: 5-Nov, Leg B: 30-Nov)',
      survivalScore: 58.0,
      signalStatus: 'WATCH',
      explanation: 'Residual deviation is notable (-1.78σ), but maturity mismatch introduces calendar carry risk and GOLDGUINEA wider bid-ask spread increases friction.'
    },
    {
      id: 'GOLDTEN-GOLDPETAL-202611',
      pair: 'GOLDTEN / GOLDPETAL',
      legA: 'GOLDTEN',
      legB: 'GOLDPETAL',
      expiryA: '2026-11-05',
      expiryB: '2026-11-30',
      daysToExpiry: 12,
      isExpiryMatched: false,
      observedSpread: -224.88,
      estimatedFairSpread: -215.00,
      residual: -9.88,
      robustZScore: -0.42,
      historicalPercentile: 46.5,
      liquidityScore: 73.3,
      liquidityAssessment: 'SUFFICIENT',
      estimatedGrossEdge: 9.88,
      estimatedTotalCost: 22.40,
      estimatedNetEdge: -12.52,
      costToEdgeRatio: 2.267,
      lifecycleAssessment: 'PASSED',
      survivalScore: 31.0,
      signalStatus: 'NO_SIGNAL',
      explanation: 'Residual is within normal statistical noise (-0.42σ). Transaction costs (₹22.40) exceed gross edge, resulting in negative net edge.'
    },
    {
      id: 'GOLDM-GOLDPETAL-202611',
      pair: 'GOLDM / GOLDPETAL',
      legA: 'GOLDM',
      legB: 'GOLDPETAL',
      expiryA: '2026-11-05',
      expiryB: '2026-11-30',
      daysToExpiry: 12,
      isExpiryMatched: false,
      observedSpread: -290.15,
      estimatedFairSpread: -275.00,
      residual: -15.15,
      robustZScore: -0.68,
      historicalPercentile: 38.0,
      liquidityScore: 80.4,
      liquidityAssessment: 'SUFFICIENT',
      estimatedGrossEdge: 15.15,
      estimatedTotalCost: 20.80,
      estimatedNetEdge: -5.65,
      costToEdgeRatio: 1.372,
      lifecycleAssessment: 'PASSED',
      survivalScore: 36.2,
      signalStatus: 'NO_SIGNAL',
      explanation: 'Residual is within normal fluctuation bounds. Friction hurdle prevents actionable arbitrage.'
    }
  ],

  // 30-Day Historical Time Series for Charting (MCX Settlement Observations)
  timeSeries: [
    { date: '2026-09-24', GOLDM: 76210, GOLDTEN: 76280, GOLDGUINEA: 76350, GOLDPETAL: 76420, spread: -70, fair: -20, residual: -50, zScore: -2.1 },
    { date: '2026-09-27', GOLDM: 76450, GOLDTEN: 76500, GOLDGUINEA: 76590, GOLDPETAL: 76650, spread: -50, fair: -20, residual: -30, zScore: -1.3 },
    { date: '2026-09-28', GOLDM: 76600, GOLDTEN: 76640, GOLDGUINEA: 76720, GOLDPETAL: 76790, spread: -40, fair: -18, residual: -22, zScore: -0.9 },
    { date: '2026-09-29', GOLDM: 76820, GOLDTEN: 76850, GOLDGUINEA: 76910, GOLDPETAL: 76990, spread: -30, fair: -18, residual: -12, zScore: -0.5 },
    { date: '2026-09-30', GOLDM: 77100, GOLDTEN: 77120, GOLDGUINEA: 77200, GOLDPETAL: 77280, spread: -20, fair: -16, residual: -4, zScore: -0.1 },
    { date: '2026-10-01', GOLDM: 77050, GOLDTEN: 77070, GOLDGUINEA: 77150, GOLDPETAL: 77210, spread: -20, fair: -16, residual: -4, zScore: -0.1 },
    { date: '2026-10-04', GOLDM: 77350, GOLDTEN: 77360, GOLDGUINEA: 77480, GOLDPETAL: 77520, spread: -10, fair: -15, residual: 5, zScore: 0.2 },
    { date: '2026-10-05', GOLDM: 77420, GOLDTEN: 77440, GOLDGUINEA: 77550, GOLDPETAL: 77610, spread: -20, fair: -15, residual: -5, zScore: -0.2 },
    { date: '2026-10-06', GOLDM: 77550, GOLDTEN: 77570, GOLDGUINEA: 77680, GOLDPETAL: 77730, spread: -20, fair: -14, residual: -6, zScore: -0.2 },
    { date: '2026-10-07', GOLDM: 77800, GOLDTEN: 77840, GOLDGUINEA: 77940, GOLDPETAL: 78010, spread: -40, fair: -14, residual: -26, zScore: -1.1 },
    { date: '2026-10-08', GOLDM: 77950, GOLDTEN: 77990, GOLDGUINEA: 78080, GOLDPETAL: 78150, spread: -40, fair: -14, residual: -26, zScore: -1.1 },
    { date: '2026-10-11', GOLDM: 78100, GOLDTEN: 78130, GOLDGUINEA: 78240, GOLDPETAL: 78310, spread: -30, fair: -13, residual: -17, zScore: -0.7 },
    { date: '2026-10-12', GOLDM: 78250, GOLDTEN: 78290, GOLDGUINEA: 78400, GOLDPETAL: 78460, spread: -40, fair: -13, residual: -27, zScore: -1.2 },
    { date: '2026-10-13', GOLDM: 78150, GOLDTEN: 78180, GOLDGUINEA: 78290, GOLDPETAL: 78360, spread: -30, fair: -13, residual: -17, zScore: -0.7 },
    { date: '2026-10-14', GOLDM: 78300, GOLDTEN: 78320, GOLDGUINEA: 78420, GOLDPETAL: 78500, spread: -20, fair: -13, residual: -7, zScore: -0.3 },
    { date: '2026-10-15', GOLDM: 78200, GOLDTEN: 78230, GOLDGUINEA: 78350, GOLDPETAL: 78420, spread: -30, fair: -13, residual: -17, zScore: -0.7 },
    { date: '2026-10-18', GOLDM: 78350, GOLDTEN: 78380, GOLDGUINEA: 78500, GOLDPETAL: 78570, spread: -30, fair: -13, residual: -17, zScore: -0.7 },
    { date: '2026-10-19', GOLDM: 78400, GOLDTEN: 78460, GOLDGUINEA: 78580, GOLDPETAL: 78650, spread: -60, fair: -13, residual: -47, zScore: -2.0 },
    { date: '2026-10-20', GOLDM: 78450, GOLDTEN: 78520, GOLDGUINEA: 78620, GOLDPETAL: 78700, spread: -70, fair: -13, residual: -57, zScore: -2.5 },
    { date: '2026-10-21', GOLDM: 78500, GOLDTEN: 78560, GOLDGUINEA: 78680, GOLDPETAL: 78750, spread: -60, fair: -12, residual: -48, zScore: -2.1 },
    { date: '2026-10-22', GOLDM: 78380, GOLDTEN: 78440, GOLDGUINEA: 78540, GOLDPETAL: 78610, spread: -60, fair: -12, residual: -48, zScore: -2.1 },
    { date: '2026-10-23', GOLDM: 78415, GOLDTEN: 78480, GOLDGUINEA: 78887, GOLDPETAL: 79020, spread: -65.27, fair: -12.4, residual: -52.87, zScore: -2.34 }
  ],

  // Backtest Validated Walk-Forward Results
  backtestResults: {
    strategyName: 'Rolling Median Residual Reversion Strategy',
    pair: 'GOLDM / GOLDTEN',
    trainingPeriod: '2025-10-01 to 2026-03-31 (6 months)',
    walkForwardTestPeriod: '2026-04-01 to 2026-10-23 (6.8 months)',
    entryThresholdZ: 2.0,
    exitThresholdZ: 0.5,
    stopLossZ: 3.5,
    maxHoldingDays: 10,
    netPnL: 148650,
    grossPnL: 196200,
    totalTradingCosts: 47550,
    winRate: 68.75, // percentage
    profitFactor: 2.42,
    sharpeRatio: 1.84,
    maxDrawdown: -4.8, // percent
    maxDrawdownINR: -24100,
    averageHoldingPeriodDays: 3.8,
    totalTrades: 32,
    profitableTrades: 22,
    lossTrades: 10,
    benchmarkGoldReturn: 14.2, // Buy & Hold GOLDM return % over same window
    equityCurve: [
      { date: '2026-04-01', portfolioEquity: 500000, benchmarkEquity: 500000, drawdown: 0 },
      { date: '2026-05-01', portfolioEquity: 521400, benchmarkEquity: 512000, drawdown: 0 },
      { date: '2026-06-01', portfolioEquity: 548200, benchmarkEquity: 524000, drawdown: -1.2 },
      { date: '2026-07-01', portfolioEquity: 574600, benchmarkEquity: 541000, drawdown: 0 },
      { date: '2026-08-01', portfolioEquity: 592100, benchmarkEquity: 558000, drawdown: -2.1 },
      { date: '2026-09-01', portfolioEquity: 618500, benchmarkEquity: 562000, drawdown: -0.8 },
      { date: '2026-10-01', portfolioEquity: 636200, benchmarkEquity: 569000, drawdown: 0 },
      { date: '2026-10-23', portfolioEquity: 648650, benchmarkEquity: 571000, drawdown: -0.4 }
    ],
    tradeHistory: [
      {
        id: 'TRD-2026-031',
        entryDate: '2026-10-18',
        exitDate: '2026-10-22',
        direction: 'LONG GOLDM / SHORT GOLDTEN',
        entrySpread: -60.0,
        exitSpread: -18.0,
        grossPnL: 4200,
        costs: 1420,
        netPnL: 2780,
        exitReason: 'Target Reversion (Residual < 0.5σ)',
        holdingDays: 4
      },
      {
        id: 'TRD-2026-030',
        entryDate: '2026-10-06',
        exitDate: '2026-10-11',
        direction: 'LONG GOLDM / SHORT GOLDTEN',
        entrySpread: -58.0,
        exitSpread: -15.0,
        grossPnL: 4300,
        costs: 1420,
        netPnL: 2880,
        exitReason: 'Target Reversion (Residual < 0.5σ)',
        holdingDays: 5
      },
      {
        id: 'TRD-2026-029',
        entryDate: '2026-09-22',
        exitDate: '2026-09-29',
        direction: 'SHORT GOLDM / LONG GOLDTEN',
        entrySpread: 45.0,
        exitSpread: 12.0,
        grossPnL: 3300,
        costs: 1420,
        netPnL: 1880,
        exitReason: 'Target Reversion (Residual < 0.5σ)',
        holdingDays: 7
      },
      {
        id: 'TRD-2026-028',
        entryDate: '2026-09-10',
        exitDate: '2026-09-18',
        direction: 'LONG GOLDM / SHORT GOLDTEN',
        entrySpread: -54.0,
        exitSpread: -72.0,
        grossPnL: -1800,
        costs: 1420,
        netPnL: -3220,
        exitReason: 'Stop Loss Triggered (Z > 3.5σ)',
        holdingDays: 8
      }
    ]
  },

  // Gold-Neutral Performance Attribution
  attribution: {
    totalNetPnL: 148650,
    grossPnL: 196200,
    relativeValueContribution: 182400, // 93.0%
    goldMarketBetaExposure: 8200, // 4.2% residual directional drift
    carryAndExpiryEffect: 5600, // 2.8%
    transactionCosts: -47550,
    betaToMCXGold: 0.04, // Highly gold-neutral
    isNeutralVerified: true,
    waterfallStages: [
      { stage: 'Relative-Value Alpha (Spread Mean Reversion)', value: 182400, type: 'positive' },
      { stage: 'Gold Directional Drift (Beta Exposure)', value: 8200, type: 'positive' },
      { stage: 'Calendar Carry & Expiry Term Structure', value: 5600, type: 'positive' },
      { stage: 'Exchange & Statutory Turnover Taxes', value: -12800, type: 'cost' },
      { stage: 'Brokerage & Clearing Charges', value: -14200, type: 'cost' },
      { stage: 'Observed Bid-Ask Slippage', value: -20550, type: 'cost' },
      { stage: 'Net Realized Return', value: 148650, type: 'result' }
    ]
  },

  // Edge Survival Analysis Pipeline Stages
  edgeSurvival: {
    pair: 'GOLDM / GOLDTEN (Nov-2026 Expiry)',
    stages: [
      {
        step: 1,
        title: 'Raw Settlement Price Spread',
        status: 'PASSED',
        value: '₹ -65.27 / 10g',
        metric: -65.27,
        explanation: 'Observed difference between normalized GOLDM (₹78,729.85) and GOLDTEN (₹78,795.12).'
      },
      {
        step: 2,
        title: 'Model-Estimated Fair Value Spread',
        status: 'PASSED',
        value: '₹ -12.40 / 10g',
        metric: -12.40,
        explanation: '30-day rolling median baseline of the normalized basis spread.'
      },
      {
        step: 3,
        title: 'Model Residual (Gross Theoretical Edge)',
        status: 'PASSED',
        value: '₹ 52.87 / 10g',
        metric: 52.87,
        explanation: 'Gross divergence |Observed - Fair| = ₹52.87 (Robust Z-Score = -2.34σ).'
      },
      {
        step: 4,
        title: 'Estimated Transaction Costs & Taxes',
        status: 'PASSED',
        value: '₹ -14.20 / 10g',
        metric: -14.20,
        explanation: 'MCX transaction charges, CTT (0.01% on sell), Stamp duty, and brokerage for 2 round legs.'
      },
      {
        step: 5,
        title: 'Liquidity & Execution Feasibility',
        status: 'PASSED',
        value: 'Sufficient (Proxy 85.2/100)',
        metric: 85.2,
        explanation: 'Daily volume > 4,000 contracts on both legs; open interest robust across near-month contracts.'
      },
      {
        step: 6,
        title: 'Lifecycle & Tender Period Constraint',
        status: 'PASSED',
        value: '12 Days Remaining',
        metric: 12,
        explanation: 'Well outside 5-day delivery tender window; holding horizon limit is 5 days.'
      },
      {
        step: 7,
        title: 'Net Actionable Edge',
        status: 'ACTIONABLE',
        value: '₹ 38.67 / 10g',
        metric: 38.67,
        explanation: 'Positive net edge survives all cost, liquidity, and lifecycle risk hurdles.'
      }
    ]
  },

  // Active Alerts
  alerts: [
    {
      id: 'ALT-1094',
      timestamp: '2026-10-23T17:15:00+05:30',
      category: 'STATISTICAL_DEVIATION',
      pair: 'GOLDM / GOLDTEN',
      severity: 'ACTIONABLE',
      observedChange: 'Residual reached -2.34σ (₹-52.87/10g)',
      explanation: 'Statistical deviation crossed 2.0σ entry threshold. Net edge of ₹38.67/10g survives transaction frictions.',
      dataDate: '2026-10-23',
      isRead: false
    },
    {
      id: 'ALT-1093',
      timestamp: '2026-10-23T16:45:00+05:30',
      category: 'LIFECYCLE_TENDER_WARNING',
      pair: 'GOLDM / GOLDGUINEA',
      severity: 'WARNING',
      observedChange: 'Expiry maturity mismatch (Nov 05 vs Nov 30)',
      explanation: 'Leg A approaches physical delivery tender window in 7 calendar days. Roll or square off required.',
      dataDate: '2026-10-23',
      isRead: false
    },
    {
      id: 'ALT-1092',
      timestamp: '2026-10-22T17:30:00+05:30',
      category: 'COST_SUPPRESSION',
      pair: 'GOLDTEN / GOLDPETAL',
      severity: 'INFO',
      observedChange: 'Opportunity suppressed: Net Edge Negative',
      explanation: 'SignalGuard suppressed signal. Estimated costs (₹22.40/10g) exceed gross residual (₹9.88/10g).',
      dataDate: '2026-10-22',
      isRead: true
    }
  ],

  // Data Quality Diagnostics
  dataQuality: {
    requestedDate: '2026-10-23',
    returnedDate: '2026-10-23',
    bhavcopyFile: 'MCX_BHAVCOPY_20261023.csv',
    bhavcopyStatus: 'AUTHENTIC_VERIFIED',
    recordsProcessed: 184,
    goldRecordsFiltered: 38,
    missingObservations: 0,
    duplicateRecords: 0,
    priceContinuityChecks: 'ALL_PASSED',
    lastSyncDurationMs: 420,
    normalizationAudit: [
      { symbol: 'GOLDM', rawPrice: 78415.0, quotation: '10g', factor: 1.00402, normalized: 78729.85, status: 'VERIFIED' },
      { symbol: 'GOLDTEN', rawPrice: 78480.0, quotation: '10g', factor: 1.00402, normalized: 78795.12, status: 'VERIFIED' },
      { symbol: 'GOLDGUINEA', rawPrice: 63110.0, quotation: '8g', factor: 1.25000, normalized: 78887.50, status: 'VERIFIED' },
      { symbol: 'GOLDPETAL', rawPrice: 7902.0, quotation: '1g', factor: 10.00000, normalized: 79020.00, status: 'VERIFIED' }
    ]
  }
};
