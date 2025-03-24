
import React from 'react';
import Navbar from '@/components/Navbar';
import Dashboard from '@/components/Dashboard';
import Footer from '@/components/Footer';

const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Your Dashboard</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Manage your wallet and home address connections, privacy settings, and app permissions.
            </p>
          </div>
          
          <Dashboard />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;
