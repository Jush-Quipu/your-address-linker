
import React from 'react';
import TutorialLayout from '@/components/TutorialLayout';
import CodeBlock from '@/components/CodeBlock';

const Web3WalletLinking: React.FC = () => {
  const walletIntegrationCode = `// Initialize both the SecureAddress SDK and ethers.js
import { SecureAddressBridge } from 'secureaddress-bridge-sdk';
import { ethers } from 'ethers';
import { useState, useEffect } from 'react';

function WalletLinkingComponent() {
  const [wallet, setWallet] = useState(null);
  const [addressData, setAddressData] = useState(null);
  const [isLinking, setIsLinking] = useState(false);
  
  // Initialize SecureAddress Bridge client
  const bridgeClient = new SecureAddressBridge({
    appId: 'YOUR_APP_ID',
    redirectUri: 'https://your-app.com/wallet-linking'
  });
  
  // Connect to MetaMask or other provider
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        
        setWallet({
          provider,
          signer,
          address
        });
      } else {
        alert('Please install MetaMask to use this feature');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };
  
  // Request physical address access
  const requestAddress = async () => {
    try {
      const state = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('secureaddress_state', state);
      
      await bridgeClient.authorize({
        scope: ['street', 'city', 'state', 'postal_code', 'country'],
        expiryDays: 365, // Longer expiry for wallet linking
        state
      });
    } catch (error) {
      console.error('Error requesting address:', error);
    }
  };
  
  // Handle callback and link the wallet to address
  const handleCallback = async () => {
    try {
      const result = await bridgeClient.handleCallback();
      if (result.success) {
        const data = await bridgeClient.getAddress();
        setAddressData(data.address);
        
        // If wallet is connected, proceed with linking
        if (wallet) {
          await linkWalletToAddress(wallet.address, data.address);
        }
      }
    } catch (error) {
      console.error('Error in callback:', error);
    }
  };
  
  // Create signed message linking wallet to physical address
  const linkWalletToAddress = async (walletAddress, physicalAddress) => {
    try {
      setIsLinking(true);
      
      // Create a message to sign that links the two addresses
      const message = \`I am linking my Ethereum address \${walletAddress} to my verified physical address with ID \${physicalAddress.id} on SecureAddress Bridge.\`;
      
      // Sign the message with the user's wallet
      const signature = await wallet.signer.signMessage(message);
      
      // Submit the signed verification to SecureAddress Bridge
      const result = await bridgeClient.linkWalletToAddress({
        walletAddress,
        physicalAddressId: physicalAddress.id,
        signedMessage: message,
        signature,
        chainId: (await wallet.provider.getNetwork()).chainId
      });
      
      if (result.success) {
        alert('Your wallet has been linked to your verified address!');
      }
    } catch (error) {
      console.error('Error linking wallet:', error);
    } finally {
      setIsLinking(false);
    }
  };
  
  // Check for callback when component mounts
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has('code')) {
      handleCallback();
    }
  }, []);
  
  return (
    <div>
      <h2>Link Your Wallet to Your Verified Address</h2>
      
      {!wallet ? (
        <button onClick={connectWallet}>
          Connect Wallet
        </button>
      ) : (
        <div>
          <p>Connected: {wallet.address}</p>
          
          {!addressData ? (
            <button onClick={requestAddress}>
              Access Your Verified Address
            </button>
          ) : (
            <div>
              <p>Address verified: {addressData.street}, {addressData.city}</p>
              <button 
                onClick={() => linkWalletToAddress(wallet.address, addressData)}
                disabled={isLinking}
              >
                {isLinking ? 'Linking...' : 'Sign & Link Addresses'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}`;

  const verificationCode = `// Smart contract for verifying address proof on-chain
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AddressVerifier is Ownable {
    // Mapping from wallet address to verification status
    mapping(address => bool) public isVerified;
    
    // Mapping from wallet address to verification timestamp
    mapping(address => uint256) public verificationTimestamp;
    
    // Mapping from wallet address to address hash (privacy-preserving)
    mapping(address => bytes32) public addressHashes;
    
    // Centralized verifier address (SecureAddress Bridge)
    address public verifier;
    
    // Events
    event AddressVerified(address indexed wallet, bytes32 addressHash);
    event VerifierChanged(address indexed newVerifier);
    
    constructor(address _verifier) {
        verifier = _verifier;
    }
    
    // Change the verifier address
    function setVerifier(address _verifier) external onlyOwner {
        verifier = _verifier;
        emit VerifierChanged(_verifier);
    }
    
    // Verify an address (only callable by the trusted verifier)
    function verifyAddress(
        address wallet, 
        bytes32 addressHash, 
        bytes memory signature
    ) external returns (bool) {
        // Verify that the caller is the trusted verifier
        require(msg.sender == verifier, "Only the verifier can call this function");
        
        // Verify the signature matches the wallet
        bytes32 messageHash = keccak256(abi.encodePacked("SecureAddress verification for ", wallet));
        require(recoverSigner(messageHash, signature) == wallet, "Invalid signature");
        
        // Update verification status
        isVerified[wallet] = true;
        verificationTimestamp[wallet] = block.timestamp;
        addressHashes[wallet] = addressHash;
        
        emit AddressVerified(wallet, addressHash);
        return true;
    }
    
    // Recover the signer from signature
    function recoverSigner(bytes32 message, bytes memory sig) internal pure returns (address) {
        require(sig.length == 65, "Invalid signature length");
        
        bytes32 r;
        bytes32 s;
        uint8 v;
        
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
        
        if (v < 27) {
            v += 27;
        }
        
        return ecrecover(message, v, r, s);
    }
    
    // Check if a wallet is address-verified
    function checkVerification(address wallet) external view returns (bool, uint256) {
        return (isVerified[wallet], verificationTimestamp[wallet]);
    }
    
    // Check if a wallet's verification is fresh (less than 6 months old)
    function hasValidVerification(address wallet) external view returns (bool) {
        if (!isVerified[wallet]) {
            return false;
        }
        
        // Verification must be less than 6 months old
        return (block.timestamp - verificationTimestamp[wallet]) < 180 days;
    }
}`;

  return (
    <TutorialLayout 
      title="Web3 Wallet Linking Tutorial" 
      description="Connect verified addresses to blockchain wallets for enhanced trust"
      previousTutorial={{
        slug: 'ecommerce-integration',
        title: 'E-commerce Integration'
      }}
      nextTutorial={{
        slug: 'webhook-integration',
        title: 'Webhook Integration'
      }}
    >
      <h2>Introduction</h2>
      <p>
        Linking verified physical addresses to blockchain wallets creates a powerful bridge between Web2 and Web3.
        It enables applications to:
      </p>
      <ul>
        <li>Verify that wallet owners have legitimate physical addresses</li>
        <li>Create DAO governance systems that consider geographic distribution</li>
        <li>Implement location-based airdrops or promotions</li>
        <li>Build Web3-native shipping and fulfillment systems</li>
      </ul>
      
      <h2>Prerequisites</h2>
      <p>Before proceeding with this tutorial, you should have:</p>
      <ul>
        <li>An active SecureAddress Bridge developer account</li>
        <li>Basic knowledge of Ethereum and ethers.js or Web3.js</li>
        <li>A Web3 application that requires address verification</li>
      </ul>
      
      <h2>Step 1: Install Required Dependencies</h2>
      <p>
        You'll need both the SecureAddress Bridge SDK and a Web3 library:
      </p>
      <CodeBlock
        code="npm install @secureaddress/bridge-sdk ethers"
        language="bash"
        showLineNumbers={false}
      />
      
      <h2>Step 2: Create the Wallet Linking Component</h2>
      <p>
        Create a React component that handles wallet connections and linking:
      </p>
      <CodeBlock
        code={walletIntegrationCode}
        language="javascript"
        showLineNumbers={true}
      />
      
      <h2>Step 3: Deploy a Verification Smart Contract (Optional)</h2>
      <p>
        For on-chain verification, you can deploy a smart contract that stores verification status:
      </p>
      <CodeBlock
        code={verificationCode}
        language="solidity"
        showLineNumbers={true}
      />
      
      <h2>Step 4: Integrate with Zero-Knowledge Proofs</h2>
      <p>
        To enhance privacy while still verifying address properties, you can use zero-knowledge proofs:
      </p>
      <ol>
        <li>
          <strong>Generate ZKPs for address properties</strong>
          <p>
            Use SecureAddress Bridge's ZKP service to generate proofs that verify specific properties 
            about an address (e.g., country, region) without revealing the address itself.
          </p>
        </li>
        <li>
          <strong>Submit proofs to your smart contract</strong>
          <p>
            Add functions to your verification contract that can validate these ZKPs and update 
            verification status accordingly.
          </p>
        </li>
      </ol>
      
      <h2>Step 5: Use the Verification in DApps</h2>
      <p>
        Once a wallet is linked to a verified address, you can use this verification in various ways:
      </p>
      <CodeBlock
        code={`// Example of checking verification status in a DApp
async function checkEligibility(userWallet) {
  // Initialize contract
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const verifierContract = new ethers.Contract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    provider
  );
  
  // Check if wallet has verified address
  const [isVerified, timestamp] = await verifierContract.checkVerification(userWallet);
  
  if (!isVerified) {
    return {
      eligible: false,
      reason: 'No verified address linked to wallet'
    };
  }
  
  // Check if verification is still valid
  const isValid = await verifierContract.hasValidVerification(userWallet);
  
  if (!isValid) {
    return {
      eligible: false,
      reason: 'Address verification has expired'
    };
  }
  
  // Check country/region eligibility (if using ZKPs)
  const isEligibleRegion = await checkRegionEligibility(userWallet);
  
  return {
    eligible: isEligibleRegion,
    reason: isEligibleRegion ? 'Eligible' : 'Region not eligible for this offering'
  };
}`}
        language="javascript"
        showLineNumbers={true}
      />
      
      <h2>Real-World Use Cases</h2>
      <p>
        Wallet-to-address linking enables many practical applications:
      </p>
      <ul>
        <li>
          <strong>Decentralized Commerce</strong>
          <p>Enable Web3-native shipping for NFT physical redemptions or merchandise sales</p>
        </li>
        <li>
          <strong>Sybil Resistance</strong>
          <p>Prevent multiple accounts from a single location in voting systems</p>
        </li>
        <li>
          <strong>Geographic DAOs</strong>
          <p>Create decentralized organizations with geography-based membership or voting power</p>
        </li>
        <li>
          <strong>Regulated DeFi</strong>
          <p>Implement compliant DeFi protocols that require KYC/AML while preserving privacy</p>
        </li>
      </ul>
      
      <h2>Privacy Considerations</h2>
      <p>
        When implementing wallet linking, always consider:
      </p>
      <ul>
        <li>Only store hashed address data on-chain to preserve privacy</li>
        <li>Use ZKPs to verify address properties without revealing the complete address</li>
        <li>Clearly communicate to users what data will be shared and how it will be used</li>
        <li>Implement revocation mechanisms so users can unlink addresses if needed</li>
      </ul>
      
      <h2>Next Steps</h2>
      <p>
        Now that you've implemented wallet linking, consider exploring:
      </p>
      <ul>
        <li>Webhook integration for real-time updates when address status changes</li>
        <li>Advanced ZKP implementations for location-based dApps</li>
        <li>Multi-chain verification for cross-chain applications</li>
      </ul>
    </TutorialLayout>
  );
};

export default Web3WalletLinking;
