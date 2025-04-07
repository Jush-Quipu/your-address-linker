
import React, { useState } from 'react';
import WalletSelector from './WalletSelector';
import { toast } from 'sonner';

interface WalletConnectWrapperProps {
  onWalletSelected?: (address: string) => void;
}

const WalletConnectWrapper: React.FC<WalletConnectWrapperProps> = ({ onWalletSelected }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleWalletSelect = async (providerType: string) => {
    try {
      setIsLoading(true);
      
      // For this implementation, we'll focus only on MetaMask
      if (providerType === 'metamask') {
        if (!window.ethereum) {
          toast.error('MetaMask is not installed');
          return;
        }
        
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          toast.success('Wallet connected successfully');
          
          if (onWalletSelected) {
            onWalletSelected(accounts[0]);
          }
          
          return accounts[0];
        }
      } else {
        toast.info('WalletConnect is currently disabled');
        // In the future, we can re-enable WalletConnect once polyfills are working
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
    
    return null;
  };
  
  return (
    <WalletSelector onSelect={handleWalletSelect} isLoading={isLoading} />
  );
};

export default WalletConnectWrapper;
