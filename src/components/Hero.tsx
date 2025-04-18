
import React from 'react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  return (
    <section className="min-h-screen pt-24 px-6 md:px-12 flex flex-col justify-center items-center text-center">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-70"></div>
      
      <div className="mb-8">
        <img 
          src="/lovable-uploads/d9494fc1-d5a2-48e3-a68d-3c9e7743d434.png" 
          alt="SecureAddress Bridge Logo" 
          className="w-32 h-32 object-contain"
        />
      </div>
      
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-4xl mb-6">
        Your wallet, your home, <span className="text-primary">your control</span>
      </h1>
      
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10">
        Securely link your blockchain wallet to your verified physical address while maintaining complete privacy and control over your data.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/auth">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8">
            Get Started
          </Button>
        </Link>
        <Link to="/features">
          <Button variant="outline" size="lg" className="px-8">
            Learn More
          </Button>
        </Link>
      </div>
      
      <div className="mt-20 max-w-4xl w-full rounded-2xl p-1">
        <div className="bg-white rounded-xl overflow-hidden shadow-lg">
          <img 
            src="https://placehold.co/1200x600/e9ecef/343a40?text=SecureAddress+Bridge+Dashboard" 
            alt="Dashboard Preview" 
            className="w-full h-auto object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
