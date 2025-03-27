
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { RoleProvider } from '@/context/RoleContext';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/context/ThemeContext';

// Pages that exist
import About from '@/pages/About';
import Auth from '@/pages/Auth';
import Contact from '@/pages/Contact';
import NotFound from '@/pages/NotFound';
import Cookies from '@/pages/Cookies';
import ApiTesting from '@/pages/ApiTesting';
import DeveloperAnalytics from '@/pages/DeveloperAnalytics';
import ApiMonitoring from '@/pages/ApiMonitoring';
import BlindShipping from '@/pages/BlindShipping';
import DashboardApiKeys from '@/pages/DashboardApiKeys';
import Dashboard from '@/pages/Dashboard';
import DashboardSettings from '@/pages/DashboardSettings';
import DeveloperPortal from '@/pages/DeveloperPortal';
import Connect from '@/pages/Connect';
import Index from '@/pages/Index';

// Newly imported pages
import Features from '@/pages/Features';
import Blog from '@/pages/Blog';
import Careers from '@/pages/Careers';
import Pricing from '@/pages/Pricing';
import Integrations from '@/pages/Integrations';
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';
import Compliance from '@/pages/Compliance';
import Security from '@/pages/Security';
import Tutorials from '@/pages/Tutorials';
import MyShipments from '@/pages/MyShipments';

// Admin and Developer pages
import AdminPage from '@/pages/AdminPage';
import AdminRolesPage from '@/pages/AdminRolesPage';
import DeveloperSandbox from '@/pages/DeveloperSandbox';
import DeveloperTodoPage from '@/pages/DeveloperTodoPage';
import DeveloperPortalManager from '@/pages/DeveloperPortalManager';

function App() {
  useEffect(() => {
    // Any global initialization code here
    console.log('Application initialized');
  }, []);

  return (
    <ThemeProvider defaultTheme="light">
      <Router>
        <AuthProvider>
          <RoleProvider>
            <Routes>
              {/* Public Pages */}
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/features" element={<Features />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/security" element={<Security />} />
              <Route path="/tutorials" element={<Tutorials />} />
              
              {/* Legal Pages */}
              <Route path="/cookies" element={<Cookies />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/compliance" element={<Compliance />} />
              
              {/* Authentication */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/connect" element={<Connect />} />
              
              {/* User Dashboard Routes */}
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
            <Toaster position="top-right" />
          </RoleProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
