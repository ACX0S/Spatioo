-- Create table for individual parking spots (vagas)
CREATE TABLE public.vagas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estacionamento_id UUID NOT NULL,
  user_id UUID NULL, -- User who has reserved/is using the spot
  status TEXT NOT NULL DEFAULT 'disponivel', -- disponivel, ocupada, reservada, manutencao
  booking_id UUID NULL, -- Reference to the booking when spot is reserved
  pagamento_realizado BOOLEAN NOT NULL DEFAULT false,
  tipo_vaga TEXT NOT NULL DEFAULT 'comum', -- comum, eletrico, deficiente, moto
  numero_vaga TEXT NOT NULL, -- Spot number/identifier
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Foreign key to estacionamento
  CONSTRAINT fk_vagas_estacionamento 
    FOREIGN KEY (estacionamento_id) 
    REFERENCES public.estacionamento(id) 
    ON DELETE CASCADE,
    
  -- Foreign key to bookings (optional)
  CONSTRAINT fk_vagas_booking 
    FOREIGN KEY (booking_id) 
    REFERENCES public.bookings(id) 
    ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.vagas ENABLE ROW LEVEL SECURITY;

-- Create policies for vagas
CREATE POLICY "Everyone can view available spots" 
ON public.vagas 
FOR SELECT 
USING (true);

CREATE POLICY "Estacionamento owners can manage their spots" 
ON public.vagas 
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

CREATE POLICY "Users can update spots they have reserved" 
ON public.vagas 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_vagas_estacionamento_id ON public.vagas(estacionamento_id);
CREATE INDEX idx_vagas_user_id ON public.vagas(user_id);
CREATE INDEX idx_vagas_booking_id ON public.vagas(booking_id);
CREATE INDEX idx_vagas_status ON public.vagas(status);
CREATE INDEX idx_vagas_tipo ON public.vagas(tipo_vaga);

-- Create trigger for updated_at
CREATE TRIGGER update_vagas_updated_at
  BEFORE UPDATE ON public.vagas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add unique constraint to ensure each spot number is unique per estacionamento
ALTER TABLE public.vagas 
ADD CONSTRAINT unique_numero_vaga_per_estacionamento 
UNIQUE (estacionamento_id, numero_vaga);