-- Create the missing notion_locks table in preloved schema
CREATE TABLE IF NOT EXISTS preloved.notion_locks (
    shoe_id UUID NOT NULL,
    user_id UUID,
    locked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    PRIMARY KEY (shoe_id)
);

-- Enable RLS on preloved.notion_locks
ALTER TABLE preloved.notion_locks ENABLE ROW LEVEL SECURITY;

-- Create a permissive policy for the preloved app operations
CREATE POLICY "Allow preloved operations" ON preloved.notion_locks
FOR ALL USING (true)
WITH CHECK (true);

-- Add foreign key constraint to link with shoes table
ALTER TABLE preloved.notion_locks 
ADD CONSTRAINT fk_notion_locks_shoe_id 
FOREIGN KEY (shoe_id) REFERENCES preloved.shoes(id) ON DELETE CASCADE;