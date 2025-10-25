-- Criar tabela de avaliações
CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id uuid NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  avaliador_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  avaliado_tipo text NOT NULL CHECK (avaliado_tipo IN ('motorista', 'estacionamento')),
  avaliado_id uuid NOT NULL,
  nota integer NOT NULL CHECK (nota >= 1 AND nota <= 5),
  tags text[],
  comentario text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar índices para melhor performance
CREATE INDEX idx_reviews_avaliado ON public.reviews(avaliado_tipo, avaliado_id);
CREATE INDEX idx_reviews_booking ON public.reviews(booking_id);

-- Adicionar campo media_avaliacao na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS media_avaliacao numeric(3,2) DEFAULT 0;

-- Adicionar campo media_avaliacao na tabela estacionamento
ALTER TABLE public.estacionamento 
ADD COLUMN IF NOT EXISTS media_avaliacao numeric(3,2) DEFAULT 0;

-- Função para calcular e atualizar média de avaliação
CREATE OR REPLACE FUNCTION public.update_media_avaliacao()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  nova_media numeric(3,2);
BEGIN
  -- Calcular nova média para o avaliado
  SELECT ROUND(AVG(nota)::numeric, 2) INTO nova_media
  FROM public.reviews
  WHERE avaliado_id = NEW.avaliado_id 
    AND avaliado_tipo = NEW.avaliado_tipo;

  -- Atualizar a tabela correspondente
  IF NEW.avaliado_tipo = 'motorista' THEN
    UPDATE public.profiles
    SET media_avaliacao = COALESCE(nova_media, 0)
    WHERE id = NEW.avaliado_id;
  ELSIF NEW.avaliado_tipo = 'estacionamento' THEN
    UPDATE public.estacionamento
    SET media_avaliacao = COALESCE(nova_media, 0)
    WHERE id = NEW.avaliado_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Criar trigger para atualizar média automaticamente
CREATE TRIGGER trigger_update_media_avaliacao
AFTER INSERT ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_media_avaliacao();

-- Função para criar notificação de nova avaliação
CREATE OR REPLACE FUNCTION public.notify_new_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_title text;
  notification_message text;
BEGIN
  -- Definir mensagem baseada no tipo de avaliado
  IF NEW.avaliado_tipo = 'motorista' THEN
    notification_title := 'Você recebeu uma nova avaliação';
    notification_message := 'Um estacionamento avaliou sua conduta. Nota: ' || NEW.nota || ' estrelas.';
  ELSE
    notification_title := 'Um cliente avaliou seu serviço';
    notification_message := 'Você recebeu uma avaliação de ' || NEW.nota || ' estrelas.';
  END IF;

  -- Criar notificação para o avaliado
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    booking_id
  ) VALUES (
    NEW.avaliado_id,
    'new_review',
    notification_title,
    notification_message,
    NEW.booking_id
  );

  RETURN NEW;
END;
$$;

-- Criar trigger para notificação de nova avaliação
CREATE TRIGGER trigger_notify_new_review
AFTER INSERT ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_review();

-- Habilitar RLS na tabela reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem criar suas próprias avaliações
CREATE POLICY "Users can create their own reviews"
ON public.reviews
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = avaliador_id);

-- Política: Todos podem visualizar avaliações
CREATE POLICY "Everyone can view reviews"
ON public.reviews
FOR SELECT
TO authenticated
USING (true);

-- Política: Avaliador pode ver suas próprias avaliações
CREATE POLICY "Users can view their own reviews"
ON public.reviews
FOR SELECT
TO authenticated
USING (auth.uid() = avaliador_id OR auth.uid() = avaliado_id);