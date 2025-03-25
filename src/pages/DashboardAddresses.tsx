
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';

const DashboardAddresses: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<any[]>([]);

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated && !loading) {
      toast.error('Authentication required', {
        description: 'Please sign in to access this page',
      });
      navigate('/auth');
    }
  }, [isAuthenticated, navigate, loading]);

  useEffect(() => {
    const fetchAddresses = async () => {
      // Here you would fetch addresses from your API
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Mock data for now
        setAddresses([]);
      } catch (error) {
        console.error('Error fetching addresses:', error);
        toast.error('Failed to load addresses', {
          description: 'Please try again later',
        });
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchAddresses();
    }
  }, [isAuthenticated]);

  const handleAddAddress = () => {
    toast.info('Add address feature coming soon!');
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold">Manage Addresses</h1>
            <Button onClick={handleAddAddress}>
              <Plus className="mr-2 h-4 w-4" /> Add Address
            </Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading addresses...</span>
            </div>
          ) : addresses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addresses.map((address) => (
                <Card key={address.id}>
                  <CardHeader>
                    <CardTitle>{address.name || 'Address'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{address.street_address}</p>
                    <p>{address.city}, {address.state} {address.postal_code}</p>
                    <p>{address.country}</p>
                    <div className="mt-4 flex space-x-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">Verify</Button>
                      <Button variant="destructive" size="sm">Delete</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground mb-4">You haven't added any addresses yet</p>
                <Button onClick={handleAddAddress}>
                  <Plus className="mr-2 h-4 w-4" /> Add Your First Address
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardAddresses;
