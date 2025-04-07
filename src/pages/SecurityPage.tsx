
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Shield, Lock, Eye, FileCheck, Database, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SecurityPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Security & Privacy</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your addresses and wallet information are protected by industry-leading security measures.
            </p>
          </div>
          
          <Tabs defaultValue="overview" className="w-full mb-16">
            <TabsList className="grid grid-cols-1 md:grid-cols-4 w-full max-w-2xl mx-auto mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="data-protection">Data Protection</TabsTrigger>
              <TabsTrigger value="zero-knowledge">Zero Knowledge</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <Shield className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>End-to-End Encryption</CardTitle>
                    <CardDescription>All sensitive data is encrypted in transit and at rest</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      We use AES-256 encryption for all data stored on our servers, and all communications use TLS 1.3 for maximum security.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <Eye className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Zero-Knowledge Architecture</CardTitle>
                    <CardDescription>Privacy-first approach for sensitive information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Our zero-knowledge proofs ensure that address verification can happen without revealing the underlying data.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <FileCheck className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Regulatory Compliance</CardTitle>
                    <CardDescription>Adherence to global privacy standards</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      We maintain compliance with GDPR, CCPA, and other privacy regulations to ensure your data is handled properly.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <Database className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Decentralized Storage</CardTitle>
                    <CardDescription>Leveraging blockchain for enhanced security</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Optional decentralized storage gives you the choice of how and where your verification proofs are stored.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <Lock className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Granular Permissions</CardTitle>
                    <CardDescription>You control who can access your data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Set expiring permissions, one-time access tokens, and revoke access at any time from your dashboard.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <AlertTriangle className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Regular Security Audits</CardTitle>
                    <CardDescription>Continuous security validation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Our platform undergoes regular security audits by independent firms to identify and address potential vulnerabilities.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="data-protection">
              <div className="max-w-3xl mx-auto space-y-6">
                <h2 className="text-2xl font-bold mb-4">Data Protection Measures</h2>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Encryption Methodology</h3>
                  <p className="text-muted-foreground">
                    We employ multiple layers of encryption to protect your sensitive information:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>AES-256 encryption for all stored data</li>
                    <li>TLS 1.3 for all data in transit</li>
                    <li>Homomorphic encryption for performing computations on encrypted data</li>
                    <li>Key rotation protocols to regularly update encryption keys</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Access Controls</h3>
                  <p className="text-muted-foreground">
                    We implement strict access controls to ensure only authorized parties can access your data:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Multi-factor authentication for all staff members</li>
                    <li>Role-based access control with least privilege principles</li>
                    <li>Audit logging of all data access events</li>
                    <li>Automatic session timeouts and access revocation</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="zero-knowledge">
              <div className="max-w-3xl mx-auto space-y-6">
                <h2 className="text-2xl font-bold mb-4">Zero-Knowledge Proofs</h2>
                
                <p className="text-muted-foreground">
                  Our platform leverages zero-knowledge proofs to allow verification without revealing sensitive information:
                </p>
                
                <div className="bg-muted p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">How It Works</h3>
                  <ol className="list-decimal pl-6 space-y-3 text-muted-foreground">
                    <li>
                      <strong>Generate Proof:</strong> When you verify your address, a cryptographic proof is generated that confirms the validity of your address without revealing the actual address details.
                    </li>
                    <li>
                      <strong>Share Proof, Not Data:</strong> When a third party needs to verify your address, they receive only the proof that your address meets certain criteria, not the address itself.
                    </li>
                    <li>
                      <strong>Verification:</strong> The third party can verify the proof is valid without ever seeing your actual address information.
                    </li>
                  </ol>
                </div>
                
                <p className="text-muted-foreground mt-4">
                  This approach ensures that your private information remains private, while still allowing necessary verification to take place.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="compliance">
              <div className="max-w-3xl mx-auto space-y-6">
                <h2 className="text-2xl font-bold mb-4">Regulatory Compliance</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold">GDPR Compliance</h3>
                    <p className="text-muted-foreground">
                      We adhere to all General Data Protection Regulation requirements, including:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-2">
                      <li>Right to access and portability of your data</li>
                      <li>Right to be forgotten (data deletion)</li>
                      <li>Data minimization principles</li>
                      <li>Privacy by design in all our systems</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold">CCPA Compliance</h3>
                    <p className="text-muted-foreground">
                      We meet all California Consumer Privacy Act requirements, including:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-2">
                      <li>Disclosure of data collection practices</li>
                      <li>User rights to opt-out of data sharing</li>
                      <li>Mechanisms to request data deletion</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold">SOC 2 Certification</h3>
                    <p className="text-muted-foreground">
                      Our infrastructure and processes have been audited and certified for:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-2">
                      <li>Security of systems and data</li>
                      <li>Availability of services</li>
                      <li>Processing integrity</li>
                      <li>Confidentiality and privacy</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-4">Our Security Commitment</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Security is not a one-time effort but an ongoing process. We continuously monitor, test, and improve our security 
              measures to stay ahead of emerging threats and ensure your data remains protected at all times.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SecurityPage;
