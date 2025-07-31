-- Fix the get_shoe_count function to use the correct schema path
CREATE OR REPLACE FUNCTION preloved.get_shoe_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'preloved, public'
AS $$
BEGIN
    RETURN (SELECT COUNT(*)::integer FROM preloved.shoes);
END;
$$;

-- Also fix the other functions to explicitly reference preloved schema
CREATE OR REPLACE FUNCTION preloved.create_shoe(
    p_brand text,
    p_model text,
    p_size text,
    p_size_unit text,
    p_condition text,
    p_rating integer,
    p_photo_url text,
    p_user_id text
) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'preloved, public'
AS $$
DECLARE
    new_shoe_id text;
BEGIN
    INSERT INTO preloved.shoes (brand, model, size, size_unit, condition, rating, photo_url, user_id)
    VALUES (p_brand, p_model, p_size, p_size_unit, p_condition, p_rating, p_photo_url, NULLIF(p_user_id, '')::uuid)
    RETURNING id::text INTO new_shoe_id;
    
    RETURN new_shoe_id;
END;
$$;

CREATE OR REPLACE FUNCTION preloved.update_qr_code(
    p_shoe_id text,
    p_qr_code text
) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'preloved, public'
AS $$
DECLARE
    updated_qr_code text;
BEGIN
    UPDATE preloved.shoes 
    SET qr_code = p_qr_code 
    WHERE id = p_shoe_id::uuid
    RETURNING qr_code INTO updated_qr_code;
    
    RETURN updated_qr_code;
END;
$$;

CREATE OR REPLACE FUNCTION preloved.check_shoe_exists(
    p_shoe_id text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'preloved, public'
AS $$
BEGIN
    RETURN EXISTS(SELECT 1 FROM preloved.shoes WHERE id = p_shoe_id::uuid);
END;
$$;