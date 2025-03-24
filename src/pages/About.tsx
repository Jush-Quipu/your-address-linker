
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About SecureAddress Bridge</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Bridging the gap between Web3 identities and physical addresses with privacy at the core.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg leading-relaxed mb-6">
                We founded SecureAddress Bridge with a simple yet powerful mission: to create a privacy-preserving 
                bridge between blockchain identities and physical addresses.
              </p>
              <p className="text-lg leading-relaxed mb-6">
                In the decentralized world, your wallet address is your identity. But when interacting with 
                real-world services that require shipping, verification, or geo-specific services, you're forced 
                to surrender your privacy.
              </p>
              <p className="text-lg leading-relaxed">
                We're changing that by creating technology that allows you to securely link and share your 
                physical address without exposing your blockchain identity, and vice versa.
              </p>
            </div>
            <div className="bg-primary/5 rounded-lg p-8 border border-primary/20">
              <h3 className="text-xl font-semibold mb-4">Our Core Values</h3>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="bg-primary/10 rounded-full h-8 w-8 flex items-center justify-center text-primary font-bold">1</div>
                  <div>
                    <h4 className="font-medium">Privacy by Design</h4>
                    <p className="text-muted-foreground">We build privacy into every aspect of our platform from the ground up.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="bg-primary/10 rounded-full h-8 w-8 flex items-center justify-center text-primary font-bold">2</div>
                  <div>
                    <h4 className="font-medium">User Control</h4>
                    <p className="text-muted-foreground">Your data belongs to you. We provide tools, not surveillance.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="bg-primary/10 rounded-full h-8 w-8 flex items-center justify-center text-primary font-bold">3</div>
                  <div>
                    <h4 className="font-medium">Accessibility</h4>
                    <p className="text-muted-foreground">Bridging Web2 and Web3 to make privacy tools available to everyone.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="bg-primary/10 rounded-full h-8 w-8 flex items-center justify-center text-primary font-bold">4</div>
                  <div>
                    <h4 className="font-medium">Transparency</h4>
                    <p className="text-muted-foreground">Open code, clear policies, and no hidden agendas.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mb-24">
            <h2 className="text-3xl font-bold mb-8 text-center">Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Alex Rivera",
                  role: "Founder & CEO",
                  bio: "Blockchain developer with 8+ years experience. Previously led privacy initiatives at major Web3 projects."
                },
                {
                  name: "Sophia Chen",
                  role: "CTO",
                  bio: "PhD in Cryptography. Expert in zero-knowledge proofs and privacy-preserving systems architecture."
                },
                {
                  name: "Marcus Johnson",
                  role: "Head of Partnerships",
                  bio: "10+ years in strategic partnerships across e-commerce and fintech industries."
                }
              ].map((member, index) => (
                <div key={index} className="text-center p-6 rounded-lg bg-card border border-border">
                  <div className="w-24 h-24 rounded-full bg-primary/20 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">{member.name.split(' ')[0][0]}{member.name.split(' ')[1][0]}</span>
                  </div>
                  <h3 className="text-xl font-bold">{member.name}</h3>
                  <p className="text-primary font-medium mb-3">{member.role}</p>
                  <p className="text-muted-foreground">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-center bg-muted p-12 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">Join Our Mission</h2>
            <p className="text-lg max-w-xl mx-auto mb-8">
              We're always looking for talented individuals who are passionate about privacy, 
              blockchain technology, and building user-centric products.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/careers">
                <Button size="lg">View Careers</Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg">Contact Us</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
