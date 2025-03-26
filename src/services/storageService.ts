
import { supabase } from '@/integrations/supabase/client';

// Função para fazer upload de avatar
export const uploadAvatar = async (file: File, userId: string): Promise<string> => {
  try {
    // Verificar se o bucket 'avatars' existe, se não, criar
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find(bucket => bucket.name === 'avatars')) {
      const { error } = await supabase.storage.createBucket('avatars', {
        public: true,
        fileSizeLimit: 1024 * 1024 * 2 // 2MB
      });
      
      if (error) {
        throw error;
      }
    }
    
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}.${fileExt}`;
    
    // Fazer upload da imagem
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });
      
    if (uploadError) {
      throw uploadError;
    }
    
    // Obter URL pública da imagem
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
      
    if (!data.publicUrl) {
      throw new Error('Não foi possível obter URL pública do avatar');
    }
    
    return data.publicUrl;
  } catch (error) {
    console.error('Erro ao fazer upload de avatar:', error);
    throw error;
  }
};
