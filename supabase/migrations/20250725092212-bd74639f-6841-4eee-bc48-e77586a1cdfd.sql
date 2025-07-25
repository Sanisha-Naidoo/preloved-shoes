-- Create a function to execute parameterized SQL for the preloved schema
CREATE OR REPLACE FUNCTION public.exec_sql(sql_query TEXT, sql_params TEXT[] DEFAULT '{}')
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = preloved, public
AS $$
DECLARE
    result JSON;
    prepared_query TEXT;
    i INTEGER;
    param_value TEXT;
BEGIN
    -- Start with the original query
    prepared_query := sql_query;
    
    -- Replace $1, $2, etc. with actual parameter values
    FOR i IN 1..COALESCE(array_length(sql_params, 1), 0) LOOP
        param_value := sql_params[i];
        
        -- Handle NULL values
        IF param_value IS NULL THEN
            prepared_query := replace(prepared_query, '$' || i, 'NULL');
        ELSE
            -- Escape single quotes and wrap in quotes
            param_value := replace(param_value, '''', '''''');
            prepared_query := replace(prepared_query, '$' || i, '''' || param_value || '''');
        END IF;
    END LOOP;
    
    -- Execute the query and collect results as JSON array
    EXECUTE 'SELECT COALESCE(json_agg(row_to_json(t)), ''[]''::json) FROM (' || prepared_query || ') t' INTO result;
    
    RETURN result;
END;
$$;