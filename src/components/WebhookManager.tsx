
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Webhook, registerWebhook, getWebhooks, updateWebhook, deleteWebhook } from '@/services/webhookService';
import { PlusIcon, Trash2Icon, RefreshCwIcon, AlertTriangleIcon, BellIcon, CheckIcon, XIcon } from 'lucide-react';
import { toast } from 'sonner';

const WEBHOOK_EVENTS = [
  { id: 'address.verified', label: 'Address Verified', description: 'Triggered when a user address is verified' },
  { id: 'address.updated', label: 'Address Updated', description: 'Triggered when a user address is updated' },
  { id: 'permission.created', label: 'Permission Created', description: 'Triggered when a new permission is granted to an application' },
  { id: 'permission.revoked', label: 'Permission Revoked', description: 'Triggered when a permission is revoked' },
  { id: 'address.accessed', label: 'Address Accessed', description: 'Triggered when a shared address is accessed' }
];

interface WebhookManagerProps {
  appId: string;
  appName: string;
}

const WebhookManager: React.FC<WebhookManagerProps> = ({ appId, appName }) => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    url: '',
    description: '',
    secret: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchWebhooks = async () => {
    try {
      setLoading(true);
      const data = await getWebhooks(appId);
      setWebhooks(data);
    } catch (error) {
      console.error('Error fetching webhooks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, [appId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEventToggle = (eventId: string) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId) 
        : [...prev, eventId]
    );
  };

  const handleCreateWebhook = async () => {
    if (!formData.url) {
      toast.error('URL is required');
      return;
    }

    if (selectedEvents.length === 0) {
      toast.error('At least one event must be selected');
      return;
    }

    try {
      setSubmitting(true);
      await registerWebhook({
        app_id: appId,
        url: formData.url,
        events: selectedEvents,
        description: formData.description,
        secret: formData.secret || undefined
      });
      
      // Reset form
      setFormData({ url: '', description: '', secret: '' });
      setSelectedEvents([]);
      setAddDialogOpen(false);
      
      // Refresh webhooks list
      fetchWebhooks();
    } catch (error) {
      console.error('Error creating webhook:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleWebhook = async (webhook: Webhook) => {
    try {
      await updateWebhook(webhook.id, { is_active: !webhook.is_active });
      
      // Update the local state
      setWebhooks(prev => 
        prev.map(wh => 
          wh.id === webhook.id 
            ? { ...wh, is_active: !wh.is_active } 
            : wh
        )
      );
    } catch (error) {
      console.error('Error toggling webhook:', error);
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    try {
      await deleteWebhook(webhookId);
      
      // Remove from local state
      setWebhooks(prev => prev.filter(wh => wh.id !== webhookId));
    } catch (error) {
      console.error('Error deleting webhook:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Webhooks for {appName}</h2>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Webhook</DialogTitle>
              <DialogDescription>
                Create a new webhook to receive real-time notifications about events in your application.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="url">Endpoint URL <span className="text-destructive">*</span></Label>
                <Input
                  id="url"
                  name="url"
                  placeholder="https://example.com/webhook"
                  value={formData.url}
                  onChange={handleInputChange}
                />
                <p className="text-sm text-muted-foreground">
                  The URL that will receive webhook events via HTTP POST requests.
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe the purpose of this webhook"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={2}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="secret">Secret Key (Optional)</Label>
                <Input
                  id="secret"
                  name="secret"
                  placeholder="Leave blank to auto-generate"
                  value={formData.secret}
                  onChange={handleInputChange}
                />
                <p className="text-sm text-muted-foreground">
                  A secret key used to sign webhook payloads. You can provide your own or let us generate one.
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label>Events <span className="text-destructive">*</span></Label>
                <div className="border rounded-md p-4 space-y-3">
                  {WEBHOOK_EVENTS.map(event => (
                    <div className="flex items-start space-x-2" key={event.id}>
                      <Checkbox 
                        id={`event-${event.id}`} 
                        checked={selectedEvents.includes(event.id)}
                        onCheckedChange={() => handleEventToggle(event.id)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor={`event-${event.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {event.label}
                        </label>
                        <p className="text-sm text-muted-foreground">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateWebhook} disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Webhook'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <RefreshCwIcon className="animate-spin h-8 w-8 mx-auto text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Loading webhooks...</p>
        </div>
      ) : webhooks.length === 0 ? (
        <Card className="bg-muted/40">
          <CardContent className="pt-10 pb-10 flex flex-col items-center justify-center text-center">
            <BellIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Webhooks</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Webhooks allow your application to receive real-time notifications about events in SecureAddress Bridge.
            </p>
            <Button onClick={() => setAddDialogOpen(true)}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Your First Webhook
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {webhooks.map(webhook => (
            <Card key={webhook.id} className={webhook.is_active ? "" : "opacity-60"}>
              <CardHeader className="pb-3">
                <div className="flex justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold flex items-center">
                      <span className="truncate max-w-md">{webhook.url}</span>
                    </CardTitle>
                    <CardDescription className="truncate max-w-md">
                      {webhook.metadata?.description || "No description provided"}
                    </CardDescription>
                  </div>
                  <Badge variant={webhook.is_active ? "success" : "secondary"}>
                    {webhook.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex flex-wrap gap-1 mb-3">
                  {webhook.events.map(event => (
                    <Badge key={event} variant="outline" className="text-xs">
                      {event}
                    </Badge>
                  ))}
                </div>
                
                {webhook.failure_count > 0 && (
                  <div className="flex items-center text-amber-500 text-sm mt-2">
                    <AlertTriangleIcon className="h-4 w-4 mr-1" />
                    <span>
                      {webhook.failure_count} failed {webhook.failure_count === 1 ? "delivery" : "deliveries"}
                    </span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-xs text-muted-foreground">
                  Created {new Date(webhook.created_at).toLocaleDateString()}
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleToggleWebhook(webhook)}
                  >
                    {webhook.is_active ? <XIcon className="h-4 w-4" /> : <CheckIcon className="h-4 w-4" />}
                    <span className="ml-1">{webhook.is_active ? "Disable" : "Enable"}</span>
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2Icon className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete webhook</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this webhook? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => handleDeleteWebhook(webhook.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WebhookManager;
