
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-primary/10">
      <div className="max-w-4xl mx-auto text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          SecureAddress Bridge
        </h1>
        <p className="text-xl md:text-2xl max-w-2xl mx-auto mb-8 text-muted-foreground">
          Connect your wallet to your verified physical address while maintaining privacy through zero-knowledge proofs
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          {isLoading ? (
            <Button disabled className="min-w-[180px]">
              <span className="animate-pulse">Loading...</span>
            </Button>
          ) : isAuthenticated ? (
            <Button size="lg" onClick={() => navigate('/dashboard')} className="min-w-[180px]">
              Go to Dashboard
            </Button>
          ) : (
            <Button size="lg" onClick={() => navigate('/auth')} className="min-w-[180px]">
              Get Started
            </Button>
          )}
          
          <Button variant="outline" size="lg" onClick={() => navigate('/features')} className="min-w-[180px]">
            Learn More
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-3">Privacy-First</h3>
            <p className="text-muted-foreground">
              Physical and blockchain addresses are never directly exposed to third parties
            </p>
          </div>
          <div className="p-6 bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-3">Hybrid Accessibility</h3>
            <p className="text-muted-foreground">
              Works for both crypto-savvy users and mainstream users
            </p>
          </div>
          <div className="p-6 bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-3">User Control</h3>
            <p className="text-muted-foreground">
              You decide who gets access to your information and for how long
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
