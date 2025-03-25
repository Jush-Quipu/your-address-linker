
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Key, Copy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const DashboardApiKeys: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState<any[]>([]);

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated && !loading) {
      toast.error('Authentication required', {
        description: 'Please sign in to access this page',
      });
      navigate('/auth');
    }
  }, [isAuthenticated, navigate, loading]);

  useEffect(() => {
    const fetchApiKeys = async () => {
      // Here you would fetch API keys from your backend
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Mock data for now
        setApiKeys([]);
      } catch (error) {
        console.error('Error fetching API keys:', error);
        toast.error('Failed to load API keys', {
          description: 'Please try again later',
        });
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchApiKeys();
    }
  }, [isAuthenticated]);

  const handleGenerateApiKey = () => {
    toast.info('API key generation coming soon!');
  };

  const handleCopyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('API key copied to clipboard');
  };

  const handleRegenerateApiKey = (id: string) => {
    toast.info('API key regeneration coming soon!');
  };

  const handleRevokeApiKey = (id: string) => {
    toast.info('API key revocation coming soon!');
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold">API Keys</h1>
            <Button onClick={handleGenerateApiKey}>
              <Key className="mr-2 h-4 w-4" /> Generate New API Key
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Your API Keys</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading API keys...</span>
                </div>
              ) : apiKeys.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Key</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.map((key) => (
                      <TableRow key={key.id}>
                        <TableCell>{key.name}</TableCell>
                        <TableCell className="font-mono">
                          {key.key.substring(0, 8)}...
                          <Button variant="ghost" size="sm" onClick={() => handleCopyApiKey(key.key)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </TableCell>
                        <TableCell>{new Date(key.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {key.last_used 
                            ? new Date(key.last_used).toLocaleDateString() 
                            : 'Never used'}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleRegenerateApiKey(key.id)}>
                            <RefreshCw className="h-3 w-3 mr-1" /> Regenerate
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleRevokeApiKey(key.id)}>
                            Revoke
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-10 text-center">
                  <p className="text-muted-foreground mb-4">You don't have any API keys yet</p>
                  <Button onClick={handleGenerateApiKey}>
                    <Key className="mr-2 h-4 w-4" /> Generate Your First API Key
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardApiKeys;
