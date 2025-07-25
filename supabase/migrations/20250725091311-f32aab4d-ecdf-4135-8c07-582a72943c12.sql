-- Create the preloved schema for this app
CREATE SCHEMA IF NOT EXISTS preloved;

-- Create tables in the preloved schema with all necessary data

-- Move shoes table
CREATE TABLE preloved.shoes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand text NOT NULL,
  model text,
  size text NOT NULL,
  size_unit text NOT NULL DEFAULT 'EU',
  condition text NOT NULL,
  rating integer,
  photo_url text,
  sole_photo_url text,
  qr_code text,
  user_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on shoes
ALTER TABLE preloved.shoes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for shoes - allow public access for this app
CREATE POLICY "Allow public access to shoes" ON preloved.shoes FOR ALL USING (true) WITH CHECK (true);

-- Move scan_entries table
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

-- Enable RLS on scan_entries
ALTER TABLE preloved.scan_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for scan_entries - allow public access
CREATE POLICY "Allow public access to scan_entries" ON preloved.scan_entries FOR ALL USING (true) WITH CHECK (true);

-- Move notion_locks table
CREATE TABLE preloved.notion_locks (
  shoe_id text NOT NULL,
  user_id uuid,
  locked_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on notion_locks
ALTER TABLE preloved.notion_locks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notion_locks - allow public access
CREATE POLICY "Allow public access to notion_locks" ON preloved.notion_locks FOR ALL USING (true) WITH CHECK (true);

-- Create profiles table in preloved schema
CREATE TABLE preloved.profiles (
  id uuid NOT NULL,
  email text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE preloved.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles - allow public access
CREATE POLICY "Allow public access to profiles" ON preloved.profiles FOR ALL USING (true) WITH CHECK (true);

-- Copy data from public tables to preloved schema
INSERT INTO preloved.shoes SELECT * FROM public.shoes;
INSERT INTO preloved.scan_entries SELECT * FROM public.scan_entries;
INSERT INTO preloved.notion_locks SELECT * FROM public.notion_locks;
INSERT INTO preloved.profiles SELECT * FROM public.profiles WHERE id IS NOT NULL;