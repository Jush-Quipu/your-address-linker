
import React, { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Loader2, ArrowLeft, Package2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createShipment, getAvailableCarriers } from '@/services/shipmentService';
import { ShipmentRequest, ShipmentWeight, ShipmentAddress, ShipmentDimensions } from '@/services/carriers';
import { getCarrierService } from '@/services/carriers';

const CreateShipmentPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const permissionId = searchParams.get('permissionId');
  const navigate = useNavigate();
  const [creatingShipment, setCreatingShipment] = useState(false);
  
  // Get available carriers
  const availableCarriers = getAvailableCarriers();
  const [selectedCarrier, setSelectedCarrier] = useState(availableCarriers[0]?.id || '');
  const [carrierServices, setCarrierServices] = useState<string[]>([]);
  const [packageTypes, setPackageTypes] = useState<string[]>([]);

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  // Redirect if no permission ID is provided
  if (!permissionId) {
    return <Navigate to="/permissions" />;
  }

  // Form validation schema
  const formSchema = z.object({
    carrier: z.string().min(1, "Please select a carrier"),
    service: z.string().min(1, "Please select a service"),
    packageType: z.string().min(1, "Please select a package type"),
    weight: z.coerce.number().positive("Weight must be positive"),
    weightUnit: z.enum(["oz", "lb", "g", "kg"]),
    length: z.coerce.number().positive("Length must be positive").optional(),
    width: z.coerce.number().positive("Width must be positive").optional(),
    height: z.coerce.number().positive("Height must be positive").optional(),
    dimensionsUnit: z.enum(["in", "cm"]).optional(),
    reference: z.string().optional(),
    description: z.string().optional(),
    recipient: z.object({
      street_address: z.string().min(1, "Street address is required"),
      city: z.string().min(1, "City is required"),
      state: z.string().min(1, "State is required"),
      postal_code: z.string().min(1, "Postal code is required"),
      country: z.string().min(1, "Country is required"),
    }),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      carrier: selectedCarrier,
      weightUnit: "lb",
      dimensionsUnit: "in",
      recipient: {
        country: "United States",
      }
    },
  });

  // Update available services and package types when carrier changes
  React.useEffect(() => {
    if (selectedCarrier) {
      const carrier = getCarrierService(selectedCarrier);
      if (carrier) {
        const config = carrier.getConfig();
        setCarrierServices(config.services);
        setPackageTypes(config.packageTypes);
        
        // Reset the service and package type selections
        form.setValue('service', '');
        form.setValue('packageType', '');
      }
    }
  }, [selectedCarrier, form]);

  // Handle carrier selection change
  const handleCarrierChange = (value: string) => {
    setSelectedCarrier(value);
    form.setValue('carrier', value);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setCreatingShipment(true);
      
      const recipientAddress: ShipmentAddress = {
        street_address: data.recipient.street_address,
        city: data.recipient.city,
        state: data.recipient.state,
        postal_code: data.recipient.postal_code,
        country: data.recipient.country,
      };
      
      const weight: ShipmentWeight = {
        value: data.weight,
        unit: data.weightUnit,
      };
      
      let dimensions: ShipmentDimensions | undefined;
      if (data.length && data.width && data.height && data.dimensionsUnit) {
        dimensions = {
          length: data.length,
          width: data.width,
          height: data.height,
          unit: data.dimensionsUnit,
        };
      }
      
      const shipmentRequest: ShipmentRequest = {
        service: data.service,
        packageType: data.packageType,
        weight,
        dimensions,
        reference: data.reference,
        description: data.description,
      };
      
      const response = await createShipment(
        permissionId,
        recipientAddress,
        data.carrier,
        shipmentRequest
      );
      
      if (response.success) {
        toast.success('Shipment created successfully', {
          description: `Tracking number: ${response.trackingNumber}`,
        });
        navigate('/my-shipments');
      } else {
        toast.error('Failed to create shipment', {
          description: response.error || 'An unknown error occurred',
        });
      }
    } catch (error) {
      console.error('Error creating shipment:', error);
      toast.error('Failed to create shipment', {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    } finally {
      setCreatingShipment(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <Button 
            variant="ghost" 
            className="mb-6" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Create New Shipment</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Create a new shipment using one of our integrated carriers
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package2 className="h-5 w-5 mr-2" />
                Shipment Details
              </CardTitle>
              <CardDescription>
                Enter the details for your new shipment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Carrier Information</h3>
                    
                    <FormField
                      control={form.control}
                      name="carrier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Carrier</FormLabel>
                          <Select 
                            onValueChange={(value) => handleCarrierChange(value)} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a carrier" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableCarriers.map((carrier) => (
                                <SelectItem key={carrier.id} value={carrier.id}>
                                  {carrier.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="service"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={carrierServices.length === 0}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a service" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {carrierServices.map((service) => (
                                <SelectItem key={service} value={service}>
                                  {service}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="packageType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Package Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={packageTypes.length === 0}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a package type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {packageTypes.map((packageType) => (
                                <SelectItem key={packageType} value={packageType}>
                                  {packageType}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Package Details</h3>
                    
                    <div className="flex space-x-4">
                      <FormField
                        control={form.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Weight</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="weightUnit"
                        render={({ field }) => (
                          <FormItem className="w-[100px]">
                            <FormLabel>Unit</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Unit" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="oz">oz</SelectItem>
                                <SelectItem value="lb">lb</SelectItem>
                                <SelectItem value="g">g</SelectItem>
                                <SelectItem value="kg">kg</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="length"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Length</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="width"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Width</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Height</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="dimensionsUnit"
                      render={({ field }) => (
                        <FormItem className="w-[200px]">
                          <FormLabel>Dimensions Unit</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Unit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="in">inches</SelectItem>
                              <SelectItem value="cm">centimeters</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="reference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reference (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Internal reference or order number
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Recipient Address</h3>
                    
                    <FormField
                      control={form.control}
                      name="recipient.street_address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="recipient.city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="recipient.state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State / Province</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="recipient.postal_code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal / ZIP Code</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="recipient.country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <CardFooter className="flex justify-end px-0 pt-4">
                    <Button 
                      type="submit" 
                      disabled={creatingShipment}
                      className="w-full md:w-auto"
                    >
                      {creatingShipment && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Create Shipment
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreateShipmentPage;
