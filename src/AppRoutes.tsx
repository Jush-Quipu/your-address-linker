
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from '@/pages/Landing';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import Dashboard from '@/pages/Dashboard';
import Features from '@/pages/Features';
import Auth from '@/pages/Auth';
import { useSecureAddress } from '@/sdk/secureaddress-context';

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
      <Route path="/" element={<Landing />} />
      <Route path="/home" element={<Index />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/features" element={<Features />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/auth/callback" element={<Auth />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
