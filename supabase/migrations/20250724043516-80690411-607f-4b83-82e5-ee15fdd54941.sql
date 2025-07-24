-- Adicionar política pública para visualização de estacionamentos
CREATE POLICY "Everyone can view all estacionamentos" 
ON public.estacionamento 
FOR SELECT 
USING (true);

-- Remover a política restritiva anterior
DROP POLICY IF EXISTS "Users can view their own estacionamento" ON public.estacionamento;

-- Garantir que os buckets sejam públicos
UPDATE storage.buckets 
SET public = true 
WHERE id IN ('avatars', 'estacionamento-photos');