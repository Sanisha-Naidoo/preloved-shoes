-- Create a function to execute parameterized SQL safely
CREATE OR REPLACE FUNCTION exec_sql(query text, params jsonb DEFAULT '[]'::jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_json jsonb;
  rec record;
  results jsonb[] := '{}';
BEGIN
  -- Execute the query and collect results into a JSON array
  FOR rec IN EXECUTE query USING VARIADIC (
    SELECT array_agg(value::text) 
    FROM jsonb_array_elements_text(params)
  )
  LOOP
    results := array_append(results, to_jsonb(rec));
  END LOOP;
  
  RETURN array_to_json(results)::jsonb;
END;
$$;