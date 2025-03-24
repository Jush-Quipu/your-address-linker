
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Code, Globe, MessageSquare, Zap } from 'lucide-react';

const CareersPage: React.FC = () => {
  const benefits = [
    {
      title: "Remote-First Culture",
      description: "Work from anywhere in the world. We believe in hiring the best talent regardless of location.",
      icon: <Globe className="h-6 w-6" />
    },
    {
      title: "Competitive Compensation",
      description: "Competitive salary, equity options, and cryptocurrency payments for those who prefer it.",
      icon: <Zap className="h-6 w-6" />
    },
    {
      title: "Cutting-Edge Technology",
      description: "Work with the latest in blockchain, cryptography, and privacy-preserving technologies.",
      icon: <Code className="h-6 w-6" />
    },
    {
      title: "Open Communication",
      description: "Flat hierarchy with direct access to leadership and transparent decision-making.",
      icon: <MessageSquare className="h-6 w-6" />
    }
  ];

  const openings = [
    {
      title: "Senior Solidity Developer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      description: "We're looking for an experienced Solidity developer to help build our on-chain verification systems and smart contracts."
    },
    {
      title: "Frontend Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      description: "Join us to create intuitive, responsive interfaces that make privacy accessible to everyone."
    },
    {
      title: "Cryptography Researcher",
      department: "Research",
      location: "Remote",
      type: "Full-time",
      description: "Help advance our zero-knowledge proof systems and research new privacy-preserving techniques."
    },
    {
      title: "Developer Advocate",
      department: "Marketing",
      location: "Remote",
      type: "Full-time",
      description: "Bridge the gap between our development team and the developer community, creating tutorials and documentation."
    },
    {
      title: "Business Development Manager",
      department: "Business",
      location: "Remote",
      type: "Full-time",
      description: "Forge partnerships with e-commerce platforms, shipping providers, and blockchain projects."
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Join Our Team</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Help us build the future of privacy-preserving address verification.
            </p>
          </div>
          
          <div className="mb-24">
            <h2 className="text-2xl font-bold mb-8">Why Work With Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <div className="mb-3 text-primary">{benefit.icon}</div>
                    <CardTitle className="text-xl">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-8">Open Positions</h2>
            <div className="space-y-6">
              {openings.map((job, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold mb-2">{job.title}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline">{job.department}</Badge>
                        <Badge variant="outline">{job.location}</Badge>
                        <Badge variant="outline">{job.type}</Badge>
                      </div>
                      <p className="text-muted-foreground">{job.description}</p>
                    </div>
                    <Button className="md:w-auto w-full flex items-center gap-2 whitespace-nowrap">
                      Apply Now
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          
          <div className="mt-20 bg-primary/5 rounded-lg p-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Don't See Your Perfect Role?</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-6">
              We're always looking for talented individuals who are passionate about privacy and blockchain technology.
              Send us your resume and tell us how you can contribute to our mission.
            </p>
            <Button size="lg">
              Send Open Application
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CareersPage;
