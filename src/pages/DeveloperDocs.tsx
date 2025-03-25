
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ApiDocumentation from '@/components/ApiDocumentation';
import SdkLibraries from '@/components/SdkLibraries';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowDownToLine, Copy, CheckCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import CodeBlock from '@/components/CodeBlock';

const DeveloperDocs: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'api-reference';
  const [copied, setCopied] = useState<string | null>(null);
  const navigate = useNavigate();

  const tutorialOptions = [
    {
      title: 'E-commerce Integration',
      description: 'Learn how to integrate SecureAddress Bridge into your e-commerce checkout flow',
      content: 'This tutorial shows how to streamline your checkout process by securely accessing user shipping addresses without storing sensitive data in your database.',
      url: '/tutorials/ecommerce-integration'
    },
    {
      title: 'Web3 Wallet Linking',
      description: 'Connect verified addresses to blockchain wallets for enhanced trust',
      content: 'Learn how to link verified physical addresses to blockchain wallets and generate verifiable credentials for use in dApps and smart contracts.',
      url: '/tutorials/web3-wallet-linking'
    },
    {
      title: 'Webhook Integration',
      description: 'Receive real-time notifications about address changes and permission updates',
      content: 'Set up secure webhooks to be notified when users update their addresses or modify permissions, allowing your application to stay in sync with user data.',
      url: '/tutorials/webhook-integration'
    },
    {
      title: 'Zero-Knowledge Proofs',
      description: 'Implement advanced privacy features with ZK proofs',
      content: 'Learn how to use zero-knowledge proofs to verify properties about a user\'s address (like country or region) without revealing the complete address information.',
      url: '/tutorials/zk-proofs'
    }
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const handleViewTutorial = (tutorialUrl: string) => {
    navigate(tutorialUrl);
  };

  const navigateToApiTesting = () => {
    navigate('/api-testing');
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Developer Documentation</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Integrate SecureAddress Bridge into your applications to securely access user address information
              with enhanced Web3 capabilities.
            </p>
          </div>
          
          <Tabs defaultValue={tab} onValueChange={handleTabChange} className="w-full mb-12">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
              <TabsTrigger value="api-reference">API Reference</TabsTrigger>
              <TabsTrigger value="sdk">SDK Libraries</TabsTrigger>
              <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
            </TabsList>
            
            <TabsContent value="api-reference">
              <ApiDocumentation />
            </TabsContent>
            
            <TabsContent value="sdk" className="space-y-8">
              <SdkLibraries />
            </TabsContent>
            
            <TabsContent value="tutorials" className="space-y-8">
              <div className="grid gap-6 sm:grid-cols-2">
                {tutorialOptions.map((tutorial, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle>{tutorial.title}</CardTitle>
                      <CardDescription>
                        {tutorial.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {tutorial.content}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full"
                        onClick={() => handleViewTutorial(tutorial.url)}
                      >
                        View Tutorial
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Video Tutorials</CardTitle>
                  <CardDescription>
                    Watch step-by-step guides to integrating SecureAddress Bridge
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                    <p className="text-muted-foreground">Video tutorials coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DeveloperDocs;
