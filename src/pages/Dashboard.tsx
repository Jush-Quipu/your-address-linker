
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import AuthenticatedLayout from '@/components/layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';

const Dashboard: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <AuthenticatedLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome to Your Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage your addresses, shipments, and application settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Dashboard cards */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-medium mb-4">Verified Addresses</h2>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Manage your verified physical addresses and control who has access to them.
            </p>
            <Button onClick={() => navigate('/dashboard/addresses')}>
              Manage Addresses
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-medium mb-4">Shipments</h2>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Track your packages and manage blind shipping configurations.
            </p>
            <Button onClick={() => navigate('/my-shipments')}>
              View Shipments
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-medium mb-4">Connected Wallets</h2>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Link your blockchain wallets to your verified addresses securely.
            </p>
            <Button onClick={() => navigate('/connect')}>
              Manage Wallets
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-medium mb-4">Access Permissions</h2>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Control which applications can access your address information.
            </p>
            <Button onClick={() => navigate('/dashboard/permissions')}>
              Manage Permissions
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-medium mb-4">API Keys</h2>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Generate and manage API keys for integrating with our services.
            </p>
            <Button onClick={() => navigate('/dashboard/api-keys')}>
              Manage API Keys
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-medium mb-4">Settings</h2>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Configure your account preferences and notification settings.
            </p>
            <Button onClick={() => navigate('/dashboard/settings')}>
              Edit Settings
            </Button>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Dashboard;
