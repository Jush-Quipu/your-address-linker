
-- Create a table for shipments
CREATE TABLE IF NOT EXISTS public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.address_permissions(id) ON DELETE CASCADE,
  carrier TEXT NOT NULL,
  service TEXT NOT NULL,
  tracking_number TEXT,
  status TEXT NOT NULL DEFAULT 'created',
  package_details JSONB,
  carrier_details JSONB,
  tracking_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  confirmation_required BOOLEAN DEFAULT false,
  confirmation_status TEXT
);

-- Add Row Level Security
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own shipments"
  ON public.shipments
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own shipments"
  ON public.shipments
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create an index on tracking_number and carrier for faster lookups
CREATE INDEX IF NOT EXISTS idx_shipments_tracking ON public.shipments(tracking_number, carrier);

-- Create an index on permission_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_shipments_permission ON public.shipments(permission_id);
