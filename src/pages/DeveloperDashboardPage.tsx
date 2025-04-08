
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { HomeIcon, Code } from 'lucide-react';
import DeveloperDashboard from '@/components/DeveloperDashboard';
import { useRole } from '@/context/RoleContext';
import { Button } from '@/components/ui/button';
import AuthenticatedLayout from '@/components/layouts/AuthenticatedLayout';

const DeveloperDashboardPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isDeveloper } = useRole();

  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  if (!isLoading && !isDeveloper && isAuthenticated) {
    return (
      <AuthenticatedLayout>
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Developer Access Required</h2>
          <p className="mb-6 text-muted-foreground">
            You need developer access to view this page.
          </p>
          <Button onClick={() => window.location.href = '/dashboard'}>
            Return to Dashboard
          </Button>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">
              <HomeIcon className="h-4 w-4 mr-1" />
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/developer">
              <Code className="h-4 w-4 mr-1" />
              Developer
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <DeveloperDashboard />
    </AuthenticatedLayout>
  );
};

export default DeveloperDashboardPage;
