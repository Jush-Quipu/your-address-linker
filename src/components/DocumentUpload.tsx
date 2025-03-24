
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Progress } from '@/components/ui/progress';

interface DocumentUploadProps {
  onDocumentUploaded?: (filePath: string) => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onDocumentUploaded }) => {
  const { user, isAuthenticated } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFilePath, setUploadedFilePath] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type and size
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        toast.error('Invalid file type', {
          description: 'Please upload a PDF, JPEG, or PNG file',
        });
        return;
      }
      
      if (file.size > maxSize) {
        toast.error('File too large', {
          description: 'Please upload a file smaller than 5MB',
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !isAuthenticated || !user) {
      toast.error('Please select a file first', {
        description: 'You need to select a file to upload',
      });
      return;
    }
    
    try {
      setUploading(true);
      setUploadProgress(0);
      
      // Create a unique file path for this user
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `verification-docs/${user.id}/${fileName}`;
      
      // Simulate progress updates (Supabase JS client doesn't have progress events)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 300);

      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('address-verification')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });
        
      clearInterval(progressInterval);
      
      if (error) {
        throw error;
      }
      
      setUploadProgress(100);
      setUploadedFilePath(data.path);
      
      toast.success('Document uploaded successfully', {
        description: 'Your document has been uploaded and will be verified soon',
      });
      
      if (onDocumentUploaded) {
        onDocumentUploaded(data.path);
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadedFilePath(null);
    setUploadProgress(0);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Upload Proof of Address</CardTitle>
        <CardDescription>
          Upload a utility bill, bank statement, or other document showing your address
        </CardDescription>
      </CardHeader>
      <CardContent>
        {uploadedFilePath ? (
          <div className="bg-secondary p-4 rounded-lg flex items-center space-x-3">
            <Check className="text-green-500" size={24} />
            <div className="flex-1">
              <p className="text-sm font-medium">Document uploaded successfully</p>
              <p className="text-xs text-muted-foreground">Your document will be verified within 24-48 hours</p>
            </div>
          </div>
        ) : selectedFile ? (
          <div className="bg-secondary p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <FileText className="text-primary" size={20} />
                <span className="text-sm font-medium truncate max-w-[200px]">
                  {selectedFile.name}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRemoveFile}
                disabled={uploading}
              >
                <X size={18} />
              </Button>
            </div>
            
            {uploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-right text-muted-foreground">{uploadProgress}%</p>
              </div>
            )}
          </div>
        ) : (
          <div 
            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-secondary/50 transition-colors"
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            <input
              id="fileInput"
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <Upload className="mx-auto text-muted-foreground mb-3" size={28} />
            <p className="text-sm font-medium mb-1">Drag and drop or click to upload</p>
            <p className="text-xs text-muted-foreground">
              Supported formats: PDF, JPEG, PNG (max 5MB)
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className={selectedFile && !uploadedFilePath ? '' : 'hidden'}>
        <Button 
          className="w-full" 
          onClick={handleUpload} 
          disabled={!selectedFile || uploading || !!uploadedFilePath}
        >
          {uploading ? 'Uploading...' : 'Upload Document'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DocumentUpload;
