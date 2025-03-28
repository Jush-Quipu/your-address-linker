
import WalletConnectProvider from '@walletconnect/web3-provider';
import { ethers } from 'ethers';
import { toast } from 'sonner';

export interface WalletInfo {
  address: string;
  chainId: string | number;
  balance: string;
  provider: any;
  providerType: string;
}

export interface WalletProvider {
  name: string;
  icon: string;
  description: string;
  connect: () => Promise<WalletInfo | null>;
  disconnect: () => Promise<void>;
  isInstalled: () => boolean;
}

// MetaMask Provider
export const metaMaskProvider: WalletProvider = {
  name: 'MetaMask',
  icon: 'metamask',
  description: 'Connect to your MetaMask Wallet',
  
  isInstalled: () => {
    return typeof window !== 'undefined' && window.ethereum !== undefined;
  },
  
  connect: async () => {
    if (!metaMaskProvider.isInstalled()) {
      toast.error('MetaMask is not installed');
      return null;
    }
    
    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts && accounts.length > 0) {
        // Create ethers provider
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        
        // Get network and balance
        const network = await provider.getNetwork();
        const balance = ethers.utils.formatEther(await provider.getBalance(address));
        
        return {
          address,
          chainId: network.chainId,
          balance,
          provider,
          providerType: 'metamask'
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      toast.error('Failed to connect to MetaMask');
      return null;
    }
  },
  
  disconnect: async () => {
    // MetaMask doesn't support programmatic disconnect
    // We just clear our local state
    return Promise.resolve();
  }
};

// WalletConnect Provider
export const walletConnectProvider: WalletProvider = {
  name: 'WalletConnect',
  icon: 'walletconnect',
  description: 'Scan with WalletConnect to connect',
  
  isInstalled: () => true, // WalletConnect doesn't require installation
  
  connect: async () => {
    try {
      const provider = new WalletConnectProvider({
        infuraId: "27e484dcd9e3efcfd25a83a78777cdf1", // A basic Infura ID for demo purposes
        rpc: {
          1: "https://mainnet.infura.io/v3/27e484dcd9e3efcfd25a83a78777cdf1",
          5: "https://goerli.infura.io/v3/27e484dcd9e3efcfd25a83a78777cdf1",
          137: "https://polygon-rpc.com",
          80001: "https://rpc-mumbai.maticvigil.com"
        },
        qrcodeModalOptions: {
          mobileLinks: [
            'rainbow',
            'metamask',
            'argent',
            'trust',
            'imtoken',
            'pillar'
          ],
        },
      });
      
      // Enable session (triggers QR Code modal)
      await provider.enable();
      
      // Create Web3Provider using the WalletConnect provider
      const web3Provider = new ethers.providers.Web3Provider(provider);
      const signer = web3Provider.getSigner();
      const address = await signer.getAddress();
      
      // Get network and balance
      const network = await web3Provider.getNetwork();
      const balance = ethers.utils.formatEther(await web3Provider.getBalance(address));
      
      // Setup disconnect event listener
      provider.on("disconnect", () => {
        toast.info("WalletConnect session ended");
      });
      
      return {
        address,
        chainId: network.chainId,
        balance,
        provider: web3Provider,
        providerType: 'walletconnect'
      };
    } catch (error) {
      console.error('Error connecting with WalletConnect:', error);
      toast.error('Failed to connect with WalletConnect');
      return null;
    }
  },
  
  disconnect: async () => {
    try {
      // Get the cached provider instance
      const cachedProvider = localStorage.getItem('walletconnect');
      if (cachedProvider) {
        const parsedProvider = JSON.parse(cachedProvider);
        if (parsedProvider.connected) {
          const provider = new WalletConnectProvider({
            infuraId: "27e484dcd9e3efcfd25a83a78777cdf1"
          });
          await provider.disconnect();
        }
      }
      
      // Clear cache
      localStorage.removeItem('walletconnect');
    } catch (error) {
      console.error('Error disconnecting WalletConnect:', error);
    }
  }
};

// Available wallet providers
export const walletProviders: WalletProvider[] = [
  metaMaskProvider,
  walletConnectProvider
];

// Connect to wallet helper function
export const connectWallet = async (providerType: 'metamask' | 'walletconnect'): Promise<WalletInfo | null> => {
  try {
    if (providerType === 'metamask') {
      return await metaMaskProvider.connect();
    } else if (providerType === 'walletconnect') {
      return await walletConnectProvider.connect();
    }
    
    throw new Error(`Unsupported provider type: ${providerType}`);
  } catch (error) {
    console.error('Error connecting wallet:', error);
    toast.error('Failed to connect wallet');
    return null;
  }
};

// Get wallet provider by type
export const getWalletProvider = (providerType: string): WalletProvider => {
  if (providerType === 'metamask') return metaMaskProvider;
  if (providerType === 'walletconnect') return walletConnectProvider;
  throw new Error(`Unsupported provider type: ${providerType}`);
};
