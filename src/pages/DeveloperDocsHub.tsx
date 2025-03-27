
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { HomeIcon, CodeIcon, Book, Bug } from 'lucide-react';
import DeveloperDocsHubComponent from '@/components/DeveloperDocsHub';
import DeveloperSidebar from '@/components/DeveloperSidebar';

const DeveloperDocsHub: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
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
                  <BreadcrumbLink href="/developer/docs">
                    <Book className="h-4 w-4 mr-1" />
                    Documentation
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
              <DeveloperDocsHubComponent />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DeveloperDocsHub;
