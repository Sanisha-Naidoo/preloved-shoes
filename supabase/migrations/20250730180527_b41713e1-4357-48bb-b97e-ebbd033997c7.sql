-- Remove public schema functions that expose preloved schema
-- These functions create security risks by allowing public schema access to preloved data

DROP FUNCTION IF EXISTS public.create_shoe_in_preloved(text, text, text, text, text, text, text, uuid);
DROP FUNCTION IF EXISTS public.update_qr_code_in_preloved(uuid, text);
DROP FUNCTION IF EXISTS public.get_shoe_count_from_preloved();
DROP FUNCTION IF EXISTS public.check_shoe_exists_in_preloved(uuid);