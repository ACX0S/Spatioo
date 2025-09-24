-- Create table for parking pricing tiers
CREATE TABLE public.estacionamento_precos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estacionamento_id UUID NOT NULL REFERENCES public.estacionamento(id) ON DELETE CASCADE,
  horas INTEGER NOT NULL CHECK (horas > 0),
  preco NUMERIC NOT NULL CHECK (preco > 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.estacionamento_precos ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Everyone can view pricing for active estacionamentos" 
ON public.estacionamento_precos 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.estacionamento 
    WHERE estacionamento.id = estacionamento_precos.estacionamento_id 
    AND estacionamento.ativo = true
  )
);

CREATE POLICY "Owners can manage their pricing" 
ON public.estacionamento_precos 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.estacionamento 
    WHERE estacionamento.id = estacionamento_precos.estacionamento_id 
    AND estacionamento.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.estacionamento 
    WHERE estacionamento.id = estacionamento_precos.estacionamento_id 
    AND estacionamento.user_id = auth.uid()
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_estacionamento_precos_updated_at
BEFORE UPDATE ON public.estacionamento_precos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add unique constraint to prevent duplicate hour entries per estacionamento
CREATE UNIQUE INDEX idx_estacionamento_precos_unique_horas 
ON public.estacionamento_precos (estacionamento_id, horas);