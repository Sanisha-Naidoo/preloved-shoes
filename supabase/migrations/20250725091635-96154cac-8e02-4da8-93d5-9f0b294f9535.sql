-- Create a function to execute raw SQL for the preloved schema
CREATE OR REPLACE FUNCTION preloved.execute_sql(query_text TEXT, param_values TEXT[] DEFAULT '{}')
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
    prepared_query TEXT;
    i INTEGER;
BEGIN
    -- Replace $1, $2, etc. with actual parameter values
    prepared_query := query_text;
    
    -- Simple parameter substitution (for basic queries)
    FOR i IN 1..array_length(param_values, 1) LOOP
        prepared_query := replace(prepared_query, '$' || i, quote_literal(param_values[i]));
    END LOOP;
    
    -- Execute the query and return as JSON
    EXECUTE 'SELECT row_to_json(result) FROM (' || prepared_query || ') result' INTO result;
    
    RETURN result;
END;
$$;