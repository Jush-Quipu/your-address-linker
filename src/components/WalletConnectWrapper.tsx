
import React, { useState } from 'react';
import WalletSelector from './WalletSelector';
import { toast } from 'sonner';
import { debugLog, errorLog } from '@/utils/debug';

interface WalletConnectWrapperProps {
  onWalletSelected?: (address: string) => void;
}

const WalletConnectWrapper: React.FC<WalletConnectWrapperProps> = ({ onWalletSelected }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleWalletSelect = async (providerType: string) => {
    try {
      setIsLoading(true);
      debugLog('WalletConnect', `Attempting to connect with provider: ${providerType}`);
      
      // For this implementation, we'll focus only on MetaMask
      if (providerType === 'metamask') {
        if (!window.ethereum) {
          const error = 'MetaMask is not installed';
          errorLog('WalletConnect', error);
          toast.error(error);
          return null;
        }
        
        debugLog('WalletConnect', 'Requesting MetaMask accounts');
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        if (accounts && accounts.length > 0) {
          const selectedAddress = accounts[0];
          debugLog('WalletConnect', 'Wallet connected successfully', selectedAddress);
          toast.success('Wallet connected successfully');
          
          if (onWalletSelected) {
            onWalletSelected(selectedAddress);
          }
          
          return selectedAddress;
        } else {
          errorLog('WalletConnect', 'No accounts returned from MetaMask');
          toast.error('No accounts available');
        }
      } else if (providerType === 'walletconnect') {
        debugLog('WalletConnect', 'WalletConnect support is coming soon');
        toast.info('WalletConnect support is coming soon');
        // Due to polyfill issues, we're temporarily disabling WalletConnect
      } else {
        debugLog('WalletConnect', `Unknown provider type: ${providerType}`);
        toast.error(`Unknown provider: ${providerType}`);
      }
    } catch (error) {
      errorLog('WalletConnect', 'Error connecting wallet:', error);
      toast.error('Failed to connect wallet', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
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
