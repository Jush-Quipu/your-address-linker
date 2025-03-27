import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Auth from '@/pages/Auth';
import Connect from '@/pages/Connect';
import { Navigate } from 'react-router-dom';
import DeveloperPortal from '@/pages/DeveloperPortal';
import DeveloperAnalytics from '@/pages/DeveloperAnalytics';
import DeveloperSandbox from '@/pages/DeveloperSandbox';
import DeveloperTodoPage from '@/pages/DeveloperTodoPage';
import AdminPage from '@/pages/AdminPage';
import AdminRolesPage from '@/pages/AdminRolesPage';
import DeveloperPortalManager from '@/pages/DeveloperPortalManager';
import BlindShipping from '@/pages/BlindShipping';
import DashboardApiKeys from '@/pages/DashboardApiKeys';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      
      {/* User Routes */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/connect" element={<Connect />} />
      
      {/* Address Book Routes */}
      <Route path="/dashboard/addresses" element={<Navigate to="/dashboard" />} />
      <Route path="/address/:id" element={<Navigate to="/dashboard" />} />
      <Route path="/address/new" element={<Navigate to="/dashboard" />} />
      <Route path="/address/edit/:id" element={<Navigate to="/dashboard" />} />
      
      {/* Verification Routes */}
      <Route path="/verify-address" element={<Navigate to="/dashboard" />} />
      
      {/* Blind Shipping Route */}
      <Route path="/blind-shipping" element={<BlindShipping />} />
      
      {/* API Keys Route */}
      <Route path="/dashboard/api-keys" element={<DashboardApiKeys />} />
      
      {/* Developer Routes */}
      <Route path="/developer">
        <Route index element={<DeveloperPortal />} />
        <Route path="apps" element={<DeveloperPortalManager />} />
        <Route path="apps/:appId" element={<DeveloperPortalManager />} />
        <Route path="analytics" element={<DeveloperAnalytics />} />
        <Route path="sandbox" element={<DeveloperSandbox />} />
        <Route path="todo" element={<DeveloperTodoPage />} />
        <Route path="admin">
          <Route index element={<AdminPage />} />
          <Route path="roles" element={<AdminRolesPage />} />
        </Route>
      </Route>
      
      {/* Catch-all route */}
      <Route path="*" element={<div>Page not found</div>} />
    </Routes>
  );
};

export default AppRoutes;
