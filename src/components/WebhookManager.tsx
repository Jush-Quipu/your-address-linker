
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { PlusCircle, Trash2, RefreshCw, Power, PowerOff, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { getWebhooks, registerWebhook, updateWebhook, deleteWebhook, Webhook, WebhookCreateParams, WebhookUpdateParams } from '@/services/webhookService';

interface WebhookManagerProps {
  appId: string;
  appName: string;
  onSelectWebhook?: (webhook: Webhook) => void;
  refreshTrigger?: number;
}

const eventTypeOptions = [
  { id: 'address.verified', label: 'Address Verified' },
  { id: 'address.updated', label: 'Address Updated' },
  { id: 'address.accessed', label: 'Address Accessed' },
  { id: 'permission.created', label: 'Permission Granted' },
  { id: 'permission.revoked', label: 'Permission Revoked' },
];

const WebhookManager: React.FC<WebhookManagerProps> = ({ 
  appId, 
  appName, 
  onSelectWebhook,
  refreshTrigger = 0
}) => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [formData, setFormData] = useState<{
    url: string;
    events: string[];
    description: string;
  }>({
    url: '',
    events: [],
    description: '',
  });
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Fetch webhooks on component mount and when refreshTrigger changes
  useEffect(() => {
    fetchWebhooks();
  }, [appId, refreshTrigger]);

  // Function to fetch webhooks
  const fetchWebhooks = async () => {
    setLoading(true);
    try {
      const data = await getWebhooks(appId);
      setWebhooks(data);
    } catch (error) {
      console.error('Error fetching webhooks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle event checkbox changes
  const handleEventChange = (eventId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      events: checked 
        ? [...prev.events, eventId] 
        : prev.events.filter(id => id !== eventId)
    }));
  };

  // Handle form submission (create or update webhook)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (selectedWebhook) {
        // Update existing webhook
        const params: WebhookUpdateParams = {
          url: formData.url,
          events: formData.events,
          description: formData.description || undefined,
        };
        
        await updateWebhook(selectedWebhook.id, params);
        toast.success('Webhook updated successfully');
      } else {
        // Create new webhook
        const params: WebhookCreateParams = {
          app_id: appId,
          url: formData.url,
          events: formData.events,
          description: formData.description,
        };
        
        await registerWebhook(params);
        toast.success('Webhook registered successfully');
      }
      
      // Reset form and refetch webhooks
      resetForm();
      fetchWebhooks();
    } catch (error) {
      console.error('Error submitting webhook:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle webhook deletion
  const handleDelete = async (webhookId: string) => {
    try {
      await deleteWebhook(webhookId);
      toast.success('Webhook deleted successfully');
      fetchWebhooks();
    } catch (error) {
      console.error('Error deleting webhook:', error);
    }
  };

  // Handle toggling webhook active state
  const handleToggleActive = async (webhook: Webhook) => {
    try {
      await updateWebhook(webhook.id, { is_active: !webhook.is_active });
      toast.success(`Webhook ${webhook.is_active ? 'disabled' : 'enabled'} successfully`);
      fetchWebhooks();
    } catch (error) {
      console.error('Error toggling webhook:', error);
    }
  };

  // Reset form state
  const resetForm = () => {
    setFormData({
      url: '',
      events: [],
      description: '',
    });
    setSelectedWebhook(null);
    setFormOpen(false);
  };

  // Open edit form for a webhook
  const handleEdit = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    setFormData({
      url: webhook.url,
      events: webhook.events,
      description: webhook.metadata?.description || '',
    });
    setFormOpen(true);
  };
  
  // Handle view webhook details
  const handleViewDetails = (webhook: Webhook) => {
    if (onSelectWebhook) {
      onSelectWebhook(webhook);
    }
  };

  return (
    <div className="space-y-4">
      {!formOpen && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{webhooks.length} Webhook{webhooks.length !== 1 && 's'}</h3>
          <Button onClick={() => setFormOpen(true)} size="sm" className="flex items-center">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Webhook
          </Button>
        </div>
      )}
      
      {formOpen ? (
        <Card>
          <CardHeader>
            <CardTitle>{selectedWebhook ? 'Edit' : 'Add'} Webhook</CardTitle>
            <CardDescription>
              Configure endpoints to receive real-time event notifications
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">Webhook URL</Label>
                <Input
                  id="url"
                  name="url"
                  placeholder="https://example.com/webhook"
                  value={formData.url}
                  onChange={handleChange}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  This URL will receive HTTP POST requests when events occur
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Events</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {eventTypeOptions.map((event) => (
                    <div key={event.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`event-${event.id}`}
                        checked={formData.events.includes(event.id)}
                        onCheckedChange={(checked) => handleEventChange(event.id, !!checked)}
                      />
                      <Label
                        htmlFor={`event-${event.id}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {event.label}
                      </Label>
                    </div>
                  ))}
                </div>
                {formData.events.length === 0 && (
                  <p className="text-sm text-amber-600">
                    Select at least one event
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="What is this webhook for?"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={resetForm}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submitting || formData.url === '' || formData.events.length === 0}
              >
                {submitting ? 'Saving...' : selectedWebhook ? 'Update Webhook' : 'Add Webhook'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : loading ? (
        <div className="text-center py-8">Loading webhooks...</div>
      ) : webhooks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <InfoCircle className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-center mb-4">
              No webhooks have been configured yet for this application.
            </p>
            <Button onClick={() => setFormOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Webhook
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {webhooks.map((webhook) => (
            <Card key={webhook.id} className={webhook.is_active ? "" : "opacity-75"}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base flex items-center">
                      {webhook.url}
                      {webhook.is_active ? (
                        <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="ml-2 bg-gray-100 text-gray-600 hover:bg-gray-100">
                          Disabled
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {webhook.metadata?.description || `Webhook for ${appName}`}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-1">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={() => handleToggleActive(webhook)}
                      title={webhook.is_active ? "Disable webhook" : "Enable webhook"}
                    >
                      {webhook.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          title="Delete webhook"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this webhook. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(webhook.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex flex-wrap gap-1 mb-2">
                  {webhook.events.map((event) => {
                    const eventOption = eventTypeOptions.find(opt => opt.id === event);
                    return (
                      <Badge variant="secondary" key={event} className="text-xs">
                        {eventOption?.label || event}
                      </Badge>
                    );
                  })}
                </div>
                
                {webhook.last_triggered_at && (
                  <p className="text-xs text-muted-foreground">
                    Last triggered: {new Date(webhook.last_triggered_at).toLocaleString()}
                  </p>
                )}
                
                {webhook.failure_count > 0 && (
                  <div className="flex items-center text-xs text-amber-600 mt-1">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Failed attempts: {webhook.failure_count}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(webhook)}>
                  Edit
                </Button>
                {onSelectWebhook && (
                  <Button variant="default" size="sm" onClick={() => handleViewDetails(webhook)}>
                    View Details
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// InfoCircle component for the empty state
const InfoCircle = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
};

export default WebhookManager;
