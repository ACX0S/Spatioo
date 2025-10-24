-- PARTE 3: Adicionar campo tamanho_vaga nas vagas residenciais
-- Adiciona coluna tamanho_vaga na tabela estacionamento
ALTER TABLE public.estacionamento 
ADD COLUMN IF NOT EXISTS tamanho_vaga TEXT CHECK (tamanho_vaga IN ('P', 'M', 'G'));

-- Comentário explicativo
COMMENT ON COLUMN public.estacionamento.tamanho_vaga IS 'Tamanho da vaga: P (até 3,8m x 1,7m), M (até 4,3m x 1,8m), G (acima de 4,3m)';

-- Define valor padrão 'M' para estacionamentos existentes
UPDATE public.estacionamento 
SET tamanho_vaga = 'M' 
WHERE tamanho_vaga IS NULL;