
import { ethers } from 'ethers';

// Types
export interface WalletInfo {
  address: string;
  chainId: number;
  balance: string;
  provider: ethers.providers.Web3Provider | null;
}

// Default wallet info
export const defaultWalletInfo: WalletInfo = {
  address: '',
  chainId: 0,
  balance: '0',
  provider: null,
};

// Check if MetaMask is installed
export const isMetaMaskInstalled = (): boolean => {
  return typeof window !== 'undefined' && window.ethereum !== undefined;
};

// Connect to MetaMask
export const connectMetaMask = async (): Promise<WalletInfo> => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
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
    };
  } catch (error) {
    console.error('Error connecting to MetaMask:', error);
    throw error;
  }
};

// Get wallet info
export const getWalletInfo = async (provider: ethers.providers.Web3Provider): Promise<WalletInfo> => {
  try {
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    const network = await provider.getNetwork();
    const balance = ethers.utils.formatEther(await provider.getBalance(address));
    
    return {
      address,
      chainId: network.chainId,
      balance,
      provider,
    };
  } catch (error) {
    console.error('Error getting wallet info:', error);
    throw error;
  }
};

// Listen for account changes
export const setupAccountsChangedListener = (callback: (accounts: string[]) => void): void => {
  if (isMetaMaskInstalled()) {
    window.ethereum.on('accountsChanged', callback);
  }
};

// Listen for chain changes
export const setupChainChangedListener = (callback: (chainId: string) => void): void => {
  if (isMetaMaskInstalled()) {
    window.ethereum.on('chainChanged', callback);
  }
};

// Remove listeners
export const removeEventListeners = (): void => {
  if (isMetaMaskInstalled()) {
    window.ethereum.removeAllListeners('accountsChanged');
    window.ethereum.removeAllListeners('chainChanged');
  }
};

// Shorten address for display
export const shortenAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Declare ethereum property on window object for TypeScript
declare global {
  interface Window {
    ethereum: any;
  }
}
