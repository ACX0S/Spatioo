-- Populate estacionamento_precos for all estacionamentos without pricing data
-- This will create pricing tiers based on each estacionamento's base 'preco' field
-- Only process estacionamentos with valid prices (> 0)

INSERT INTO public.estacionamento_precos (estacionamento_id, horas, preco)
SELECT 
  e.id,
  tier.horas,
  ROUND(
    CASE 
      -- 1 hour: base price
      WHEN tier.horas = 1 THEN e.preco
      -- 2-4 hours: base price * hours with 5% discount per hour
      WHEN tier.horas BETWEEN 2 AND 4 THEN e.preco * tier.horas * 0.95
      -- 6-8 hours: base price * hours with 10% discount per hour
      WHEN tier.horas BETWEEN 6 AND 8 THEN e.preco * tier.horas * 0.90
      -- 12 hours: base price * hours with 15% discount per hour
      WHEN tier.horas = 12 THEN e.preco * tier.horas * 0.85
      -- 24 hours (daily): base price * hours with 20% discount per hour
      WHEN tier.horas = 24 THEN e.preco * tier.horas * 0.80
    END, 2
  ) as preco
FROM public.estacionamento e
CROSS JOIN (
  VALUES (1), (2), (3), (4), (6), (8), (12), (24)
) AS tier(horas)
WHERE e.ativo = true
  AND e.preco > 0
  AND NOT EXISTS (
    SELECT 1 
    FROM public.estacionamento_precos ep 
    WHERE ep.estacionamento_id = e.id 
      AND ep.horas = tier.horas
  );