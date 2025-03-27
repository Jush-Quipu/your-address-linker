
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WebhookManager from '@/components/WebhookManager';
import WebhookDetails from '@/components/WebhookDetails';
import { Webhook } from '@/services/webhookService';

interface WebhookManagerTabsProps {
  appId: string;
  appName: string;
}

const WebhookManagerTabs: React.FC<WebhookManagerTabsProps> = ({ appId, appName }) => {
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Handle webhook selection
  const handleSelectWebhook = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
  };

  // Handle webhook update
  const handleWebhookUpdate = () => {
    // Trigger a refresh of webhooks
    setRefreshTrigger(prev => prev + 1);
  };

  // Handle back to list
  const handleBackToList = () => {
    setSelectedWebhook(null);
  };

  return (
    <div className="space-y-4">
      {selectedWebhook ? (
        <div>
          <div className="mb-4">
            <button
              onClick={handleBackToList}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              ← Back to webhook list
            </button>
          </div>
          <WebhookDetails 
            webhook={selectedWebhook} 
            onWebhookUpdate={handleWebhookUpdate} 
          />
        </div>
      ) : (
        <WebhookManager 
          appId={appId} 
          appName={appName} 
          onSelectWebhook={handleSelectWebhook}
          refreshTrigger={refreshTrigger}
        />
      )}
    </div>
  );
};

export default WebhookManagerTabs;
