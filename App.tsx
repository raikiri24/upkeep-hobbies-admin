import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Inventory from './components/Inventory';
import Dashboard from './components/Dashboard';
import Newsletter from './components/Newsletter';
import Users from './components/Users';
import Tournaments from './components/Tournaments';
import PosTerminal from './components/PosTerminal';
import SalesManagement from './components/SalesManagement';
import Login from './components/Login';
import NotFound from './components/NotFound';
import { ProtectedRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';
import { useAuth } from './contexts/AuthContext';

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login onLogin={() => {}} />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={
          <ProtectedRoute requiredPermission="dashboard.view">
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/inventory" element={
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