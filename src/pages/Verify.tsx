
import React from 'react';
import Navbar from '@/components/Navbar';
import AddressVerification from '@/components/AddressVerification';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MapPin, Shield, Mail, CheckCircle2, LockKeyhole } from 'lucide-react';
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
                  <Shield className="mr-2 h-5 w-5 text-primary" />
                  Multi-level Address Verification
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-0.5">
                      1
                    </div>
                    <div>
                      <h3 className="font-medium">Address Validation</h3>
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
                      <h3 className="font-medium">Document Verification</h3>
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
                      <h3 className="font-medium">Postal Verification (Highest Security)</h3>
                      <p className="text-sm text-muted-foreground">
                        Receive a postcard with a unique verification code at your address.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-8">
                <div className="bg-secondary/20 p-6 rounded-lg flex flex-col items-center text-center">
                  <div className="bg-primary/10 p-3 rounded-full mb-4">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Trusted Verification</h3>
                  <p className="text-sm text-muted-foreground">
                    Multiple verification methods ensure your address is verified with high confidence.
                  </p>
                </div>
                
                <div className="bg-secondary/20 p-6 rounded-lg flex flex-col items-center text-center">
                  <div className="bg-primary/10 p-3 rounded-full mb-4">
                    <LockKeyhole className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Zero-Knowledge Proofs</h3>
                  <p className="text-sm text-muted-foreground">
                    Share your address with services without revealing your wallet or other personal details.
                  </p>
                </div>
                
                <div className="bg-secondary/20 p-6 rounded-lg flex flex-col items-center text-center">
                  <div className="bg-primary/10 p-3 rounded-full mb-4">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Physical Confirmation</h3>
                  <p className="text-sm text-muted-foreground">
                    Postal verification confirms you actually receive mail at your address.
                  </p>
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
