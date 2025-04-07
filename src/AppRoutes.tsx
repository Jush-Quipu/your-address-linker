
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from '@/pages/Landing';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import Dashboard from '@/pages/Dashboard';
import Features from '@/pages/Features';
import Auth from '@/pages/Auth';
import { useSecureAddress } from '@/sdk/secureaddress-context';
import MyShipmentsPage from '@/pages/MyShipments';
import BlindShipping from '@/pages/BlindShipping';
import DashboardSettings from '@/pages/DashboardSettings';
import DashboardApiKeys from '@/pages/DashboardApiKeys';
import Connect from '@/pages/Connect';
import DeveloperPortal from '@/pages/DeveloperPortal';
import AdminPage from '@/pages/AdminPage';
import DashboardAddresses from '@/pages/DashboardAddresses';
import Permissions from '@/pages/Permissions';

// Developer routes
import DeveloperDashboardPage from '@/pages/DeveloperDashboardPage';
import DeveloperDocs from '@/pages/DeveloperDocs';
import DeveloperPortalManager from '@/pages/DeveloperPortalManager';
import ApiTesting from '@/pages/ApiTesting';
import DeveloperAnalytics from '@/pages/DeveloperAnalytics';
import ApiMonitoring from '@/pages/ApiMonitoring';
import DeveloperTodoPage from '@/pages/DeveloperTodoPage';

const AppRoutes: React.FC = () => {
  const { isLoading } = useSecureAddress();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/home" element={<Index />} />
      <Route path="/features" element={<Features />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/auth/callback" element={<Auth />} />
      
      {/* Dashboard Routes */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/addresses" element={<DashboardAddresses />} />
      <Route path="/dashboard/settings" element={<DashboardSettings />} />
      <Route path="/dashboard/api-keys" element={<DashboardApiKeys />} />
      <Route path="/dashboard/permissions" element={<Permissions />} />
      
      {/* Shipping Related Routes */}
      <Route path="/my-shipments" element={<MyShipmentsPage />} />
      <Route path="/blind-shipping" element={<BlindShipping />} />
      
      {/* Wallet Connection */}
      <Route path="/connect" element={<Connect />} />
      
      {/* Developer Portal Routes */}
      <Route path="/developer" element={<DeveloperDashboardPage />} />
      <Route path="/developer/docs" element={<DeveloperDocs />} />
      <Route path="/developer/portal" element={<DeveloperPortalManager />} />
      <Route path="/developer/testing" element={<ApiTesting />} />
      <Route path="/developer/analytics" element={<DeveloperAnalytics />} />
      <Route path="/developer/monitoring" element={<ApiMonitoring />} />
      <Route path="/developer/todo" element={<DeveloperTodoPage />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/*" element={<AdminPage />} />
      
      {/* 404 Page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
