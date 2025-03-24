
import React from 'react';
import Navbar from '@/components/Navbar';
import AddressVerification from '@/components/AddressVerification';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MapPin, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Verify: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

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
          
          {!isAuthenticated ? (
            <div className="max-w-md mx-auto mb-12">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>Authentication Required</AlertTitle>
                <AlertDescription className="space-y-4">
                  <p>You need to sign in or connect your wallet before verifying your address.</p>
                  <div className="flex space-x-4">
                    <Button variant="default" onClick={() => navigate('/auth')}>
                      Sign In
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/connect')}>
                      Connect Wallet
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="mx-auto max-w-2xl bg-secondary/30 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-primary" />
                  How Address Verification Works
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-0.5">
                      1
                    </div>
                    <div>
                      <h3 className="font-medium">Enter your address</h3>
                      <p className="text-sm text-muted-foreground">
                        We'll use geocoding to validate the address existence and format.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-0.5">
                      2
                    </div>
                    <div>
                      <h3 className="font-medium">Upload proof of residence</h3>
                      <p className="text-sm text-muted-foreground">
                        Upload a utility bill, bank statement, or government ID with your address.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-0.5">
                      3
                    </div>
                    <div>
                      <h3 className="font-medium">Verification and approval</h3>
                      <p className="text-sm text-muted-foreground">
                        Our team will review your submission and approve it within 24-48 hours.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <AddressVerification />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Verify;
