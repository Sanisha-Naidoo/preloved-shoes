-- Fix search_path security issue for preloved schema functions
-- Update all functions in preloved schema to have secure search_path

ALTER FUNCTION preloved.get_shoe_count() SET search_path = '';
ALTER FUNCTION preloved.create_shoe(text, text, text, text, text, integer, text, text) SET search_path = '';
ALTER FUNCTION preloved.update_qr_code(text, text) SET search_path = '';
ALTER FUNCTION preloved.check_shoe_exists(text) SET search_path = '';
ALTER FUNCTION preloved.get_shoes_for_notion() SET search_path = '';
ALTER FUNCTION preloved.execute_sql(text) SET search_path = '';
ALTER FUNCTION preloved.update_shoe_qr_code(text, text) SET search_path = '';