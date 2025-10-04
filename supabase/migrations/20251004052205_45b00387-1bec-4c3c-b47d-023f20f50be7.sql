-- Tornar o campo hora_extra opcional na tabela estacionamento
ALTER TABLE public.estacionamento 
ALTER COLUMN hora_extra DROP NOT NULL,
ALTER COLUMN hora_extra SET DEFAULT NULL;

-- Comentário explicativo
COMMENT ON COLUMN public.estacionamento.hora_extra IS 'Valor cobrado por hora adicional (opcional, a critério do proprietário)';