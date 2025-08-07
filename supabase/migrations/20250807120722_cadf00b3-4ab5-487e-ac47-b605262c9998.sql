-- Add latitude and longitude columns to estacionamento table
ALTER TABLE public.estacionamento 
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);

-- Add index for location-based queries
CREATE INDEX idx_estacionamento_location 
ON public.estacionamento (latitude, longitude);

-- Add comment for the new columns
COMMENT ON COLUMN public.estacionamento.latitude IS 'Latitude coordinate for the parking spot';
COMMENT ON COLUMN public.estacionamento.longitude IS 'Longitude coordinate for the parking spot';