
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useSecureAddress } from '@/sdk/secureaddress-bridge-sdk';
import { connectWallet, formatAddress, getCurrentChainId, CHAINS } from '@/utils/blockchain';
import { toast } from 'sonner';
import { Shield, AlertCircle, Check, Wallet, Key, Link as LinkIcon } from 'lucide-react';

const Connect: React.FC = () => {
  const navigate = useNavigate();
  const { sdk, user, isAuthenticated, wallets, refreshWallets } = useSecureAddress();
  const [connecting, setConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('connect');

  useEffect(() => {
    // Check if wallet is already connected
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            setWalletAddress(accounts[0]);
            
            const chainId = await getCurrentChainId();
            setChainId(chainId);
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };
    
    checkWalletConnection();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        } else {
          setWalletAddress(null);
        }
      });
      
      window.ethereum.on('chainChanged', (chainId: string) => {
        setChainId(chainId);
      });
    }
    
    return () => {
      // Remove listeners
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  const handleConnectWallet = async () => {
    setConnecting(true);
    try {
      const address = await connectWallet();
      if (address) {
        setWalletAddress(address);
        const chainId = await getCurrentChainId();
        setChainId(chainId);
        toast.success('Wallet connected');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  };

  const handleLinkWallet = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to link your wallet');
      navigate('/auth');
      return;
    }
    
    if (!walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    setConnecting(true);
    try {
      // Create message for signing to verify ownership
      const message = `I am linking this wallet address ${walletAddress} to my SecureAddress Bridge account ${user?.email || 'User'}`;
      
      // Request signature (implemented in blockchain.ts)
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, walletAddress],
      });
      
      if (signature) {
        // Link wallet to user account
        const response = await sdk.linkAddressToWallet('verified-address-id', walletAddress);
        
        if (response.success) {
          toast.success('Wallet linked successfully');
          await refreshWallets();
          setActiveTab('manage');
        } else {
          throw new Error(response.error);
        }
      }
    } catch (error: any) {
      console.error('Error linking wallet:', error);
      toast.error(error.message || 'Failed to link wallet');
    } finally {
      setConnecting(false);
    }
  };

  // Get the current chain name
  const getChainName = (chainId: string | null) => {
    if (!chainId) return 'Unknown Network';
    
    const chain = Object.values(CHAINS).find(c => c.id === chainId);
    return chain ? chain.name : 'Unknown Network';
  };

  // Wallet status badge
  const WalletStatusBadge = () => {
    if (!walletAddress) {
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Not Connected</Badge>;
    }
    
    const chainName = getChainName(chainId);
    return (
      <div className="flex items-center space-x-2">
        <Badge variant="outline" className="bg-green-100 text-green-800">Connected</Badge>
        <Badge variant="outline" className="bg-blue-100 text-blue-800">{chainName}</Badge>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center mb-8 text-center">
            <Shield className="h-12 w-12 text-primary mb-4" />
            <h1 className="text-3xl font-bold mb-2">Connect Wallet</h1>
            <p className="text-muted-foreground max-w-xl">
              Link your blockchain wallet to your verified physical address for secure, privacy-preserving interactions with services.
            </p>
          </div>

          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full mb-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="connect">Connect Wallet</TabsTrigger>
              <TabsTrigger value="link">Link Address</TabsTrigger>
              <TabsTrigger value="manage">Manage Wallets</TabsTrigger>
            </TabsList>
            
            <TabsContent value="connect" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Connect Your Wallet</span>
                    <WalletStatusBadge />
                  </CardTitle>
                  <CardDescription>
                    Connect your Web3 wallet to interact with blockchain applications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!window.ethereum ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>No Web3 Wallet Detected</AlertTitle>
                      <AlertDescription>
                        Please install MetaMask or another Ethereum wallet to continue. 
                        <a 
                          href="https://metamask.io/download/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary underline ml-1"
                        >
                          Download MetaMask
                        </a>
                      </AlertDescription>
                    </Alert>
                  ) : walletAddress ? (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                        <div>
                          <h3 className="font-medium text-green-800">Wallet Connected</h3>
                          <p className="text-green-700 text-sm mt-1">
                            Your wallet is connected and ready to use with SecureAddress Bridge
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border rounded-md p-4">
                          <p className="text-sm text-muted-foreground mb-1">Wallet Address</p>
                          <p className="font-mono text-sm break-all">{walletAddress}</p>
                        </div>
                        <div className="border rounded-md p-4">
                          <p className="text-sm text-muted-foreground mb-1">Network</p>
                          <p>{getChainName(chainId)}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Wallet className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Wallet Connected</h3>
                      <p className="text-muted-foreground mb-4">
                        Connect your wallet to start using Web3 features
                      </p>
                      <Button onClick={handleConnectWallet} disabled={connecting} className="mx-auto">
                        {connecting ? 'Connecting...' : 'Connect Wallet'}
                      </Button>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  {walletAddress ? (
                    <>
                      <Button variant="outline" onClick={() => setActiveTab('link')}>
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Link to Address
                      </Button>
                      <Button onClick={handleConnectWallet}>
                        Change Wallet
                      </Button>
                    </>
                  ) : (
                    <Button 
                      variant="outline" 
                      onClick={() => window.open('https://ethereum.org/wallets', '_blank')}
                      className="ml-auto"
                    >
                      Learn About Wallets
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="link" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Link Wallet to Address</CardTitle>
                  <CardDescription>
                    Create a private connection between your wallet and verified physical address
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!isAuthenticated ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Authentication Required</AlertTitle>
                      <AlertDescription>
                        Please sign in to link your wallet to your verified address.
                      </AlertDescription>
                    </Alert>
                  ) : !walletAddress ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Wallet Connection Required</AlertTitle>
                      <AlertDescription>
                        Please connect your wallet first before linking it to your address.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                        <h3 className="font-medium text-blue-800 mb-2">What happens when you link?</h3>
                        <ul className="space-y-2 text-blue-700 text-sm">
                          <li className="flex items-start">
                            <Check className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                            <span>Your wallet address and physical address are privately linked using encrypted storage</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                            <span>Zero-knowledge proofs allow you to verify your address without revealing it</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                            <span>You control who can access your address information and for what purpose</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="border rounded-md p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Wallet to Link</p>
                            <p className="font-mono text-sm">{formatAddress(walletAddress)}</p>
                          </div>
                          <Badge variant="outline" className="bg-green-100 text-green-800">Ready</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Address Verification</p>
                            <p className="text-sm">Your verified address will be linked</p>
                          </div>
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                            Verification Required
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => !walletAddress ? setActiveTab('connect') : navigate('/dashboard')}
                  >
                    {!walletAddress ? 'Connect Wallet First' : 'Verify Address First'}
                  </Button>
                  <Button 
                    onClick={handleLinkWallet} 
                    disabled={!isAuthenticated || !walletAddress || connecting}
                  >
                    {connecting ? 'Linking...' : 'Link Wallet & Address'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="manage" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Manage Linked Wallets</CardTitle>
                  <CardDescription>
                    View and manage your linked blockchain wallets
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!isAuthenticated ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Authentication Required</AlertTitle>
                      <AlertDescription>
                        Please sign in to manage your linked wallets.
                      </AlertDescription>
                    </Alert>
                  ) : wallets.length === 0 ? (
                    <div className="text-center py-8">
                      <Key className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Wallets Linked</h3>
                      <p className="text-muted-foreground mb-4">
                        You haven't linked any wallets to your account yet
                      </p>
                      <Button onClick={() => setActiveTab('connect')} className="mx-auto">
                        Connect a Wallet
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {wallets.map((wallet, index) => (
                        <div key={index} className="border rounded-md p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center">
                                <h3 className="font-medium">
                                  {wallet.address === walletAddress ? 'Current Wallet' : `Wallet ${index + 1}`}
                                </h3>
                                {wallet.address === walletAddress && (
                                  <Badge className="ml-2 bg-green-100 text-green-800">Active</Badge>
                                )}
                              </div>
                              <p className="font-mono text-sm mt-1 break-all">{wallet.address}</p>
                            </div>
                            <Badge variant="outline">
                              {wallet.chainId === '0x1' ? 'Ethereum' : 
                               wallet.chainId === '0x89' ? 'Polygon' : 
                               `Chain ID: ${wallet.chainId}`}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center mt-4">
                            <p className="text-sm text-muted-foreground">
                              Connected on {new Date(wallet.connectedAt).toLocaleDateString()}
                            </p>
                            <Button variant="outline" size="sm">Remove</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => setActiveTab('connect')}
                    className="w-full"
                  >
                    {wallets.length > 0 ? 'Add Another Wallet' : 'Connect a Wallet'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="bg-muted rounded-lg p-4 text-center mb-8">
            <h3 className="text-lg font-medium mb-2">How It Works</h3>
            <p className="text-muted-foreground mb-4">
              SecureAddress Bridge uses advanced cryptography to create a secure link between your blockchain identity and physical address.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4">
                <div className="rounded-full bg-primary/10 h-12 w-12 flex items-center justify-center mx-auto mb-3">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-medium mb-1">Connect Wallet</h4>
                <p className="text-sm text-muted-foreground">
                  Connect your preferred Web3 wallet
                </p>
              </div>
              <div className="p-4">
                <div className="rounded-full bg-primary/10 h-12 w-12 flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-medium mb-1">Verify Address</h4>
                <p className="text-sm text-muted-foreground">
                  Complete a one-time address verification
                </p>
              </div>
              <div className="p-4">
                <div className="rounded-full bg-primary/10 h-12 w-12 flex items-center justify-center mx-auto mb-3">
                  <LinkIcon className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-medium mb-1">Create Link</h4>
                <p className="text-sm text-muted-foreground">
                  Establish an encrypted connection between both
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Connect;
