-- Adicionar coluna hora_extra na tabela estacionamento
-- Esta coluna armazenará o valor cobrado por hora adicional quando não há preço específico cadastrado
ALTER TABLE public.estacionamento 
ADD COLUMN hora_extra NUMERIC NOT NULL DEFAULT 0;

-- Comentário: Esta coluna representa o valor cobrado por cada hora adicional
-- quando o tempo de permanência excede as horas com preços específicos cadastrados