
import React from 'react';
import { Route, Routes } from 'react-router-dom';

// Public Pages
import Index from '@/pages/Index';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Features from '@/pages/Features';
import Pricing from '@/pages/Pricing';
import Blog from '@/pages/Blog';
import Careers from '@/pages/Careers';
import Integrations from '@/pages/Integrations';
import Security from '@/pages/Security';
import Tutorials from '@/pages/Tutorials';
import Cookies from '@/pages/Cookies';
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';
import Compliance from '@/pages/Compliance';
import NotFound from '@/pages/NotFound';

// Authentication
import Auth from '@/pages/Auth';
import Connect from '@/pages/Connect';

// User Dashboard
import Dashboard from '@/pages/Dashboard';
import DashboardSettings from '@/pages/DashboardSettings';
import DashboardApiKeys from '@/pages/DashboardApiKeys';
import BlindShipping from '@/pages/BlindShipping';
import MyShipments from '@/pages/MyShipments';

// Developer
import DeveloperPortal from '@/pages/DeveloperPortal';
import ApiTesting from '@/pages/ApiTesting';
import DeveloperAnalytics from '@/pages/DeveloperAnalytics';
import ApiMonitoring from '@/pages/ApiMonitoring';
import DeveloperSandbox from '@/pages/DeveloperSandbox';
import DeveloperTodoPage from '@/pages/DeveloperTodoPage';
import DeveloperPortalManager from '@/pages/DeveloperPortalManager';

// Admin
import AdminPage from '@/pages/AdminPage';
import AdminRolesPage from '@/pages/AdminRolesPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/cookies" element={<Cookies />} />
      <Route path="/features" element={<Features />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/careers" element={<Careers />} />
      <Route path="/integrations" element={<Integrations />} />
      <Route path="/security" element={<Security />} />
      <Route path="/tutorials" element={<Tutorials />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/compliance" element={<Compliance />} />
      
      {/* Authentication */}
      <Route path="/auth" element={<Auth />} />
      <Route path="/connect" element={<Connect />} />
      
      {/* User Dashboard */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/settings" element={<DashboardSettings />} />
      <Route path="/dashboard/api-keys" element={<DashboardApiKeys />} />
      <Route path="/blind-shipping" element={<BlindShipping />} />
      <Route path="/my-shipments" element={<MyShipments />} />
      
      {/* Developer Routes */}
      <Route path="/developer" element={<DeveloperPortal />} />
      <Route path="/developer/testing" element={<ApiTesting />} />
      <Route path="/developer/analytics" element={<DeveloperAnalytics />} />
      <Route path="/developer/monitoring" element={<ApiMonitoring />} />
      <Route path="/developer/sandbox" element={<DeveloperSandbox />} />
      <Route path="/developer/todo" element={<DeveloperTodoPage />} />
      <Route path="/developer/apps" element={<DeveloperPortalManager />} />
      <Route path="/developer/apps/:appId" element={<DeveloperPortalManager />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/roles" element={<AdminRolesPage />} />
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
