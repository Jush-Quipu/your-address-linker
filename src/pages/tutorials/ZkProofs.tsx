
import React from 'react';
import TutorialLayout from '@/components/TutorialLayout';
import CodeBlock from '@/components/CodeBlock';

const ZkProofs: React.FC = () => {
  const zkpClientCode = `// Client-side implementation using the SecureAddress Bridge ZKP SDK
import { SecureAddressBridge } from '@secureaddress/bridge-sdk';
import { useState } from 'react';

function AddressVerificationComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [proofResult, setProofResult] = useState(null);
  
  const client = new SecureAddressBridge({
    appId: 'YOUR_APP_ID',
    redirectUri: 'https://your-app.com/callback'
  });
  
  // Request a zero-knowledge proof about a user's address
  const requestAddressProof = async () => {
    setIsLoading(true);
    try {
      // Generate state for CSRF protection
      const state = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('secureaddress_state', state);
      
      // Request ZKP authorization
      await client.authorizeZkp({
        // What we want to prove about the address
        proofType: 'country_region',
        // Specify the predicates (conditions to prove)
        predicates: [
          {
            field: 'country',
            operation: 'equals',
            value: 'US'
          },
          {
            field: 'state',
            operation: 'in',
            values: ['CA', 'NY', 'TX']
          }
        ],
        expiryDays: 30,
        state
      });
    } catch (error) {
      console.error('Error requesting ZKP:', error);
      setIsLoading(false);
    }
  };
  
  // Handle the callback after user authorizes the ZKP
  const handleZkpCallback = async () => {
    try {
      // Verify the authorization was successful
      const result = await client.handleZkpCallback();
      
      if (result.success) {
        // Get the proof result
        const zkProof = await client.getZkProof();
        setProofResult(zkProof);
      }
    } catch (error) {
      console.error('Error in ZKP callback:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render the component...
}`;

  const zkpServerCode = `// Server-side verification of ZK proofs
const express = require('express');
const { SecureAddressBridgeServer } = require('@secureaddress/bridge-sdk-server');
const router = express.Router();

// Initialize the server-side SDK with your secret key
const bridgeClient = new SecureAddressBridgeServer({
  apiKey: process.env.SECUREADDRESS_API_KEY
});

// Endpoint to verify a ZK proof
router.post('/api/verify-proof', async (req, res) => {
  try {
    const { proofId, proofToken } = req.body;
    
    // Verify the proof
    const verification = await bridgeClient.verifyZkProof({
      proofId,
      proofToken
    });
    
    if (verification.valid) {
      // The proof is valid!
      // verification.predicates contains the predicates that were proven
      
      // Example: Check if user is in the US
      const isInUS = verification.predicates.some(
        p => p.field === 'country' && p.operation === 'equals' && p.value === 'US'
      );
      
      // Example: Check if user is in specific states
      const isInTargetState = verification.predicates.some(
        p => p.field === 'state' && 
             p.operation === 'in' && 
             p.values.some(v => ['CA', 'NY', 'TX'].includes(v))
      );
      
      // Take action based on the verification
      if (isInUS && isInTargetState) {
        return res.json({
          success: true,
          eligible: true,
          message: 'User is eligible for this service'
        });
      } else {
        return res.json({
          success: true,
          eligible: false,
          message: 'User is not in an eligible location'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid proof'
      });
    }
  } catch (error) {
    console.error('Proof verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify proof'
    });
  }
});

module.exports = router;`;

  const zkpSmartContractCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ZkAddressVerifier is Ownable {
    // Trusted verifier address (the SecureAddress Bridge oracle)
    address public verifier;
    
    // Structure to store proof verification status
    struct ProofVerification {
        bool verified;
        uint256 timestamp;
        bytes32 proofHash;
    }
    
    // Mapping from wallet address to verification status
    mapping(address => ProofVerification) public verifications;
    
    // Events
    event ProofVerified(address indexed wallet, bytes32 proofHash);
    event VerifierChanged(address indexed newVerifier);
    
    constructor(address _verifier) {
        verifier = _verifier;
    }
    
    // Change the verifier address
    function setVerifier(address _verifier) external onlyOwner {
        verifier = _verifier;
        emit VerifierChanged(_verifier);
    }
    
    // Verify a ZK proof on-chain (called by the oracle)
    function verifyProof(
        address wallet,
        bytes32 proofHash,
        bytes calldata signature,
        uint256 expiresAt
    ) external returns (bool) {
        // Ensure the caller is the trusted verifier
        require(msg.sender == verifier, "Only the verifier can call this function");
        
        // Verify that the signature is valid
        bytes32 messageHash = keccak256(abi.encodePacked(wallet, proofHash, expiresAt));
        require(recoverSigner(messageHash, signature) == wallet, "Invalid signature");
        
        // Store the verification
        verifications[wallet] = ProofVerification({
            verified: true,
            timestamp: block.timestamp,
            proofHash: proofHash
        });
        
        emit ProofVerified(wallet, proofHash);
        return true;
    }
    
    // Helper function to recover signer from signature
    function recoverSigner(bytes32 messageHash, bytes memory sig) internal pure returns (address) {
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
        
        return ecrecover(messageHash, v, r, s);
    }
    
    // Check if a wallet has a verified proof
    function isVerified(address wallet) external view returns (bool) {
        return verifications[wallet].verified;
    }
    
    // Get full verification details
    function getVerification(address wallet) external view returns (bool, uint256, bytes32) {
        ProofVerification memory verification = verifications[wallet];
        return (verification.verified, verification.timestamp, verification.proofHash);
    }
}`;

  return (
    <TutorialLayout 
      title="Zero-Knowledge Proofs Tutorial" 
      description="Implement advanced privacy features with ZK proofs"
      previousTutorial={{
        slug: 'webhook-integration',
        title: 'Webhook Integration'
      }}
      nextTutorial={null}
    >
      <h2>Introduction</h2>
      <p>
        Zero-Knowledge Proofs (ZKPs) allow you to verify certain properties about data without revealing the data itself.
        In the context of SecureAddress Bridge, ZKPs enable:
      </p>
      <ul>
        <li>Verifying a user is located in a specific country or region without revealing their exact address</li>
        <li>Confirming a shipping address meets certain criteria without exposing the full address</li>
        <li>Proving address ownership on a blockchain without linking to personal information</li>
        <li>Creating privacy-preserving eligibility checks for region-restricted services</li>
      </ul>
      
      <h2>Prerequisites</h2>
      <p>To implement ZK proofs with SecureAddress Bridge, you&apos;ll need:</p>
      <ul>
        <li>An active SecureAddress Bridge developer account with ZKP features enabled</li>
        <li>The SecureAddress Bridge SDK installed in your project</li>
        <li>Basic understanding of cryptographic concepts</li>
      </ul>
      
      <h2>Step 1: Understand ZK Proof Types</h2>
      <p>
        SecureAddress Bridge offers several types of zero-knowledge proofs:
      </p>
      
      <h3>1. Location Proofs</h3>
      <ul>
        <li><strong>country_proof</strong>: Proves a user resides in a specific country</li>
        <li><strong>region_proof</strong>: Proves a user is in a specific state/province/region</li>
        <li><strong>postal_code_prefix</strong>: Proves a user&apos;s postal code begins with specific digits</li>
      </ul>
      
      <h3>2. Address Characteristic Proofs</h3>
      <ul>
        <li><strong>address_type</strong>: Proves an address is residential, commercial, or PO Box</li>
        <li><strong>delivery_zone</strong>: Proves an address is in a specific delivery zone</li>
      </ul>
      
      <h3>3. Verification Status Proofs</h3>
      <ul>
        <li><strong>verification_level</strong>: Proves an address has been verified to a certain level</li>
        <li><strong>verification_date</strong>: Proves when an address was last verified</li>
      </ul>
      
      <h2>Step 2: Implement Client-Side ZKP Requests</h2>
      <p>
        To request a zero-knowledge proof from a user, implement the following in your client application:
      </p>
      <CodeBlock
        code={zkpClientCode}
        language="javascript"
        showLineNumbers={true}
      />
      
      <h2>Step 3: Verify Proofs Server-Side</h2>
      <p>
        Once a user has authorized and generated a ZK proof, you&apos;ll need to verify it in your backend:
      </p>
      <CodeBlock
        code={zkpServerCode}
        language="javascript"
        showLineNumbers={true}
      />
      
      <h2>Step 4: Integrate with Blockchain (Optional)</h2>
      <p>
        For Web3 applications, you can verify ZK proofs on-chain using a smart contract:
      </p>
      <CodeBlock
        code={zkpSmartContractCode}
        language="solidity"
        showLineNumbers={true}
      />
      
      <h2>Advanced ZKP Features</h2>
      
      <h3>Complex Predicates</h3>
      <p>
        You can combine multiple conditions in a single proof:
      </p>
      <CodeBlock
        code={`// Request proof with complex predicates
await client.authorizeZkp({
  proofType: 'address_eligibility',
  predicates: [
    // User must be in the US
    {
      field: 'country',
      operation: 'equals',
      value: 'US'
    },
    // AND in one of these states
    {
      field: 'state',
      operation: 'in',
      values: ['CA', 'NY', 'TX', 'FL', 'IL']
    },
    // AND NOT in these postal codes
    {
      field: 'postal_code',
      operation: 'not_in',
      values: ['90210', '10001', '77001']
    }
  ],
  expiryDays: 30
});`}
        language="javascript"
        showLineNumbers={true}
      />
      
      <h3>Proof Chaining</h3>
      <p>
        For enhanced privacy, you can chain proofs together without revealing the connection:
      </p>
      <CodeBlock
        code={`// First, prove the user is in the US
const countryProof = await client.getZkProof();

// Then, use that proof to request a more specific proof
// without revealing the connection between them
await client.authorizeZkp({
  proofType: 'address_details',
  previousProofId: countryProof.id,
  predicates: [
    {
      field: 'state',
      operation: 'equals',
      value: 'CA'
    }
  ]
});`}
        language="javascript"
        showLineNumbers={true}
      />
      
      <h3>Temporal Conditions</h3>
      <p>
        You can verify conditions about when an address was verified or updated:
      </p>
      <CodeBlock
        code={`// Prove an address was verified in the last 90 days
await client.authorizeZkp({
  proofType: 'verification_freshness',
  predicates: [
    {
      field: 'verification_date',
      operation: 'greater_than',
      value: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]
});`}
        language="javascript"
        showLineNumbers={true}
      />
      
      <h2>Privacy and Security Considerations</h2>
      <p>
        When working with ZK proofs, keep these best practices in mind:
      </p>
      <ul>
        <li>Only request the minimum information needed for your use case</li>
        <li>Set appropriate expiration times for proofs</li>
        <li>Never store the user&apos;s actual address alongside proof verifications</li>
        <li>Use unique proof requests for sensitive operations to prevent replay attacks</li>
        <li>Implement proper error handling for cases where proofs fail verification</li>
      </ul>
      
      <h2>Real-World Applications</h2>
      <p>
        Zero-knowledge proofs enable many privacy-preserving applications:
      </p>
      <ul>
        <li>
          <strong>Geo-Restricted Services</strong>
          <p>Verify a user is in an eligible region without knowing exactly where they live</p>
        </li>
        <li>
          <strong>Regulatory Compliance</strong>
          <p>Implement KYC/AML requirements without storing sensitive user data</p>
        </li>
        <li>
          <strong>DAO Governance</strong>
          <p>Ensure geographic diversity in voting without exposing member locations</p>
        </li>
        <li>
          <strong>Decentralized Commerce</strong>
          <p>Confirm shipping eligibility without revealing customer addresses to smart contracts</p>
        </li>
      </ul>
      
      <h2>Next Steps</h2>
      <p>
        Now that you&apos;ve learned about implementing ZK proofs, consider exploring:
      </p>
      <ul>
        <li>Custom ZK proof types for specific business requirements</li>
        <li>Integrating with ZK rollups for scalable on-chain verification</li>
        <li>Building privacy-preserving marketplaces using SecureAddress Bridge</li>
      </ul>
    </TutorialLayout>
  );
};

export default ZkProofs;
