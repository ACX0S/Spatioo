-- Adicionar campo dono_estacionamento na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN dono_estacionamento BOOLEAN DEFAULT false;

-- Criar tabela estacionamento
CREATE TABLE public.estacionamento (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cnpj TEXT NOT NULL,
  cep TEXT NOT NULL,
  endereco TEXT NOT NULL,
  numero_vagas INTEGER NOT NULL,
  fotos TEXT[], -- Array de URLs das fotos
  horario_funcionamento JSONB NOT NULL, -- {"abertura": "08:00", "fechamento": "18:00"}
  preco NUMERIC(10,2) NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.estacionamento ENABLE ROW LEVEL SECURITY;

-- Create policies for estacionamento table
CREATE POLICY "Users can view their own estacionamento" 
ON public.estacionamento 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own estacionamento" 
ON public.estacionamento 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own estacionamento" 
ON public.estacionamento 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own estacionamento" 
ON public.estacionamento 
FOR DELETE 
USING (user_id = auth.uid());

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_estacionamento_updated_at
BEFORE UPDATE ON public.estacionamento
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();