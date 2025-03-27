
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { HomeIcon, DatabaseIcon, ActivityIcon, PieChartIcon, CpuIcon, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Sample data - would be replaced with real data from API
const apiUsageData = [
  { name: 'Monday', requests: 120 },
  { name: 'Tuesday', requests: 150 },
  { name: 'Wednesday', requests: 180 },
  { name: 'Thursday', requests: 145 },
  { name: 'Friday', requests: 190 },
  { name: 'Saturday', requests: 80 },
  { name: 'Sunday', requests: 70 },
];

const responseTimeData = [
  { name: 'Monday', time: 85 },
  { name: 'Tuesday', time: 90 },
  { name: 'Wednesday', time: 115 },
  { name: 'Thursday', time: 95 },
  { name: 'Friday', time: 105 },
  { name: 'Saturday', time: 70 },
  { name: 'Sunday', time: 65 },
];

const endpointUsageData = [
  { name: '/address', value: 350 },
  { name: '/wallet-verify', value: 200 },
  { name: '/verify-address', value: 150 },
  { name: '/blind-shipping', value: 100 },
  { name: '/other', value: 80 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const DeveloperAnalytics: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [timeRange, setTimeRange] = useState('7d');
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [usageData, setUsageData] = useState<any[]>([]);

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
        if (data && data.length > 0) {
          setSelectedApp(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast.error('Failed to load your applications');
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, [isAuthenticated, user]);

  useEffect(() => {
    const fetchUsageData = async () => {
      if (!selectedApp) return;
      
      // In a real app, this would fetch actual usage data from the API
      // For now, we'll just use the sample data
      setUsageData(apiUsageData);
    };
    
    fetchUsageData();
  }, [selectedApp, timeRange]);

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
                onValueChange={setSelectedApp} 
                value={selectedApp || ''} 
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
                <Button asChild>
                  <a href="/developer">Register Application</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <ActivityIcon className="h-5 w-5 mr-2 text-primary" />
                      API Requests
                    </CardTitle>
                    <CardDescription>Total requests in selected period</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end space-x-2">
                      <div className="text-3xl font-bold">1,234</div>
                      <div className="text-sm text-green-500">+12% ↑</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Clock className="h-5 w-5 mr-2 text-primary" />
                      Average Response Time
                    </CardTitle>
                    <CardDescription>Average API response time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end space-x-2">
                      <div className="text-3xl font-bold">89ms</div>
                      <div className="text-sm text-green-500">-5% ↓</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <CpuIcon className="h-5 w-5 mr-2 text-primary" />
                      Success Rate
                    </CardTitle>
                    <CardDescription>Percentage of successful requests</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end space-x-2">
                      <div className="text-3xl font-bold">99.8%</div>
                      <div className="text-sm text-green-500">+0.2% ↑</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="requests" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="requests">API Requests</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="endpoints">Endpoint Usage</TabsTrigger>
                  <TabsTrigger value="errors">Errors</TabsTrigger>
                </TabsList>
                
                <TabsContent value="requests">
                  <Card>
                    <CardHeader>
                      <CardTitle>Request Volume</CardTitle>
                      <CardDescription>
                        API requests over time for the selected period
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={apiUsageData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="requests" fill="#3b82f6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="performance">
                  <Card>
                    <CardHeader>
                      <CardTitle>Response Time</CardTitle>
                      <CardDescription>
                        Average response time in milliseconds
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={responseTimeData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="time" stroke="#8884d8" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="endpoints">
                  <Card>
                    <CardHeader>
                      <CardTitle>Endpoint Usage</CardTitle>
                      <CardDescription>
                        Distribution of requests by endpoint
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-between">
                      <div className="h-[300px] w-1/2">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={endpointUsageData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {endpointUsageData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="w-1/2 pl-6">
                        <h4 className="font-medium mb-4">Top Endpoints</h4>
                        <div className="space-y-4">
                          {endpointUsageData.map((entry, index) => (
                            <div key={`endpoint-${index}`} className="flex justify-between">
                              <div className="flex items-center">
                                <div 
                                  className="w-3 h-3 rounded-full mr-2" 
                                  style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                                />
                                <span>{entry.name}</span>
                              </div>
                              <span className="font-medium">{entry.value} requests</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="errors">
                  <Card>
                    <CardHeader>
                      <CardTitle>Error Analysis</CardTitle>
                      <CardDescription>
                        API errors by type and frequency
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <PieChartIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          No errors recorded in the selected time period.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DeveloperAnalytics;
