
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { testWebhookEvent } from '@/services/webhookDeliveryService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Zap, RefreshCw, Info } from 'lucide-react';

interface WebhookEventTesterProps {
  webhookId: string;
  events: string[];
}

const WebhookEventTester: React.FC<WebhookEventTesterProps> = ({ webhookId, events }) => {
  const [eventType, setEventType] = useState<string>(events[0] || '');
  const [customPayload, setCustomPayload] = useState<string>('{\n  "test": true,\n  "timestamp": "' + new Date().toISOString() + '"\n}');
  const [activeTab, setActiveTab] = useState<string>('standard');
  const [sending, setSending] = useState<boolean>(false);

  // Get example payload for the selected event
  const getExamplePayload = (event: string) => {
    switch (event) {
      case 'address.verified':
        return JSON.stringify({
          event_type: 'address.verified',
          address_id: 'example-address-id',
          user_id: 'example-user-id',
          verification_method: 'document',
          timestamp: new Date().toISOString()
        }, null, 2);
      case 'address.updated':
        return JSON.stringify({
          event_type: 'address.updated',
          address_id: 'example-address-id',
          user_id: 'example-user-id',
          fields_updated: ['city', 'postal_code'],
          timestamp: new Date().toISOString()
        }, null, 2);
      case 'permission.created':
        return JSON.stringify({
          event_type: 'permission.created',
          permission_id: 'example-permission-id',
          user_id: 'example-user-id',
          app_id: 'example-app-id',
          shared_fields: ['state', 'country'],
          timestamp: new Date().toISOString()
        }, null, 2);
      case 'permission.revoked':
        return JSON.stringify({
          event_type: 'permission.revoked',
          permission_id: 'example-permission-id',
          user_id: 'example-user-id',
          app_id: 'example-app-id',
          revocation_reason: 'user_initiated',
          timestamp: new Date().toISOString()
        }, null, 2);
      case 'address.accessed':
        return JSON.stringify({
          event_type: 'address.accessed',
          permission_id: 'example-permission-id',
          user_id: 'example-user-id',
          app_id: 'example-app-id',
          accessed_fields: ['state', 'country'],
          timestamp: new Date().toISOString()
        }, null, 2);
      default:
        return JSON.stringify({
          event_type: event,
          test: true,
          timestamp: new Date().toISOString()
        }, null, 2);
    }
  };

  // Update custom payload when event type changes
  React.useEffect(() => {
    if (activeTab === 'standard') {
      setCustomPayload(getExamplePayload(eventType));
    }
  }, [eventType, activeTab]);

  // Format JSON
  const formatJson = () => {
    try {
      const parsed = JSON.parse(customPayload);
      setCustomPayload(JSON.stringify(parsed, null, 2));
      toast.success('JSON formatted');
    } catch (error) {
      toast.error('Invalid JSON');
    }
  };

  // Handle sending test event
  const handleSendTest = async () => {
    if (!eventType) {
      toast.error('Please select an event type');
      return;
    }
    
    let parsedPayload;
    try {
      parsedPayload = JSON.parse(customPayload);
    } catch (error) {
      toast.error('Invalid JSON in payload');
      return;
    }
    
    setSending(true);
    try {
      await testWebhookEvent(webhookId, eventType, parsedPayload);
    } catch (error) {
      console.error('Error sending test event:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Test Webhook</CardTitle>
        <CardDescription>
          Send test events to your webhook endpoint
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="event-type">Event Type</Label>
            <Select 
              value={eventType} 
              onValueChange={setEventType}
              disabled={events.length === 0}
            >
              <SelectTrigger id="event-type">
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                {events.map(event => (
                  <SelectItem key={event} value={event}>
                    {event}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="standard">Standard Payload</TabsTrigger>
              <TabsTrigger value="custom">Custom Payload</TabsTrigger>
            </TabsList>
            
            <TabsContent value="standard" className="space-y-4 pt-2">
              <div className="flex items-center bg-muted/50 p-2 rounded text-sm">
                <Info className="h-4 w-4 mr-2 text-blue-500" />
                Using standard test payload for the selected event type.
              </div>
            </TabsContent>
            
            <TabsContent value="custom" className="space-y-4 pt-2">
              <div className="flex items-center bg-muted/50 p-2 rounded text-sm">
                <Info className="h-4 w-4 mr-2 text-blue-500" />
                Edit the payload below to customize your test event.
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="event-payload">Event Payload</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={formatJson}
                className="h-7 px-2 text-xs"
              >
                Format JSON
              </Button>
            </div>
            <Textarea
              id="event-payload"
              value={customPayload}
              onChange={(e) => setCustomPayload(e.target.value)}
              className="font-mono text-sm min-h-[200px]"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSendTest} 
          disabled={sending || !eventType}
          className="w-full"
        >
          {sending ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Send Test Event
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WebhookEventTester;
