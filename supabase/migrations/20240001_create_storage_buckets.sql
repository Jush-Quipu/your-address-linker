
-- Create a storage bucket for address verification documents
INSERT INTO storage.buckets (id, name, public, avif_autodetection)
VALUES ('address-verification', 'Address Verification Documents', false, false);

-- Set up security policies for the address-verification bucket
-- Allow authenticated users to upload their own documents
CREATE POLICY "Users can upload their own documents" 
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'address-verification' AND
    (storage.foldername(name))[1] = 'verification-docs' AND
    (storage.foldername(name))[2] = auth.uid()::text
);

-- Allow users to read their own documents
CREATE POLICY "Users can view their own documents" 
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'address-verification' AND
    (storage.foldername(name))[1] = 'verification-docs' AND
    (storage.foldername(name))[2] = auth.uid()::text
);

-- Allow users to update their own documents
CREATE POLICY "Users can update their own documents" 
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'address-verification' AND
    (storage.foldername(name))[1] = 'verification-docs' AND
    (storage.foldername(name))[2] = auth.uid()::text
);

-- Allow users to delete their own documents
CREATE POLICY "Users can delete their own documents" 
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'address-verification' AND
    (storage.foldername(name))[1] = 'verification-docs' AND
    (storage.foldername(name))[2] = auth.uid()::text
);
