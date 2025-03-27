import React from 'react';
import { Route, Routes } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';
import DashboardPage from '@/pages/DashboardPage';
import AuthPage from '@/pages/AuthPage';
import ProfilePage from '@/pages/ProfilePage';
import AddressBookPage from '@/pages/AddressBookPage';
import AddressDetailsPage from '@/pages/AddressDetailsPage';
import NewAddressPage from '@/pages/NewAddressPage';
import EditAddressPage from '@/pages/EditAddressPage';
import VerifyAddressPage from '@/pages/VerifyAddressPage';
import BlindShippingPage from '@/pages/BlindShippingPage';
import ApiKeysPage from '@/pages/ApiKeysPage';
import DeveloperDashboard from '@/components/DeveloperDashboard';
import DeveloperPortal from '@/pages/DeveloperPortal';
import DeveloperAnalytics from '@/pages/DeveloperAnalytics';
import DeveloperSandbox from '@/pages/DeveloperSandbox';
import TodoPage from '@/pages/TodoPage';
import AdminPage from '@/pages/AdminPage';
import AdminRolesPage from '@/pages/AdminRolesPage';
import DeveloperPortalManager from '@/pages/DeveloperPortalManager';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      
      {/* User Routes */}
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      
      {/* Address Book Routes */}
      <Route path="/address-book" element={<AddressBookPage />} />
      <Route path="/address/:id" element={<AddressDetailsPage />} />
      <Route path="/address/new" element={<NewAddressPage />} />
      <Route path="/address/edit/:id" element={<EditAddressPage />} />
      
      {/* Verification Routes */}
      <Route path="/verify-address" element={<VerifyAddressPage />} />
      
      {/* Blind Shipping Route */}
      <Route path="/blind-shipping" element={<BlindShippingPage />} />
      
      {/* API Keys Route */}
      <Route path="/dashboard/api-keys" element={<ApiKeysPage />} />
      
      {/* Developer Routes */}
      <Route path="/developer">
        <Route index element={<DeveloperPortal />} />
        <Route path="apps" element={<DeveloperPortalManager />} />
        <Route path="apps/:appId" element={<DeveloperPortalManager />} />
        <Route path="analytics" element={<DeveloperAnalytics />} />
        <Route path="sandbox" element={<DeveloperSandbox />} />
        <Route path="todo" element={<TodoPage />} />
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
