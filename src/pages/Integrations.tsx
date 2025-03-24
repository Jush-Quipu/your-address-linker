
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, ShoppingCart, Truck, Wallet } from 'lucide-react';

const IntegrationsPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Integrations</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect SecureAddress Bridge with your favorite platforms and services.
            </p>
          </div>
          
          <Tabs defaultValue="ecommerce" className="w-full">
            <TabsList className="grid grid-cols-1 md:grid-cols-4 w-full max-w-2xl mx-auto mb-8">
              <TabsTrigger value="ecommerce">E-commerce</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
              <TabsTrigger value="wallets">Web3 Wallets</TabsTrigger>
              <TabsTrigger value="developer">Developer</TabsTrigger>
            </TabsList>
            
            <TabsContent value="ecommerce">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <IntegrationCard 
                  title="Shopify" 
                  icon={<ShoppingCart className="h-8 w-8 text-primary" />}
                  description="Integrate with your Shopify store for secure customer shipping without exposing wallet addresses."
                  status="Available"
                />
                <IntegrationCard 
                  title="WooCommerce" 
                  icon={<ShoppingCart className="h-8 w-8 text-primary" />}
                  description="Add SecureAddress Bridge to your WordPress site with our WooCommerce plugin."
                  status="Available"
                />
                <IntegrationCard 
                  title="Magento" 
                  icon={<ShoppingCart className="h-8 w-8 text-primary" />}
                  description="Connect your Magento store with our extension for secure address handling."
                  status="Coming Soon"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="shipping">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <IntegrationCard 
                  title="FedEx" 
                  icon={<Truck className="h-8 w-8 text-primary" />}
                  description="Direct integration with FedEx API for blind shipping and address verification."
                  status="Available"
                />
                <IntegrationCard 
                  title="UPS" 
                  icon={<Truck className="h-8 w-8 text-primary" />}
                  description="Connect with UPS for secure package delivery without exposing customer data."
                  status="Available"
                />
                <IntegrationCard 
                  title="USPS" 
                  icon={<Truck className="h-8 w-8 text-primary" />}
                  description="Verify addresses against USPS database and enable secure shipping."
                  status="Available"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="wallets">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <IntegrationCard 
                  title="MetaMask" 
                  icon={<Wallet className="h-8 w-8 text-primary" />}
                  description="Connect your MetaMask wallet for seamless address verification and sharing."
                  status="Available"
                />
                <IntegrationCard 
                  title="WalletConnect" 
                  icon={<Wallet className="h-8 w-8 text-primary" />}
                  description="Use WalletConnect to link any compatible wallet to your SecureAddress account."
                  status="Available"
                />
                <IntegrationCard 
                  title="Coinbase Wallet" 
                  icon={<Wallet className="h-8 w-8 text-primary" />}
                  description="Direct integration with Coinbase Wallet for secure address verification."
                  status="In Development"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="developer">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <IntegrationCard 
                  title="REST API" 
                  icon={<Code className="h-8 w-8 text-primary" />}
                  description="Full API access for custom integrations with your application or service."
                  status="Available"
                />
                <IntegrationCard 
                  title="JavaScript SDK" 
                  icon={<Code className="h-8 w-8 text-primary" />}
                  description="Easy-to-use JavaScript SDK for frontend and Node.js applications."
                  status="Available"
                />
                <IntegrationCard 
                  title="Smart Contract Library" 
                  icon={<Code className="h-8 w-8 text-primary" />}
                  description="Solidity libraries for on-chain verification and integration."
                  status="Beta"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

interface IntegrationCardProps {
  title: string;
  icon: React.ReactNode;
  description: string;
  status: "Available" | "Beta" | "In Development" | "Coming Soon";
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({ title, icon, description, status }) => {
  const getStatusColor = () => {
    switch (status) {
      case "Available": return "bg-green-100 text-green-800";
      case "Beta": return "bg-blue-100 text-blue-800";
      case "In Development": return "bg-yellow-100 text-yellow-800";
      case "Coming Soon": return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon}
            <CardTitle>{title}</CardTitle>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor()}`}>
            {status}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export default IntegrationsPage;
