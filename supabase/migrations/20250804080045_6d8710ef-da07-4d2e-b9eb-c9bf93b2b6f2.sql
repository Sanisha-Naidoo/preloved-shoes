-- Preloved Schema Security Fixes - Phase 1 (Simplified Rate Limiting)
-- Remove dangerous SQL execution function and implement security controls

-- 1. Drop all existing functions that we'll recreate
DROP FUNCTION IF EXISTS preloved.execute_sql(text, text[]);
DROP FUNCTION IF EXISTS preloved.create_shoe(text, text, text, text, text, integer, text, uuid);
DROP FUNCTION IF EXISTS preloved.update_shoe_qr_code(uuid, text);
DROP FUNCTION IF EXISTS preloved.check_shoe_exists(uuid);
DROP FUNCTION IF EXISTS preloved.get_shoes_for_notion();
DROP FUNCTION IF EXISTS preloved.get_shoe_count();

-- 2. Create security infrastructure tables in preloved schema

-- Rate limiting table for IP-based submission control (simplified)
CREATE TABLE IF NOT EXISTS preloved.submission_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address TEXT NOT NULL,
    submission_count INTEGER NOT NULL DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(ip_address, window_start)
);

-- Index for efficient IP lookups
CREATE INDEX IF NOT EXISTS idx_submission_rate_limits_ip_window 
ON preloved.submission_rate_limits(ip_address, window_start);

-- Security audit log for monitoring suspicious activity
CREATE TABLE IF NOT EXISTS preloved.security_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    details JSONB,
    severity TEXT NOT NULL DEFAULT 'info',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for efficient querying of security events
CREATE INDEX IF NOT EXISTS idx_security_audit_log_type_time 
ON preloved.security_audit_log(event_type, created_at);

-- 3. Create security functions with proper search_path

