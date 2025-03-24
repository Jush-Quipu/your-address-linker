
import React from 'react';
import Navbar from '@/components/Navbar';
import AddressVerification from '@/components/AddressVerification';
import Footer from '@/components/Footer';

const Verify: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Verify Your Address</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Securely verify your physical address to create a privacy-preserving link with your wallet.
            </p>
          </div>
          
          <AddressVerification />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Verify;
