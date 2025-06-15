
-- 1. Add user_id column (nullable, if not already present)
ALTER TABLE public.shoes ADD COLUMN IF NOT EXISTS user_id uuid;

-- (Do NOT make user_id NOT NULL; keep it nullable for old rows)

-- 2. Enable Row-Level Security
ALTER TABLE public.shoes ENABLE ROW LEVEL SECURITY;

-- 3. Only allow users to insert shoes with their own user_id (new shoes only)
CREATE POLICY "Allow users to insert their own shoes"
  ON public.shoes
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 4. Allow users to view only their own shoes
CREATE POLICY "Allow users to view their own shoes"
  ON public.shoes
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 5. Allow users to update/delete only their own shoes
CREATE POLICY "Allow users to update their own shoes"
  ON public.shoes
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Allow users to delete their own shoes"
  ON public.shoes
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- (Old records without user_id will not be accessible through the authenticated RLS, but are not deleted)

