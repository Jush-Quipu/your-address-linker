
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Shield, Lock, FileCheck, History, Bell, Target } from 'lucide-react';

const SecurityPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Security Measures</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Learn how we protect your data and maintain the highest standards of security.
            </p>
          </div>
          
          <div className="space-y-16">
            <section>
              <div className="flex items-center gap-4 mb-6">
                <Shield className="h-8 w-8 text-primary" />
                <h2 className="text-2xl font-bold">End-to-End Encryption</h2>
              </div>
              <p className="text-lg leading-relaxed mb-6">
                All personal data, including your home address and verification documents, are encrypted using
                industry-standard AES-256 encryption. We implement end-to-end encryption to ensure that your 
                data cannot be read by anyone, including our own team, without proper authorization.
              </p>
            </section>
            
            <section>
              <div className="flex items-center gap-4 mb-6">
                <Lock className="h-8 w-8 text-primary" />
                <h2 className="text-2xl font-bold">Zero-Knowledge Architecture</h2>
              </div>
              <p className="text-lg leading-relaxed mb-6">
                Our platform uses zero-knowledge proofs to verify address ownership without revealing the 
                actual address data. This cryptographic approach ensures that services can verify your 
                address without ever seeing the actual details, maintaining your privacy at all times.
              </p>
            </section>
            
            <section>
              <div className="flex items-center gap-4 mb-6">
                <FileCheck className="h-8 w-8 text-primary" />
                <h2 className="text-2xl font-bold">Regular Security Audits</h2>
              </div>
              <p className="text-lg leading-relaxed mb-6">
                We conduct regular third-party security audits of our system. The smart contracts and 
                security protocols are professionally reviewed to identify and address potential 
                vulnerabilities before they become issues.
              </p>
            </section>
            
            <section>
              <div className="flex items-center gap-4 mb-6">
                <History className="h-8 w-8 text-primary" />
                <h2 className="text-2xl font-bold">Immutable Access Logs</h2>
              </div>
              <p className="text-lg leading-relaxed mb-6">
                Every access request to your address information is logged on-chain, creating an 
                immutable record that cannot be altered. You can review who has requested access 
                to your information and when, providing complete transparency.
              </p>
            </section>
            
            <section>
              <div className="flex items-center gap-4 mb-6">
                <Bell className="h-8 w-8 text-primary" />
                <h2 className="text-2xl font-bold">Real-time Alerts</h2>
              </div>
              <p className="text-lg leading-relaxed mb-6">
                Receive instant notifications whenever a service requests access to your address 
                information. You maintain complete control over who can access your data and when.
              </p>
            </section>
            
            <section>
              <div className="flex items-center gap-4 mb-6">
                <Target className="h-8 w-8 text-primary" />
                <h2 className="text-2xl font-bold">Bug Bounty Program</h2>
              </div>
              <p className="text-lg leading-relaxed mb-6">
                We maintain an active bug bounty program, encouraging security researchers to 
                responsibly disclose potential vulnerabilities. This community-driven approach 
                helps us maintain the highest security standards.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SecurityPage;
