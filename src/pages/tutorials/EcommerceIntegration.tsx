import React from 'react';
import TutorialLayout from '@/components/TutorialLayout';
import CodeBlock from '@/components/CodeBlock';

const EcommerceIntegration: React.FC = () => {
  const frontendCodeExample = `// Initialize the SDK in your checkout component
import { SecureAddressBridge } from '@secureaddress/bridge-sdk';
import { useState } from 'react';

function CheckoutComponent() {
  const [shippingAddress, setShippingAddress] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const client = new SecureAddressBridge({
    appId: 'YOUR_APP_ID',
    redirectUri: 'https://your-store.com/checkout'
  });
  
  const requestShippingAddress = async () => {
    setIsLoading(true);
    try {
      // Generate state for CSRF protection
      const state = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('secureaddress_state', state);
      
      // Redirect user to the SecureAddress permission screen
      await client.authorize({
        scope: ['street', 'city', 'state', 'postal_code', 'country'],
        expiryDays: 30,
        state
      });
    } catch (error) {
      console.error('Error requesting address:', error);
      setIsLoading(false);
    }
  };
  
  // Call this in your callback page/component
  const handleAddressCallback = async () => {
    try {
      // Verify the authorization was successful
      const result = await client.handleCallback();
      if (result.success) {
        // Fetch the address data
        const data = await client.getAddress();
        setShippingAddress(data.address);
      }
    } catch (error) {
      console.error('Error in callback:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // ... rest of your component
}`;

  const backendCodeExample = `// Example Node.js backend endpoint to process an order
const express = require('express');
const { SecureAddressBridgeServer } = require('@secureaddress/bridge-sdk-server');
const router = express.Router();

// Initialize the server-side SDK with your secret key
const bridgeClient = new SecureAddressBridgeServer({
  apiKey: process.env.SECUREADDRESS_API_KEY
});

// Endpoint to process an order with a SecureAddress permission token
router.post('/api/orders', async (req, res) => {
  try {
    const { products, addressToken, paymentInfo } = req.body;
    
    // Validate the address token and retrieve the address
    const addressData = await bridgeClient.getAddressFromToken(addressToken);
    
    if (!addressData) {
      return res.status(401).json({ error: 'Invalid address token' });
    }
    
    // Now you can use the address data to calculate shipping
    // without storing it permanently in your database
    const shippingCost = calculateShipping(
      addressData.country, 
      addressData.postal_code,
      products
    );
    
    // Process the order
    const order = await createOrder({
      products,
      addressToken, // Store the token, not the address
      shippingCost,
      total: calculateTotal(products, shippingCost),
      paymentInfo
    });
    
    // Pass the order to your shipping provider
    await notifyShippingProvider({
      orderId: order.id,
      addressData, // Send address directly to shipping provider
      products
    });
    
    return res.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error('Order processing error:', error);
    return res.status(500).json({ error: 'Failed to process order' });
  }
});

module.exports = router;`;

  return (
    <TutorialLayout 
      title="E-commerce Integration Tutorial" 
      description="Learn how to integrate SecureAddress Bridge into your e-commerce checkout flow"
      previousTutorial={null}
      nextTutorial={{
        slug: 'web3-wallet-linking',
        title: 'Web3 Wallet Linking'
      }}
    >
      <h2>Introduction</h2>
      <p>
        One of the most common use cases for SecureAddress Bridge is integrating it into an e-commerce checkout flow. 
        This allows you to:
      </p>
      <ul>
        <li>Securely access customer shipping addresses without storing sensitive data</li>
        <li>Ensure addresses are verified and accurate</li>
        <li>Simplify the checkout experience for returning customers</li>
        <li>Implement privacy-preserving shipping processes</li>
      </ul>
      
      <h2>Prerequisites</h2>
      <p>Before you begin this tutorial, make sure you have:</p>
      <ul>
        <li>An active SecureAddress Bridge developer account</li>
        <li>Your application registered in the developer portal with valid redirect URIs</li>
        <li>The SecureAddress Bridge SDK installed in your project</li>
      </ul>
      
      <h2>Step 1: Install the SDK</h2>
      <p>
        Start by installing the SecureAddress Bridge SDK in your project:
      </p>
      <CodeBlock
        code="npm install @secureaddress/bridge-sdk"
        language="bash"
        showLineNumbers={false}
      />
      
      <h2>Step 2: Initialize the SDK in Your Checkout Component</h2>
      <p>
        In your checkout component, initialize the SDK with your application ID and redirect URI:
      </p>
      <CodeBlock
        code={frontendCodeExample}
        language="javascript"
        showLineNumbers={true}
      />
      
      <h2>Step 3: Set Up the Server-Side Integration</h2>
      <p>
        For a complete e-commerce integration, you'll want to set up server-side components that can validate address tokens
        and send shipping information to carriers without exposing customer addresses in your database.
      </p>
      <CodeBlock
        code={backendCodeExample}
        language="javascript"
        showLineNumbers={true}
      />
      
      <h2>Step 4: Implement the Checkout UI</h2>
      <p>
        In your checkout form, add a button or option for users to use SecureAddress Bridge:
      </p>
      <CodeBlock
        code={`// Checkout form component
function ShippingAddressSection() {
  // ... other form code
  
  return (
    <div className="shipping-address-section">
      <h3>Shipping Address</h3>
      
      {shippingAddress ? (
        <div className="address-display">
          <p>{shippingAddress.street}</p>
          <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postal_code}</p>
          <p>{shippingAddress.country}</p>
          <button onClick={() => setShippingAddress(null)}>Change Address</button>
        </div>
      ) : (
        <div className="address-options">
          <button 
            onClick={requestShippingAddress}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Use SecureAddress Bridge'}
          </button>
          <p className="text-sm text-muted">
            Securely access your verified address without sharing your data.
          </p>
          
          {/* Option to manually enter address */}
          <div className="manual-option">
            <button onClick={() => setShowManualForm(true)}>
              Enter Address Manually
            </button>
          </div>
        </div>
      )}
    </div>
  );
}`}
        language="javascript"
        showLineNumbers={true}
      />
      
      <h2>Step 5: Implement Blind Shipping (Optional)</h2>
      <p>
        For enhanced privacy, you can implement blind shipping so that the sender never sees the recipient's address:
      </p>
      <ul>
        <li>Configure your shipping provider integration to use SecureAddress tokens directly</li>
        <li>Use the SecureAddress Bridge API to generate shipping labels without exposing addresses to your system</li>
        <li>Implement customer notification systems that don't require you to know their exact address</li>
      </ul>
      
      <h2>Testing Your Integration</h2>
      <p>
        SecureAddress Bridge provides a sandbox environment for testing your integration. To use it:
      </p>
      <ol>
        <li>Set your SDK to sandbox mode: <code>new SecureAddressBridge({ appId: 'YOUR_APP_ID', sandbox: true })</code></li>
        <li>Use test accounts from the developer portal for authentication</li>
        <li>Test the complete checkout flow, including address selection and order completion</li>
      </ol>
      
      <h2>Best Practices</h2>
      <p>When implementing SecureAddress Bridge in your e-commerce flow:</p>
      <ul>
        <li>Always validate address tokens server-side before processing orders</li>
        <li>Implement proper error handling for cases when users deny permission</li>
        <li>Store address tokens rather than the addresses themselves to maintain privacy</li>
        <li>Set appropriate expiration times for address permissions based on your use case</li>
        <li>Clearly communicate the privacy benefits to your users to increase adoption</li>
      </ul>
      
      <h2>Next Steps</h2>
      <p>
        Now that you've integrated SecureAddress Bridge into your checkout flow, consider exploring:
      </p>
      <ul>
        <li>Web3 wallet linking for blockchain-verified shipping</li>
        <li>Setting up webhooks to receive real-time address update notifications</li>
        <li>Implementing zero-knowledge proofs for advanced verification needs</li>
      </ul>
    </TutorialLayout>
  );
};

export default EcommerceIntegration;
