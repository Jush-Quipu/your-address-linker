
import React from 'react';
import DashboardNavbar from '@/components/DashboardNavbar';
import BlindShipping from '@/components/BlindShipping';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

const BlindShippingPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/auth" />;
  }
  
  return (
    <div className="min-h-screen">
      <DashboardNavbar />
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Blind Shipping</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Create shipping tokens that allow carriers to deliver packages to you without revealing your address to the sender.
            </p>
          </div>
          
          <BlindShipping />
          
          <div className="mt-12 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">How Blind Shipping Works</h2>
            <ol className="space-y-4 list-decimal pl-6">
              <li className="text-muted-foreground">
                <span className="text-foreground font-medium">Create a shipping token</span> - Generate a secure token with your preferred shipping carriers and services.
              </li>
              <li className="text-muted-foreground">
                <span className="text-foreground font-medium">Share the token</span> - Give the token to an application, marketplace, or individual that needs to ship to you.
              </li>
              <li className="text-muted-foreground">
                <span className="text-foreground font-medium">They request shipping</span> - The sender uses the token to request shipping through one of the authorized carriers.
              </li>
              <li className="text-muted-foreground">
                <span className="text-foreground font-medium">Private delivery</span> - The carrier receives your address through our secure system, but the sender only gets a tracking number.
              </li>
              <li className="text-muted-foreground">
                <span className="text-foreground font-medium">Track your package</span> - You can track the delivery and get notifications at each step.
              </li>
            </ol>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlindShippingPage;
