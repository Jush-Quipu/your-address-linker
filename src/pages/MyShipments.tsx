
import React, { useEffect, useState } from 'react';
import DashboardNavbar from '@/components/DashboardNavbar';
import MyShipments from '@/components/MyShipments';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { getUserShipments, Shipment } from '@/services/shipmentService';

const MyShipmentsPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [shipmentsLoading, setShipmentsLoading] = useState(true);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  
  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/auth" />;
  }
  
  useEffect(() => {
    fetchShipments();
  }, [isAuthenticated]);
  
  const fetchShipments = async () => {
    if (!isAuthenticated) return;
    
    setShipmentsLoading(true);
    try {
      const data = await getUserShipments();
      setShipments(data);
    } catch (error) {
      console.error('Error fetching shipments:', error);
      toast.error('Failed to load shipments', {
        description: 'Please try again later',
      });
    } finally {
      setShipmentsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen">
      <DashboardNavbar />
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">My Shipments</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Track and manage all your packages from different carriers in one place.
            </p>
          </div>
          
          {shipmentsLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading shipments...</span>
            </div>
          ) : (
            <MyShipments 
              shipments={shipments}
              onRefresh={fetchShipments}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyShipmentsPage;
