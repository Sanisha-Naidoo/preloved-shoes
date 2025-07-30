-- Create a function to execute raw SQL with parameters
CREATE OR REPLACE FUNCTION exec_sql(sql text, params jsonb DEFAULT '[]'::jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  -- This function allows controlled SQL execution for edge functions
  -- Note: This is a simplified version - in production you'd want more security controls
  EXECUTE sql USING variadic (SELECT array_agg(value) FROM jsonb_array_elements_text(params))
  INTO result;
  
  RETURN result;
END;
$$;