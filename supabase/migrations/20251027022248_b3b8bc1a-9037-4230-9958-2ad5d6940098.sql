-- Adicionar constraint UNIQUE na coluna placa da tabela veiculos
ALTER TABLE veiculos ADD CONSTRAINT veiculos_placa_unique UNIQUE (placa);

-- Adicionar colunas de dimensões em metros na tabela estacionamento
ALTER TABLE estacionamento ADD COLUMN IF NOT EXISTS largura_vaga NUMERIC;
ALTER TABLE estacionamento ADD COLUMN IF NOT EXISTS comprimento_vaga NUMERIC;

-- Remover coluna tamanho_vaga (não mais necessária)
ALTER TABLE estacionamento DROP COLUMN IF EXISTS tamanho_vaga;