-- 1. Storage Buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('product-images', 'product-images', true),
  ('homepage-images', 'homepage-images', true),
  ('videos', 'videos', true),
  ('admin-uploads', 'admin-uploads', true)
ON CONFLICT DO NOTHING;

-- 2. Products table updates
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS compare_at_price NUMERIC;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_new_arrival BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS care_instructions TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS origin TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS craft TEXT;

-- 3. Testimonials table
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_city TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.testimonials DISABLE ROW LEVEL SECURITY;

INSERT INTO public.testimonials (customer_name, customer_city, rating, review_text) 
VALUES
('Meena Sharma', 'Bangalore', 5, 'The Kanjivaram saree was absolutely stunning. Perfect for my daughter''s wedding!'),
('Priya Patel', 'Mumbai', 5, 'Quality is exceptional. The silk feels so rich and colors are exactly as shown.'),
('Anita Desai', 'Dharwad', 5, 'Fast delivery to my city! Beautifully packed. Will definitely order again from Prerna Silks.');

-- 4. Wishlists table (for persistence)
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);
ALTER TABLE public.wishlists DISABLE ROW LEVEL SECURITY;

-- 5. Fix users trigger and backfill
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'first_name', split_part(new.email, '@', 1)), 
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Backfill users
INSERT INTO public.users (id, email, first_name, last_name, role)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'first_name', split_part(email, '@', 1)), 
  COALESCE(raw_user_meta_data->>'last_name', ''),
  'user'
FROM auth.users
ON CONFLICT (id) DO NOTHING;