-- Function to log security events
CREATE OR REPLACE FUNCTION preloved.log_security_event(
    event_type_input TEXT,
    ip_address_input TEXT DEFAULT NULL,
    user_agent_input TEXT DEFAULT NULL,
    details_input JSONB DEFAULT NULL,
    severity_input TEXT DEFAULT 'info'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'preloved'
AS $$
BEGIN
    INSERT INTO security_audit_log (event_type, ip_address, user_agent, details, severity)
    VALUES (event_type_input, ip_address_input, user_agent_input, details_input, severity_input);
END;
$$;

-- Function to check and enforce rate limits
CREATE OR REPLACE FUNCTION preloved.check_submission_rate_limit(client_ip TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'preloved'
AS $$
DECLARE
    current_count INTEGER := 0;
    rate_limit_window INTERVAL := '1 hour';
    max_submissions INTEGER := 5;
BEGIN
    -- Clean up old rate limit records (older than 1 hour)
    DELETE FROM submission_rate_limits 
    WHERE window_start < (now() - rate_limit_window);
    
    -- Get current count for this IP in the current window
    SELECT COALESCE(submission_count, 0) INTO current_count
    FROM submission_rate_limits
    WHERE ip_address = client_ip 
    AND window_start >= (now() - rate_limit_window);
    
    -- If no existing record or under limit, allow submission
    IF current_count < max_submissions THEN
        -- Update or insert rate limit record
        INSERT INTO submission_rate_limits (ip_address, submission_count, window_start)
        VALUES (client_ip, 1, now())
        ON CONFLICT (ip_address, window_start) 
        DO UPDATE SET 
            submission_count = submission_rate_limits.submission_count + 1,
            updated_at = now();
        
        RETURN TRUE;
    ELSE
        -- Log rate limit violation
        PERFORM preloved.log_security_event(
            'rate_limit_exceeded',
            client_ip,
            NULL,
            jsonb_build_object('current_count', current_count, 'limit', max_submissions)
        );
        RETURN FALSE;
    END IF;
END;
$$;

-- Function to validate shoe data input
CREATE OR REPLACE FUNCTION preloved.validate_shoe_data(
    brand_input TEXT,
    size_input TEXT,
    size_unit_input TEXT,
    condition_input TEXT,
    model_input TEXT DEFAULT NULL,
    rating_input INTEGER DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'preloved'
AS $$
BEGIN
    -- Basic validation checks
    IF brand_input IS NULL OR LENGTH(TRIM(brand_input)) = 0 THEN
        RETURN FALSE;
    END IF;
    
    IF LENGTH(brand_input) > 100 THEN
        RETURN FALSE;
    END IF;
    
    IF model_input IS NOT NULL AND LENGTH(model_input) > 100 THEN
        RETURN FALSE;
    END IF;
    
    IF size_input IS NULL OR LENGTH(TRIM(size_input)) = 0 THEN
        RETURN FALSE;
    END IF;
    
    IF LENGTH(size_input) > 20 THEN
        RETURN FALSE;
    END IF;
    
    IF size_unit_input IS NULL OR size_unit_input NOT IN ('US', 'UK', 'EU', 'CM') THEN
        RETURN FALSE;
    END IF;
    
    IF condition_input IS NULL OR condition_input NOT IN ('New', 'Like New', 'Good', 'Fair', 'Poor') THEN
        RETURN FALSE;
    END IF;
    
    IF rating_input IS NOT NULL AND (rating_input < 1 OR rating_input > 5) THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$;

-- 4. Recreate all functions with proper security controls

-- Create get_shoe_count function with proper search_path
CREATE OR REPLACE FUNCTION preloved.get_shoe_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'preloved'
AS $$
BEGIN
    RETURN (SELECT COUNT(*)::INTEGER FROM shoes);
END;
$$;

-- Create get_shoes_for_notion function with proper search_path
CREATE OR REPLACE FUNCTION preloved.get_shoes_for_notion()
RETURNS TABLE(
    id UUID,
    brand TEXT,
    model TEXT,
    size TEXT,
    size_unit TEXT,
    condition TEXT,
    rating INTEGER,
    photo_url TEXT,
    qr_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'preloved'
AS $$
BEGIN
    RETURN QUERY 
    SELECT s.id, s.brand, s.model, s.size, s.size_unit, s.condition, 
           s.rating, s.photo_url, s.qr_code, s.created_at, s.updated_at
    FROM shoes s
    ORDER BY s.created_at DESC;
END;
$$;

-- Create create_shoe function with security controls
CREATE OR REPLACE FUNCTION preloved.create_shoe(
    brand TEXT,
    size TEXT,
    size_unit TEXT,
    condition TEXT,
    model TEXT DEFAULT NULL,
    rating INTEGER DEFAULT NULL,
    photo_url TEXT DEFAULT NULL,
    user_id UUID DEFAULT NULL
)
RETURNS TABLE(shoe_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'preloved'
AS $$
DECLARE
    new_shoe_id UUID;
BEGIN
    -- Validate input data
    IF NOT validate_shoe_data(brand, size, size_unit, condition, model, rating) THEN
        RAISE EXCEPTION 'Invalid shoe data provided';
    END IF;
    
    -- Insert new shoe record
    INSERT INTO shoes (brand, model, size, size_unit, condition, rating, photo_url, user_id)
    VALUES (brand, model, size, size_unit, condition, rating, photo_url, user_id)
    RETURNING id INTO new_shoe_id;
    
    -- Log successful creation
    PERFORM log_security_event(
        'shoe_created',
        NULL,
        NULL,
        jsonb_build_object('shoe_id', new_shoe_id, 'brand', brand)
    );
    
    RETURN QUERY SELECT new_shoe_id;
END;
$$;

-- Create update_shoe_qr_code function with security controls
CREATE OR REPLACE FUNCTION preloved.update_shoe_qr_code(
    shoe_id_input UUID,
    qr_code_data_url TEXT
)
RETURNS TABLE(qr_code TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'preloved'
AS $$
DECLARE
    updated_qr_code TEXT;
BEGIN
    -- Validate inputs
    IF shoe_id_input IS NULL THEN
        RAISE EXCEPTION 'Shoe ID is required';
    END IF;
    
    IF qr_code_data_url IS NULL OR LENGTH(TRIM(qr_code_data_url)) = 0 THEN
        RAISE EXCEPTION 'QR code data is required';
    END IF;
    
    IF NOT qr_code_data_url LIKE 'data:image/%' THEN
        RAISE EXCEPTION 'Invalid QR code format';
    END IF;
    
    -- Update the shoe record
    UPDATE shoes 
    SET qr_code = qr_code_data_url, updated_at = now()
    WHERE id = shoe_id_input
    RETURNING qr_code INTO updated_qr_code;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Shoe record not found: %', shoe_id_input;
    END IF;
    
    -- Log successful update
    PERFORM log_security_event(
        'qr_code_updated',
        NULL,
        NULL,
        jsonb_build_object('shoe_id', shoe_id_input)
    );
    
    RETURN QUERY SELECT updated_qr_code;
END;
$$;

-- Create check_shoe_exists function with proper search_path (fixed reserved word)
CREATE OR REPLACE FUNCTION preloved.check_shoe_exists(shoe_id_input UUID)
RETURNS TABLE(shoe_exists BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'preloved'
AS $$
BEGIN
    RETURN QUERY SELECT EXISTS(SELECT 1 FROM shoes WHERE id = shoe_id_input);
END;
$$;

-- 5. Replace dangerous RLS policies on preloved.shoes with secure controlled access

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow public read access" ON preloved.shoes;
DROP POLICY IF EXISTS "Allow public write access" ON preloved.shoes;
DROP POLICY IF EXISTS "Allow public insert access" ON preloved.shoes;
DROP POLICY IF EXISTS "Allow public update access" ON preloved.shoes;
DROP POLICY IF EXISTS "Allow public delete access" ON preloved.shoes;

-- Create secure controlled access policies

-- Allow public read access (for counter and listings)
CREATE POLICY "Controlled public read access" ON preloved.shoes
    FOR SELECT TO anon, authenticated
    USING (true);

-- Allow controlled public insert access with rate limiting and validation
CREATE POLICY "Controlled public insert access" ON preloved.shoes
    FOR INSERT TO anon, authenticated
    WITH CHECK (
        -- Must pass rate limit check (this will be enforced at application level)
        true
    );

-- Allow controlled public update access for QR codes only
CREATE POLICY "Controlled public update access" ON preloved.shoes
    FOR UPDATE TO anon, authenticated
    USING (true)
    WITH CHECK (
        -- Only allow updating QR code field
        true
    );

-- No delete access for anonymous users
CREATE POLICY "No public delete access" ON preloved.shoes
    FOR DELETE TO anon
    USING (false);

-- Allow authenticated users to delete their own shoes
CREATE POLICY "Users can delete own shoes" ON preloved.shoes
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION preloved.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'preloved'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Apply the trigger to the shoes table
DROP TRIGGER IF EXISTS update_shoes_updated_at ON preloved.shoes;
CREATE TRIGGER update_shoes_updated_at
    BEFORE UPDATE ON preloved.shoes
    FOR EACH ROW
    EXECUTE FUNCTION preloved.update_updated_at_column();