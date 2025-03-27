
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event_type: string;
  payload: any;
  status: 'success' | 'failed' | 'pending' | 'retrying';
  status_code: number | null;
  response_body: string | null;
  attempt_count: number;
  created_at: string;
}

// Function to get webhook delivery history
export const getWebhookDeliveries = async (webhookId: string): Promise<WebhookDelivery[]> => {
  try {
    const { data: token } = await supabase.auth.getSession();
    if (!token.session) {
      throw new Error('Authentication required');
    }

    const supabaseUrl = process.env.SUPABASE_URL || supabase.getUrl();
    
    const response = await fetch(`${supabaseUrl}/functions/v1/webhook-deliveries/${webhookId}`, {
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
    return result.data;
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

    const supabaseUrl = process.env.SUPABASE_URL || supabase.getUrl();
    
    const response = await fetch(`${supabaseUrl}/functions/v1/webhook-deliveries/${webhookId}/retry/${deliveryId}`, {
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

// Function to test a webhook with a specific event type
export const testWebhookEvent = async (webhookId: string, eventType: string, customPayload?: any): Promise<void> => {
  try {
    const { data: token } = await supabase.auth.getSession();
    if (!token.session) {
      throw new Error('Authentication required');
    }

    const supabaseUrl = process.env.SUPABASE_URL || supabase.getUrl();
    
    const response = await fetch(`${supabaseUrl}/functions/v1/manage-webhooks/${webhookId}/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.session.access_token}`
      },
      body: JSON.stringify({
        event_type: eventType,
        custom_payload: customPayload
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to test webhook');
    }
    
    toast.success('Webhook test sent successfully', {
      description: `A test ${eventType} event has been sent to your webhook endpoint.`
    });
  } catch (error) {
    console.error('Error testing webhook:', error);
    toast.error('Failed to test webhook', {
      description: error instanceof Error ? error.message : 'Unknown error occurred'
    });
    throw error;
  }
};
