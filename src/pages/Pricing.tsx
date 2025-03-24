
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';

const PricingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "For individual users getting started with address verification",
      features: [
        "Connect 1 wallet address",
        "Verify 1 home address",
        "Basic address sharing controls",
        "Up to 5 verifications per month",
        "Community support"
      ],
      buttonText: isAuthenticated ? "Current Plan" : "Get Started",
      buttonVariant: "outline" as const,
      popular: false
    },
    {
      name: "Pro",
      price: "$9.99",
      period: "per month",
      description: "For power users who need advanced control and verification",
      features: [
        "Connect up to 5 wallet addresses",
        "Verify up to 3 home addresses",
        "Advanced sharing permissions",
        "Unlimited verifications",
        "Priority support",
        "Address change history",
        "Custom expiration for permissions"
      ],
      buttonText: "Upgrade",
      buttonVariant: "default" as const,
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For businesses requiring integration with multiple services",
      features: [
        "Unlimited wallet connections",
        "Unlimited address verifications",
        "API access for business integration",
        "Full SDK access",
        "Dedicated account manager",
        "Custom security requirements",
        "SLA guarantee",
        "White-label option"
      ],
      buttonText: "Contact Sales",
      buttonVariant: "outline" as const,
      popular: false
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that works best for your needs, with no hidden fees.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card key={index} className={`border ${plan.popular ? 'border-primary shadow-lg' : 'border-border'} relative`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-0 right-0 mx-auto w-fit bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground ml-1">{plan.period}</span>}
                  </div>
                  <p className="text-muted-foreground mt-2">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant={plan.buttonVariant} 
                    className="w-full"
                    disabled={isAuthenticated && plan.name === "Free" && plan.buttonText === "Current Plan"}
                  >
                    {plan.buttonText}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <div className="mt-20 bg-muted p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-center">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-lg mb-2">Can I change plans later?</h3>
                <p className="text-muted-foreground">Yes, you can upgrade or downgrade your plan at any time. Changes will be applied at the start of your next billing cycle.</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Do you offer refunds?</h3>
                <p className="text-muted-foreground">We offer a 14-day money-back guarantee for all paid plans. If you're not satisfied, contact our support team.</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">What payment methods do you accept?</h3>
                <p className="text-muted-foreground">We accept all major credit cards, PayPal, and various cryptocurrencies including ETH, USDC, and DAI.</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Is there a contract or commitment?</h3>
                <p className="text-muted-foreground">No, all plans are month-to-month with no long-term commitments. You can cancel anytime.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PricingPage;
