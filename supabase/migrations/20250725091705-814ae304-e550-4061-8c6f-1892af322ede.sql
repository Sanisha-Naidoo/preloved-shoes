-- Create specific functions for the preloved app
CREATE OR REPLACE FUNCTION preloved.create_shoe(
  p_brand TEXT,
  p_model TEXT,
  p_size TEXT,
  p_size_unit TEXT,
  p_condition TEXT,
  p_rating INTEGER,
  p_photo_url TEXT,
  p_user_id UUID
)
RETURNS TABLE(id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = preloved, public
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO preloved.shoes (brand, model, size, size_unit, condition, rating, photo_url, sole_photo_url, user_id)
  VALUES (p_brand, p_model, p_size, p_size_unit, p_condition, p_rating, p_photo_url, p_photo_url, p_user_id)
  RETURNING preloved.shoes.id;
END;
$$;

CREATE OR REPLACE FUNCTION preloved.update_shoe_qr_code(
  p_shoe_id UUID,
  p_qr_code TEXT
)
RETURNS TABLE(id UUID, qr_code TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = preloved, public
AS $$
BEGIN
  RETURN QUERY
  UPDATE preloved.shoes 
  SET qr_code = p_qr_code 
  WHERE preloved.shoes.id = p_shoe_id 
  RETURNING preloved.shoes.id, preloved.shoes.qr_code;
END;
$$;

CREATE OR REPLACE FUNCTION preloved.get_shoe_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = preloved, public
AS $$
DECLARE
  shoe_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO shoe_count FROM preloved.shoes;
  RETURN shoe_count;
END;
$$;

CREATE OR REPLACE FUNCTION preloved.check_shoe_exists(p_shoe_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = preloved, public
AS $$
DECLARE
  exists_flag BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM preloved.shoes WHERE id = p_shoe_id) INTO exists_flag;
  RETURN exists_flag;
END;
$$;