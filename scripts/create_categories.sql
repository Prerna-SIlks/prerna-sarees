-- Categories Table Migration
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;

INSERT INTO public.categories (name, slug) VALUES
('Silk', 'silk'),
('Cotton', 'cotton'),
('Banarasi', 'banarasi'),
('Linen', 'linen'),
('Designer', 'designer'),
('Bridal', 'bridal'),
('Casual', 'casual'),
('Georgette', 'georgette'),
('Chiffon', 'chiffon'),
('Net', 'net'),
('Organza', 'organza'),
('Kanjivaram', 'kanjivaram'),
('Chanderi', 'chanderi')
ON CONFLICT DO NOTHING;
