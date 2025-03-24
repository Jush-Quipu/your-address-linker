
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const features = [
  {
    title: "Web3 & Web2 Hybrid Authentication",
    description: "Connect with MetaMask, WalletConnect or use traditional email/password for a seamless experience regardless of crypto expertise.",
    delay: "0"
  },
  {
    title: "Verifiable Home Address",
    description: "Securely verify your physical address through our multi-step verification process without exposing sensitive data.",
    delay: "100"
  },
  {
    title: "Privacy-First Approach",
    description: "Your wallet address and home address are never directly exposed, protecting your identity and personal information.",
    delay: "200"
  },
  {
    title: "Granular Sharing Controls",
    description: "Grant one-time, time-limited, or recurring permissions to dApps and services on your terms.",
    delay: "300"
  },
  {
    title: "End-to-End Encryption",
    description: "All sensitive data is encrypted using industry-leading protocols, ensuring your information stays secure.",
    delay: "400"
  },
  {
    title: "Developer-Friendly Integration",
    description: "APIs and SDKs make it easy for dApps to request home addresses with user consent, while respecting privacy.",
    delay: "500"
  }
];

const Features: React.FC = () => {
  return (
    <section id="features" className="py-20 px-6 md:px-12 bg-secondary/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Key Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Our platform combines the best of Web3 security with Web2 usability to create a seamless, privacy-preserving experience.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className={`animate-fade-up animate-delay-${feature.delay} border bg-card shadow-sm hover:shadow-md transition-shadow duration-300`}>
              <CardHeader>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-foreground/80">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
