
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardNavbar from '@/components/DashboardNavbar';
import Footer from '@/components/Footer';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  requiresAuth?: boolean;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ 
  children, 
  requiresAuth = true 
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect if auth is required but user is not authenticated
  if (!isLoading && requiresAuth && !isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardNavbar />
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AuthenticatedLayout;
