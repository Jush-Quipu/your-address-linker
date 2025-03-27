import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { AlertTriangle, ArrowUpRight, BarChart2, RefreshCw, TrendingDown, TrendingUp, Clock } from 'lucide-react';
import { getApiUsage, getApiQuota, ApiUsageDetails } from '@/services/analyticsService';
import { format } from 'date-fns';
import { toast } from 'sonner';
import ApiQuotaManager from '@/components/ApiQuotaManager';
import { ChartContainer, ChartTooltipContent, ChartTooltip } from '@/components/ui/chart';

interface ApiAnalyticsDashboardProps {
  appId: string;
  appName: string;
  timeRange: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#4CAF50', '#F44336'];

const ApiAnalyticsDashboard: React.FC<ApiAnalyticsDashboardProps> = ({ 
  appId, 
  appName,
  timeRange
}) => {
  const [usageData, setUsageData] = useState<ApiUsageDetails | null>(null);
  const [quotaData, setQuotaData] = useState<{ used: number, limit: number, reset_date: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isFetching, setIsFetching] = useState<boolean>(false);

  // Fetch API usage data
  const fetchUsageData = async () => {
    setIsFetching(true);
    try {
      const [usage, quota] = await Promise.all([
        getApiUsage(appId, timeRange),
        getApiQuota(appId)
      ]);
      setUsageData(usage);
      setQuotaData(quota);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  };

  // Fetch data when component mounts or when appId/timeRange changes
  useEffect(() => {
    if (appId) {
      fetchUsageData();
    }
  }, [appId, timeRange]);

  // Format date for display
  const formatDate = (date: string) => {
    return format(new Date(date), 'MMM d, yyyy');
  };

  // Get status badge color
  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "#4CAF50";
    if (status >= 400 && status < 500) return "#FF9800";
    if (status >= 500) return "#F44336";
    return "#9E9E9E";
  };

  // Calculate quota usage percentage
  const getQuotaPercentage = () => {
    if (!quotaData) return 0;
    return Math.round((quotaData.used / quotaData.limit) * 100);
  };

  // Get quota status
  const getQuotaStatus = () => {
    const percentage = getQuotaPercentage();
    if (percentage >= 90) return "critical";
    if (percentage >= 75) return "warning";
    return "good";
  };

  // Prepare chart data
  const prepareChartData = () => {
    // Chart data transformation logic
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{appName} Analytics</h2>
          <p className="text-muted-foreground">API usage and performance metrics</p>
        </div>
        <Button 
          variant="outline" 
          onClick={fetchUsageData} 
          disabled={isFetching}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      {/* API Quota Manager component */}
      <ApiQuotaManager appId={appId} appName={appName} />
      
      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-1/3" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[250px] w-full" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {usageData && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Total Requests */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {usageData.summary.total_requests.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    During selected period
                  </p>
                </CardContent>
              </Card>
              
              {/* Success Rate */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {usageData.summary.total_requests === 0 
                      ? '100%' 
                      : `${Math.round((usageData.summary.success_count / usageData.summary.total_requests) * 100)}%`}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    {usageData.summary.error_count} errors
                    {usageData.summary.error_count > 0 && (
                      <AlertTriangle className="h-3 w-3 ml-1 text-amber-500" />
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Average Response Time */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {usageData.summary.avg_response_time.toFixed(0)} ms
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    {usageData.summary.avg_response_time < 100 
                      ? <TrendingDown className="h-3 w-3 mr-1 text-green-500" /> 
                      : <TrendingUp className="h-3 w-3 mr-1 text-amber-500" />}
                    {usageData.summary.avg_response_time < 100 ? 'Good performance' : 'Consider optimization'}
                  </div>
                </CardContent>
              </Card>
              
              {/* API Quota */}
              {quotaData && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">API Quota</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {quotaData.used.toLocaleString()} / {quotaData.limit.toLocaleString()}
                    </div>
                    <div className="mt-2 space-y-1">
                      <Progress
                        value={getQuotaPercentage()}
                        className={`h-2 ${
                          getQuotaStatus() === 'critical' 
                            ? 'bg-muted text-red-500' 
                            : getQuotaStatus() === 'warning'
                              ? 'bg-muted text-amber-500'
                              : 'bg-muted text-green-500'
                        }`}
                      />
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          Resets on {formatDate(quotaData.reset_date)}
                        </span>
                        <span>
                          {getQuotaPercentage()}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
              <TabsTrigger value="status">Status Codes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              {usageData?.daily && usageData.daily.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Request Volume Over Time</CardTitle>
                    <CardDescription>
                      Daily API request volume for the selected period
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={usageData.daily}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <XAxis 
                            dataKey="time_period" 
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => {
                              // Format the date for display
                              try {
                                return format(new Date(value), 'MMM d');
                              } catch (e) {
                                return value;
                              }
                            }}
                          />
                          <YAxis />
                          <Tooltip 
                            formatter={(value) => [value, 'Requests']}
                            labelFormatter={(value) => {
                              try {
                                return format(new Date(value), 'MMMM d, yyyy');
                              } catch (e) {
                                return value;
                              }
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="requests" 
                            stroke="#8884d8" 
                            activeDot={{ r: 8 }} 
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">No Data Available</p>
                    <p className="text-sm text-muted-foreground text-center max-w-md mt-1">
                      There's no API usage data for this application in the selected time period.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="endpoints" className="space-y-4">
              {usageData?.by_endpoint && usageData.by_endpoint.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Requests by Endpoint</CardTitle>
                    <CardDescription>
                      Distribution of API requests across different endpoints
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={usageData.by_endpoint}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          layout="vertical"
                        >
                          <XAxis type="number" />
                          <YAxis 
                            dataKey="endpoint" 
                            type="category"
                            width={150}
                            tick={{ fontSize: 12 }}
                          />
                          <Tooltip formatter={(value) => [value, 'Requests']} />
                          <Bar dataKey="requests" fill="#8884d8">
                            {usageData.by_endpoint.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <BarChart2 className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">No Endpoint Data</p>
                    <p className="text-sm text-muted-foreground text-center max-w-md mt-1">
                      There's no endpoint usage data for this application in the selected time period.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="status" className="space-y-4">
              {usageData?.by_status && usageData.by_status.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Requests by Status Code</CardTitle>
                    <CardDescription>
                      Distribution of API responses by HTTP status code
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col lg:flex-row items-center gap-6">
                      <div className="w-full lg:w-1/2 h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={usageData.by_status}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="count"
                              nameKey="status_code"
                              label={({ status_code, percent }) => `${status_code}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {usageData.by_status.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={getStatusColor(entry.status_code)} 
                                />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value, name) => [value, `Status ${name}`]} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="w-full lg:w-1/2 space-y-3">
                        {usageData.by_status.map((statusData, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-2" 
                                style={{ backgroundColor: getStatusColor(statusData.status_code) }}
                              />
                              <Badge
                                variant={
                                  statusData.status_code >= 200 && statusData.status_code < 300
                                    ? 'success'
                                    : statusData.status_code >= 400 && statusData.status_code < 500
                                    ? 'warning'
                                    : statusData.status_code >= 500
                                    ? 'destructive'
                                    : 'outline'
                                }
                              >
                                {statusData.status_code}
                              </Badge>
                              <span className="ml-2 text-sm">
                                {statusData.status_code >= 200 && statusData.status_code < 300
                                  ? 'Success'
                                  : statusData.status_code >= 400 && statusData.status_code < 500
                                  ? 'Client Error'
                                  : statusData.status_code >= 500
                                  ? 'Server Error'
                                  : 'Other'}
                              </span>
                            </div>
                            <div className="text-sm font-medium">
                              {statusData.count} requests
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <ArrowUpRight className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">No Status Code Data</p>
                    <p className="text-sm text-muted-foreground text-center max-w-md mt-1">
                      There's no status code data for this application in the selected time period.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default ApiAnalyticsDashboard;
