
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { RefreshCcw, Settings, CheckCircle } from 'lucide-react';
import { SandboxConfig } from '@/types/sandbox';
import { toast } from 'sonner';

interface SandboxConfigurationPanelProps {
  config: SandboxConfig;
  onUpdateConfig: (config: SandboxConfig) => void;
  onResetConfig: () => void;
}

const SandboxConfigurationPanel: React.FC<SandboxConfigurationPanelProps> = ({
  config,
  onUpdateConfig,
  onResetConfig
}) => {
  const [activeTab, setActiveTab] = useState('general');
  const form = useForm<SandboxConfig>({
    defaultValues: config
  });

  const handleSubmit = (values: SandboxConfig) => {
    onUpdateConfig(values);
    toast.success('Sandbox configuration updated', {
      description: 'Your changes to the sandbox environment have been applied.',
      icon: <CheckCircle className="h-4 w-4" />
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Sandbox Configuration
        </CardTitle>
        <CardDescription>
          Customize how the sandbox environment behaves
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="responses">Responses</TabsTrigger>
                <TabsTrigger value="data">Mock Data</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="space-y-4">
                <FormField
                  control={form.control}
                  name="responseDelay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Response Delay (ms): {field.value}ms</FormLabel>
                      <FormControl>
                        <Slider 
                          min={0} 
                          max={2000} 
                          step={50} 
                          defaultValue={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                      </FormControl>
                      <FormDescription>
                        Simulate network latency by adding a delay to API responses
                      </FormDescription>
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="simulateErrors"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Simulate Errors</FormLabel>
                          <FormDescription>
                            Randomly generate API errors
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  {form.watch('simulateErrors') && (
                    <FormField
                      control={form.control}
                      name="errorRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Error Rate: {(field.value * 100).toFixed(0)}%</FormLabel>
                          <FormControl>
                            <Slider 
                              min={0} 
                              max={0.5} 
                              step={0.05} 
                              defaultValue={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                            />
                          </FormControl>
                          <FormDescription>
                            How often errors should occur
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="responses" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="verificationSuccess"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Verification Success</FormLabel>
                          <FormDescription>
                            Address verification requests succeed
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="walletConnectionSuccess"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Wallet Connection</FormLabel>
                          <FormDescription>
                            Wallet connection requests succeed
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="mockShipping.available"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Shipping Available</FormLabel>
                        <FormDescription>
                          Blind shipping services are available
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                {form.watch('mockShipping.available') && (
                  <FormField
                    control={form.control}
                    name="mockShipping.trackingAvailable"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Tracking Available</FormLabel>
                          <FormDescription>
                            Shipment tracking information is available
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="data" className="space-y-4">
                <FormField
                  control={form.control}
                  name="mockAddress.street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="mockAddress.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="mockAddress.state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="mockAddress.postal_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="mockAddress.country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="mockAddress.verification_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification Method</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select verification method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="document_upload">Document Upload</SelectItem>
                          <SelectItem value="postal_code">Postal Code</SelectItem>
                          <SelectItem value="geocoding">Geocoding</SelectItem>
                          <SelectItem value="manual_review">Manual Review</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="mockWallet.address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wallet Address</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onResetConfig}
                className="flex items-center gap-2"
              >
                <RefreshCcw className="h-4 w-4" />
                Reset to Defaults
              </Button>
              <Button type="submit">Save Configuration</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SandboxConfigurationPanel;
