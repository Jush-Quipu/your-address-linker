
import React from 'react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  return (
    <section className="min-h-screen pt-24 px-6 md:px-12 flex flex-col justify-center items-center text-center">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-70"></div>
      
      <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-8 animate-bounce-subtle">
        <span className="text-primary-foreground font-bold text-3xl">SB</span>
      </div>
      
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-4xl animate-fade-in mb-6">
        Your wallet, your home, <span className="text-primary">your control</span>
      </h1>
      
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 animate-fade-in animate-delay-200">
        Securely link your blockchain wallet to your verified physical address while maintaining complete privacy and control over your data.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 animate-fade-in animate-delay-300">
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
      
      <div className="mt-20 max-w-4xl w-full glass rounded-2xl p-1 animate-fade-in animate-delay-400">
        <div className="bg-white rounded-xl overflow-hidden shadow-subtle">
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
