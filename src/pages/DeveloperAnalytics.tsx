import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { HomeIcon, DatabaseIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ApiAnalyticsDashboard from '@/components/ApiAnalyticsDashboard';

const DeveloperAnalytics: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  const [timeRange, setTimeRange] = useState('7d');
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  useEffect(() => {
    const fetchApplications = async () => {
      if (!isAuthenticated || !user) return;
      
      try {
        const { data, error } = await supabase
          .from('developer_apps')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setApplications(data || []);
        
        // If we have an app ID from location state, use that
        const appIdFromState = location.state?.appId;
        if (appIdFromState && data?.some(app => app.id === appIdFromState)) {
          setSelectedAppId(appIdFromState);
        } else if (data && data.length > 0) {
          // Otherwise use the first app
          setSelectedAppId(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast.error('Failed to load your applications');
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, [isAuthenticated, user, location.state]);

  // Get the selected app's name
  const getSelectedAppName = () => {
    if (!selectedAppId || !applications.length) return '';
    const app = applications.find(app => app.id === selectedAppId);
    return app?.app_name || '';
  };

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
                <BreadcrumbLink href="/developer">Developer</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/developer/analytics">Analytics</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Developer Analytics</h1>
              <p className="text-muted-foreground">
                Monitor your API usage, performance, and request patterns
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Select onValueChange={setTimeRange} value={timeRange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                onValueChange={setSelectedAppId} 
                value={selectedAppId || ''} 
                disabled={applications.length === 0}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select application" />
                </SelectTrigger>
                <SelectContent>
                  {applications.map(app => (
                    <SelectItem key={app.id} value={app.id}>
                      {app.app_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Loading analytics data...</p>
            </div>
          ) : applications.length === 0 ? (
            <Card>
              <CardContent className="pt-10 pb-10 flex flex-col items-center justify-center text-center">
                <DatabaseIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Applications Found</h3>
                <p className="text-muted-foreground max-w-md mb-6">
                  You need to register an application before you can view analytics data.
                </p>
                <a href="/developer" className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded">
                  Register Application
                </a>
              </CardContent>
            </Card>
          ) : selectedAppId ? (
            <ApiAnalyticsDashboard 
              appId={selectedAppId} 
              appName={getSelectedAppName()} 
              timeRange={timeRange} 
            />
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Please select an application to view analytics.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DeveloperAnalytics;
