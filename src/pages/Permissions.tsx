
import React from 'react';
import Navbar from '@/components/Navbar';
import PermissionManager from '@/components/PermissionManager';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

const PermissionsPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/auth" />;
  }
  
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Manage Address Access</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Control which applications can access your verified address information.
            </p>
          </div>
          
          <PermissionManager />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PermissionsPage;
