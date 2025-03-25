
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '@/pages/Index'; // Corrected import path
import About from '@/pages/About';
import DeveloperDocs from '@/pages/DeveloperDocs';
import ApiTesting from '@/pages/ApiTesting';
import { AuthProvider } from '@/context/AuthContext'; // Import AuthProvider
import Auth from '@/pages/Auth'; // Import Auth page
import Connect from '@/pages/Connect'; // Import Connect page
import Dashboard from '@/pages/Dashboard'; // Import Dashboard page
import Features from '@/pages/Features'; // Import Features page
import Contact from '@/pages/Contact'; // Import Contact page
import Careers from '@/pages/Careers'; // Import Careers page
import Security from '@/pages/Security'; // Import Security page
import Pricing from '@/pages/Pricing'; // Import Pricing page
import Integrations from '@/pages/Integrations'; // Import Integrations page
import Privacy from '@/pages/Privacy'; // Import Privacy page
import Terms from '@/pages/Terms'; // Import Terms page
import Compliance from '@/pages/Compliance'; // Import Compliance page
import Cookies from '@/pages/Cookies'; // Import Cookies page
import Tutorials from '@/pages/Tutorials'; // Import Tutorials page
import PermissionsPage from '@/pages/Permissions'; // Import Permissions page
import BlindShippingPage from '@/pages/BlindShipping'; // Import BlindShipping page
import AuthorizePage from '@/pages/AuthorizePage'; // Import Authorization page
import DashboardAddresses from '@/pages/DashboardAddresses'; // Import Address management page
import DashboardApiKeys from '@/pages/DashboardApiKeys'; // Import API Keys page
import DashboardSettings from '@/pages/DashboardSettings'; // Import Settings page

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/docs" element={<DeveloperDocs />} />
          <Route path="/api-testing" element={<ApiTesting />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/connect" element={<Connect />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/addresses" element={<DashboardAddresses />} />
          <Route path="/dashboard/api-keys" element={<DashboardApiKeys />} />
          <Route path="/dashboard/settings" element={<DashboardSettings />} />
          <Route path="/features" element={<Features />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/security" element={<Security />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/compliance" element={<Compliance />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/tutorials" element={<Tutorials />} />
          <Route path="/permissions" element={<PermissionsPage />} />
          <Route path="/blind-shipping" element={<BlindShippingPage />} />
          <Route path="/authorize" element={<AuthorizePage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
