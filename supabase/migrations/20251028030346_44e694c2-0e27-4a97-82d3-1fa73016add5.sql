-- Criar função para limpar vagas órfãs (sem booking associado mas com status != disponivel)
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_vagas()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Resetar vagas que estão reservadas/ocupadas mas não têm booking_id
  UPDATE public.vagas
  SET 
    status = 'disponivel',
    booking_id = NULL,
    user_id = NULL
  WHERE status IN ('reservada', 'ocupada', 'aguardando_confirmacao')
    AND booking_id IS NULL;
    
  -- Log de vagas corrigidas
  RAISE NOTICE 'Vagas órfãs limpas com sucesso';
END;
$$;

-- Executar a limpeza imediatamente para corrigir as vagas atuais
SELECT public.cleanup_orphaned_vagas();

-- Adicionar trigger para prevenir estados inconsistentes
-- Sempre que uma booking for atualizada para status final, limpar a vaga se necessário
CREATE OR REPLACE FUNCTION public.cleanup_vaga_on_booking_final_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Se a booking foi para um status final (cancelada, rejeitada, expirada, concluída)
  -- E a vaga ainda está associada a ela, liberar a vaga
  IF NEW.status IN ('cancelada', 'rejeitada', 'expirada', 'concluida') 
     AND OLD.status NOT IN ('cancelada', 'rejeitada', 'expirada', 'concluida') THEN
    
    UPDATE public.vagas
    SET 
      status = 'disponivel',
      booking_id = NULL,
      user_id = NULL
    WHERE estacionamento_id = NEW.estacionamento_id
      AND numero_vaga = NEW.spot_number;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger na tabela bookings
DROP TRIGGER IF EXISTS trigger_cleanup_vaga_on_booking_final ON public.bookings;
CREATE TRIGGER trigger_cleanup_vaga_on_booking_final
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_vaga_on_booking_final_status();