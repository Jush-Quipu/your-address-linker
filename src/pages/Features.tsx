
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, Lock, Users, Globe, Zap, Database } from 'lucide-react';

const FeaturesPage: React.FC = () => {
  const features = [
    {
      title: "Privacy-First Architecture",
      description: "Your physical and blockchain addresses are never directly exposed, ensuring maximum privacy.",
      icon: <Shield className="h-10 w-10 text-primary" />
    },
    {
      title: "Zero-Knowledge Proofs",
      description: "Verify address ownership without revealing sensitive information using advanced cryptography.",
      icon: <Lock className="h-10 w-10 text-primary" />
    },
    {
      title: "Hybrid Authentication",
      description: "Support for both Web3 wallets and traditional login methods for maximum accessibility.",
      icon: <Users className="h-10 w-10 text-primary" />
    },
    {
      title: "Global Address Verification",
      description: "Verify addresses worldwide with our comprehensive geocoding system and proof-of-residence checks.",
      icon: <Globe className="h-10 w-10 text-primary" />
    },
    {
      title: "Granular Permission Controls",
      description: "Precise control over which applications can access your address data and for how long.",
      icon: <Zap className="h-10 w-10 text-primary" />
    },
    {
      title: "End-to-End Encryption",
      description: "All sensitive data is encrypted at rest and in transit with industry-leading security standards.",
      icon: <Database className="h-10 w-10 text-primary" />
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Platform Features</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover how SecureAddress Bridge helps you maintain privacy while connecting your digital and physical worlds.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border border-border">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-foreground/80 text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FeaturesPage;
