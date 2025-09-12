-- Fix vaga numbering to avoid duplicates and fill gaps; add indexes; backfill missing rows
BEGIN;

-- Safer creation: only insert missing numbers 1..numero_vagas for the new estacionamento
CREATE OR REPLACE FUNCTION public.create_vagas_for_estacionamento()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.vagas (estacionamento_id, numero_vaga, tipo_vaga, status)
  SELECT NEW.id, 'Vaga ' || gs.n, 'comum', 'disponivel'
  FROM generate_series(1, NEW.numero_vagas) AS gs(n)
  LEFT JOIN public.vagas v
    ON v.estacionamento_id = NEW.id
   AND v.numero_vaga = 'Vaga ' || gs.n
  WHERE v.id IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update logic: insert any missing numbers up to NEW.numero_vagas; when reducing, delete highest numbered available spots first
CREATE OR REPLACE FUNCTION public.update_vagas_on_estacionamento_change()
RETURNS TRIGGER AS $$
DECLARE
  current_vagas_count INTEGER;
  vagas_diff INTEGER;
BEGIN
  SELECT COUNT(*) INTO current_vagas_count FROM public.vagas WHERE estacionamento_id = NEW.id;
  vagas_diff := NEW.numero_vagas - current_vagas_count;

  IF vagas_diff > 0 THEN
    -- Insert missing numbers 1..NEW.numero_vagas that don't exist yet
    INSERT INTO public.vagas (estacionamento_id, numero_vaga, tipo_vaga, status)
    SELECT NEW.id, 'Vaga ' || gs.n, 'comum', 'disponivel'
    FROM generate_series(1, NEW.numero_vagas) AS gs(n)
    LEFT JOIN public.vagas v
      ON v.estacionamento_id = NEW.id
     AND v.numero_vaga = 'Vaga ' || gs.n
    WHERE v.id IS NULL;
  ELSIF vagas_diff < 0 THEN
    -- Remove extra available spots: highest numbered first to keep sequence compact
    WITH deletable AS (
      SELECT id
      FROM public.vagas
      WHERE estacionamento_id = NEW.id
        AND status = 'disponivel'
      ORDER BY COALESCE(NULLIF(regexp_replace(numero_vaga, '\\D', '', 'g'), '')::int, 0) DESC, created_at DESC
      LIMIT ABS(vagas_diff)
    )
    DELETE FROM public.vagas WHERE id IN (SELECT id FROM deletable);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_vagas_estacionamento_id ON public.vagas(estacionamento_id);
CREATE INDEX IF NOT EXISTS idx_vagas_estacionamento_status ON public.vagas(estacionamento_id, status);

-- Backfill: ensure all estacionamentos have rows 1..numero_vagas, without duplicating existing ones
WITH all_pairs AS (
  SELECT e.id AS estacionamento_id, gs.n
  FROM public.estacionamento e
  CROSS JOIN LATERAL generate_series(1, e.numero_vagas) AS gs(n)
)
INSERT INTO public.vagas (estacionamento_id, numero_vaga, tipo_vaga, status)
SELECT ap.estacionamento_id, 'Vaga ' || ap.n, 'comum', 'disponivel'
FROM all_pairs ap
LEFT JOIN public.vagas v
  ON v.estacionamento_id = ap.estacionamento_id
 AND v.numero_vaga = 'Vaga ' || ap.n
WHERE v.id IS NULL;

COMMIT;