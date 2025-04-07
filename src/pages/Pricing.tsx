
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Pricing: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that's right for your needs, with no hidden fees or surprises.
            </p>
          </div>
          
          <Tabs defaultValue="monthly" className="mb-10">
            <div className="flex justify-center mb-10">
              <TabsList>
                <TabsTrigger value="monthly">Monthly Billing</TabsTrigger>
                <TabsTrigger value="annual">Annual Billing (Save 20%)</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="monthly">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <PricingCard 
                  title="Basic"
                  price="$19"
                  description="Perfect for individuals and small projects"
                  features={[
                    { name: "10 address verifications per month", included: true },
                    { name: "Connect 1 wallet", included: true },
                    { name: "Basic API access", included: true },
                    { name: "Email support", included: true },
                    { name: "Webhook notifications", included: false },
                    { name: "Zero-knowledge proofs", included: false },
                    { name: "Developer portal access", included: false },
                    { name: "Priority support", included: false }
                  ]}
                  buttonText="Start Free Trial"
                />
                
                <PricingCard 
                  title="Professional"
                  price="$49"
                  description="For businesses with growing needs"
                  popular={true}
                  features={[
                    { name: "100 address verifications per month", included: true },
                    { name: "Connect up to 10 wallets", included: true },
                    { name: "Full API access", included: true },
                    { name: "Email & chat support", included: true },
                    { name: "Webhook notifications", included: true },
                    { name: "Zero-knowledge proofs", included: true },
                    { name: "Developer portal access", included: false },
                    { name: "Priority support", included: false }
                  ]}
                  buttonText="Start Free Trial"
                />
                
                <PricingCard 
                  title="Enterprise"
                  price="$199"
                  description="For organizations with advanced requirements"
                  features={[
                    { name: "Unlimited address verifications", included: true },
                    { name: "Connect unlimited wallets", included: true },
                    { name: "Full API access", included: true },
                    { name: "24/7 support", included: true },
                    { name: "Webhook notifications", included: true },
                    { name: "Zero-knowledge proofs", included: true },
                    { name: "Developer portal access", included: true },
                    { name: "Priority support", included: true }
                  ]}
                  buttonText="Contact Sales"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="annual">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <PricingCard 
                  title="Basic"
                  price="$15"
                  period="per month, billed annually"
                  description="Perfect for individuals and small projects"
                  features={[
                    { name: "10 address verifications per month", included: true },
                    { name: "Connect 1 wallet", included: true },
                    { name: "Basic API access", included: true },
                    { name: "Email support", included: true },
                    { name: "Webhook notifications", included: false },
                    { name: "Zero-knowledge proofs", included: false },
                    { name: "Developer portal access", included: false },
                    { name: "Priority support", included: false }
                  ]}
                  buttonText="Start Free Trial"
                />
                
                <PricingCard 
                  title="Professional"
                  price="$39"
                  period="per month, billed annually"
                  description="For businesses with growing needs"
                  popular={true}
                  features={[
                    { name: "100 address verifications per month", included: true },
                    { name: "Connect up to 10 wallets", included: true },
                    { name: "Full API access", included: true },
                    { name: "Email & chat support", included: true },
                    { name: "Webhook notifications", included: true },
                    { name: "Zero-knowledge proofs", included: true },
                    { name: "Developer portal access", included: false },
                    { name: "Priority support", included: false }
                  ]}
                  buttonText="Start Free Trial"
                />
                
                <PricingCard 
                  title="Enterprise"
                  price="$159"
                  period="per month, billed annually"
                  description="For organizations with advanced requirements"
                  features={[
                    { name: "Unlimited address verifications", included: true },
                    { name: "Connect unlimited wallets", included: true },
                    { name: "Full API access", included: true },
                    { name: "24/7 support", included: true },
                    { name: "Webhook notifications", included: true },
                    { name: "Zero-knowledge proofs", included: true },
                    { name: "Developer portal access", included: true },
                    { name: "Priority support", included: true }
                  ]}
                  buttonText="Contact Sales"
                />
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-center mb-10">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Can I change plans later?</h3>
                <p className="text-muted-foreground">Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">What payment methods do you accept?</h3>
                <p className="text-muted-foreground">We accept all major credit cards, PayPal, and select cryptocurrencies including ETH and BTC.</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Is there a free trial?</h3>
                <p className="text-muted-foreground">Yes, all plans come with a 14-day free trial so you can test the features before committing.</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">What happens if I exceed my verification limit?</h3>
                <p className="text-muted-foreground">You'll be notified when you reach 80% of your limit. You can purchase additional verifications or upgrade your plan.</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Do you offer custom plans?</h3>
                <p className="text-muted-foreground">Yes, enterprise customers can contact our sales team for custom solutions tailored to specific requirements.</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">How secure is my data?</h3>
                <p className="text-muted-foreground">We use end-to-end encryption and zero-knowledge proofs to ensure your data remains private and secure.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

interface PricingFeature {
  name: string;
  included: boolean;
}

interface PricingCardProps {
  title: string;
  price: string;
  period?: string;
  description: string;
  features: PricingFeature[];
  buttonText: string;
  popular?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  period = "per month",
  description,
  features,
  buttonText,
  popular = false
}) => {
  return (
    <Card className={`flex flex-col ${popular ? 'border-primary shadow-lg ring-2 ring-primary' : ''}`}>
      {popular && (
        <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
          Most Popular
        </div>
      )}
      <CardHeader className="pb-0">
        <CardTitle className="text-2xl">{title}</CardTitle>
        <div className="mt-4 flex items-baseline">
          <span className="text-3xl font-extrabold">{price}</span>
          <span className="ml-1 text-sm text-muted-foreground">{period}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-4">{description}</p>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-3 mt-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              {feature.included ? (
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
              ) : (
                <X className="h-5 w-5 text-muted-foreground mr-2 shrink-0" />
              )}
              <span className={feature.included ? '' : 'text-muted-foreground'}>
                {feature.name}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button variant={popular ? "default" : "outline"} className="w-full">
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Pricing;
