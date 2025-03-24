
import React from 'react';
import TutorialLayout from '@/components/TutorialLayout';
import CodeBlock from '@/components/CodeBlock';

const WebhookIntegration: React.FC = () => {
  const webhookSetupCode = `// Server setup with Express
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const app = express();

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Your webhook secret from SecureAddress Bridge dashboard
const WEBHOOK_SECRET = process.env.SECUREADDRESS_WEBHOOK_SECRET;

// Verify webhook signature
function verifySignature(payload, signature) {
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const calculatedSignature = hmac.update(JSON.stringify(payload)).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(calculatedSignature, 'hex'),
    Buffer.from(signature, 'hex')
  );
}

// Webhook endpoint for address updates
app.post('/webhooks/address-updates', (req, res) => {
  const signature = req.headers['x-secureaddress-signature'];
  
  // Verify the webhook signature
  if (!signature || !verifySignature(req.body, signature)) {
    console.error('Invalid webhook signature');
    return res.status(401).send('Invalid signature');
  }
  
  const { event, data } = req.body;
  
  switch (event) {
    case 'address.updated':
      // Handle address update
      console.log('Address updated:', data.addressId);
      updateUserAddress(data.userId, data.addressId);
      break;
      
    case 'address.verified':
      // Handle address verification
      console.log('Address verified:', data.addressId);
      markAddressAsVerified(data.userId, data.addressId);
      break;
      
    case 'permission.granted':
      // Handle new permission
      console.log('Permission granted:', data.permissionId);
      processNewPermission(data.permissionId, data.userId, data.clientId);
      break;
      
    case 'permission.revoked':
      // Handle revoked permission
      console.log('Permission revoked:', data.permissionId);
      removeAccessToAddress(data.permissionId);
      break;
      
    default:
      console.log('Unhandled event type:', event);
  }
  
  // Always respond with a 200 to acknowledge receipt
  res.status(200).send('Webhook received');
});

// Start the server
app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});

// Example implementation functions
function updateUserAddress(userId, addressId) {
  // Update user's address in your database
  // e.g., db.users.update({ id: userId }, { addressId });
}

function markAddressAsVerified(userId, addressId) {
  // Mark address as verified in your database
  // e.g., db.addresses.update({ id: addressId }, { verified: true });
}

function processNewPermission(permissionId, userId, clientId) {
  // Process new permission
  // e.g., db.permissions.insert({ id: permissionId, userId, clientId });
}

function removeAccessToAddress(permissionId) {
  // Remove access based on the permission
  // e.g., db.permissions.update({ id: permissionId }, { active: false });
}`;

  const registerWebhookCode = `// Using the SecureAddress Bridge SDK to register webhooks
import { SecureAddressBridgeAdmin } from '@secureaddress/bridge-sdk-admin';

const bridgeAdmin = new SecureAddressBridgeAdmin({
  apiKey: process.env.SECUREADDRESS_API_KEY
});

async function setupWebhooks() {
  try {
    // Register webhook for all address events
    const addressWebhook = await bridgeAdmin.registerWebhook({
      url: 'https://your-app.com/webhooks/address-updates',
      events: [
        'address.updated',
        'address.verified',
        'permission.granted',
        'permission.revoked'
      ],
      description: 'Webhook for all address and permission events'
    });
    
    console.log('Webhook registered successfully:', addressWebhook.id);
    
    // You can register multiple webhooks for different event types
    // or pointing to different endpoints
    const verificationWebhook = await bridgeAdmin.registerWebhook({
      url: 'https://your-app.com/webhooks/verifications-only',
      events: ['address.verified'],
      description: 'Webhook for address verification events only'
    });
    
    console.log('Verification webhook registered:', verificationWebhook.id);
    
  } catch (error) {
    console.error('Error setting up webhooks:', error);
  }
}

// Call the function to set up your webhooks
setupWebhooks();`;

  return (
    <TutorialLayout 
      title="Webhook Integration Tutorial" 
      description="Receive real-time notifications about address changes and permission updates"
      previousTutorial={{
        slug: 'web3-wallet-linking',
        title: 'Web3 Wallet Linking'
      }}
      nextTutorial={{
        slug: 'zk-proofs',
        title: 'Zero-Knowledge Proofs'
      }}
    >
      <h2>Introduction</h2>
      <p>
        Webhooks provide a powerful way to receive real-time notifications about events in the SecureAddress Bridge 
        ecosystem. By implementing webhooks, your application can:
      </p>
      <ul>
        <li>Keep your local data in sync with SecureAddress Bridge</li>
        <li>React immediately to address updates and verification status changes</li>
        <li>Be notified when users grant or revoke permissions</li>
        <li>Build reliable integrations without constant polling</li>
      </ul>
      
      <h2>Prerequisites</h2>
      <p>To implement webhooks with SecureAddress Bridge, you&apos;ll need:</p>
      <ul>
        <li>A publicly accessible HTTPS endpoint to receive webhook events</li>
        <li>Administrator API keys from the SecureAddress Bridge developer portal</li>
        <li>Server-side code to validate and process webhook payloads</li>
      </ul>
      
      <h2>Step 1: Create a Webhook Endpoint</h2>
      <p>
        First, you&apos;ll need to create an HTTP endpoint on your server to receive webhook events. 
        Here&apos;s an example using Express.js:
      </p>
      <CodeBlock
        code={webhookSetupCode}
        language="javascript"
        showLineNumbers={true}
      />
      
      <h2>Step 2: Register Your Webhook</h2>
      <p>
        Once you have your webhook endpoint set up, you need to register it with SecureAddress Bridge:
      </p>
      <CodeBlock
        code={registerWebhookCode}
        language="javascript"
        showLineNumbers={true}
      />
      
      <h2>Step 3: Handle Webhook Events</h2>
      <p>
        When events occur in SecureAddress Bridge, your webhook endpoint will receive HTTP POST requests
        with JSON payloads describing the events. Here are the main event types you&apos;ll receive:
      </p>
      
      <h3>Address Events</h3>
      <ul>
        <li>
          <strong>address.created</strong> - A new address has been added to the system
        </li>
        <li>
          <strong>address.updated</strong> - An existing address has been modified
        </li>
        <li>
          <strong>address.verified</strong> - An address has been verified
        </li>
        <li>
          <strong>address.deleted</strong> - An address has been removed
        </li>
      </ul>
      
      <h3>Permission Events</h3>
      <ul>
        <li>
          <strong>permission.granted</strong> - A user has granted permission to access their address
        </li>
        <li>
          <strong>permission.revoked</strong> - A user has revoked a previously granted permission
        </li>
        <li>
          <strong>permission.expired</strong> - A time-limited permission has reached its expiration date
        </li>
      </ul>
      
      <h3>Wallet Events</h3>
      <ul>
        <li>
          <strong>wallet.linked</strong> - A wallet has been linked to a verified address
        </li>
        <li>
          <strong>wallet.unlinked</strong> - A wallet has been unlinked from an address
        </li>
      </ul>
      
      <h2>Step 4: Implement Webhook Security</h2>
      <p>
        It&apos;s crucial to verify that webhook requests are actually coming from SecureAddress Bridge.
        Each webhook request includes a signature header that you should validate:
      </p>
      <CodeBlock
        code={`// Function to verify webhook signature
function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const calculatedSignature = hmac.update(JSON.stringify(payload)).digest('hex');
  
  // Use a constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(calculatedSignature, 'hex'),
    Buffer.from(signature, 'hex')
  );
}`}
        language="javascript"
        showLineNumbers={true}
      />
      
      <h2>Step 5: Test Your Webhook Integration</h2>
      <p>
        SecureAddress Bridge provides tools to test your webhook integration without triggering real events:
      </p>
      <ol>
        <li>
          <p>
            <strong>Developer Dashboard</strong>: Use the &quot;Test Webhook&quot; feature to send sample events to your endpoint
          </p>
        </li>
        <li>
          <p>
            <strong>Testing API</strong>: Send test events programmatically
          </p>
          <CodeBlock
            code={`// Send a test webhook event
const result = await bridgeAdmin.sendTestWebhook({
  webhookId: 'whk_123456789',
  eventType: 'address.verified',
  payload: {
    userId: 'usr_test123',
    addressId: 'addr_test456'
  }
});

console.log('Test webhook sent:', result.delivered);`}
            language="javascript"
            showLineNumbers={true}
          />
        </li>
      </ol>
      
      <h2>Advanced Webhook Configurations</h2>
      
      <h3>Filtering Events</h3>
      <p>
        You can register webhooks that only receive specific event types:
      </p>
      <CodeBlock
        code={`// Register a webhook for permission events only
const permissionWebhook = await bridgeAdmin.registerWebhook({
  url: 'https://your-app.com/webhooks/permissions',
  events: ['permission.granted', 'permission.revoked', 'permission.expired'],
  description: 'Webhook for permission events only'
});`}
        language="javascript"
        showLineNumbers={true}
      />
      
      <h3>Webhook Retries</h3>
      <p>
        SecureAddress Bridge automatically retries failed webhook deliveries with exponential backoff:
      </p>
      <ul>
        <li>Initial retry after 30 seconds</li>
        <li>Second retry after 5 minutes</li>
        <li>Third retry after 30 minutes</li>
        <li>Final retry after 2 hours</li>
      </ul>
      <p>
        After all retries are exhausted, the webhook is marked as failed and will appear
        in your webhook logs in the developer dashboard.
      </p>
      
      <h3>Webhook Logs</h3>
      <p>
        You can view the delivery status and payload of all webhook attempts in the developer dashboard.
        This is invaluable for debugging issues with your webhook integration.
      </p>
      <CodeBlock
        code={`// Programmatically check webhook delivery status
const deliveryLogs = await bridgeAdmin.getWebhookDeliveries({
  webhookId: 'whk_123456789',
  limit: 10
});

deliveryLogs.forEach(log => {
  console.log(\`Event: \${log.event}, Status: \${log.status}, Time: \${log.timestamp}\`);
});`}
        language="javascript"
        showLineNumbers={true}
      />
      
      <h2>Best Practices</h2>
      <p>When implementing webhooks, follow these best practices:</p>
      
      <ul>
        <li>Always validate webhook signatures to ensure the requests are authentic</li>
        <li>Process webhooks asynchronously to respond quickly (avoid timeouts)</li>
        <li>Implement idempotency to handle duplicate webhook deliveries</li>
        <li>Store webhook events in a queue before processing them</li>
        <li>Implement error handling to manage failed event processing</li>
        <li>Keep your webhook endpoint URLs confidential</li>
      </ul>
      
      <h2>Next Steps</h2>
      <p>
        Now that you&apos;ve implemented webhook integration, consider exploring:
      </p>
      <ul>
        <li>Zero-Knowledge Proofs for enhanced privacy in your application</li>
        <li>Setting up redundant webhook endpoints for high availability</li>
        <li>Implementing event-driven architectures based on webhook events</li>
      </ul>
    </TutorialLayout>
  );
};

export default WebhookIntegration;
