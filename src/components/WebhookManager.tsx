
import React, { useState, useEffect } from 'react';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { 
  Webhook, 
  getWebhooks, 
  registerWebhook, 
  updateWebhook, 
  deleteWebhook, 
  testWebhook
} from '@/services/webhookService';
import { 
  AlertCircle,
  Check,
  Clock,
  Code,
  Copy,
  Edit,
  Plus,
  RefreshCw,
  Save,
  Trash,
  X,
  Zap
} from 'lucide-react';
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
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';

// Available webhook event types
const availableEvents = [
  { id: 'address.access', name: 'Address Accessed' },
  { id: 'address.updated', name: 'Address Updated' },
  { id: 'address.verified', name: 'Address Verified' },
  { id: 'permissions.granted', name: 'Permissions Granted' },
  { id: 'permissions.revoked', name: 'Permissions Revoked' },
  { id: 'verification.completed', name: 'Verification Completed' },
  { id: 'verification.rejected', name: 'Verification Rejected' },
  { id: 'user.linked_wallet', name: 'Wallet Linked' },
];

interface WebhookManagerProps {
  appId: string;
  appName: string;
}

const WebhookManager: React.FC<WebhookManagerProps> = ({ appId, appName }) => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [webhookToDelete, setWebhookToDelete] = useState<string | null>(null);
  
  // Form state for new webhook
  const [formData, setFormData] = useState({
    url: '',
    description: '',
    events: [] as string[],
    secret: ''
  });
  
  // Load webhooks for this app
  useEffect(() => {
    const fetchWebhooks = async () => {
      try {
        setLoading(true);
        const data = await getWebhooks(appId);
        setWebhooks(data);
      } catch (error) {
        console.error('Error fetching webhooks:', error);
        toast.error('Failed to load webhooks');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWebhooks();
  }, [appId]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleEventToggle = (eventId: string) => {
    setFormData(prev => {
      if (prev.events.includes(eventId)) {
        return { ...prev, events: prev.events.filter(id => id !== eventId) };
      } else {
        return { ...prev, events: [...prev.events, eventId] };
      }
    });
  };
  
  const handleCreateWebhook = async () => {
    if (!formData.url) {
      toast.error('URL is required');
      return;
    }
    
    if (formData.events.length === 0) {
      toast.error('At least one event must be selected');
      return;
    }
    
    try {
      await registerWebhook({
        app_id: appId,
        url: formData.url,
        events: formData.events,
        description: formData.description || undefined,
        secret: formData.secret || undefined
      });
      
      // Refresh the list
      const updatedWebhooks = await getWebhooks(appId);
      setWebhooks(updatedWebhooks);
      
      // Reset form and close
      setFormData({ url: '', description: '', events: [], secret: '' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating webhook:', error);
    }
  };
  
  const handleEditWebhook = async () => {
    if (!editingWebhook) return;
    
    try {
      await updateWebhook(editingWebhook.id, {
        url: formData.url,
        events: formData.events,
        description: formData.description || undefined
      });
      
      // Refresh the list
      const updatedWebhooks = await getWebhooks(appId);
      setWebhooks(updatedWebhooks);
      
      // Reset form and close
      setFormData({ url: '', description: '', events: [], secret: '' });
      setEditingWebhook(null);
    } catch (error) {
      console.error('Error updating webhook:', error);
    }
  };
  
  const handleDeleteWebhook = async () => {
    if (!webhookToDelete) return;
    
    try {
      await deleteWebhook(webhookToDelete);
      
      // Refresh the list
      const updatedWebhooks = await getWebhooks(appId);
      setWebhooks(updatedWebhooks);
      
      // Reset state
      setWebhookToDelete(null);
      setDeleteConfirmOpen(false);
    } catch (error) {
      console.error('Error deleting webhook:', error);
    }
  };
  
  const handleTestWebhook = async (webhookId: string) => {
    try {
      await testWebhook(webhookId);
    } catch (error) {
      console.error('Error testing webhook:', error);
    }
  };
  
  const handleToggleActive = async (webhook: Webhook) => {
    try {
      await updateWebhook(webhook.id, {
        is_active: !webhook.is_active
      });
      
      // Refresh the list
      const updatedWebhooks = await getWebhooks(appId);
      setWebhooks(updatedWebhooks);
    } catch (error) {
      console.error('Error toggling webhook status:', error);
    }
  };
  
  const startEdit = (webhook: Webhook) => {
    setEditingWebhook(webhook);
    setFormData({
      url: webhook.url,
      description: webhook.metadata?.description || '',
      events: webhook.events,
      secret: '' // Secret is not returned from the API
    });
  };
  
  const cancelEdit = () => {
    setEditingWebhook(null);
    setFormData({ url: '', description: '', events: [], secret: '' });
  };
  
  const startDelete = (webhookId: string) => {
    setWebhookToDelete(webhookId);
    setDeleteConfirmOpen(true);
  };
  
  // Format timestamp for display
  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString();
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Webhooks for {appName}</h3>
        <Button 
          onClick={() => setShowCreateForm(true)} 
          disabled={showCreateForm}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Webhook
        </Button>
      </div>
      
      {/* Create/Edit Form */}
      {(showCreateForm || editingWebhook) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingWebhook ? 'Edit Webhook' : 'Create New Webhook'}</CardTitle>
            <CardDescription>
              {editingWebhook 
                ? 'Update your webhook configuration' 
                : 'Configure a new webhook to receive event notifications'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">Webhook URL</Label>
                <Input
                  id="url"
                  name="url"
                  placeholder="https://example.com/webhook"
                  value={formData.url}
                  onChange={handleInputChange}
                />
                <p className="text-xs text-muted-foreground">
                  The URL where webhook events will be sent via HTTP POST
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Webhook for handling address verification events"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
              
              {!editingWebhook && (
                <div className="space-y-2">
                  <Label htmlFor="secret">Webhook Secret (optional)</Label>
                  <Input
                    id="secret"
                    name="secret"
                    type="password"
                    placeholder="••••••••"
                    value={formData.secret}
                    onChange={handleInputChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    Used to sign webhook payloads so you can verify their authenticity
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label>Events to Subscribe</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {availableEvents.map(event => (
                    <div key={event.id} className="flex items-start space-x-2">
                      <Checkbox 
                        id={`event-${event.id}`}
                        checked={formData.events.includes(event.id)}
                        onCheckedChange={() => handleEventToggle(event.id)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label
                          htmlFor={`event-${event.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {event.name}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {event.id}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={editingWebhook ? cancelEdit : () => setShowCreateForm(false)}
            >
              Cancel
            </Button>
            <Button onClick={editingWebhook ? handleEditWebhook : handleCreateWebhook}>
              {editingWebhook ? 'Update Webhook' : 'Create Webhook'}
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {/* Webhooks List */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading webhooks...</p>
        </div>
      ) : webhooks.length === 0 && !showCreateForm ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">No webhooks configured for this application</p>
            <Button onClick={() => setShowCreateForm(true)}>Add Your First Webhook</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {webhooks.map(webhook => (
            <Card key={webhook.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base font-medium">{webhook.url}</CardTitle>
                    <CardDescription>
                      {webhook.metadata?.description || 'No description provided'}
                    </CardDescription>
                  </div>
                  <Badge variant={webhook.is_active ? "success" : "secondary"}>
                    {webhook.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">Events:</span>
                    {webhook.events.map(event => (
                      <Badge key={event} variant="outline" className="text-xs">
                        {event}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="inline-flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Last triggered: {formatTimestamp(webhook.last_triggered_at)}
                    </span>
                    {webhook.failure_count > 0 && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Delivery Issues</AlertTitle>
                        <AlertDescription>
                          This webhook has failed {webhook.failure_count} times.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <div className="flex justify-between w-full">
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      onClick={() => handleToggleActive(webhook)}
                    >
                      {webhook.is_active ? (
                        <>
                          <X className="h-4 w-4 mr-1" />
                          Disable
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Enable
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestWebhook(webhook.id)}
                    >
                      <Zap className="h-4 w-4 mr-1" />
                      Test
                    </Button>
                  </div>
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mr-2"
                      onClick={() => startEdit(webhook)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => startDelete(webhook.id)}
                    >
                      <Trash className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this webhook? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteWebhook}
            >
              Delete Webhook
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WebhookManager;
