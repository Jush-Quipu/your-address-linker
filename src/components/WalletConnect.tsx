
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { connectMetaMask, WalletInfo, defaultWalletInfo, shortenAddress, isMetaMaskInstalled } from '@/utils/web3';
import { toast } from 'sonner';

interface WalletConnectProps {
  onConnect?: (walletInfo: WalletInfo) => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ onConnect }) => {
  const [loading, setLoading] = useState(false);
  const [walletInfo, setWalletInfo] = useState<WalletInfo>(defaultWalletInfo);
  const [isConnected, setIsConnected] = useState(false);

  const handleConnectMetaMask = async () => {
    setLoading(true);
    try {
      const info = await connectMetaMask();
      setWalletInfo(info);
      setIsConnected(true);
      
      toast.success('Wallet connected successfully!', {
        description: `Connected to ${shortenAddress(info.address)}`,
      });
      
      if (onConnect) {
        onConnect(info);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md w-full mx-auto glass">
      <CardHeader>
        <CardTitle className="text-2xl">Connect Your Wallet</CardTitle>
        <CardDescription>
          Connect your Web3 wallet to start using SecureAddress Bridge.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected ? (
          <div className="p-4 bg-secondary rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Address:</span>
              <span className="text-sm font-mono">{shortenAddress(walletInfo.address)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Network:</span>
              <span className="text-sm">Chain ID: {walletInfo.chainId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Balance:</span>
              <span className="text-sm">{parseFloat(walletInfo.balance).toFixed(4)} ETH</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {!isMetaMaskInstalled() && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
                MetaMask is not installed. Please install MetaMask to continue.
              </div>
            )}
            <Button 
              onClick={handleConnectMetaMask} 
              className="w-full" 
              disabled={loading || !isMetaMaskInstalled()}
            >
              {loading ? 'Connecting...' : 'Connect MetaMask'}
            </Button>
            <div className="text-center text-sm text-muted-foreground mt-2">
              <p>Don't have MetaMask?</p>
              <a 
                href="https://metamask.io/download/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Download MetaMask
              </a>
            </div>
          </div>
        )}
      </CardContent>
      {isConnected && (
        <CardFooter className="flex justify-center">
          <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
            Continue to Dashboard
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default WalletConnect;
