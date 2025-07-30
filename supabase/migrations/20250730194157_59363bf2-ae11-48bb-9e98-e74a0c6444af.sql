-- Fix preloved schema functions to work with actual table structure
-- Remove non-existent status column references

-- Update get_shoe_count function
CREATE OR REPLACE FUNCTION preloved.get_shoe_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'preloved'
AS $$
BEGIN
  RETURN (SELECT COUNT(*)::integer FROM shoes);
END;
$$;

-- Update get_shoes_for_notion function  
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
SET search_path TO 'preloved'
AS $$
BEGIN
  RETURN QUERY
  SELECT s.id, s.brand, s.model, s.size, s.condition
  FROM shoes s
  ORDER BY s.created_at DESC;
END;
$$;

-- Update create_shoe function
CREATE OR REPLACE FUNCTION preloved.create_shoe(
  brand_param text,
  model_param text DEFAULT NULL,
  size_param text,
  size_unit_param text DEFAULT 'US',
  condition_param text,
  rating_param integer DEFAULT NULL,
  photo_url_param text DEFAULT NULL,
  user_id_param uuid DEFAULT NULL
)
RETURNS TABLE(shoe_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'preloved'
AS $$
DECLARE
  new_shoe_id uuid;
BEGIN
  INSERT INTO shoes (
    brand,
    model,
    size,
    size_unit,
    condition,
    rating,
    photo_url,
    user_id
  )
  VALUES (
    brand_param,
    model_param,
    size_param,
    size_unit_param,
    condition_param,
    rating_param,
    photo_url_param,
    user_id_param
  )
  RETURNING id INTO new_shoe_id;
  
  RETURN QUERY SELECT new_shoe_id;
END;
$$;

-- Update check_shoe_exists function
CREATE OR REPLACE FUNCTION preloved.check_shoe_exists(shoe_id_param uuid)
RETURNS TABLE(shoe_exists boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'preloved'
AS $$
BEGIN
  RETURN QUERY
  SELECT EXISTS(
    SELECT 1 FROM shoes WHERE id = shoe_id_param
  );
END;
$$;

-- Update update_qr_code function
CREATE OR REPLACE FUNCTION preloved.update_qr_code(
  shoe_id_param uuid,
  qr_code_data_url_param text
)
RETURNS TABLE(qr_code text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'preloved'
AS $$
BEGIN
  UPDATE shoes 
  SET qr_code = qr_code_data_url_param
  WHERE id = shoe_id_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Shoe with ID % not found', shoe_id_param;
  END IF;
  
  RETURN QUERY SELECT qr_code_data_url_param;
END;
$$;