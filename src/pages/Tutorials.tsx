
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const tutorialsList = [
  {
    slug: 'ecommerce-integration',
    title: 'E-commerce Integration',
    description: 'Learn how to integrate SecureAddress Bridge into your e-commerce checkout flow',
    content: 'This tutorial shows how to streamline your checkout process by securely accessing user shipping addresses without storing sensitive data in your database.',
  },
  {
    slug: 'web3-wallet-linking',
    title: 'Web3 Wallet Linking',
    description: 'Connect verified addresses to blockchain wallets for enhanced trust',
    content: 'Learn how to link verified physical addresses to blockchain wallets and generate verifiable credentials for use in dApps and smart contracts.',
  },
  {
    slug: 'webhook-integration',
    title: 'Webhook Integration',
    description: 'Receive real-time notifications about address changes and permission updates',
    content: 'Set up secure webhooks to be notified when users update their addresses or modify permissions, allowing your application to stay in sync with user data.',
  },
  {
    slug: 'zk-proofs',
    title: 'Zero-Knowledge Proofs',
    description: 'Implement advanced privacy features with ZK proofs',
    content: 'Learn how to use zero-knowledge proofs to verify properties about a user\'s address (like country or region) without revealing the complete address information.',
  }
];

const Tutorials: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Developer Tutorials</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Learn how to integrate SecureAddress Bridge into your applications with these step-by-step tutorials.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            {tutorialsList.map((tutorial) => (
              <Card key={tutorial.slug}>
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
                    onClick={() => navigate(`/tutorials/${tutorial.slug}`)}
                  >
                    View Tutorial
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Tutorials;
