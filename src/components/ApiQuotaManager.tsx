
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getApiQuota } from '@/services/analyticsService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AlertCircle, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';

interface ApiQuotaManagerProps {
  appId: string;
  appName: string;
}

const ApiQuotaManager: React.FC<ApiQuotaManagerProps> = ({ appId, appName }) => {
  const [quotaData, setQuotaData] = useState<{ used: number, limit: number, reset_date: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [newQuotaLimit, setNewQuotaLimit] = useState<string>('');
  const [expanded, setExpanded] = useState<boolean>(false);

  useEffect(() => {
    fetchQuotaData();
  }, [appId]);

  const fetchQuotaData = async () => {
    setLoading(true);
    try {
      const quota = await getApiQuota(appId);
      setQuotaData(quota);
      setNewQuotaLimit(quota.limit.toString());
    } catch (error) {
      console.error('Error fetching quota data:', error);
      toast.error('Failed to load quota information');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuota = async () => {
    const limit = parseInt(newQuotaLimit);
    
    if (isNaN(limit) || limit < 0) {
      toast.error('Please enter a valid quota limit');
      return;
    }
    
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('developer_apps')
        .update({ monthly_request_limit: limit })
        .eq('id', appId);
        
      if (error) throw error;
      
      toast.success('API quota updated successfully');
      fetchQuotaData();
    } catch (error) {
      console.error('Error updating quota:', error);
      toast.error('Failed to update quota limit');
    } finally {
      setUpdating(false);
    }
  };

  const getQuotaPercentage = () => {
    if (!quotaData) return 0;
    return Math.round((quotaData.used / quotaData.limit) * 100);
  };

  const getQuotaStatus = () => {
    const percentage = getQuotaPercentage();
    if (percentage >= 90) return "critical";
    if (percentage >= 75) return "warning";
    return "good";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>API Quota Management</CardTitle>
            <CardDescription>
              Monitor and manage API usage limits for {appName}
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
        </div>
      </CardHeader>
      
      {expanded && (
        <>
          <CardContent className="pb-3 space-y-4">
            {loading ? (
              <div className="space-y-2">
                <div className="h-4 w-full bg-muted rounded animate-pulse" />
                <div className="h-8 w-full bg-muted rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
              </div>
            ) : quotaData ? (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Used {quotaData.used.toLocaleString()} of {quotaData.limit.toLocaleString()} requests</span>
                    <span className="font-medium">{getQuotaPercentage()}%</span>
                  </div>
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
                  <p className="text-xs text-muted-foreground">
                    Quota resets on {formatDate(quotaData.reset_date)}
                  </p>
                </div>
                
                {getQuotaStatus() === 'critical' && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Critical Quota Usage</AlertTitle>
                    <AlertDescription>
                      API quota is almost depleted. Consider upgrading your limit to avoid service interruption.
                    </AlertDescription>
                  </Alert>
                )}
                
                {getQuotaStatus() === 'warning' && (
                  <Alert variant="warning" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>High Quota Usage</AlertTitle>
                    <AlertDescription>
                      API quota is running low. Monitor your usage or increase your limit if needed.
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2 pt-4">
                  <Label htmlFor="quota-limit">Monthly API Request Limit</Label>
                  <div className="flex gap-2">
                    <Input
                      id="quota-limit"
                      type="number"
                      min="0"
                      step="100"
                      value={newQuotaLimit}
                      onChange={(e) => setNewQuotaLimit(e.target.value)}
                    />
                    <Button onClick={handleUpdateQuota} disabled={updating}>
                      {updating ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Update'}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Failed to load quota information</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={fetchQuotaData}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            )}
          </CardContent>
          
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={fetchQuotaData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Quota Data
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  );
};

export default ApiQuotaManager;
