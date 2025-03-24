
import React from 'react';

const steps = [
  {
    number: "01",
    title: "Connect Your Wallet",
    description: "Link your Web3 wallet or create a traditional account to get started with SecureAddress Bridge.",
    delay: "0"
  },
  {
    number: "02",
    title: "Verify Your Address",
    description: "Securely verify your physical home address through our privacy-preserving verification process.",
    delay: "100"
  },
  {
    number: "03",
    title: "Create Secure Pairing",
    description: "We'll create an encrypted link between your wallet and home address that only you control.",
    delay: "200"
  },
  {
    number: "04",
    title: "Manage Permissions",
    description: "Control which dApps or services can access your verified home address, and for how long.",
    delay: "300"
  }
];

const HowItWorks: React.FC = () => {
  return (
    <section className="py-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Our simple four-step process gives you complete control over your personal data while enabling secure verification.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className={`animate-fade-up animate-delay-${step.delay}`}>
              <div className="mb-4 text-4xl font-bold text-primary/20">{step.number}</div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-16 pt-8 border-t border-border">
          <div className="bg-gradient-subtle rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-semibold mb-4">Ready to take control of your digital identity?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join the growing community of users who value privacy, security, and control in the Web3 ecosystem.
            </p>
            <a href="/connect" className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
              Get Started Now
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
