import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/context/RoleContext';
import { Navigate } from 'react-router-dom';
import AuthenticatedLayout from '@/components/layouts/AuthenticatedLayout';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { HomeIcon, Shield, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const AdminMonitoringPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isAdmin } = useRole();

  // Redirect if not authenticated or not admin
  if (!isLoading && (!isAuthenticated || !isAdmin)) {
    return <Navigate to="/" />;
  }

  return (
    <AuthenticatedLayout>
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink to="/">
              <HomeIcon className="h-4 w-4 mr-1" />
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink to="/admin">
              <Shield className="h-4 w-4 mr-1" />
              Admin
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink to="/admin/monitoring">
              <Activity className="h-4 w-4 mr-1" />
              System Monitoring
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8 space-y-4">
        <h1 className="text-2xl font-bold flex items-center">
          <Activity className="mr-2 h-6 w-6 text-primary" />
          System Monitoring
        </h1>
        <p className="text-muted-foreground">
          Monitor platform performance and usage metrics
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>System Monitoring Dashboard</CardTitle>
          <CardDescription>
            Monitor system performance, usage metrics, and error logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-muted-foreground">
            System monitoring functionality will be implemented in a future update.
          </p>
        </CardContent>
      </Card>
    </AuthenticatedLayout>
  );
};

export default AdminMonitoringPage;
