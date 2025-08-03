-- Fix the NOT NULL constraint issue on photo_url column
-- The app allows submissions without photos, so photo_url should be nullable

ALTER TABLE preloved.shoes 
ALTER COLUMN photo_url DROP NOT NULL;