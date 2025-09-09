-- Fix security warning by setting search_path for the function
CREATE OR REPLACE FUNCTION public.notify_estacionamento_owner()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;