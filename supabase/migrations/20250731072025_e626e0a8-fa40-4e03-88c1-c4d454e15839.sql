-- Grant execute permissions on preloved schema functions to service role
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA preloved TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA preloved TO anon;

-- Also grant usage on the schema
GRANT USAGE ON SCHEMA preloved TO service_role;
GRANT USAGE ON SCHEMA preloved TO anon;