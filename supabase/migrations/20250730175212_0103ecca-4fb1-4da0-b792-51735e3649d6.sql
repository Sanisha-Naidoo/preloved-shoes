-- Create functions to work with preloved schema tables (fixed parameter defaults)

-- Function to create a shoe in preloved.shoes
CREATE OR REPLACE FUNCTION create_shoe_in_preloved(
  p_brand text,
  p_model text,
  p_size text,
  p_size_unit text,
  p_condition text,
  p_rating text,
  p_photo_url text,
  p_user_id uuid
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_shoe_id uuid;
BEGIN
  INSERT INTO preloved.shoes (
    brand, model, size, size_unit, condition, rating, 
    photo_url, sole_photo_url, user_id
  )
  VALUES (
    p_brand, p_model, p_size, p_size_unit, p_condition, p_rating,
    p_photo_url, p_photo_url, p_user_id
  )
  RETURNING id INTO new_shoe_id;
  
  RETURN new_shoe_id;
END;
$$;

-- Function to update QR code in preloved.shoes
CREATE OR REPLACE FUNCTION update_qr_code_in_preloved(
  p_shoe_id uuid,
  p_qr_code text
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_row preloved.shoes%ROWTYPE;
BEGIN
  UPDATE preloved.shoes 
  SET qr_code = p_qr_code 
  WHERE id = p_shoe_id
  RETURNING * INTO result_row;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Shoe with ID % not found', p_shoe_id;
  END IF;
  
  RETURN json_build_object(
    'id', result_row.id,
    'qr_code', result_row.qr_code
  );
END;
$$;

-- Function to get shoe count from preloved.shoes
CREATE OR REPLACE FUNCTION get_shoe_count_from_preloved()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  shoe_count bigint;
BEGIN
  SELECT COUNT(*) INTO shoe_count FROM preloved.shoes;
  RETURN shoe_count;
END;
$$;

-- Function to check if shoe exists in preloved.shoes
CREATE OR REPLACE FUNCTION check_shoe_exists_in_preloved(p_shoe_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  shoe_exists boolean;
BEGIN
  SELECT EXISTS(SELECT 1 FROM preloved.shoes WHERE id = p_shoe_id) INTO shoe_exists;
  RETURN shoe_exists;
END;
$$;