-- Adicionar novos campos à tabela bookings
ALTER TABLE public.bookings 
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS arrival_confirmed_by_owner_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS arrival_confirmed_by_user_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS departure_confirmed_by_owner_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS departure_confirmed_by_user_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Remover constraint antiga temporariamente
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_status_check;

-- Atualizar registros existentes
UPDATE public.bookings SET status = 'concluida' WHERE status = 'completed';
UPDATE public.bookings SET status = 'cancelada' WHERE status = 'cancelled';
UPDATE public.bookings SET status = 'reservada' WHERE status IN ('active', 'upcoming');

-- Adicionar nova constraint
ALTER TABLE public.bookings ADD CONSTRAINT bookings_status_check 
  CHECK (status IN ('aguardando_confirmacao', 'reservada', 'ocupada', 'concluida', 'cancelada', 'rejeitada', 'expirada'));

-- Atualizar vagas constraint
ALTER TABLE public.vagas DROP CONSTRAINT IF EXISTS vagas_status_check;
ALTER TABLE public.vagas ADD CONSTRAINT vagas_status_check 
  CHECK (status IN ('disponivel', 'aguardando_confirmacao', 'reservada', 'ocupada', 'manutencao'));

-- Funções auxiliares
CREATE OR REPLACE FUNCTION public.expire_pending_bookings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.bookings
  SET status = 'expirada'
  WHERE status = 'aguardando_confirmacao'
    AND expires_at < NOW();

  UPDATE public.vagas
  SET status = 'disponivel',
      booking_id = NULL,
      user_id = NULL
  WHERE booking_id IN (
    SELECT id FROM public.bookings 
    WHERE status = 'expirada' AND updated_at > NOW() - INTERVAL '1 minute'
  );

  INSERT INTO public.notifications (user_id, type, title, message, booking_id)
  SELECT 
    b.user_id,
    'booking_expired',
    'Reserva expirada',
    'Sua solicitação de reserva expirou pois não foi confirmada a tempo.',
    b.id
  FROM public.bookings b
  WHERE b.status = 'expirada' 
    AND b.updated_at > NOW() - INTERVAL '1 minute'
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n 
      WHERE n.booking_id = b.id AND n.type = 'booking_expired'
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.can_user_book_today(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 
    FROM public.bookings
    WHERE user_id = p_user_id
      AND date = CURRENT_DATE
      AND status IN ('aguardando_confirmacao', 'reservada', 'ocupada')
  );
$$;

-- Políticas RLS
DROP POLICY IF EXISTS "Owners can view booking requests for their parking" ON public.bookings;
CREATE POLICY "Owners can view booking requests for their parking"
ON public.bookings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.estacionamento e
    WHERE e.id = bookings.estacionamento_id 
      AND e.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Owners can update bookings for their parking" ON public.bookings;
CREATE POLICY "Owners can update bookings for their parking"
ON public.bookings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.estacionamento e
    WHERE e.id = bookings.estacionamento_id 
      AND e.user_id = auth.uid()
  )
);