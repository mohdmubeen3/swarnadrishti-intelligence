import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { LoadingState } from '../components/common/States';

// Public Homepage
import { Home } from '../pages/Home';

// Lazy-loaded analytical workstation pages
const Overview = lazy(() => import('../pages/Overview').then(m => ({ default: m.Overview })));
const OpportunityScanner = lazy(() => import('../pages/OpportunityScanner').then(m => ({ default: m.OpportunityScanner })));
const RelativeValueLab = lazy(() => import('../pages/RelativeValueLab').then(m => ({ default: m.RelativeValueLab })));
const FairValue = lazy(() => import('../pages/FairValue').then(m => ({ default: m.FairValue })));
const LiquidityLifecycle = lazy(() => import('../pages/LiquidityLifecycle').then(m => ({ default: m.LiquidityLifecycle })));
const CostEstimator = lazy(() => import('../pages/CostEstimator').then(m => ({ default: m.CostEstimator })));
const SurvivalSignalGuard = lazy(() => import('../pages/SurvivalSignalGuard').then(m => ({ default: m.SurvivalSignalGuard })));
const Simulator = lazy(() => import('../pages/Simulator').then(m => ({ default: m.Simulator })));
const Backtesting = lazy(() => import('../pages/Backtesting').then(m => ({ default: m.Backtesting })));
const Attribution = lazy(() => import('../pages/Attribution').then(m => ({ default: m.Attribution })));
const EdgeSurvival = lazy(() => import('../pages/EdgeSurvival').then(m => ({ default: m.EdgeSurvival })));
const Alerts = lazy(() => import('../pages/Alerts').then(m => ({ default: m.Alerts })));
const Methodology = lazy(() => import('../pages/Methodology').then(m => ({ default: m.Methodology })));
const Settings = lazy(() => import('../pages/Settings').then(m => ({ default: m.Settings })));

function LazyWrapper({ component: Component }) {
  return (
    <Suspense fallback={<LoadingState message="Loading analytical workstation view..." />}>
      <Component />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  // 1. Root route: Public Landing Page
  {
    path: '/',
    element: <Home />,
  },

  // 2. Workstation routes under /app
  {
    path: '/app',
    element: <AppShell />,
    children: [
      { index: true, element: <LazyWrapper component={Overview} /> },
      { path: 'scanner', element: <LazyWrapper component={OpportunityScanner} /> },
      { path: 'opportunities', element: <Navigate to="/app/scanner" replace /> },
      { path: 'rv-lab', element: <LazyWrapper component={RelativeValueLab} /> },
      { path: 'relative-value', element: <Navigate to="/app/rv-lab" replace /> },
      { path: 'fair-value', element: <LazyWrapper component={FairValue} /> },
      { path: 'liquidity-lifecycle', element: <LazyWrapper component={LiquidityLifecycle} /> },
      { path: 'cost-estimator', element: <LazyWrapper component={CostEstimator} /> },
      { path: 'survival-signalguard', element: <LazyWrapper component={SurvivalSignalGuard} /> },
      { path: 'signals', element: <Navigate to="/app/survival-signalguard" replace /> },
      { path: 'simulator', element: <LazyWrapper component={Simulator} /> },
      { path: 'backtesting', element: <LazyWrapper component={Backtesting} /> },
      { path: 'attribution', element: <LazyWrapper component={Attribution} /> },
      { path: 'edge-survival', element: <LazyWrapper component={EdgeSurvival} /> },
      { path: 'alerts', element: <LazyWrapper component={Alerts} /> },
      { path: 'methodology', element: <LazyWrapper component={Methodology} /> },
      { path: 'settings', element: <LazyWrapper component={Settings} /> },
    ],
  },

  // 3. Graceful backwards-compatible redirects from previous top-level paths
  { path: '/scanner', element: <Navigate to="/app/scanner" replace /> },
  { path: '/rv-lab', element: <Navigate to="/app/rv-lab" replace /> },
  { path: '/fair-value', element: <Navigate to="/app/fair-value" replace /> },
  { path: '/liquidity-lifecycle', element: <Navigate to="/app/liquidity-lifecycle" replace /> },
  { path: '/cost-estimator', element: <Navigate to="/app/cost-estimator" replace /> },
  { path: '/survival-signalguard', element: <Navigate to="/app/survival-signalguard" replace /> },
  { path: '/simulator', element: <Navigate to="/app/simulator" replace /> },
  { path: '/backtesting', element: <Navigate to="/app/backtesting" replace /> },
  { path: '/attribution', element: <Navigate to="/app/attribution" replace /> },
  { path: '/edge-survival', element: <Navigate to="/app/edge-survival" replace /> },
  { path: '/alerts', element: <Navigate to="/app/alerts" replace /> },
  { path: '/methodology', element: <Navigate to="/app/methodology" replace /> },
  { path: '/settings', element: <Navigate to="/app/settings" replace /> },

  // Catch-all
  { path: '*', element: <Navigate to="/" replace /> },
]);
