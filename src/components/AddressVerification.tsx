
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';

interface AddressFormData {
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const initialFormData: AddressFormData = {
  streetAddress: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
};

interface AddressVerificationProps {
  onVerify?: (addressData: AddressFormData) => void;
}

const AddressVerification: React.FC<AddressVerificationProps> = ({ onVerify }) => {
  const [formData, setFormData] = useState<AddressFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call for address validation
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API delay
      
      // In a real app, you'd validate the address with a geocoding service
      if (Math.random() > 0.2) { // Simulate 80% success rate
        toast.success('Address validation successful!', {
          description: 'Your address has been verified successfully.',
        });
        
        if (onVerify) {
          onVerify(formData);
        }
        
        setStep(2); // Move to next step
      } else {
        throw new Error('Unable to verify address. Please check your input and try again.');
      }
    } catch (error) {
      console.error('Error verifying address:', error);
      toast.error('Address verification failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setLoading(true);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate upload and processing
      
      toast.success('Document uploaded successfully!', {
        description: 'Your proof of residence document has been uploaded.',
      });
      
      // Move to success state after document upload
      setTimeout(() => {
        setStep(3);
      }, 1000);
      
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Document upload failed', {
        description: 'Unable to upload your document. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-lg w-full mx-auto glass">
      <CardHeader>
        <CardTitle className="text-2xl">Verify Your Address</CardTitle>
        <CardDescription>
          {step === 1 && 'Please enter your physical address for verification.'}
          {step === 2 && 'Upload a proof of residence document to verify your address.'}
          {step === 3 && 'Your address has been successfully verified!'}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {step === 1 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="streetAddress">Street Address</Label>
              <Input
                id="streetAddress"
                name="streetAddress"
                value={formData.streetAddress}
                onChange={handleChange}
                required
                placeholder="123 Main St, Apt 4B"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  placeholder="New York"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  placeholder="NY"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  required
                  placeholder="10001"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  placeholder="United States"
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full mt-4" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Address'}
            </Button>
          </form>
        )}
        
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-secondary rounded-lg p-4">
              <div className="text-sm font-medium mb-1">Verified Address:</div>
              <div className="text-sm">
                {formData.streetAddress}, {formData.city}, {formData.state} {formData.postalCode}, {formData.country}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="document">Upload Proof of Residence</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Input
                  id="document"
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <Label htmlFor="document" className="cursor-pointer">
                  <div className="flex flex-col items-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-10 w-10 text-muted-foreground mb-2" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                      />
                    </svg>
                    <span className="text-muted-foreground font-medium">
                      {loading ? 'Uploading...' : 'Click to upload or drag and drop'}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      PDF, JPG or PNG (max. 5MB)
                    </span>
                  </div>
                </Label>
              </div>
            </div>
            
            <div className="bg-accent p-4 rounded-lg mt-4">
              <h4 className="text-sm font-semibold mb-2">Supported Documents:</h4>
              <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                <li>Utility bill (electric, gas, water, internet) less than 3 months old</li>
                <li>Bank statement less than 3 months old</li>
                <li>Government-issued ID with address</li>
                <li>Tax document from the current year</li>
              </ul>
            </div>
          </div>
        )}
        
        {step === 3 && (
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Address Verified Successfully!</h3>
            <p className="text-muted-foreground mb-4">
              Your physical address has been verified and securely linked to your wallet.
            </p>
            <div className="bg-secondary rounded-lg p-4 text-left mb-4">
              <div className="text-sm font-medium mb-1">Verified Address:</div>
              <div className="text-sm">
                {formData.streetAddress}, {formData.city}, {formData.state} {formData.postalCode}, {formData.country}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      {step === 3 && (
        <CardFooter className="flex justify-center">
          <Button onClick={() => window.location.href = '/dashboard'}>
            Go to Dashboard
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default AddressVerification;
