
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  RefreshCw,
  Search,
  AlertTriangle
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { WebhookDelivery, getWebhookDeliveries, retryWebhookDelivery } from '@/services/webhookDeliveryService';
import { toast } from 'sonner';

interface WebhookDeliveryHistoryProps {
  webhookId: string;
  showHeader?: boolean;
}

const WebhookDeliveryHistory: React.FC<WebhookDeliveryHistoryProps> = ({ 
  webhookId,
  showHeader = true
}) => {
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [searchText, setSearchText] = useState<string>('');
  const [expandedDeliveries, setExpandedDeliveries] = useState<Record<string, boolean>>({});
  const [retrying, setRetrying] = useState<Record<string, boolean>>({});

  // Fetch webhook deliveries
  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const data = await getWebhookDeliveries(webhookId);
      setDeliveries(data);
    } catch (error) {
      console.error('Error fetching webhook deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (webhookId) {
      fetchDeliveries();
    }
  }, [webhookId]);

  // Filter deliveries based on status and search text
  const filteredDeliveries = deliveries
    .filter(delivery => {
      if (filter === 'all') return true;
      if (filter === 'success') return delivery.status === 'success';
      if (filter === 'failed') return delivery.status === 'failed' || delivery.status === 'retrying';
      return true;
    })
    .filter(delivery => {
      if (!searchText) return true;
      const search = searchText.toLowerCase();
      
      return (
        delivery.event_type.toLowerCase().includes(search) ||
        delivery.status.toLowerCase().includes(search) ||
        (delivery.response_body && delivery.response_body.toLowerCase().includes(search)) ||
        JSON.stringify(delivery.payload).toLowerCase().includes(search)
      );
    });

  // Toggle expanded view for a delivery
  const toggleExpand = (deliveryId: string) => {
    setExpandedDeliveries(prev => ({
      ...prev,
      [deliveryId]: !prev[deliveryId]
    }));
  };

  // Handle retry delivery
  const handleRetry = async (deliveryId: string) => {
    setRetrying(prev => ({ ...prev, [deliveryId]: true }));
    try {
      await retryWebhookDelivery(webhookId, deliveryId);
      // Refresh deliveries after retry
      fetchDeliveries();
    } catch (error) {
      console.error('Error retrying webhook delivery:', error);
    } finally {
      setRetrying(prev => ({ ...prev, [deliveryId]: false }));
    }
  };

  // Download delivery logs as JSON
  const handleDownloadLogs = () => {
    const logData = JSON.stringify(deliveries, null, 2);
    const blob = new Blob([logData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `webhook-deliveries-${webhookId}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Delivery logs downloaded');
  };

  // Get status badge based on delivery status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="success" className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Success</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Failed</Badge>;
      case 'pending':
        return <Badge variant="outline" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case 'retrying':
        return <Badge variant="warning" className="flex items-center gap-1"><RefreshCw className="h-3 w-3" /> Retrying</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <CardTitle>Webhook Delivery History</CardTitle>
          <CardDescription>
            View and manage webhook delivery attempts
          </CardDescription>
        </CardHeader>
      )}
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <Tabs defaultValue={filter} value={filter} onValueChange={(value) => setFilter(value as 'all' | 'success' | 'failed')}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="success">Successful</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                className="pl-8 w-[200px]"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleDownloadLogs}
              disabled={deliveries.length === 0}
              title="Download logs"
            >
              <Download className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={fetchDeliveries} 
              disabled={loading}
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-md p-4">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-3/4 mt-2" />
              </div>
            ))}
          </div>
        ) : filteredDeliveries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No delivery logs found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {filter !== 'all' 
                ? `No ${filter === 'success' ? 'successful' : 'failed'} deliveries found.` 
                : searchText 
                  ? 'No results match your search.' 
                  : 'No webhook deliveries have been recorded yet.'}
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[500px]">
            <div className="space-y-3">
              {filteredDeliveries.map((delivery) => {
                const isExpanded = !!expandedDeliveries[delivery.id];
                const isRetrying = !!retrying[delivery.id];
                const formattedDate = format(new Date(delivery.created_at), 'MMM d, yyyy HH:mm:ss');
                const timeAgo = formatDistanceToNow(new Date(delivery.created_at), { addSuffix: true });
                
                return (
                  <div key={delivery.id} className="border rounded-md overflow-hidden">
                    <div 
                      className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => toggleExpand(delivery.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(delivery.status)}
                          <span className="font-medium">{delivery.event_type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground" title={formattedDate}>{timeAgo}</span>
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        <Badge variant="outline" className="font-mono text-xs">
                          Attempt {delivery.attempt_count}
                        </Badge>
                        {delivery.status_code && (
                          <Badge 
                            variant={delivery.status_code >= 200 && delivery.status_code < 300 ? 'success' : 'destructive'}
                            className="font-mono text-xs"
                          >
                            {delivery.status_code}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="px-3 pb-3 border-t">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
                          <div>
                            <p className="text-xs font-medium mb-1">Event Payload:</p>
                            <pre className="text-xs overflow-auto bg-muted p-2 rounded-sm max-h-[200px]">
                              {JSON.stringify(delivery.payload, null, 2)}
                            </pre>
                          </div>
                          
                          <div>
                            <p className="text-xs font-medium mb-1">Response:</p>
                            <pre className="text-xs overflow-auto bg-muted p-2 rounded-sm max-h-[200px]">
                              {delivery.response_body ? delivery.response_body : "No response data"}
                            </pre>
                            
                            {(delivery.status === 'failed' || delivery.status === 'retrying') && (
                              <div className="mt-4 flex justify-end">
                                <Button 
                                  size="sm" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRetry(delivery.id);
                                  }}
                                  disabled={isRetrying}
                                >
                                  {isRetrying ? (
                                    <>
                                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                      Retrying...
                                    </>
                                  ) : (
                                    <>
                                      <RefreshCw className="h-4 w-4 mr-2" />
                                      Retry Delivery
                                    </>
                                  )}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default WebhookDeliveryHistory;
