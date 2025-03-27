
import { toast } from 'sonner';

/**
 * Utility functions for blockchain interactions
 */

// Define chain types and IDs
export const CHAINS = {
  ETH_MAINNET: {
    id: '0x1',
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/your-infura-key',
    blockExplorer: 'https://etherscan.io'
  },
  ETH_GOERLI: {
    id: '0x5',
    name: 'Goerli Testnet',
    rpcUrl: 'https://goerli.infura.io/v3/your-infura-key',
    blockExplorer: 'https://goerli.etherscan.io'
  },
  POLYGON: {
    id: '0x89',
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com'
  },
  POLYGON_MUMBAI: {
    id: '0x13881',
    name: 'Mumbai Testnet',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    blockExplorer: 'https://mumbai.polygonscan.com'
  }
};

// Check if wallet is connected
export const isWalletConnected = async (): Promise<boolean> => {
  try {
    if (!window.ethereum) {
      return false;
    }
    
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return accounts && accounts.length > 0;
  } catch (error) {
    console.error('Error checking wallet connection:', error);
    return false;
  }
};

// Connect to wallet
export const connectWallet = async (): Promise<string | null> => {
  try {
    if (!window.ethereum) {
      toast.error('No Ethereum wallet detected. Please install MetaMask or another wallet.');
      return null;
    }
    
    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    if (accounts && accounts.length > 0) {
      toast.success('Wallet connected successfully');
      return accounts[0];
    }
    
    return null;
  } catch (error: any) {
    console.error('Error connecting wallet:', error);
    toast.error(error.message || 'Failed to connect wallet');
    return null;
  }
};

// Get current chain ID
export const getCurrentChainId = async (): Promise<string | null> => {
  try {
    if (!window.ethereum) {
      return null;
    }
    
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    return chainId;
  } catch (error) {
    console.error('Error getting chain ID:', error);
    return null;
  }
};

// Switch chain
export const switchChain = async (chainId: string): Promise<boolean> => {
  try {
    if (!window.ethereum) {
      toast.error('No Ethereum wallet detected');
      return false;
    }
    
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    });
    
    return true;
  } catch (error: any) {
    // If the chain has not been added to MetaMask
    if (error.code === 4902) {
      const chain = Object.values(CHAINS).find(c => c.id === chainId);
      
      if (chain) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId,
                chainName: chain.name,
                rpcUrls: [chain.rpcUrl],
                blockExplorerUrls: [chain.blockExplorer],
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error('Error adding chain:', addError);
          toast.error('Failed to add chain to wallet');
          return false;
        }
      }
    }
    
    console.error('Error switching chain:', error);
    toast.error('Failed to switch network');
    return false;
  }
};

// Sign message to verify wallet ownership
export const signMessage = async (message: string): Promise<string | null> => {
  try {
    if (!window.ethereum) {
      toast.error('No Ethereum wallet detected');
      return null;
    }
    
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    
    if (!accounts || accounts.length === 0) {
      toast.error('No wallet connected');
      return null;
    }
    
    const from = accounts[0];
    const msgParams = {
      domain: {
        name: 'SecureAddress Bridge',
        version: '1'
      },
      message: {
        content: message,
        timestamp: Date.now()
      },
      primaryType: 'Verification',
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' }
        ],
        Verification: [
          { name: 'content', type: 'string' },
          { name: 'timestamp', type: 'uint256' }
        ]
      }
    };
    
    const signature = await window.ethereum.request({
      method: 'eth_signTypedData_v4',
      params: [from, JSON.stringify(msgParams)],
    });
    
    return signature;
  } catch (error: any) {
    console.error('Error signing message:', error);
    toast.error(error.message || 'Failed to sign message');
    return null;
  }
};

// Format wallet address for display (e.g., 0x71C7...976F)
export const formatAddress = (address: string, startChars: number = 6, endChars: number = 4): string => {
  if (!address) return '';
  
  if (address.length <= startChars + endChars) {
    return address;
  }
  
  return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
};

// Add blockchain types to the global window object
declare global {
  interface Window {
    ethereum?: any;
  }
}
