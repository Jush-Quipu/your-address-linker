
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { 
  generateVerificationCode, 
  verifyPostalCode, 
  getVerificationStatus,
  cancelVerificationCode,
  PostalVerificationCode
} from '@/services/postalVerificationService';
import { 
  Mail, 
  Clock, 
  Shield, 
  RefreshCw, 
  Loader2, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle
} from 'lucide-react';

interface PostalVerificationProps {
  physicalAddressId: string;
  onVerificationComplete?: () => void;
}

const PostalVerification: React.FC<PostalVerificationProps> = ({ 
  physicalAddressId,
  onVerificationComplete
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState<PostalVerificationCode | null>(null);
  const [codeInput, setCodeInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && physicalAddressId) {
      fetchVerificationStatus();
    }
  }, [user, physicalAddressId]);

  const fetchVerificationStatus = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const status = await getVerificationStatus(user.id, physicalAddressId);
      setVerificationCode(status);
    } catch (err) {
      console.error('Error fetching verification status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCode = async () => {
    if (!user) {
      toast.error('You need to sign in to request a verification code');
      return;
    }

    setLoading(true);
    try {
      const code = await generateVerificationCode(user.id, physicalAddressId);
      if (code) {
        setVerificationCode(code);
        toast.success('Verification code generated successfully', {
          description: 'A postcard with your verification code will be sent to your address.'
        });
      }
    } catch (err) {
      console.error('Error generating verification code:', err);
      toast.error('Failed to generate verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!user) {
      toast.error('You need to sign in to verify your address');
      return;
    }

    if (!codeInput) {
      setError('Please enter the verification code from your postcard');
      return;
    }

    setVerifying(true);
    setError(null);
    
    try {
      const result = await verifyPostalCode(user.id, physicalAddressId, codeInput.toUpperCase());
      
      if (result.success) {
        toast.success('Address verified successfully!');
        setVerificationCode(result.verificationCode || null);
        if (onVerificationComplete) {
          onVerificationComplete();
        }
      } else {
        setError(result.message);
        setVerificationCode(result.verificationCode || null);
      }
    } catch (err) {
      console.error('Error verifying code:', err);
      setError('An error occurred during verification. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleCancelVerification = async () => {
    if (!user || !verificationCode) return;

    if (window.confirm('Are you sure you want to cancel this verification process?')) {
      setLoading(true);
      try {
        await cancelVerificationCode(user.id, verificationCode.id);
        toast.success('Verification cancelled');
        fetchVerificationStatus();
      } catch (err) {
        console.error('Error cancelling verification:', err);
        toast.error('Failed to cancel verification');
      } finally {
        setLoading(false);
      }
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Verified
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Expired
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            <XCircle className="mr-1 h-3 w-3" />
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  const getMailStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            <Mail className="mr-1 h-3 w-3" />
            Sent
          </Badge>
        );
      case 'delivered':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Delivered
          </Badge>
        );
      case 'preparing':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            <RefreshCw className="mr-1 h-3 w-3" />
            Preparing
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  const isActiveVerification = verificationCode && 
    verificationCode.status === 'pending' && 
    new Date(verificationCode.expires_at) > new Date();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Mail className="mr-2 h-5 w-5 text-primary" />
          Postal Verification
        </CardTitle>
        <CardDescription>
          Verify your address by receiving a postcard with a unique code
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : verificationCode && verificationCode.status === 'verified' ? (
          <Alert className="bg-green-50 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle>Address Verified</AlertTitle>
            <AlertDescription>
              Your address has been successfully verified on {formatDate(verificationCode.verified_at)}.
            </AlertDescription>
          </Alert>
        ) : verificationCode ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              {getStatusBadge(verificationCode.status)}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Mail Status:</span>
              {getMailStatusBadge(verificationCode.mail_status)}
            </div>
            
            {verificationCode.tracking_number && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tracking Number:</span>
                <span className="text-sm font-mono">{verificationCode.tracking_number}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Created:</span>
              <span className="text-sm">{formatDate(verificationCode.created_at)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Expires:</span>
              <span className="text-sm">{formatDate(verificationCode.expires_at)}</span>
            </div>
            
            <Separator />
            
            {isActiveVerification && (
              <div className="space-y-4">
                <Alert variant="default">
                  <Mail className="h-4 w-4" />
                  <AlertTitle>Enter Verification Code</AlertTitle>
                  <AlertDescription>
                    Enter the verification code from the postcard sent to your address.
                  </AlertDescription>
                </Alert>
                
                <div className="flex flex-col space-y-2">
                  <label htmlFor="verificationCode" className="text-sm font-medium">
                    Verification Code:
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      id="verificationCode"
                      value={codeInput}
                      onChange={(e) => {
                        setCodeInput(e.target.value.toUpperCase());
                        setError(null);
                      }}
                      placeholder="Enter code (e.g. ABC123)"
                      maxLength={10}
                      className="font-mono uppercase"
                    />
                    <Button onClick={handleVerifyCode} disabled={verifying || !codeInput}>
                      {verifying ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Verify'
                      )}
                    </Button>
                  </div>
                  {error && (
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Attempts: {verificationCode.attempts}/{verificationCode.max_attempts}
                  </p>
                </div>
                
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelVerification}
                    disabled={loading}
                  >
                    Cancel Verification
                  </Button>
                </div>
              </div>
            )}
            
            {verificationCode.status === 'expired' && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Verification Expired</AlertTitle>
                <AlertDescription>
                  Your verification code has expired. Please request a new code.
                </AlertDescription>
              </Alert>
            )}
            
            {verificationCode.status === 'cancelled' && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Verification Cancelled</AlertTitle>
                <AlertDescription>
                  This verification has been cancelled. Please request a new code if needed.
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Verification Code Requested</h3>
            <p className="text-muted-foreground mb-6">
              Request a postcard with a verification code to be sent to your address.
              This adds an extra layer of verification to your account.
            </p>
            <Button
              onClick={handleGenerateCode}
              disabled={loading}
              className="mx-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Request Verification Code
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {!loading && verificationCode && verificationCode.status !== 'verified' && verificationCode.status !== 'pending' && (
          <Button
            onClick={handleGenerateCode}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Request New Verification Code'
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default PostalVerification;
