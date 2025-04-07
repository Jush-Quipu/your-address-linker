
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import WalletConnectWrapper from '@/components/WalletConnectWrapper';

const Connect: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
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
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">Connect Your Wallet</h1>
            <p className="text-muted-foreground mt-2">
              Link your blockchain wallet to your SecureAddress Bridge account
            </p>
          </div>
          
          <div className="max-w-md mx-auto">
            <WalletConnectWrapper />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Connect;
