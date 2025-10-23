-- Criar tabela de veículos
CREATE TABLE public.veiculos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  modelo TEXT NOT NULL,
  cor TEXT NOT NULL,
  placa TEXT NOT NULL,
  tamanho TEXT NOT NULL CHECK (tamanho IN ('P', 'M', 'G')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.veiculos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Usuários podem gerenciar apenas seus próprios veículos
CREATE POLICY "Users can view their own vehicles"
  ON public.veiculos
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vehicles"
  ON public.veiculos
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vehicles"
  ON public.veiculos
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vehicles"
  ON public.veiculos
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_veiculos_updated_at
  BEFORE UPDATE ON public.veiculos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índice para melhorar performance de queries por user_id
CREATE INDEX idx_veiculos_user_id ON public.veiculos(user_id);