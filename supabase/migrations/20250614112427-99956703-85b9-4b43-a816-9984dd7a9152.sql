
-- Add QR code field to the shoes table
ALTER TABLE public.shoes 
ADD COLUMN qr_code TEXT;

-- Add an index for faster QR code lookups
CREATE INDEX idx_shoes_qr_code ON public.shoes(qr_code);
