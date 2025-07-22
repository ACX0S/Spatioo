-- Corrigir o relacionamento da tabela bookings para referenciar estacionamento
-- Primeiro, vamos alterar a coluna parking_spot_id para estacionamento_id
ALTER TABLE public.bookings RENAME COLUMN parking_spot_id TO estacionamento_id;

-- Adicionar foreign key constraint
ALTER TABLE public.bookings 
ADD CONSTRAINT fk_bookings_estacionamento 
FOREIGN KEY (estacionamento_id) REFERENCES public.estacionamento(id) ON DELETE CASCADE;