-- Adicionar campos de comodidades para estacionamento
ALTER TABLE public.estacionamento
ADD COLUMN funcionamento_24h boolean DEFAULT false,
ADD COLUMN suporte_carro_eletrico boolean DEFAULT false,
ADD COLUMN vaga_coberta boolean DEFAULT false,
ADD COLUMN manobrista boolean DEFAULT false,
ADD COLUMN suporte_caminhao boolean DEFAULT false,
ADD COLUMN vaga_moto boolean DEFAULT false;

-- Adicionar comentários para documentação
COMMENT ON COLUMN public.estacionamento.funcionamento_24h IS 'Indica se o estacionamento funciona 24 horas por dia';
COMMENT ON COLUMN public.estacionamento.suporte_carro_eletrico IS 'Indica se o estacionamento possui suporte para carros elétricos';
COMMENT ON COLUMN public.estacionamento.vaga_coberta IS 'Indica se o estacionamento possui vagas cobertas';
COMMENT ON COLUMN public.estacionamento.manobrista IS 'Indica se o estacionamento possui serviço de manobrista';
COMMENT ON COLUMN public.estacionamento.suporte_caminhao IS 'Indica se o estacionamento possui suporte para caminhões';
COMMENT ON COLUMN public.estacionamento.vaga_moto IS 'Indica se o estacionamento possui vagas para motocicletas';