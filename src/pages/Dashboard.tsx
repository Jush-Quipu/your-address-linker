
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MapPin, Package, Key, Settings, Shield } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Address Management Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-primary" />
                  Address Management
                </CardTitle>
                <CardDescription>Manage your verified addresses</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Add, verify, and manage your physical addresses.
                </p>
                <Button 
                  variant="default" 
                  className="w-full"
                  onClick={() => navigate('/dashboard/addresses')}
                >
                  Manage Addresses
                </Button>
              </CardContent>
            </Card>
            
            {/* Shipment Tracking Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2 text-primary" />
                  Shipment Tracking
                </CardTitle>
                <CardDescription>Track your shipments</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  View and track all your blind shipments.
                </p>
                <Button 
                  variant="default" 
                  className="w-full"
                  onClick={() => navigate('/my-shipments')}
                >
                  View Shipments
                </Button>
              </CardContent>
            </Card>
            
            {/* API Keys Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="h-5 w-5 mr-2 text-primary" />
                  API Keys
                </CardTitle>
                <CardDescription>Manage your API keys</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate and manage API keys for integration.
                </p>
                <Button 
                  variant="default" 
                  className="w-full"
                  onClick={() => navigate('/dashboard/api-keys')}
                >
                  Manage API Keys
                </Button>
              </CardContent>
            </Card>
            
            {/* Settings Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-primary" />
                  Account Settings
                </CardTitle>
                <CardDescription>Manage your account</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Update your profile and account settings.
                </p>
                <Button 
                  variant="default" 
                  className="w-full"
                  onClick={() => navigate('/dashboard/settings')}
                >
                  Account Settings
                </Button>
              </CardContent>
            </Card>
            
            {/* Developer Portal Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-primary" />
                  Developer Portal
                </CardTitle>
                <CardDescription>Access developer tools</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Access the developer portal for API docs and tools.
                </p>
                <Button 
                  variant="default" 
                  className="w-full"
                  onClick={() => navigate('/developer')}
                >
                  Developer Portal
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
