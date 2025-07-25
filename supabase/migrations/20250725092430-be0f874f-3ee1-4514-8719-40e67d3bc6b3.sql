-- Drop the conflicting public schema tables since data is copied to preloved
DROP TABLE IF EXISTS public.shoes CASCADE;
DROP TABLE IF EXISTS public.scan_entries CASCADE;
DROP TABLE IF EXISTS public.notion_locks CASCADE;