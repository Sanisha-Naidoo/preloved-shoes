-- Fix the NOT NULL constraint issue on rating column
-- The app allows submissions without ratings, so rating should be nullable

ALTER TABLE preloved.shoes 
ALTER COLUMN rating DROP NOT NULL;