
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
              {/* Main pages */}
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/connect" element={<Connect />} />
              
              {/* Dashboard Routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/settings" element={<DashboardSettings />} />
              <Route path="/dashboard/api-keys" element={<DashboardApiKeys />} />
              <Route path="/blind-shipping" element={<BlindShipping />} />
              
              {/* Developer Routes */}
              <Route path="/developer" element={<DeveloperPortal />} />
              <Route path="/developer/testing" element={<ApiTesting />} />
              <Route path="/developer/analytics" element={<DeveloperAnalytics />} />
              <Route path="/developer/monitoring" element={<ApiMonitoring />} />
              
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
