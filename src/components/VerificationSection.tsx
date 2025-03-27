
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AppVerificationStatus, DeveloperApp } from "@/services/developerService";
import { Check, AlertTriangle, Clock } from 'lucide-react';

interface VerificationSectionProps {
  app: DeveloperApp;
}

const VerificationSection: React.FC<VerificationSectionProps> = ({ app }) => {
  const verificationStatus = app.verification_status || AppVerificationStatus.PENDING;
  const isVerified = verificationStatus === AppVerificationStatus.VERIFIED;
  const isPending = verificationStatus === AppVerificationStatus.PENDING;
  const isRejected = verificationStatus === AppVerificationStatus.REJECTED;

  const getStatusBadge = () => {
    switch (verificationStatus) {
      case AppVerificationStatus.VERIFIED:
        return <Badge className="bg-green-100 text-green-800 flex items-center">
          <Check className="h-3 w-3 mr-1" />Verified
        </Badge>;
      case AppVerificationStatus.REJECTED:
        return <Badge variant="destructive" className="flex items-center">
          <AlertTriangle className="h-3 w-3 mr-1" />Rejected
        </Badge>;
      case AppVerificationStatus.PENDING:
      default:
        return <Badge variant="outline" className="flex items-center">
          <Clock className="h-3 w-3 mr-1" />Pending Review
        </Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Application Verification</CardTitle>
            <CardDescription>
              Verify your application to access higher rate limits and production status
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isPending && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <Clock className="h-4 w-4 text-yellow-900" />
            <AlertTitle className="text-yellow-900">Verification Pending</AlertTitle>
            <AlertDescription className="text-yellow-800">
              Your application is currently under review by our team. 
              This process typically takes 1-3 business days.
            </AlertDescription>
          </Alert>
        )}

        {isRejected && app.verification_details?.verification_notes && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Verification Rejected</AlertTitle>
            <AlertDescription>
              {app.verification_details.verification_notes}
            </AlertDescription>
          </Alert>
        )}

        {isVerified && (
          <Alert className="bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-900" />
            <AlertTitle className="text-green-900">Verification Successful</AlertTitle>
            <AlertDescription className="text-green-800">
              Your application has been verified and is approved for production use.
              {app.verification_details?.verified_at && (
                <span className="block mt-1 text-xs">
                  Verified on: {new Date(app.verification_details.verified_at).toLocaleDateString()}
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        <Separator />

        <div className="space-y-4">
          <h3 className="text-base font-medium">Verification Requirements</h3>
          
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <div className={`rounded-full p-1 ${app.website_url ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                {app.website_url ? <Check className="h-3 w-3" /> : <span className="h-3 w-3 block" />}
              </div>
              <div>
                <h4 className="text-sm font-medium">Valid Website URL</h4>
                <p className="text-xs text-muted-foreground">
                  A publicly accessible website for your application
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <div className={`rounded-full p-1 ${app.description && app.description.length > 30 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                {app.description && app.description.length > 30 ? <Check className="h-3 w-3" /> : <span className="h-3 w-3 block" />}
              </div>
              <div>
                <h4 className="text-sm font-medium">Detailed Description</h4>
                <p className="text-xs text-muted-foreground">
                  Clear description of how your app will use our API
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <div className={`rounded-full p-1 ${app.callback_urls && app.callback_urls.length > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                {app.callback_urls && app.callback_urls.length > 0 ? <Check className="h-3 w-3" /> : <span className="h-3 w-3 block" />}
              </div>
              <div>
                <h4 className="text-sm font-medium">Valid Callback URLs</h4>
                <p className="text-xs text-muted-foreground">
                  At least one valid callback URL for OAuth redirects
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="rounded-full p-1 bg-gray-100 text-gray-500">
                <span className="h-3 w-3 block" />
              </div>
              <div>
                <h4 className="text-sm font-medium">Privacy Policy</h4>
                <p className="text-xs text-muted-foreground">
                  Link to your privacy policy that explains data handling
                </p>
              </div>
            </div>
          </div>
        </div>

        {!isVerified && (
          <div className="space-y-4">
            <Separator />
            
            {isRejected ? (
              <div className="space-y-3">
                <h3 className="text-base font-medium">Resubmit for Verification</h3>
                <p className="text-sm text-muted-foreground">
                  Please address the issues mentioned above and resubmit your application for verification.
                </p>
                <Button>Resubmit Application</Button>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-base font-medium">Request Verification</h3>
                <p className="text-sm text-muted-foreground">
                  Once you've completed all the requirements, submit your application for verification.
                </p>
                <Button disabled={isPending}>
                  {isPending ? 'Verification Pending' : 'Request Verification'}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VerificationSection;
