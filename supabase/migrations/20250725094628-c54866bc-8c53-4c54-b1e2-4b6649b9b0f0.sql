-- Create views in public schema that point to preloved tables
CREATE OR REPLACE VIEW public.shoes AS SELECT * FROM preloved.shoes;
CREATE OR REPLACE VIEW public.scan_entries AS SELECT * FROM preloved.scan_entries;
CREATE OR REPLACE VIEW public.notion_locks AS SELECT * FROM preloved.notion_locks;

-- Allow operations on these views
GRANT ALL ON public.shoes TO authenticated, anon, service_role;
GRANT ALL ON public.scan_entries TO authenticated, anon, service_role;
GRANT ALL ON public.notion_locks TO authenticated, anon, service_role;