
import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '@/components/layouts/PublicLayout';
import Landing from '@/pages/Landing';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const Index: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <PublicLayout>
      <Landing />
      <Features />
      <HowItWorks />
      
      {/* CTA Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
            Ready to Bridge Your Web3 and Physical Identities?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Join SecureAddress Bridge today and take control of your digital and physical address data.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="lg" className="font-medium">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button size="lg" className="font-medium">
                  Get Started
                </Button>
              </Link>
            )}
            <Link to="/features">
              <Button variant="outline" size="lg" className="font-medium">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Index;
