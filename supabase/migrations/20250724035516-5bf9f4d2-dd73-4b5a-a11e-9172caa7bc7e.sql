-- Primeiro, vamos renomear a coluna parking_spot_id para estacionamento_id se ela ainda existe
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'parking_spot_id') THEN
        ALTER TABLE public.bookings RENAME COLUMN parking_spot_id TO estacionamento_id;
    END IF;
END $$;

-- Remover dados órfãos (bookings que referenciam estacionamentos que não existem)
DELETE FROM public.bookings 
WHERE estacionamento_id NOT IN (SELECT id FROM public.estacionamento);

-- Adicionar a foreign key constraint se ela não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_bookings_estacionamento') THEN
        ALTER TABLE public.bookings 
        ADD CONSTRAINT fk_bookings_estacionamento 
        FOREIGN KEY (estacionamento_id) REFERENCES public.estacionamento(id) ON DELETE CASCADE;
    END IF;
END $$;