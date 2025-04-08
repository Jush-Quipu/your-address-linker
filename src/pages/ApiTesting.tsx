
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { HomeIcon, CodeIcon, Beaker, Bug } from 'lucide-react';
import ApiTestingEnvironment from '@/components/ApiTestingEnvironment';
import DeveloperSidebar from '@/components/DeveloperSidebar';
import AuthenticatedLayout from '@/components/layouts/AuthenticatedLayout';

const ApiTesting: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  return (
    <AuthenticatedLayout>
      <div className="flex justify-between items-center mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">
                <HomeIcon className="h-4 w-4 mr-1" />
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/developer">
                <CodeIcon className="h-4 w-4 mr-1" />
                Developer
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/developer/testing">
                <Beaker className="h-4 w-4 mr-1" />
                API Testing
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="flex items-center gap-2">
          {isDevelopment && (
            <Badge variant="outline" className="bg-amber-100 text-amber-800">
              Development Mode
            </Badge>
          )}
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            <Bug className="h-3 w-3 mr-1" />
            Sandbox
          </Badge>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 lg:w-72">
          <DeveloperSidebar />
        </div>
        <div className="flex-1">
          <ApiTestingEnvironment />
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default ApiTesting;
