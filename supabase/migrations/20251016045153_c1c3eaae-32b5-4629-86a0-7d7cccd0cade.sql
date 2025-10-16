-- Adicionar política para permitir que usuários deletem suas próprias notificações
CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);