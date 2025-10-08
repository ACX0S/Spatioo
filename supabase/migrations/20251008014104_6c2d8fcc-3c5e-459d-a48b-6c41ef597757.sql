-- Adicionar foreign keys com CASCADE para evitar erros de exclusão
-- Verificando e criando apenas as que não existem

-- 1. Adicionar foreign key de bookings.user_id para profiles.id se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'bookings_user_id_fkey' 
        AND table_name = 'bookings'
    ) THEN
        ALTER TABLE public.bookings 
        ADD CONSTRAINT bookings_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 2. Remover e recriar foreign key de notifications.estacionamento_id com CASCADE
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_estacionamento_id_fkey;

ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_estacionamento_id_fkey 
FOREIGN KEY (estacionamento_id) REFERENCES public.estacionamento(id) ON DELETE CASCADE;

-- 3. Remover e recriar foreign key de notifications.booking_id com CASCADE
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_booking_id_fkey;

ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_booking_id_fkey 
FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;

-- 4. Garantir que estacionamento_precos tem CASCADE
ALTER TABLE public.estacionamento_precos 
DROP CONSTRAINT IF EXISTS estacionamento_precos_estacionamento_id_fkey;

ALTER TABLE public.estacionamento_precos 
ADD CONSTRAINT estacionamento_precos_estacionamento_id_fkey 
FOREIGN KEY (estacionamento_id) REFERENCES public.estacionamento(id) ON DELETE CASCADE;

-- 5. Garantir que vagas tem CASCADE
ALTER TABLE public.vagas 
DROP CONSTRAINT IF EXISTS vagas_estacionamento_id_fkey;

ALTER TABLE public.vagas 
ADD CONSTRAINT vagas_estacionamento_id_fkey 
FOREIGN KEY (estacionamento_id) REFERENCES public.estacionamento(id) ON DELETE CASCADE;

-- 6. Garantir que bookings tem CASCADE para estacionamento_id
ALTER TABLE public.bookings 
DROP CONSTRAINT IF EXISTS bookings_estacionamento_id_fkey;

ALTER TABLE public.bookings 
ADD CONSTRAINT bookings_estacionamento_id_fkey 
FOREIGN KEY (estacionamento_id) REFERENCES public.estacionamento(id) ON DELETE CASCADE;