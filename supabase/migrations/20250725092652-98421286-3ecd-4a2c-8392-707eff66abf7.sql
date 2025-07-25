-- Remove all public schema tables related to preloved app completely
DROP TABLE IF EXISTS public.shoes CASCADE;
DROP TABLE IF EXISTS public.scan_entries CASCADE; 
DROP TABLE IF EXISTS public.notion_locks CASCADE;

-- Ensure preloved schema has all necessary tables
-- Re-create the shoes table in preloved schema if it doesn't exist
CREATE TABLE IF NOT EXISTS preloved.shoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand TEXT NOT NULL,
    model TEXT,
    size TEXT NOT NULL,
    size_unit TEXT DEFAULT 'US',
    condition TEXT NOT NULL,
    rating TEXT,
    photo_url TEXT,
    sole_photo_url TEXT,
    user_id UUID,
    qr_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on preloved.shoes
ALTER TABLE preloved.shoes ENABLE ROW LEVEL SECURITY;

-- Create a permissive policy for the preloved app operations
CREATE POLICY "Allow preloved operations" ON preloved.shoes
FOR ALL USING (true)
WITH CHECK (true);

-- Enable realtime for the preloved.shoes table
ALTER TABLE preloved.shoes REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE preloved.shoes;