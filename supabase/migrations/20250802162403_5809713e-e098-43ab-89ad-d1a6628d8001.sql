-- Fix search path security issues for functions

-- Function to create a shoe record
CREATE OR REPLACE FUNCTION preloved.create_shoe(
    p_brand text,
    p_size text,
    p_condition text,
    p_model text DEFAULT NULL,
    p_size_unit text DEFAULT 'US',
    p_rating integer DEFAULT NULL,
    p_photo_url text DEFAULT NULL,
    p_user_id uuid DEFAULT NULL
)
RETURNS TABLE(shoe_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = preloved, public
AS $$
DECLARE
    new_shoe_id uuid;
BEGIN
    INSERT INTO preloved.shoes (
        brand, model, size, size_unit, condition, rating, photo_url, user_id
    ) VALUES (
        p_brand, p_model, p_size, p_size_unit, p_condition, p_rating, p_photo_url, p_user_id
    ) RETURNING id INTO new_shoe_id;
    
    RETURN QUERY SELECT new_shoe_id;
END;
$$;

-- Function to check if a shoe exists
CREATE OR REPLACE FUNCTION preloved.check_shoe_exists(
    p_shoe_id uuid
)
RETURNS TABLE(shoe_exists boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = preloved, public
AS $$
BEGIN
    RETURN QUERY 
    SELECT EXISTS(
        SELECT 1 FROM preloved.shoes WHERE id = p_shoe_id
    ) as shoe_exists;
END;
$$;

-- Function to update shoe QR code
CREATE OR REPLACE FUNCTION preloved.update_shoe_qr_code(
    p_shoe_id uuid,
    p_qr_code_url text
)
RETURNS TABLE(id uuid, qr_code text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = preloved, public
AS $$
BEGIN
    UPDATE preloved.shoes 
    SET qr_code = p_qr_code_url
    WHERE preloved.shoes.id = p_shoe_id;
    
    RETURN QUERY 
    SELECT preloved.shoes.id, preloved.shoes.qr_code
    FROM preloved.shoes 
    WHERE preloved.shoes.id = p_shoe_id;
END;
$$;

-- Function to get shoes for Notion (used by dependent app)
CREATE OR REPLACE FUNCTION preloved.get_shoes_for_notion()
RETURNS TABLE(
    id uuid,
    brand text,
    model text,
    size text,
    condition text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = preloved, public
AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        s.id,
        s.brand,
        COALESCE(s.model, '') as model,
        s.size,
        s.condition
    FROM preloved.shoes s
    ORDER BY s.created_at DESC;
END;
$$;

-- Function to get shoe count
CREATE OR REPLACE FUNCTION preloved.get_shoe_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = preloved, public
AS $$
BEGIN
    RETURN (SELECT COUNT(*)::integer FROM preloved.shoes);
END;
$$;