
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { walletProviders } from '@/utils/walletProviders';
import { toast } from 'sonner';
import { Wallet, QrCode, AlertCircle } from 'lucide-react';

interface WalletSelectorProps {
  onSelect: (providerType: string) => void;
  isLoading: boolean;
}

const WalletSelector: React.FC<WalletSelectorProps> = ({ onSelect, isLoading }) => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">Connect Wallet</CardTitle>
        <CardDescription>
          Choose a wallet provider to connect your wallet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {walletProviders.map((provider) => (
          <Button
            key={provider.name}
            variant="outline"
            className="w-full flex justify-between items-center p-3 h-auto"
            disabled={isLoading || (!provider.isInstalled() && provider.name === 'MetaMask')}
            onClick={() => onSelect(provider.name.toLowerCase())}
          >
            <div className="flex items-center">
              {provider.name === 'MetaMask' ? (
                <Wallet className="h-5 w-5 mr-2 text-orange-500" />
              ) : (
                <QrCode className="h-5 w-5 mr-2 text-blue-500" />
              )}
              <span>{provider.name}</span>
            </div>
            {provider.name === 'MetaMask' && !provider.isInstalled() && (
              <span className="text-xs text-red-500">Not installed</span>
            )}
          </Button>
        ))}

        {walletProviders.some(p => p.name === 'MetaMask' && !p.isInstalled()) && (
          <div className="p-3 bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 rounded-lg text-sm flex items-start">
            <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">MetaMask not detected</p>
              <p className="mt-1">
                <a 
                  href="https://metamask.io/download/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  Install MetaMask
                </a> to connect with this provider.
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Your wallet data never leaves your device
      </CardFooter>
    </Card>
  );
};

export default WalletSelector;
