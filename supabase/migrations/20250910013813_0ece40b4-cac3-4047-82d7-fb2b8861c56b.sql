-- Create function to automatically create vagas when estacionamento is created
CREATE OR REPLACE FUNCTION public.create_vagas_for_estacionamento()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert vagas based on numero_vagas in the estacionamento
  INSERT INTO public.vagas (estacionamento_id, numero_vaga, tipo_vaga, status)
  SELECT 
    NEW.id,
    'Vaga ' || generate_series(1, NEW.numero_vagas),
    'comum',
    'disponivel'
  FROM generate_series(1, NEW.numero_vagas);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-create vagas when estacionamento is inserted
CREATE TRIGGER trigger_create_vagas_after_estacionamento_insert
  AFTER INSERT ON public.estacionamento
  FOR EACH ROW
  EXECUTE FUNCTION public.create_vagas_for_estacionamento();

-- Create function to handle vagas when numero_vagas is updated
CREATE OR REPLACE FUNCTION public.update_vagas_on_estacionamento_change()
RETURNS TRIGGER AS $$
DECLARE
  current_vagas_count INTEGER;
  vagas_diff INTEGER;
BEGIN
  -- Get current number of vagas for this estacionamento
  SELECT COUNT(*) INTO current_vagas_count 
  FROM public.vagas 
  WHERE estacionamento_id = NEW.id;
  
  vagas_diff := NEW.numero_vagas - current_vagas_count;
  
  IF vagas_diff > 0 THEN
    -- Add new vagas
    INSERT INTO public.vagas (estacionamento_id, numero_vaga, tipo_vaga, status)
    SELECT 
      NEW.id,
      'Vaga ' || (current_vagas_count + generate_series(1, vagas_diff)),
      'comum',
      'disponivel'
    FROM generate_series(1, vagas_diff);
  ELSIF vagas_diff < 0 THEN
    -- Remove excess vagas (only if they are disponivel)
    DELETE FROM public.vagas 
    WHERE estacionamento_id = NEW.id 
      AND status = 'disponivel'
      AND id IN (
        SELECT id FROM public.vagas 
        WHERE estacionamento_id = NEW.id 
          AND status = 'disponivel'
        ORDER BY created_at DESC 
        LIMIT ABS(vagas_diff)
      );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to update vagas when estacionamento numero_vagas changes
CREATE TRIGGER trigger_update_vagas_on_estacionamento_update
  AFTER UPDATE OF numero_vagas ON public.estacionamento
  FOR EACH ROW
  WHEN (OLD.numero_vagas IS DISTINCT FROM NEW.numero_vagas)
  EXECUTE FUNCTION public.update_vagas_on_estacionamento_change();

-- Create function to get vagas statistics for an estacionamento
CREATE OR REPLACE FUNCTION public.get_vagas_stats(estacionamento_id_param UUID)
RETURNS TABLE (
  total_vagas INTEGER,
  vagas_disponiveis INTEGER,
  vagas_ocupadas INTEGER,
  vagas_reservadas INTEGER,
  vagas_manutencao INTEGER
) 
LANGUAGE SQL SECURITY DEFINER SET search_path = public
AS $$
  SELECT 
    COUNT(*)::INTEGER as total_vagas,
    COUNT(*) FILTER (WHERE status = 'disponivel')::INTEGER as vagas_disponiveis,
    COUNT(*) FILTER (WHERE status = 'ocupada')::INTEGER as vagas_ocupadas,
    COUNT(*) FILTER (WHERE status = 'reservada')::INTEGER as vagas_reservadas,
    COUNT(*) FILTER (WHERE status = 'manutencao')::INTEGER as vagas_manutencao
  FROM public.vagas
  WHERE estacionamento_id = estacionamento_id_param;
$$;

-- Create function to safely populate vagas for existing estacionamentos
CREATE OR REPLACE FUNCTION public.populate_existing_estacionamento_vagas()
RETURNS INTEGER AS $$
DECLARE
  estacionamento_record RECORD;
  total_created INTEGER := 0;
  current_count INTEGER;
  vagas_needed INTEGER;
BEGIN
  -- Loop through all estacionamentos and check their vagas
  FOR estacionamento_record IN 
    SELECT id, numero_vagas FROM public.estacionamento
  LOOP
    -- Count existing vagas for this estacionamento
    SELECT COUNT(*) INTO current_count 
    FROM public.vagas 
    WHERE estacionamento_id = estacionamento_record.id;
    
    vagas_needed := estacionamento_record.numero_vagas - current_count;
    
    -- Only create if we need more vagas
    IF vagas_needed > 0 THEN
      INSERT INTO public.vagas (estacionamento_id, numero_vaga, tipo_vaga, status)
      SELECT 
        estacionamento_record.id,
        'Vaga ' || (current_count + generate_series(1, vagas_needed)),
        'comum',
        'disponivel'
      FROM generate_series(1, vagas_needed);
      
      total_created := total_created + vagas_needed;
    END IF;
  END LOOP;
  
  RETURN total_created;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Populate vagas for existing estacionamentos
SELECT public.populate_existing_estacionamento_vagas();