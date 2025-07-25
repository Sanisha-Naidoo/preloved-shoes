-- Create the preloved schema for this app
CREATE SCHEMA IF NOT EXISTS preloved;

-- Create shoes table with correct structure matching public.shoes
CREATE TABLE preloved.shoes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand text NOT NULL,
  model text,
  size text NOT NULL,
  condition text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  size_unit text NOT NULL DEFAULT 'EU',
  rating integer,
  photo_url text,
  sole_photo_url text,
  qr_code text,
  user_id uuid
);

-- Enable RLS and create policies for shoes
ALTER TABLE preloved.shoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to shoes" ON preloved.shoes FOR ALL USING (true) WITH CHECK (true);

-- Create scan_entries table
CREATE TABLE preloved.scan_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL,
  file_url text NOT NULL,
  description text,
  notes text,
  tags text[],
  shoe_id uuid,
  notion_id text,
  upload_date timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS and create policies for scan_entries
ALTER TABLE preloved.scan_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to scan_entries" ON preloved.scan_entries FOR ALL USING (true) WITH CHECK (true);

-- Copy data from public tables to preloved schema
INSERT INTO preloved.shoes (id, brand, model, size, condition, created_at, size_unit, rating, photo_url, sole_photo_url, qr_code, user_id)
SELECT id, brand, model, size, condition, created_at, size_unit, rating, photo_url, sole_photo_url, qr_code, user_id 
FROM public.shoes;

INSERT INTO preloved.scan_entries (id, filename, file_type, file_size, file_url, description, notes, tags, shoe_id, notion_id, upload_date, created_at)
SELECT id, filename, file_type, file_size, file_url, description, notes, tags, shoe_id, notion_id, upload_date, created_at
FROM public.scan_entries;