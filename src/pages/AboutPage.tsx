
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Shield, Globe, Lightbulb, Users, Lock, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About SecureAddress Bridge</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Bridging the gap between Web2 and Web3 with privacy-preserving address verification.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-6">
                SecureAddress Bridge was founded with a simple but powerful mission: to solve the challenge of securely linking 
                blockchain wallet addresses to real-world physical addresses while preserving user privacy and control.
              </p>
              <p className="text-lg text-muted-foreground">
                We believe that blockchain technology should empower users, not expose them. By creating a secure, privacy-first 
                bridge between Web3 and physical addresses, we're helping to unlock the full potential of decentralized commerce 
                and services without compromising on privacy.
              </p>
            </div>
            <div className="bg-primary/5 rounded-lg p-8">
              <h2 className="text-3xl font-bold mb-6">Our Vision</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Lightbulb className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-muted-foreground">
                    <strong>Privacy as a Standard:</strong> A world where users can interact with both Web2 and Web3 services without sacrificing their privacy.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-muted-foreground">
                    <strong>Global Commerce:</strong> Enabling seamless global commerce across traditional and blockchain platforms.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-muted-foreground">
                    <strong>User Sovereignty:</strong> Returning control of personal data to users, allowing them to share only what's necessary, when necessary.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-20">
            <h2 className="text-3xl font-bold mb-10 text-center">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <Shield className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>Privacy-First Design</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We build with privacy as our foundation, not as an afterthought. Every feature we create is designed to protect user data.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <Lock className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>Security Excellence</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We maintain the highest security standards, employing encryption, zero-knowledge proofs, and regular security audits.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <Users className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>User Control</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We believe users should have full control over their data, including who can access it and for how long.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <Globe className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>Interoperability</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We build bridges, not walls. Our systems are designed to work seamlessly with both traditional and blockchain platforms.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <Award className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>Transparency</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We are open about how our systems work, what data we collect, and how we handle it. No hidden practices.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <Lightbulb className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>Innovation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We continuously explore new technologies and approaches to improve privacy, security, and user experience.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="mb-20">
            <h2 className="text-3xl font-bold mb-10 text-center">Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full bg-primary/10 mb-4 flex items-center justify-center">
                    <Users className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Team Member {i}</h3>
                  <p className="text-primary font-medium">Position Title</p>
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    Brief biography describing the team member's background, expertise, and role in the company.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
