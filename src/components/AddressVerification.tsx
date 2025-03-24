
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { createPhysicalAddress } from '@/services/addressService';
import { useAuth } from '@/context/AuthContext';

// List of countries for the select dropdown
const countries = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 
  'Germany', 'France', 'Japan', 'Brazil', 'India', 'China',
  // Add more countries as needed
];

const AddressVerification: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
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
  };

  const handleCountryChange = (value: string) => {
    setFormData(prev => ({ ...prev, country: value }));
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
      // Save the address to Supabase
      await createPhysicalAddress({
        user_id: user!.id,
        street_address: formData.streetAddress,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postalCode,
        country: formData.country,
        verification_status: 'pending', // Address is pending verification
        verification_method: 'form_submission'
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
      
      // Redirect to dashboard or verification confirmation page
      // For now, we'll just reset the form
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
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Verify Your Address</CardTitle>
        <CardDescription>
          Enter your physical address to verify it with our secure system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="p-3 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-600 rounded-lg text-sm">
              Please sign in to verify your address.
            </div>
          )}
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          type="submit" 
          onClick={handleSubmit}
          disabled={loading || !isAuthenticated}
        >
          {loading ? 'Submitting...' : 'Verify Address'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AddressVerification;
