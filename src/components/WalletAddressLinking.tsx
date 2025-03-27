
import React, { useState, useEffect } from 'react';
import { useSecureAddress } from '@/sdk/secureaddress-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface WalletAddressLinkingProps {
  onSuccess?: (linkId: string) => void;
  onError?: (error: string) => void;
}

const WalletAddressLinking: React.FC<WalletAddressLinkingProps> = ({
  onSuccess,
  onError
}) => {
  const {
    isAuthorized,
    zkpProof,
    authorizeZkp,
    walletLinked,
    linkWalletToAddress,
    isLoading,
    error
  } = useSecureAddress();

  const [wallet, setWallet] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number>(1);
  const [linkingInProgress, setLinkingInProgress] = useState<boolean>(false);
  const [linkResult, setLinkResult] = useState<any>(null);

  // Check if MetaMask is available
  useEffect(() => {
    const checkMetaMask = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          // Get the connected accounts
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setWallet(accounts[0]);
            
            // Get the current chain ID
            const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
            setChainId(parseInt(chainIdHex, 16));
          }
        } catch (error) {
          console.error('Error checking MetaMask accounts:', error);
        }
      }
    };
    
    checkMetaMask();
  }, []);

  // Connect to MetaMask
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWallet(accounts[0]);
        
        // Get the current chain ID
        const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
        setChainId(parseInt(chainIdHex, 16));
        
        toast.success('Wallet connected successfully');
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
        toast.error('Failed to connect wallet', {
          description: error instanceof Error ? error.message : 'Unknown error'
        });
        if (onError) {
          onError(error instanceof Error ? error.message : 'Unknown error');
        }
      }
    } else {
      toast.error('MetaMask not found', {
        description: 'Please install MetaMask to use this feature'
      });
      if (onError) {
        onError('MetaMask not found');
      }
    }
  };

  // Generate a ZKP for address association
  const generateAddressProof = async () => {
    try {
      await authorizeZkp({
        proofType: 'address_ownership',
        predicates: [
          {
            field: 'ownership',
            operation: 'equals',
            value: 'verified'
          }
        ],
        expiryDays: 30
      });
    } catch (error) {
      console.error('Error generating address proof:', error);
      toast.error('Failed to generate address proof', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
      if (onError) {
        onError(error instanceof Error ? error.message : 'Unknown error');
      }
    }
  };

  // Link wallet to address using ZKP
  const linkWalletWithZkp = async () => {
    if (!wallet || !zkpProof) {
      toast.error('Wallet or proof missing', {
        description: 'Please connect your wallet and generate a proof first'
      });
      return;
    }
    
    try {
      setLinkingInProgress(true);
      
      const proofId = localStorage.getItem('secureaddress_proof_id');
      const proofToken = localStorage.getItem('secureaddress_proof_token');
      
      if (!proofId || !proofToken) {
        throw new Error('Proof information missing');
      }
      
      const result = await linkWalletToAddress({
        wallet_address: wallet,
        chain_id: chainId,
        proofId,
        proofToken
      });
      
      setLinkResult(result);
      
      if (result.success && result.linked) {
        toast.success('Wallet linked successfully', {
          description: 'Your wallet has been securely linked to your verified address'
        });
        if (onSuccess) {
          onSuccess(result.linkId);
        }
      } else {
        throw new Error(result.error || 'Failed to link wallet');
      }
    } catch (error) {
      console.error('Error linking wallet:', error);
      toast.error('Failed to link wallet', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
      if (onError) {
        onError(error instanceof Error ? error.message : 'Unknown error');
      }
    } finally {
      setLinkingInProgress(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Secure Wallet-Address Linking
        </CardTitle>
        <CardDescription>
          Link your wallet to your verified address using zero-knowledge proofs to maintain privacy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* Wallet Connection */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Step 1: Connect Your Wallet</h3>
          {wallet ? (
            <Alert variant="default" className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle>Wallet Connected</AlertTitle>
              <AlertDescription className="font-mono text-xs truncate">{wallet}</AlertDescription>
            </Alert>
          ) : (
            <Button 
              onClick={connectWallet} 
              variant="outline" 
              className="w-full"
              disabled={isLoading}
            >
              Connect Wallet
            </Button>
          )}
        </div>
        
        {/* Address Proof */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Step 2: Generate Address Proof</h3>
          {zkpProof ? (
            <Alert variant="default" className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle>Address Proof Generated</AlertTitle>
              <AlertDescription>
                Your address has been verified with ZKP
              </AlertDescription>
            </Alert>
          ) : (
            <Button 
              onClick={generateAddressProof} 
              variant="outline" 
              className="w-full"
              disabled={isLoading || !isAuthorized}
            >
              Generate Address Proof
            </Button>
          )}
          {!isAuthorized && (
            <p className="text-xs text-muted-foreground">
              You need to be authorized first to generate an address proof
            </p>
          )}
        </div>
        
        {/* Linking Status */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Step 3: Link Wallet to Address</h3>
          {walletLinked || linkResult?.success ? (
            <Alert variant="default" className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle>Wallet Linked Successfully</AlertTitle>
              <AlertDescription>
                Your wallet is now securely linked to your verified address
              </AlertDescription>
            </Alert>
          ) : (
            <Button 
              onClick={linkWalletWithZkp} 
              className="w-full"
              disabled={isLoading || !wallet || !zkpProof || linkingInProgress}
            >
              {linkingInProgress ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Linking...
                </>
              ) : (
                'Link Wallet to Address'
              )}
            </Button>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center border-t p-4">
        <p className="text-xs text-center text-muted-foreground">
          Your wallet and address are linked using zero-knowledge proofs, ensuring your privacy is preserved.
        </p>
      </CardFooter>
    </Card>
  );
};

export default WalletAddressLinking;
