
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { createBlindShippingAppPermission } from '@/services/permissionService';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Copy, Check, Info, Truck } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';

// Available shipping carriers
const SHIPPING_CARRIERS = [
  { id: 'usps', name: 'USPS', services: ['Priority', 'First-Class', 'Ground', 'Express'] },
  { id: 'fedex', name: 'FedEx', services: ['Ground', '2Day', 'Express', 'Overnight'] },
  { id: 'ups', name: 'UPS', services: ['Ground', 'Next Day Air', '2nd Day Air', '3 Day Select'] }
];

const BlindShipping: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [shippingToken, setShippingToken] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    appName: '',
    expiryDays: 7,
    maxAccesses: 1,
    enableNotifications: true,
    requireDeliveryConfirmation: false,
    selectedCarriers: [] as string[],
    selectedServices: {} as Record<string, string[]>
  });
  
  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSwitchChange = (field: string) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field as keyof typeof prev] }));
  };
  
  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // Handle carrier selection
  const handleCarrierChange = (carrierId: string, isChecked: boolean) => {
    setFormData(prev => {
      let updatedCarriers = [...prev.selectedCarriers];
      let updatedServices = { ...prev.selectedServices };
      
      if (isChecked) {
        // Add carrier
        updatedCarriers.push(carrierId);
        // Initialize services for this carrier
        const carrierServices = SHIPPING_CARRIERS.find(c => c.id === carrierId)?.services || [];
        updatedServices[carrierId] = carrierServices;
      } else {
        // Remove carrier
        updatedCarriers = updatedCarriers.filter(id => id !== carrierId);
        // Remove services for this carrier
        delete updatedServices[carrierId];
      }
      
      return {
        ...prev, 
        selectedCarriers: updatedCarriers,
        selectedServices: updatedServices
      };
    });
  };
  
  // Handle service selection for a carrier
  const handleServiceChange = (carrierId: string, serviceId: string, isChecked: boolean) => {
    setFormData(prev => {
      const services = prev.selectedServices[carrierId] || [];
      let updatedServices;
      
      if (isChecked) {
        // Add service
        updatedServices = [...services, serviceId];
      } else {
        // Remove service
        updatedServices = services.filter(id => id !== serviceId);
      }
      
      return {
        ...prev,
        selectedServices: {
          ...prev.selectedServices,
          [carrierId]: updatedServices
        }
      };
    });
  };
  
  // Get all selected services as a flat array
  const getAllSelectedServices = (): string[] => {
    return Object.values(formData.selectedServices).flat();
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      toast.error('Please sign in first', {
        description: 'You need to be signed in to create shipping tokens',
      });
      return;
    }
    
    if (!formData.appName) {
      toast.error('App name is required', {
        description: 'Please enter a name for the app',
      });
      return;
    }
    
    if (formData.selectedCarriers.length === 0) {
      toast.error('At least one carrier is required', {
        description: 'Please select at least one shipping carrier',
      });
      return;
    }
    
    const allServices = getAllSelectedServices();
    if (allServices.length === 0) {
      toast.error('At least one shipping service is required', {
        description: 'Please select at least one shipping service',
      });
      return;
    }
    
    setLoading(true);
    try {
      // Parse numeric values
      const expiryDays = parseInt(formData.expiryDays.toString());
      const maxAccesses = formData.maxAccesses ? parseInt(formData.maxAccesses.toString()) : 1;
      
      const token = await createBlindShippingAppPermission(
        user.id,
        formData.appName,
        {
          allowedCarriers: formData.selectedCarriers,
          allowedShippingMethods: allServices,
          requireDeliveryConfirmation: formData.requireDeliveryConfirmation
        },
        expiryDays,
        maxAccesses,
        formData.enableNotifications
      );
      
      // Show the token to the user
      setShippingToken(token);
      setShowTokenDialog(true);
      
      // Reset form
      setFormData({
        appName: '',
        expiryDays: 7,
        maxAccesses: 1,
        enableNotifications: true,
        requireDeliveryConfirmation: false,
        selectedCarriers: [],
        selectedServices: {}
      });
    } catch (error) {
      console.error('Error creating shipping token:', error);
      toast.error('Failed to create shipping token', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shippingToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Truck className="h-5 w-5 text-primary" />
            <CardTitle>Create Blind Shipping Token</CardTitle>
          </div>
          <CardDescription>
            Allow an application to ship to you without ever seeing your address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Label htmlFor="appName">Application Name</Label>
              <Input
                id="appName"
                name="appName"
                placeholder="e.g., Online Store"
                value={formData.appName}
                onChange={handleChange}
                required
              />
            </div>

            <Separator />
            
            <div className="space-y-4">
              <Label className="text-base">Allowed Shipping Carriers</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Select which shipping carriers are allowed to access your address
              </p>
              
              <div className="space-y-4">
                {SHIPPING_CARRIERS.map(carrier => (
                  <Accordion key={carrier.id} type="single" collapsible className="border rounded-md">
                    <AccordionItem value={carrier.id}>
                      <div className="flex items-center px-4 py-2">
                        <Checkbox 
                          id={`carrier-${carrier.id}`} 
                          checked={formData.selectedCarriers.includes(carrier.id)}
                          onCheckedChange={(checked) => handleCarrierChange(carrier.id, checked === true)}
                        />
                        <AccordionTrigger className="px-2 hover:no-underline">
                          <span className="text-sm font-medium">{carrier.name}</span>
                        </AccordionTrigger>
                      </div>
                      <AccordionContent className="px-4 pb-2">
                        <div className="ml-6 space-y-2">
                          <p className="text-xs text-muted-foreground mb-2">
                            Select allowed shipping services
                          </p>
                          {carrier.services.map(service => (
                            <div key={service} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`service-${carrier.id}-${service}`}
                                checked={formData.selectedServices[carrier.id]?.includes(service) || false}
                                onCheckedChange={(checked) => handleServiceChange(carrier.id, service, checked === true)}
                                disabled={!formData.selectedCarriers.includes(carrier.id)}
                              />
                              <label 
                                htmlFor={`service-${carrier.id}-${service}`}
                                className="text-sm"
                              >
                                {service}
                              </label>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="expiryDays">Token Duration</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-80">How long the shipping token will be valid</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select
                value={formData.expiryDays.toString()}
                onValueChange={(value) => handleSelectChange('expiryDays', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="maxAccesses">Maximum Uses</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-80">How many shipments can be made with this token. Usually set to 1 for one-time use.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select
                value={formData.maxAccesses.toString()}
                onValueChange={(value) => handleSelectChange('maxAccesses', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select maximum uses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 shipment (one-time use)</SelectItem>
                  <SelectItem value="2">2 shipments</SelectItem>
                  <SelectItem value="3">3 shipments</SelectItem>
                  <SelectItem value="5">5 shipments</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="enableNotifications">Shipping Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Get notified when a carrier accesses your address
                </p>
              </div>
              <Switch 
                id="enableNotifications" 
                checked={formData.enableNotifications}
                onCheckedChange={() => handleSwitchChange('enableNotifications')}
              />
            </div>
            
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="requireDeliveryConfirmation">Require Delivery Confirmation</Label>
                <p className="text-xs text-muted-foreground">
                  Require confirmation when package is delivered
                </p>
              </div>
              <Switch 
                id="requireDeliveryConfirmation" 
                checked={formData.requireDeliveryConfirmation}
                onCheckedChange={() => handleSwitchChange('requireDeliveryConfirmation')}
              />
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            type="submit" 
            onClick={handleSubmit}
            disabled={loading || !isAuthenticated}
          >
            {loading ? 'Creating Shipping Token...' : 'Create Shipping Token'}
          </Button>
        </CardFooter>
      </Card>
      
      <Dialog open={showTokenDialog} onOpenChange={setShowTokenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Blind Shipping Token Created</DialogTitle>
            <DialogDescription>
              This token allows shipping to your address without revealing it. Share this token with the application that needs to ship to you.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 mt-4">
            <Input 
              value={shippingToken} 
              readOnly 
              className="font-mono text-xs"
            />
            <Button size="icon" variant="outline" onClick={copyToClipboard}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Keep this token secure. Anyone with this token can create a shipping label to your address (but cannot see the actual address).
          </p>
          <DialogFooter className="mt-4">
            <Button onClick={() => setShowTokenDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BlindShipping;
