
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { RoleProvider } from '@/context/RoleContext';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/context/ThemeContext';

// Pages
import Home from '@/pages/Home';
import Features from '@/pages/Features';
import About from '@/pages/About';
import Dashboard from '@/pages/Dashboard';
import AddressManagement from '@/pages/AddressManagement';
import AddressVerification from '@/pages/AddressVerification';
import ShippingAddresses from '@/pages/ShippingAddresses';
import Developers from '@/pages/Developers';
import Contact from '@/pages/Contact';
import NotFound from '@/pages/NotFound';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';
import Account from '@/pages/Account';
import Billing from '@/pages/Billing';
import Security from '@/pages/Security';
import Preferences from '@/pages/Preferences';
import Auth from '@/pages/Auth';
import BlindShipping from '@/pages/BlindShipping';
import Checkout from '@/pages/Checkout';
import Transactions from '@/pages/Transactions';
import ApiDocumentation from '@/pages/ApiDocumentation';
import NotificationsPage from '@/pages/NotificationsPage';
import TodoPage from '@/pages/TodoPage';
import DeveloperDocsHub from '@/pages/DeveloperDocsHub';
import ApiTesting from '@/pages/ApiTesting';
import DeveloperAnalytics from '@/pages/DeveloperAnalytics';
import ApiMonitoring from '@/pages/ApiMonitoring';

function App() {
  useEffect(() => {
    // Any global initialization code here
    console.log('Application initialized');
  }, []);

  return (
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <RoleProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/features" element={<Features />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/addresses" element={<AddressManagement />} />
              <Route path="/dashboard/verification" element={<AddressVerification />} />
              <Route path="/dashboard/shipping" element={<ShippingAddresses />} />
              <Route path="/dashboard/blind-shipping" element={<BlindShipping />} />
              <Route path="/dashboard/checkout" element={<Checkout />} />
              <Route path="/dashboard/transactions" element={<Transactions />} />
              <Route path="/dashboard/notifications" element={<NotificationsPage />} />
              <Route path="/account" element={<Account />} />
              <Route path="/account/billing" element={<Billing />} />
              <Route path="/account/security" element={<Security />} />
              <Route path="/account/preferences" element={<Preferences />} />
              <Route path="/developer" element={<Developers />} />
              <Route path="/docs" element={<ApiDocumentation />} />
              <Route path="/developer/docs" element={<DeveloperDocsHub />} />
              <Route path="/developer/testing" element={<ApiTesting />} />
              <Route path="/developer/analytics" element={<DeveloperAnalytics />} />
              <Route path="/developer/monitoring" element={<ApiMonitoring />} />
              <Route path="/developer/todo" element={<TodoPage />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster position="top-right" />
        </RoleProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
