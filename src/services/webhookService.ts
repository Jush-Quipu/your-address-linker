
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Webhook {
  id: string;
  app_id: string;
  url: string;
  events: string[];
  is_active: boolean;
  failure_count: number;
  last_triggered_at: string | null;
  created_at: string;
  updated_at: string;
  metadata?: {
    description?: string;
  };
}

export interface WebhookCreateParams {
  app_id: string;
  url: string;
  events: string[];
  description?: string;
  secret?: string;
}

export interface WebhookUpdateParams {
  url?: string;
  events?: string[];
  is_active?: boolean;
  description?: string;
}

// Function to register a new webhook
export const registerWebhook = async (params: WebhookCreateParams): Promise<Webhook> => {
  try {
    const { data: token } = await supabase.auth.getSession();
    if (!token.session) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${supabase.supabaseUrl}/functions/v1/register-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.session.access_token}`
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to register webhook');
    }

    const result = await response.json();
    
    toast.success('Webhook registered successfully', {
      description: 'Your webhook has been registered and is ready to receive events.'
    });
    
    return result.data;
  } catch (error) {
    console.error('Error registering webhook:', error);
    toast.error('Failed to register webhook', {
      description: error instanceof Error ? error.message : 'Unknown error occurred'
    });
    throw error;
  }
};

// Function to get all webhooks for the user
export const getWebhooks = async (appId?: string): Promise<Webhook[]> => {
  try {
    const { data: token } = await supabase.auth.getSession();
    if (!token.session) {
      throw new Error('Authentication required');
    }

    const url = new URL(`${supabase.supabaseUrl}/functions/v1/manage-webhooks`);
    if (appId) {
      url.searchParams.append('app_id', appId);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.session.access_token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch webhooks');
    }

    const result = await response.json();
    return result.data.webhooks;
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    toast.error('Failed to fetch webhooks', {
      description: error instanceof Error ? error.message : 'Unknown error occurred'
    });
    throw error;
  }
};

// Function to get a single webhook by ID
export const getWebhook = async (webhookId: string): Promise<Webhook> => {
  try {
    const { data: token } = await supabase.auth.getSession();
    if (!token.session) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${supabase.supabaseUrl}/functions/v1/manage-webhooks/${webhookId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.session.access_token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch webhook');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching webhook:', error);
    toast.error('Failed to fetch webhook', {
      description: error instanceof Error ? error.message : 'Unknown error occurred'
    });
    throw error;
  }
};

// Function to update a webhook
export const updateWebhook = async (webhookId: string, params: WebhookUpdateParams): Promise<Webhook> => {
  try {
    const { data: token } = await supabase.auth.getSession();
    if (!token.session) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${supabase.supabaseUrl}/functions/v1/manage-webhooks/${webhookId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.session.access_token}`
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update webhook');
    }

    const result = await response.json();
    
    toast.success('Webhook updated successfully', {
      description: 'Your webhook settings have been updated.'
    });
    
    return result.data.webhook;
  } catch (error) {
    console.error('Error updating webhook:', error);
    toast.error('Failed to update webhook', {
      description: error instanceof Error ? error.message : 'Unknown error occurred'
    });
    throw error;
  }
};

// Function to delete a webhook
export const deleteWebhook = async (webhookId: string): Promise<void> => {
  try {
    const { data: token } = await supabase.auth.getSession();
    if (!token.session) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${supabase.supabaseUrl}/functions/v1/manage-webhooks/${webhookId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token.session.access_token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete webhook');
    }
    
    toast.success('Webhook deleted successfully', {
      description: 'Your webhook has been removed.'
    });
  } catch (error) {
    console.error('Error deleting webhook:', error);
    toast.error('Failed to delete webhook', {
      description: error instanceof Error ? error.message : 'Unknown error occurred'
    });
    throw error;
  }
};

// Function to test a webhook
export const testWebhook = async (webhookId: string): Promise<void> => {
  try {
    const { data: token } = await supabase.auth.getSession();
    if (!token.session) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${supabase.supabaseUrl}/functions/v1/manage-webhooks/${webhookId}/test`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.session.access_token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to test webhook');
    }
    
    toast.success('Webhook test sent successfully', {
      description: 'A test event has been sent to your webhook endpoint.'
    });
  } catch (error) {
    console.error('Error testing webhook:', error);
    toast.error('Failed to test webhook', {
      description: error instanceof Error ? error.message : 'Unknown error occurred'
    });
    throw error;
  }
};

// Function to get webhook delivery history
export const getWebhookDeliveries = async (webhookId: string): Promise<any[]> => {
  try {
    const { data: token } = await supabase.auth.getSession();
    if (!token.session) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${supabase.supabaseUrl}/functions/v1/manage-webhooks/${webhookId}/deliveries`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.session.access_token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch webhook deliveries');
    }

    const result = await response.json();
    return result.data.deliveries;
  } catch (error) {
    console.error('Error fetching webhook deliveries:', error);
    toast.error('Failed to fetch webhook deliveries', {
      description: error instanceof Error ? error.message : 'Unknown error occurred'
    });
    throw error;
  }
};

// Function to retry a failed webhook delivery
export const retryWebhookDelivery = async (webhookId: string, deliveryId: string): Promise<void> => {
  try {
    const { data: token } = await supabase.auth.getSession();
    if (!token.session) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${supabase.supabaseUrl}/functions/v1/manage-webhooks/${webhookId}/deliveries/${deliveryId}/retry`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.session.access_token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to retry webhook delivery');
    }
    
    toast.success('Webhook delivery retry initiated', {
      description: 'The webhook delivery is being retried.'
    });
  } catch (error) {
    console.error('Error retrying webhook delivery:', error);
    toast.error('Failed to retry webhook delivery', {
      description: error instanceof Error ? error.message : 'Unknown error occurred'
    });
    throw error;
  }
};
