
-- Enable real-time functionality for the shoes table
-- Set replica identity to capture full row data during changes
ALTER TABLE public.shoes REPLICA IDENTITY FULL;

-- Add the shoes table to the realtime publication
-- This allows clients to subscribe to real-time changes
ALTER PUBLICATION supabase_realtime ADD TABLE public.shoes;
