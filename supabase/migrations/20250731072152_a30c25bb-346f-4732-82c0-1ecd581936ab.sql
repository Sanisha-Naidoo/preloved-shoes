-- Fix search_path security issue for preloved schema functions with correct signatures

ALTER FUNCTION preloved.get_shoe_count() SET search_path = '';
ALTER FUNCTION preloved.create_shoe(uuid, text, text, text, text, integer, text, uuid) SET search_path = '';
ALTER FUNCTION preloved.create_shoe(text, text, text, text, text, text, text, text) SET search_path = '';
ALTER FUNCTION preloved.update_qr_code(uuid, text) SET search_path = '';
ALTER FUNCTION preloved.check_shoe_exists(uuid) SET search_path = '';
ALTER FUNCTION preloved.get_shoes_for_notion() SET search_path = '';

-- Also fix any other functions that might exist
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN 
        SELECT p.proname, pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'preloved'
    LOOP
        EXECUTE format('ALTER FUNCTION preloved.%I(%s) SET search_path = ''''', func_record.proname, func_record.args);
    END LOOP;
END $$;