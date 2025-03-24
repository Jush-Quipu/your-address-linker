
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import DashboardComponent from '@/components/Dashboard';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { getPhysicalAddresses, getWalletAddresses, getAddressPermissions } from '@/services/addressService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    physicalAddresses: [],
    walletAddresses: [],
    permissions: []
  });

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated && !loading) {
      toast.error('Authentication required', {
        description: 'Please sign in to access the dashboard',
      });
      navigate('/auth');
    }
  }, [isAuthenticated, navigate, loading]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated) return;
      
      setLoading(true);
      try {
        // Fetch all required data in parallel
        const [addresses, wallets, permissions] = await Promise.all([
          getPhysicalAddresses(),
          getWalletAddresses(),
          getAddressPermissions()
        ]);
        
        setDashboardData({
          physicalAddresses: addresses,
          walletAddresses: wallets,
          permissions: permissions
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data', {
          description: 'Please try again later',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated]);

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
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading your data...</span>
            </div>
          ) : (
            <DashboardComponent 
              physicalAddresses={dashboardData.physicalAddresses}
              walletAddresses={dashboardData.walletAddresses}
              permissions={dashboardData.permissions}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;
