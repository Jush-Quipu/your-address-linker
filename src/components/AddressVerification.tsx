
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { createPhysicalAddress } from '@/services/addressService';
import { useAuth } from '@/context/AuthContext';
import { validateAddress, GeocodingResult } from '@/services/geocodingService';
import DocumentUpload from '@/components/DocumentUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, MapPin, AlertTriangle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// List of countries for the select dropdown
const countries = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 
  'Germany', 'France', 'Japan', 'Brazil', 'India', 'China',
  // Add more countries as needed
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
    
    // Reset verification when form changes
    if (addressVerified) {
      setAddressVerified(false);
      setGeocodingResult(null);
    }
  };

  const handleCountryChange = (value: string) => {
    setFormData(prev => ({ ...prev, country: value }));
    
    // Reset verification when form changes
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

    // Basic validation
    if (!formData.streetAddress || !formData.city || !formData.state || 
        !formData.postalCode || !formData.country) {
      toast.error('Please fill in all fields', {
        description: 'All address fields are required',
      });
      return;
    }

    setVerifying(true);
    try {
      // Validate address with geocoding service
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please sign in first', {
        description: 'You need to be signed in to verify your address',
      });
      return;
    }

    // Basic validation
    if (!formData.streetAddress || !formData.city || !formData.state || 
        !formData.postalCode || !formData.country) {
      toast.error('Please fill in all fields', {
        description: 'All address fields are required',
      });
      return;
    }

    setLoading(true);
    try {
      // Determine verification status and method
      let verificationStatus = 'pending';
      let verificationMethod = 'form_submission';
      
      if (addressVerified && documentUploaded) {
        verificationMethod = 'geocoding_and_document';
      } else if (addressVerified) {
        verificationMethod = 'geocoding';
      } else if (documentUploaded) {
        verificationMethod = 'document_upload';
      }
      
      // Save the address to Supabase
      await createPhysicalAddress({
        user_id: user!.id,
        street_address: formData.streetAddress,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postalCode,
        country: formData.country,
        verification_status: verificationStatus,
        verification_method: verificationMethod,
        verification_date: null // Will be set when verified by admin
      });

      toast.success('Address submitted successfully!', {
        description: 'Your address has been submitted for verification.',
      });

      // Reset form after successful submission
      setFormData({
        streetAddress: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      });
      
      setAddressVerified(false);
      setGeocodingResult(null);
      setDocumentUploaded(false);
      setDocumentPath(null);
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
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
          Complete both steps to verify your physical address
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="address-form" className="space-y-6">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="address-form">1. Enter Address</TabsTrigger>
            <TabsTrigger value="document-upload" disabled={!addressVerified}>2. Upload Document</TabsTrigger>
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
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          type="submit" 
          onClick={handleSubmit}
          disabled={loading || !isAuthenticated || !addressVerified}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Address for Verification'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AddressVerification;
