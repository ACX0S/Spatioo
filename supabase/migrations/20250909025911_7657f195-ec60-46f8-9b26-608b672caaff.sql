-- Add active field to estacionamento table
ALTER TABLE public.estacionamento 
ADD COLUMN ativo boolean NOT NULL DEFAULT true;

-- Create notifications table for booking notifications
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('booking_created', 'booking_cancelled', 'booking_completed')),
  title text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  booking_id uuid,
  estacionamento_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for notifications updated_at
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to notify estacionamento owner
CREATE OR REPLACE FUNCTION public.notify_estacionamento_owner()
RETURNS TRIGGER AS $$
DECLARE
  estacionamento_owner_id uuid;
  estacionamento_name text;
BEGIN
  -- Get the owner and name of the estacionamento
  SELECT user_id, nome INTO estacionamento_owner_id, estacionamento_name
  FROM public.estacionamento 
  WHERE id = NEW.estacionamento_id;

  -- Only create notification if the booking is not for the owner
  IF estacionamento_owner_id != NEW.user_id THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      booking_id,
      estacionamento_id
    ) VALUES (
      estacionamento_owner_id,
      'booking_created',
      'Nova reserva recebida',
      'Você recebeu uma nova reserva para ' || estacionamento_name || ' no dia ' || NEW.date::text,
      NEW.id,
      NEW.estacionamento_id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to notify on booking creation
CREATE TRIGGER trigger_notify_estacionamento_owner
AFTER INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.notify_estacionamento_owner();