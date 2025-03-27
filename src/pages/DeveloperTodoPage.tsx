
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { HomeIcon, ClipboardList } from 'lucide-react';
import TodoList from '@/components/todo/TodoList';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a new query client instance
const queryClient = new QueryClient();

const DeveloperTodoPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
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
                <BreadcrumbLink href="/developer-dashboard">Developer</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/developer/todo">
                  <ClipboardList className="h-4 w-4 mr-1" />
                  Implementation Todo
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <QueryClientProvider client={queryClient}>
            <TodoList />
          </QueryClientProvider>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DeveloperTodoPage;
