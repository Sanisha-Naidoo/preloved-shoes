-- Create functions in preloved schema to handle shoe operations
-- This allows proper access to preloved.shoes table

-- Function to get shoe count
CREATE OR REPLACE FUNCTION preloved.get_shoe_count()
RETURNS TABLE(count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT COUNT(*)::bigint as count
  FROM preloved.shoes
  WHERE status = 'active';
END;
$$;

-- Function to create a new shoe record
CREATE OR REPLACE FUNCTION preloved.create_shoe(
  p_brand text,
  p_model text,
  p_size text,
  p_size_unit text,
  p_condition text,
  p_rating text,
  p_photo_url text,
  p_user_id text
)
RETURNS TABLE(shoe_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO preloved.shoes (
    brand,
    model,
    size,
    size_unit,
    condition,
    rating,
    photo_url,
    sole_photo_url,
    user_id
  )
  VALUES (
    p_brand,
    p_model,
    p_size,
    p_size_unit,
    p_condition,
    p_rating,
    p_photo_url,
    p_photo_url,
    p_user_id
  )
  RETURNING id as shoe_id;
END;
$$;

-- Function to update QR code
CREATE OR REPLACE FUNCTION preloved.update_qr_code(
  p_shoe_id uuid,
  p_qr_code text
)
RETURNS TABLE(shoe_id uuid, qr_code text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  UPDATE preloved.shoes
  SET qr_code = p_qr_code
  WHERE id = p_shoe_id
  RETURNING id as shoe_id, preloved.shoes.qr_code;
END;
$$;

-- Function to check if shoe exists
CREATE OR REPLACE FUNCTION preloved.check_shoe_exists(
  p_shoe_id uuid
)
RETURNS TABLE(exists boolean)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT (COUNT(*) > 0)::boolean as exists
  FROM preloved.shoes
  WHERE id = p_shoe_id;
END;
$$;

-- Function to get shoes for notion sync
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
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.brand,
    s.model,
    s.size,
    s.condition
  FROM preloved.shoes s
  WHERE s.status = 'active'
  ORDER BY s.created_at DESC;
END;
$$;