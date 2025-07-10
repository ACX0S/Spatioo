-- Primeiro, vamos verificar se a trigger existe
SELECT tgname, tgenabled FROM pg_trigger WHERE tgrelid = 'auth.users'::regclass;

-- Inserir manualmente o perfil que deveria ter sido criado pela trigger
INSERT INTO public.profiles (id, name)
VALUES (
  'e881ef4b-6d13-4935-9090-daf8f0b0529a',
  'Leonardo Parpinelli'
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Verificar se o perfil foi criado
SELECT * FROM public.profiles WHERE id = 'e881ef4b-6d13-4935-9090-daf8f0b0529a';