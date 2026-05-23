-- 1. Create homepage_content table
CREATE TABLE IF NOT EXISTS public.homepage_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(section, key)
);
ALTER TABLE public.homepage_content DISABLE ROW LEVEL SECURITY;

-- 2. Seed default announcement bar messages
INSERT INTO public.homepage_content (section, key, value, sort_order) VALUES
  ('announcement', 'message_1', 'Free shipping on orders above ₹2,000', 1),
  ('announcement', 'message_2', 'COD available across India', 2),
  ('announcement', 'message_3', 'Easy 7-day returns & exchange', 3),
  ('announcement', 'message_4', 'Call us: +91 8660087544', 4)
ON CONFLICT (section, key) DO NOTHING;

-- 3. Seed hero defaults
INSERT INTO public.homepage_content (section, key, value, sort_order) VALUES
  ('hero', 'title', 'Elegance Woven in Tradition', 0),
  ('hero', 'subtitle', 'Discover our ultra-premium collection of authentic Indian sarees. Crafted for the modern woman who embraces her heritage.', 0),
  ('hero', 'image_url', '/images/products/saree-1.jpg', 0)
ON CONFLICT (section, key) DO NOTHING;

-- 4. Seed category images defaults
INSERT INTO public.homepage_content (section, key, value, image_url, sort_order) VALUES
  ('category', 'silk-sarees', 'Silk Sarees', '/images/products/saree-2.jpg', 1),
  ('category', 'banarasi-sarees', 'Banarasi Sarees', '/images/products/saree-3.jpg', 2),
  ('category', 'cotton-sarees', 'Cotton Sarees', '/images/products/saree-4.jpg', 3),
  ('category', 'designer-sarees', 'Designer Sarees', '/images/products/saree-5.jpg', 4),
  ('category', 'bridal-sarees', 'Bridal Sarees', '/images/products/saree-6.jpg', 5),
  ('category', 'casual-wear', 'Casual Wear', '/images/products/saree-7.jpg', 6)
ON CONFLICT (section, key) DO NOTHING;

-- 5. Add is_featured column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- 6. Create homepage-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'homepage-images', 'homepage-images', true, 5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- 7. Storage policies for homepage-images
CREATE POLICY "Public read access for homepage images"
ON storage.objects FOR SELECT USING (bucket_id = 'homepage-images');

CREATE POLICY "Authenticated users can upload homepage images"
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'homepage-images');

CREATE POLICY "Authenticated users can update homepage images"
ON storage.objects FOR UPDATE USING (bucket_id = 'homepage-images');

CREATE POLICY "Authenticated users can delete homepage images"
ON storage.objects FOR DELETE USING (bucket_id = 'homepage-images');

-- 8. Refresh schema
NOTIFY pgrst, 'reload schema';
