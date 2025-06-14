
-- Check if the sole_photos bucket exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'sole_photos') THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('sole_photos', 'sole_photos', true);
    END IF;
END $$;

-- Create policies for the bucket if they don't exist
DO $$
BEGIN
    -- Policy for SELECT (viewing files)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Public Access for sole_photos'
    ) THEN
        CREATE POLICY "Public Access for sole_photos"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'sole_photos');
    END IF;

    -- Policy for INSERT (uploading files)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Public Upload for sole_photos'
    ) THEN
        CREATE POLICY "Public Upload for sole_photos"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = 'sole_photos');
    END IF;
END $$;
