-- Add veiculo_id to bookings table
ALTER TABLE public.bookings 
ADD COLUMN veiculo_id uuid REFERENCES public.veiculos(id) ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX idx_bookings_veiculo_id ON public.bookings(veiculo_id);

-- Add comment
COMMENT ON COLUMN public.bookings.veiculo_id IS 'ID do veículo utilizado na reserva';