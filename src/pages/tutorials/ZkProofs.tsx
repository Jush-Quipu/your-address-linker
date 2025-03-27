
import React from 'react';
import TutorialLayout from '@/components/TutorialLayout';
import CodeBlock from '@/components/CodeBlock';

const ZkProofs: React.FC = () => {
  const zkpClientCode = `// Client-side implementation using the SecureAddress Bridge ZKP SDK
import { SecureAddressBridge } from 'secureaddress-bridge-sdk';
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
const { SecureAddressBridgeServer } = require('secureaddress-bridge-sdk-server');
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
      
      // Now we can take actions based on these verifications
      // without ever seeing the actual address data
      if (isInUS && isInTargetState) {
        return res.json({
          eligible: true,
          message: 'User is eligible for this service'
        });
      } else {
        return res.json({
          eligible: false,
          message: 'User is not in an eligible location'
        });
      }
    } else {
      return res.status(400).json({
        error: 'Invalid proof',
        message: verification.error
      });
    }
  } catch (error) {
    console.error('Error verifying proof:', error);
    return res.status(500).json({ error: 'Failed to verify proof' });
  }
});

module.exports = router;`;

  const smartContractCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ZkAddressVerifier is Ownable {
    // Mapping from wallet address to verification status for different predicates
    mapping(address => mapping(bytes32 => bool)) public verifiedPredicates;
    
    // Verifier contract address (the SecureAddress Bridge verifier)
    address public verifier;
    
    // Events
    event PredicateVerified(address indexed wallet, bytes32 predicateHash);
    event VerifierChanged(address indexed newVerifier);
    
    constructor(address _verifier) {
        verifier = _verifier;
    }
    
    // Set the verifier address
    function setVerifier(address _verifier) external onlyOwner {
        verifier = _verifier;
        emit VerifierChanged(_verifier);
    }
    
    // Verify a ZK predicate
    function verifyPredicate(
        address wallet, 
        bytes32 predicateHash,
        bytes memory proof
    ) external returns (bool) {
        // Ensure only the trusted verifier can call this
        require(msg.sender == verifier, "Only the verifier can call this function");
        
        // Set the predicate as verified
        verifiedPredicates[wallet][predicateHash] = true;
        
        emit PredicateVerified(wallet, predicateHash);
        return true;
    }
    
    // Check if a wallet has a verified predicate
    function hasVerifiedPredicate(address wallet, bytes32 predicateHash) external view returns (bool) {
        return verifiedPredicates[wallet][predicateHash];
    }
    
    // Helper to generate consistent predicate hashes
    function generatePredicateHash(string memory predicateType, string memory value) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(predicateType, ":", value));
    }
    
    // Example: Check if a wallet is verified to be in a specific country
    function isInCountry(address wallet, string memory countryCode) external view returns (bool) {
        bytes32 predicateHash = keccak256(abi.encodePacked("country:", countryCode));
        return verifiedPredicates[wallet][predicateHash];
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
        Zero-knowledge proofs (ZKPs) provide a powerful way to prove facts about data without revealing the data itself.
        In the context of SecureAddress Bridge, ZKPs enable:
      </p>
      <ul>
        <li>Verifying properties about a user&apos;s address without exposing the complete address</li>
        <li>Proving a user is in a specific region, country, or jurisdiction without revealing their exact location</li>
        <li>Enabling compliance with geographic regulations while preserving user privacy</li>
        <li>Creating location-based dApps with strong privacy guarantees</li>
      </ul>
      
      <h2>Prerequisites</h2>
      <p>Before proceeding with this tutorial, you&apos;ll need:</p>
      <ul>
        <li>An active SecureAddress Bridge developer account</li>
        <li>Familiarity with the SecureAddress Bridge SDK</li>
        <li>Basic understanding of zero-knowledge proofs conceptually</li>
      </ul>
      
      <h2>Step 1: Install Required Dependencies</h2>
      <p>
        First, install the SecureAddress Bridge SDK:
      </p>
      <CodeBlock
        code="npm install @secureaddress/bridge-sdk"
        language="bash"
        showLineNumbers={false}
      />
      
      <h2>Step 2: Implement Client-Side ZKP Authorization</h2>
      <p>
        Create a component that requests and handles zero-knowledge proofs:
      </p>
      <CodeBlock
        code={zkpClientCode}
        language="javascript"
        showLineNumbers={true}
      />
      
      <h2>Step 3: Verify Proofs on the Server</h2>
      <p>
        On your server, implement an endpoint to verify the proofs:
      </p>
      <CodeBlock
        code={zkpServerCode}
        language="javascript"
        showLineNumbers={true}
      />
      
      <h2>Step 4: Blockchain Integration (Optional)</h2>
      <p>
        For Web3 applications, you can integrate ZK proofs with smart contracts:
      </p>
      <CodeBlock
        code={smartContractCode}
        language="solidity"
        showLineNumbers={true}
      />
      
      <h2>How Zero-Knowledge Proofs Work in SecureAddress Bridge</h2>
      <p>
        The SecureAddress Bridge ZKP system works through these key components:
      </p>
      
      <ol>
        <li>
          <strong>Predicate Definition</strong>
          <p>
            A predicate is a statement about an address that can be proven true or false,
            such as &quot;The user&apos;s country is the United States&quot; or &quot;The user&apos;s postal code is within a specific range.&quot;
          </p>
        </li>
        <li>
          <strong>Proof Generation</strong>
          <p>
            When a user authorizes a ZKP request, the SecureAddress Bridge generates a cryptographic
            proof that the predicate is true for their verified address.
          </p>
        </li>
        <li>
          <strong>Proof Verification</strong>
          <p>
            Your application can verify this proof without ever seeing the address data itself.
            The verification process confirms that the predicate is true without revealing any
            information beyond what was explicitly authorized.
          </p>
        </li>
      </ol>
      
      <h2>Available Predicate Types</h2>
      <p>
        SecureAddress Bridge supports the following predicate types:
      </p>
      
      <h3>Equality Predicates</h3>
      <ul>
        <li><strong>equals</strong> - Proves that a field exactly matches a value</li>
        <li><strong>notEquals</strong> - Proves that a field does not match a value</li>
      </ul>
      
      <h3>Set Membership Predicates</h3>
      <ul>
        <li><strong>in</strong> - Proves that a field is one of a set of values</li>
        <li><strong>notIn</strong> - Proves that a field is not in a set of values</li>
      </ul>
      
      <h3>Range Predicates</h3>
      <ul>
        <li><strong>greaterThan</strong> - Proves that a numeric field is greater than a value</li>
        <li><strong>lessThan</strong> - Proves that a numeric field is less than a value</li>
        <li><strong>inRange</strong> - Proves that a numeric field is within a range</li>
      </ul>
      
      <h3>Geographic Predicates</h3>
      <ul>
        <li><strong>withinRadius</strong> - Proves that an address is within a radius of a point</li>
        <li><strong>withinBoundary</strong> - Proves that an address is within a geographic boundary</li>
      </ul>
      
      <h2>Privacy Considerations</h2>
      <p>
        When implementing ZKPs, keep these privacy best practices in mind:
      </p>
      <ul>
        <li>Only request the minimum information needed for your use case</li>
        <li>Be transparent with users about what you&apos;re verifying</li>
        <li>Store proof results securely, ideally without linking them to user identities</li>
        <li>Implement short expiration periods for proofs that may change over time</li>
      </ul>
      
      <h2>Example Use Cases</h2>
      
      <h3>Region-Restricted Content</h3>
      <p>
        Verify a user is in an eligible region without tracking their specific location:
      </p>
      <CodeBlock
        code={`// Client-side
await client.authorizeZkp({
  proofType: 'region_eligibility',
  predicates: [
    {
      field: 'country',
      operation: 'in',
      values: ['US', 'CA', 'MX']
    }
  ],
  expiryDays: 30
});`}
        language="javascript"
        showLineNumbers={true}
      />
      
      <h3>Tax Compliance</h3>
      <p>
        Verify tax jurisdiction without storing address details:
      </p>
      <CodeBlock
        code={`// Client-side
await client.authorizeZkp({
  proofType: 'tax_jurisdiction',
  predicates: [
    {
      field: 'state',
      operation: 'equals',
      value: 'CA'
    }
  ],
  expiryDays: 90
});`}
        language="javascript"
        showLineNumbers={true}
      />
      
      <h3>KYC/AML for DeFi</h3>
      <p>
        Implement compliance checks without compromising privacy:
      </p>
      <CodeBlock
        code={`// Smart contract integration
// This would be called by the SecureAddress Bridge verifier
// after generating and validating the proof
function verifyUserCompliance(address userWallet) external onlyVerifier {
  bytes32 predicateHash = keccak256(abi.encodePacked("compliant_jurisdiction"));
  verifiedPredicates[userWallet][predicateHash] = true;
  emit ComplianceVerified(userWallet);
}`}
        language="solidity"
        showLineNumbers={true}
      />
      
      <h2>Next Steps</h2>
      <p>
        Now that you understand how to implement ZKPs with SecureAddress Bridge, consider exploring:
      </p>
      <ul>
        <li>Combining ZKPs with wallet linking for privacy-preserving Web3 applications</li>
        <li>Implementing complex multi-predicate proofs for sophisticated verification logic</li>
        <li>Creating your own custom verification predicates for specialized use cases</li>
      </ul>
    </TutorialLayout>
  );
};

export default ZkProofs;
