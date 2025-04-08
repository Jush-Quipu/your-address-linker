import React, { useState, useEffect } from 'react';
import DashboardNavbar from '@/components/DashboardNavbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Key, Copy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created_at: string;
  last_used: string | null;
  revoked: boolean;
}

const DashboardApiKeys: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatingKey, setGeneratingKey] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      toast.error('Authentication required', {
        description: 'Please sign in to access this page',
      });
      navigate('/auth');
    }
  }, [isAuthenticated, navigate, loading]);

  useEffect(() => {
    const fetchApiKeys = async () => {
      if (!isAuthenticated || !user) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('api_keys')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setApiKeys(data || []);
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
  }, [isAuthenticated, user]);

  const generateApiKey = () => {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  const handleGenerateApiKey = async () => {
    setShowNewKeyDialog(true);
  };

  const submitNewApiKey = async () => {
    if (!user) return;
    
    if (!newKeyName.trim()) {
      toast.error('API key name is required');
      return;
    }
    
    setGeneratingKey(true);
    
    try {
      const apiKey = generateApiKey();
      
      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          user_id: user.id,
          name: newKeyName.trim(),
          key: apiKey,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        setApiKeys(prev => [data, ...prev]);
        
        toast.success('API key generated successfully', {
          description: 'Make sure to copy your key now. You won\'t be able to see it again.'
        });
        
        navigator.clipboard.writeText(apiKey);
        
        setNewKeyName('');
        setShowNewKeyDialog(false);
      }
    } catch (error) {
      console.error('Error generating API key:', error);
      toast.error('Failed to generate API key', {
        description: 'Please try again later',
      });
    } finally {
      setGeneratingKey(false);
    }
  };

  const handleCopyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('API key copied to clipboard');
  };

  const handleRegenerateApiKey = async (id: string) => {
    if (!user) return;
    
    try {
      const apiKey = generateApiKey();
      
      const { data, error } = await supabase
        .from('api_keys')
        .update({ key: apiKey })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        setApiKeys(prev => 
          prev.map(key => key.id === id ? data : key)
        );
        
        navigator.clipboard.writeText(apiKey);
        
        toast.success('API key regenerated', {
          description: 'New key copied to clipboard'
        });
      }
    } catch (error) {
      console.error('Error regenerating API key:', error);
      toast.error('Failed to regenerate API key');
    }
  };

  const handleRevokeApiKey = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ revoked: true })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setApiKeys(prev => prev.map(key => 
        key.id === id ? { ...key, revoked: true } : key
      ));
      
      toast.success('API key revoked');
    } catch (error) {
      console.error('Error revoking API key:', error);
      toast.error('Failed to revoke API key');
    }
  };

  return (
    <div className="min-h-screen">
      <DashboardNavbar />
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
                          {key.revoked ? 'Revoked' : `${key.key.substring(0, 8)}...`}
                          {!key.revoked && (
                            <Button variant="ghost" size="sm" onClick={() => handleCopyApiKey(key.key)}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>{new Date(key.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {key.last_used 
                            ? new Date(key.last_used).toLocaleDateString() 
                            : 'Never used'}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {!key.revoked && (
                            <>
                              <Button variant="outline" size="sm" onClick={() => handleRegenerateApiKey(key.id)}>
                                <RefreshCw className="h-3 w-3 mr-1" /> Regenerate
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleRevokeApiKey(key.id)}>
                                Revoke
                              </Button>
                            </>
                          )}
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

          <Dialog open={showNewKeyDialog} onOpenChange={setShowNewKeyDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate New API Key</DialogTitle>
                <DialogDescription>
                  Give your API key a descriptive name. You'll only see the full key once.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input 
                    id="name" 
                    value={newKeyName} 
                    onChange={(e) => setNewKeyName(e.target.value)} 
                    className="col-span-3" 
                    placeholder="My API Key"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewKeyDialog(false)}>Cancel</Button>
                <Button onClick={submitNewApiKey} disabled={generatingKey || !newKeyName.trim()}>
                  {generatingKey ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>Generate</>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardApiKeys;
