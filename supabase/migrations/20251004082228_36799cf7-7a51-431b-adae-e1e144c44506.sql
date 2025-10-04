-- Atualizar função handle_new_user para incluir campo apelido
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, apelido, phone)
  VALUES (
    NEW.id, 
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'apelido',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$;