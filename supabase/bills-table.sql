-- Create bills table
CREATE TABLE IF NOT EXISTS public.bills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  bill_date DATE NOT NULL,
  bill_time TEXT,
  image_url TEXT,
  total_tax NUMERIC,
  total_amount NUMERIC,
  total_bills INTEGER,
  bill_entries JSONB,
  is_verified BOOLEAN DEFAULT false
);

-- Add index for duplicate checking
CREATE UNIQUE INDEX IF NOT EXISTS bills_bill_date_idx ON public.bills (bill_date);

-- Enable RLS
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

-- Create admin policy
CREATE POLICY "Admins can do everything on bills" 
  ON public.bills FOR ALL 
  TO authenticated 
  USING (true)
  WITH CHECK (true);

-- Create bills bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('bills', 'bills', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket policies
CREATE POLICY "Public Access" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'bills');

CREATE POLICY "Authenticated users can upload bills" 
  ON storage.objects FOR INSERT 
  TO authenticated
  WITH CHECK (bucket_id = 'bills');

CREATE POLICY "Authenticated users can delete bills" 
  ON storage.objects FOR DELETE 
  TO authenticated
  USING (bucket_id = 'bills');
