-- Create storage buckets for avatars and estacionamento photos
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('avatars', 'avatars', true),
  ('estacionamento-photos', 'estacionamento-photos', true);

-- Create policies for avatar uploads
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policies for estacionamento photo uploads
CREATE POLICY "Estacionamento images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'estacionamento-photos');

CREATE POLICY "Users can upload estacionamento photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'estacionamento-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update estacionamento photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'estacionamento-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete estacionamento photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'estacionamento-photos' AND auth.uid()::text = (storage.foldername(name))[1]);