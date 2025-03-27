
import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { updateDeveloperApp, DeveloperApp } from "@/services/developerService";

// Usage limits schema
const usageLimitsSchema = z.object({
  monthlyRequestLimit: z.coerce.number()
    .min(100, { message: "Monthly request limit must be at least 100" })
    .max(100000, { message: "Monthly request limit cannot exceed 100,000" }),
});

type UsageLimitsFormValues = z.infer<typeof usageLimitsSchema>;

interface UsageLimitsSectionProps {
  app: DeveloperApp;
  onAppUpdated: (app: DeveloperApp) => void;
}

const UsageLimitsSection: React.FC<UsageLimitsSectionProps> = ({ app, onAppUpdated }) => {
  // Example usage data - in a real app, this would come from API analytics
  const currentMonthUsage = 320; // example value
  const currentLimit = app.monthly_request_limit || 1000;
  const usagePercentage = Math.min(Math.round((currentMonthUsage / currentLimit) * 100), 100);

  // Initialize form with existing values
  const form = useForm<UsageLimitsFormValues>({
    resolver: zodResolver(usageLimitsSchema),
    defaultValues: {
      monthlyRequestLimit: app.monthly_request_limit || 1000,
    },
  });

  // Handle form submission
  const onSubmit = async (values: UsageLimitsFormValues) => {
    try {
      const updatedApp = await updateDeveloperApp(app.id, {
        requestLimit: values.monthlyRequestLimit,
      });
      
      toast.success("Usage limits updated successfully");
      onAppUpdated(updatedApp);
    } catch (error) {
      console.error('Error updating usage limits:', error);
      toast.error("Failed to update usage limits");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage Limits & Quotas</CardTitle>
        <CardDescription>
          Manage API request limits for your application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Current Usage (This Month)</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{currentMonthUsage} requests</span>
              <span>{currentLimit} limit</span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {usagePercentage}% of your monthly quota used
            </p>
          </div>
        </div>

        <Separator />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="monthlyRequestLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Request Limit</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      min={100}
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum number of API requests allowed per month
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between bg-muted p-4 rounded-lg text-sm">
              <div>
                <span className="font-medium">Current Plan:</span> Developer
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="/plans">Upgrade Plan</a>
              </Button>
            </div>

            <Button type="submit" className="w-full">
              Update Usage Limits
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default UsageLimitsSection;
