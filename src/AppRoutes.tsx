
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
import Contact from '@/pages/Contact';
import IntegrationsPage from '@/pages/Integrations';
import SecurityPage from '@/pages/Security';
import AboutPage from '@/pages/About';
import BlogPage from '@/pages/Blog';
import Pricing from '@/pages/Pricing';

// Developer routes
import DeveloperDashboardPage from '@/pages/DeveloperDashboardPage';
import DeveloperDocs from '@/pages/DeveloperDocs';
import DeveloperPortalManager from '@/pages/DeveloperPortalManager';
import ApiTesting from '@/pages/ApiTesting';
import DeveloperAnalytics from '@/pages/DeveloperAnalytics';
import ApiMonitoring from '@/pages/ApiMonitoring';
import DeveloperTodoPage from '@/pages/DeveloperTodoPage';

// Admin routes
import AdminRolesPage from '@/pages/AdminRolesPage';
import AdminMonitoringPage from '@/pages/AdminMonitoringPage';
import AdminAppsPage from '@/pages/AdminAppsPage';
import AdminSettingsPage from '@/pages/AdminSettingsPage';
import AdminLogsPage from '@/pages/AdminLogsPage';

const AppRoutes: React.FC = () => {
  const { isLoading, error } = useSecureAddress();
  
  // Add error handling for context initialization
  if (error) {
    console.error("SecureAddress context error:", error);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
        <p className="text-muted-foreground">There was a problem loading the application</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-primary text-white rounded"
        >
          Refresh page
        </button>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <Routes>
      {/* Public Routes - Make Index the root route */}
      <Route path="/" element={<Index />} />
      <Route path="/home" element={<Index />} />
      <Route path="/features" element={<Features />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/integrations" element={<IntegrationsPage />} />
      <Route path="/security" element={<SecurityPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/contact" element={<Contact />} />
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
      <Route path="/admin/roles" element={<AdminRolesPage />} />
      <Route path="/admin/monitoring" element={<AdminMonitoringPage />} />
      <Route path="/admin/apps" element={<AdminAppsPage />} />
      <Route path="/admin/settings" element={<AdminSettingsPage />} />
      <Route path="/admin/logs" element={<AdminLogsPage />} />
      
      {/* 404 Page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
