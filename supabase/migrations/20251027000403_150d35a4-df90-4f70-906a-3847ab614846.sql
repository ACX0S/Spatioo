-- Atualizar estrutura da tabela veiculos
-- Adicionar novas colunas
ALTER TABLE veiculos ADD COLUMN IF NOT EXISTS nome TEXT;
ALTER TABLE veiculos ADD COLUMN IF NOT EXISTS largura NUMERIC;
ALTER TABLE veiculos ADD COLUMN IF NOT EXISTS comprimento NUMERIC;

-- Remover colunas antigas
ALTER TABLE veiculos DROP COLUMN IF EXISTS tipo;
ALTER TABLE veiculos DROP COLUMN IF EXISTS modelo;
ALTER TABLE veiculos DROP COLUMN IF EXISTS tamanho;

-- Tornar as novas colunas obrigatórias (NOT NULL)
-- Primeiro atualizar registros existentes com valores padrão se houver algum
UPDATE veiculos SET nome = 'Veículo não especificado' WHERE nome IS NULL;
UPDATE veiculos SET largura = 1.8 WHERE largura IS NULL;
UPDATE veiculos SET comprimento = 4.5 WHERE comprimento IS NULL;

ALTER TABLE veiculos ALTER COLUMN nome SET NOT NULL;
ALTER TABLE veiculos ALTER COLUMN largura SET NOT NULL;
ALTER TABLE veiculos ALTER COLUMN comprimento SET NOT NULL;