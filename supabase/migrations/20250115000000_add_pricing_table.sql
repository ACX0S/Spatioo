-- Create table for hourly pricing
CREATE TABLE public.estacionamento_precos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estacionamento_id UUID NOT NULL,
  horas INTEGER NOT NULL CHECK (horas > 0),
  preco NUMERIC(10,2) NOT NULL CHECK (preco > 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Foreign key to estacionamento
  CONSTRAINT fk_estacionamento_precos_estacionamento 
    FOREIGN KEY (estacionamento_id) 
    REFERENCES public.estacionamento(id) 
    ON DELETE CASCADE,
    
  -- Ensure unique hours per estacionamento
  CONSTRAINT unique_horas_per_estacionamento 
    UNIQUE (estacionamento_id, horas)
);

-- Enable RLS
ALTER TABLE public.estacionamento_precos ENABLE ROW LEVEL SECURITY;

-- Create policies for estacionamento_precos
CREATE POLICY "Everyone can view pricing" 
ON public.estacionamento_precos 
FOR SELECT 
USING (true);

CREATE POLICY "Estacionamento owners can manage their pricing" 
ON public.estacionamento_precos 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.estacionamento 
    WHERE id = estacionamento_id AND user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.estacionamento 
    WHERE id = estacionamento_id AND user_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX idx_estacionamento_precos_estacionamento_id ON public.estacionamento_precos(estacionamento_id);
CREATE INDEX idx_estacionamento_precos_horas ON public.estacionamento_precos(horas);

-- Create trigger for updated_at
CREATE TRIGGER update_estacionamento_precos_updated_at
  BEFORE UPDATE ON public.estacionamento_precos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment for the new table
COMMENT ON TABLE public.estacionamento_precos IS 'Tabela para armazenar preços por quantidade de horas para cada estacionamento';
COMMENT ON COLUMN public.estacionamento_precos.horas IS 'Quantidade de horas para este preço';
COMMENT ON COLUMN public.estacionamento_precos.preco IS 'Preço para a quantidade de horas especificada';