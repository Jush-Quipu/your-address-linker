import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { createPhysicalAddress, getPhysicalAddressById } from '@/services/addressService';
import { useAuth } from '@/context/AuthContext';
import { validateAddress, GeocodingResult } from '@/services/geocodingService';
import DocumentUpload from '@/components/DocumentUpload';
import PostalVerification from '@/components/PostalVerification';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, MapPin, AlertTriangle, Loader2, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const countries = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 
  'Germany', 'France', 'Japan', 'Brazil', 'India', 'China',
];

const AddressVerification: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [documentUploaded, setDocumentUploaded] = useState(false);
  const [documentPath, setDocumentPath] = useState<string | null>(null);
  const [addressVerified, setAddressVerified] = useState(false);
  const [geocodingResult, setGeocodingResult] = useState<GeocodingResult | null>(null);
  const [verificationConfidence, setVerificationConfidence] = useState(0);
  const [activeVerificationTab, setActiveVerificationTab] = useState('address-form');
  const [savedAddressId, setSavedAddressId] = useState<string | null>(null);
  const [postalVerified, setPostalVerified] = useState(false);
  
  const [formData, setFormData] = useState({
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (addressVerified) {
      setAddressVerified(false);
      setGeocodingResult(null);
    }
  };

  const handleCountryChange = (value: string) => {
    setFormData(prev => ({ ...prev, country: value }));
    
    if (addressVerified) {
      setAddressVerified(false);
      setGeocodingResult(null);
    }
  };

  const handleVerifyAddress = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in first', {
        description: 'You need to be signed in to verify your address',
      });
      return;
    }

    if (!formData.streetAddress || !formData.city || !formData.state || 
        !formData.postalCode || !formData.country) {
      toast.error('Please fill in all fields', {
        description: 'All address fields are required',
      });
      return;
    }

    setVerifying(true);
    try {
      const result = await validateAddress(
        formData.streetAddress,
        formData.city,
        formData.state,
        formData.postalCode,
        formData.country
      );
      
      setGeocodingResult(result.geocodingResult);
      setVerificationConfidence(result.confidence);
      
      if (result.isValid) {
        setAddressVerified(true);
        toast.success('Address verified successfully!', {
          description: result.message,
        });
      } else {
        setAddressVerified(false);
        toast.error('Address verification failed', {
          description: result.message,
        });
      }
    } catch (error) {
      console.error('Error verifying address:', error);
      toast.error('Error verifying address', {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleDocumentUploaded = (filePath: string) => {
    setDocumentUploaded(true);
    setDocumentPath(filePath);
  };

  const handlePostalVerificationComplete = () => {
    setPostalVerified(true);
    toast.success('Address fully verified with postal code!', {
      description: 'Your address has been verified with the highest level of confidence.'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please sign in first', {
        description: 'You need to be signed in to verify your address',
      });
      return;
    }

    if (!formData.streetAddress || !formData.city || !formData.state || 
        !formData.postalCode || !formData.country) {
      toast.error('Please fill in all fields', {
        description: 'All address fields are required',
      });
      return;
    }

    setLoading(true);
    try {
      let verificationStatus = 'pending';
      let verificationMethod = 'form_submission';
      
      if (addressVerified && documentUploaded) {
        verificationMethod = 'geocoding_and_document';
        verificationStatus = 'verified';
      } else if (addressVerified) {
        verificationMethod = 'geocoding';
        verificationStatus = 'verified';
      } else if (documentUploaded) {
        verificationMethod = 'document_upload';
        verificationStatus = 'pending';
      }
      
      const addressData = {
        user_id: user!.id,
        street_address: formData.streetAddress,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postalCode,
        country: formData.country,
        verification_status: verificationStatus,
        verification_method: verificationMethod,
        verification_date: verificationStatus === 'verified' ? new Date().toISOString() : null,
        encrypted_street_address: null,
        encrypted_city: null,
        encrypted_state: null,
        encrypted_postal_code: null, 
        encrypted_country: null,
        encryption_nonce: null,
        encryption_public_key: null,
        encryption_version: 1,
        zkp_proof: null,
        zkp_public_inputs: null,
        zkp_created_at: null
      };
      
      const savedAddress = await createPhysicalAddress(addressData);
      
      if (savedAddress && savedAddress.id) {
        setSavedAddressId(savedAddress.id);
        setActiveVerificationTab('postal-verification');
      }

      toast.success('Address submitted successfully!', {
        description: 'Your address has been saved and is ready for verification.',
      });

    } catch (error) {
      console.error('Error submitting address:', error);
      toast.error('Error submitting address', {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Verify Your Address</CardTitle>
        <CardDescription>
          Complete all steps to fully verify your physical address
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs 
          value={activeVerificationTab} 
          onValueChange={setActiveVerificationTab}
          className="space-y-6"
        >
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="address-form">1. Enter Address</TabsTrigger>
            <TabsTrigger value="document-upload" disabled={!addressVerified && !savedAddressId}>
              2. Upload Document
            </TabsTrigger>
            <TabsTrigger value="postal-verification" disabled={!savedAddressId}>
              3. Postal Verify
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="address-form" className="space-y-6">
            <form className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="streetAddress">Street Address</Label>
                <Input
                  id="streetAddress"
                  name="streetAddress"
                  placeholder="123 Main St, Apt 4B"
                  value={formData.streetAddress}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="New York"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    name="state"
                    placeholder="NY"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="postalCode">Postal/ZIP Code</Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    placeholder="10001"
                    value={formData.postalCode}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="country">Country</Label>
                  <Select 
                    value={formData.country} 
                    onValueChange={handleCountryChange}
                    required
                  >
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {!isAuthenticated && (
                <Alert variant="warning">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Authentication required</AlertTitle>
                  <AlertDescription>
                    Please sign in to verify your address.
                  </AlertDescription>
                </Alert>
              )}
              
              {geocodingResult && (
                <Alert variant={addressVerified ? "default" : "destructive"}>
                  {addressVerified ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  <AlertTitle>
                    {addressVerified ? 'Address Verified' : 'Verification Issue'}
                  </AlertTitle>
                  <AlertDescription className="space-y-2">
                    <p>
                      {addressVerified 
                        ? 'Your address was successfully verified.' 
                        : 'There was an issue verifying your address.'}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Confidence:</span>
                      <Badge variant={addressVerified ? "default" : "outline"}>
                        {Math.round(verificationConfidence * 100)}%
                      </Badge>
                    </div>
                    <p className="text-sm">{geocodingResult.display_name}</p>
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex justify-end">
                <Button 
                  type="button" 
                  onClick={handleVerifyAddress}
                  disabled={verifying || !isAuthenticated || !formData.streetAddress || !formData.city || 
                    !formData.state || !formData.postalCode || !formData.country}
                >
                  {verifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <MapPin className="mr-2 h-4 w-4" />
                      Verify Address
                    </>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="document-upload">
            <DocumentUpload onDocumentUploaded={handleDocumentUploaded} />
          </TabsContent>
          
          <TabsContent value="postal-verification">
            {savedAddressId ? (
              <PostalVerification 
                physicalAddressId={savedAddressId}
                onVerificationComplete={handlePostalVerificationComplete}
              />
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Address Required</AlertTitle>
                <AlertDescription>
                  You need to save your address information first before proceeding with postal verification.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        {activeVerificationTab === 'address-form' && (
          <Button 
            className="w-full" 
            type="submit" 
            onClick={handleSubmit}
            disabled={loading || !isAuthenticated}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Save Address and Continue'
            )}
          </Button>
        )}
        
        {activeVerificationTab === 'document-upload' && (
          <Button 
            className="w-full" 
            onClick={() => setActiveVerificationTab('postal-verification')}
            disabled={!documentUploaded && !savedAddressId}
          >
            Continue to Postal Verification
          </Button>
        )}
        
        {activeVerificationTab === 'postal-verification' && postalVerified && (
          <Button 
            className="w-full" 
            onClick={() => window.location.href = '/dashboard'}
          >
            Go to Dashboard
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default AddressVerification;
