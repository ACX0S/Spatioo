-- 1) Remover FK duplicada em bookings.estacionamento_id que causa ambiguidade de embed
ALTER TABLE public.bookings
DROP CONSTRAINT IF EXISTS fk_bookings_estacionamento;

-- 2) Trocar referência de bookings.user_id -> auth.users para profiles.id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    WHERE tc.table_name = 'bookings'
      AND tc.constraint_name = 'bookings_user_id_fkey'
  ) THEN
    ALTER TABLE public.bookings DROP CONSTRAINT bookings_user_id_fkey;
  END IF;
END $$;

ALTER TABLE public.bookings
ADD CONSTRAINT bookings_user_id_profiles_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 3) Política para donos verem perfis dos usuários que têm relação com seus estacionamentos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='Owners can view profiles of their booking users'
  ) THEN
    CREATE POLICY "Owners can view profiles of their booking users"
    ON public.profiles
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1
        FROM public.bookings b
        JOIN public.estacionamento e ON e.id = b.estacionamento_id
        WHERE b.user_id = profiles.id
          AND e.user_id = auth.uid()
      )
    );
  END IF;
END $$;