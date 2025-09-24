-- Add tipo column to estacionamento table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'estacionamento' 
                   AND column_name = 'tipo' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.estacionamento ADD COLUMN tipo TEXT DEFAULT 'residencial';
    END IF;
END $$;

-- Add comment for the new column
COMMENT ON COLUMN public.estacionamento.tipo IS 'Tipo de estacionamento: residencial ou estacionamento';

-- Update existing records to have a default tipo if they don't have one
UPDATE public.estacionamento SET tipo = 'residencial' WHERE tipo IS NULL;