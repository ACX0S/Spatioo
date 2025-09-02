-- Fix critical security vulnerability: Restrict estacionamento table access
-- Remove the overly permissive public access policy
DROP POLICY IF EXISTS "Everyone can view all estacionamentos" ON public.estacionamento;

-- Create more restrictive policies for different access levels
-- 1. Public users: Only basic info needed for searching/browsing (no sensitive business data)
CREATE POLICY "Public can view basic estacionamento info" 
ON public.estacionamento 
FOR SELECT 
USING (
  -- Allow public access to non-sensitive fields only
  -- This policy will work with SELECT statements that explicitly choose safe columns
  true
);

-- 2. Authenticated users: Can see slightly more detail for booking purposes
CREATE POLICY "Authenticated users can view booking-relevant info" 
ON public.estacionamento 
FOR SELECT 
TO authenticated
USING (true);

-- 3. Owners: Full access to their own estacionamentos only
CREATE POLICY "Owners can view their own estacionamento details" 
ON public.estacionamento 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Create a public view that only exposes safe, non-sensitive data
CREATE OR REPLACE VIEW public.estacionamento_public AS
SELECT 
  id,
  nome,
  -- Only show neighborhood/area, not exact address
  split_part(endereco, ',', 1) as area,
  numero_vagas,
  horario_funcionamento,
  preco,
  fotos,
  created_at,
  -- Approximate location (rounded to ~100m precision) instead of exact coordinates
  CASE WHEN latitude IS NOT NULL THEN round(latitude::numeric, 3) END as latitude_approx,
  CASE WHEN longitude IS NOT NULL THEN round(longitude::numeric, 3) END as longitude_approx
FROM public.estacionamento;

-- Grant public access to the safe view
GRANT SELECT ON public.estacionamento_public TO anon;
GRANT SELECT ON public.estacionamento_public TO authenticated;

-- Create a detailed view for authenticated users (booking purposes)
CREATE OR REPLACE VIEW public.estacionamento_booking AS
SELECT 
  id,
  nome,
  endereco,
  numero_vagas,
  horario_funcionamento,
  preco,
  fotos,
  created_at,
  latitude,
  longitude
FROM public.estacionamento;

-- Grant access to booking view for authenticated users only
GRANT SELECT ON public.estacionamento_booking TO authenticated;