
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface PublicLayoutProps {
  children: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
