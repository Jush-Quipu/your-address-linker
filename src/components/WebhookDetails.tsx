
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Webhook, testWebhook, updateWebhook } from '@/services/webhookService';
import WebhookDeliveryHistory from '@/components/WebhookDeliveryHistory';
import WebhookEventTester from '@/components/WebhookEventTester';
import { AlertCircle, CheckCircle2, ClipboardCopy, Link, Power, PowerOff, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface WebhookDetailsProps {
  webhook: Webhook;
  onWebhookUpdate: () => void;
}

const WebhookDetails: React.FC<WebhookDetailsProps> = ({ webhook, onWebhookUpdate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isTesting, setIsTesting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // Format created date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  // Copy webhook URL to clipboard
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(webhook.url);
    toast.success('Webhook URL copied to clipboard');
  };

  // Handle toggle webhook active state
  const handleToggleActive = async () => {
    setIsToggling(true);
    try {
      await updateWebhook(webhook.id, { is_active: !webhook.is_active });
      onWebhookUpdate();
      toast.success(`Webhook ${webhook.is_active ? 'disabled' : 'enabled'} successfully`);
    } catch (error) {
      console.error('Error toggling webhook:', error);
    } finally {
      setIsToggling(false);
    }
  };

  // Handle test webhook
  const handleTestWebhook = async () => {
    setIsTesting(true);
    try {
      await testWebhook(webhook.id);
      toast.success('Test webhook sent successfully');
      onWebhookUpdate();
    } catch (error) {
      console.error('Error testing webhook:', error);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0 pt-0">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <CardTitle className="text-xl flex items-center flex-wrap gap-2">
              <span className="font-mono text-base break-all">{webhook.url}</span>
              <Button variant="ghost" size="icon" onClick={handleCopyUrl} className="h-7 w-7">
                <ClipboardCopy className="h-4 w-4" />
              </Button>
              {webhook.is_active ? (
                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                  Active
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-gray-100 text-gray-600 hover:bg-gray-100">
                  Disabled
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {webhook.metadata?.description || `Webhook for events: ${webhook.events.join(', ')}`}
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleToggleActive}
              disabled={isToggling}
              className="flex items-center gap-2"
            >
              {isToggling ? <RefreshCw className="h-4 w-4 animate-spin" /> : 
                webhook.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
              {webhook.is_active ? 'Disable' : 'Enable'}
            </Button>
            
            <Button 
              onClick={handleTestWebhook}
              disabled={isTesting || !webhook.is_active}
              className="flex items-center gap-2"
            >
              {isTesting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Link className="h-4 w-4" />}
              Test Webhook
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground mb-1">Created</div>
              <div className="text-sm">{formatDate(webhook.created_at)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground mb-1">Last Triggered</div>
              <div className="text-sm">{formatDate(webhook.last_triggered_at)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground mb-1">Status</div>
              <div className="flex items-center gap-2">
                {webhook.failure_count > 0 ? (
                  <div className="flex items-center text-amber-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {webhook.failure_count} failed attempts
                  </div>
                ) : (
                  <div className="flex items-center text-green-600">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Healthy
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex items-center space-x-2 mb-4">
          <div className="font-medium">Subscribed Events:</div>
          <div className="flex flex-wrap gap-1">
            {webhook.events.map((event) => (
              <Badge key={event} variant="secondary" className="text-xs">
                {event}
              </Badge>
            ))}
          </div>
        </div>
        
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="deliveries">Delivery History</TabsTrigger>
            <TabsTrigger value="tester">Event Tester</TabsTrigger>
          </TabsList>
          
          <TabsContent value="deliveries">
            <WebhookDeliveryHistory webhookId={webhook.id} showHeader={false} />
          </TabsContent>
          
          <TabsContent value="tester">
            <WebhookEventTester webhookId={webhook.id} events={webhook.events} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WebhookDetails;
