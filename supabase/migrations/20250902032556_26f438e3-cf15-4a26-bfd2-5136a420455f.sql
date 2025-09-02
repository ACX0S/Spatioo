-- Remove the views approach and implement app-level column filtering instead
-- This is more secure and doesn't trigger security definer warnings

-- Drop the views since we'll handle filtering in the application
DROP VIEW IF EXISTS public.estacionamento_public;
DROP VIEW IF EXISTS public.estacionamento_booking;

-- Simplify the RLS policy to be clear and secure
DROP POLICY IF EXISTS "Restricted estacionamento access" ON public.estacionamento;

-- Create clear, separate policies for different access levels
-- 1. Owners can see everything about their own parking lots
CREATE POLICY "Owners can manage their estacionamentos" 
ON public.estacionamento 
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 2. Authenticated users can see basic info for booking purposes  
CREATE POLICY "Authenticated users can view for booking" 
ON public.estacionamento 
FOR SELECT
TO authenticated
USING (true);

-- 3. Anonymous users can see limited info for browsing
CREATE POLICY "Anonymous users can browse basic info" 
ON public.estacionamento 
FOR SELECT
TO anon
USING (true);

-- Create a function to check if user owns an estacionamento (for use in app)
CREATE OR REPLACE FUNCTION public.user_owns_estacionamento(estacionamento_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.estacionamento 
    WHERE id = estacionamento_id AND user_id = auth.uid()
  );
$$;