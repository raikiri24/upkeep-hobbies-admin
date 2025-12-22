import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';
import { useAuth } from './contexts/AuthContext';

// Lazy load components for code splitting
const Inventory = React.lazy(() => import('./components/Inventory'));
const InventoryOptimized = React.lazy(() => import('./components/InventoryOptimized'));
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const Newsletter = React.lazy(() => import('./components/Newsletter'));
const Users = React.lazy(() => import('./components/Users'));
const Tournaments = React.lazy(() => import('./components/Tournaments'));
const PosTerminal = React.lazy(() => import('./components/PosTerminal'));
const SalesManagement = React.lazy(() => import('./components/SalesManagement'));
const Login = React.lazy(() => import('./components/Login'));
const NotFound = React.lazy(() => import('./components/NotFound'));

// Loading component for lazy routes
const RouteLoader: React.FC = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
  </div>
);

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<RouteLoader />}>
        <Login onLogin={() => {}} />
      </Suspense>
    );
  }

  return (
    <Layout>
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path="/dashboard" element={
            <ProtectedRoute requiredPermission="dashboard.view">
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/inventory" element={
            <ProtectedRoute requiredPermission="inventory.view">
              <InventoryOptimized />
            </ProtectedRoute>
          } />
          <Route path="/inventory-old" element={
            <ProtectedRoute requiredPermission="inventory.view">
              <Inventory />
            </ProtectedRoute>
          } />
          <Route path="/newsletter" element={
            <ProtectedRoute requiredPermission="newsletter.view">
              <Newsletter />
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute requiredPermission="users.view">
              <Users />
            </ProtectedRoute>
          } />
          <Route path="/tournaments" element={
            <ProtectedRoute requiredPermission="tournaments.view">
              <Tournaments />
            </ProtectedRoute>
          } />
          <Route path="/pos" element={
            <ProtectedRoute requiredPermission="pos.view">
              <PosTerminal />
            </ProtectedRoute>
          } />
          <Route path="/sales" element={
            <ProtectedRoute requiredPermission="sales.view">
              <SalesManagement />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App;