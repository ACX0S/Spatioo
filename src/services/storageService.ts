
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

// Função para fazer upload de avatar
export const uploadAvatar = async (file: File, userId: string): Promise<string> => {
  try {
    // Verificar tamanho do arquivo (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      throw new Error('O arquivo deve ter no máximo 2MB');
    }
    
    // Verificar tipo do arquivo (apenas imagens)
    if (!file.type.startsWith('image/')) {
      throw new Error('Apenas imagens são permitidas');
    }
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    // Fazer upload da imagem
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });
      
    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Erro ao fazer upload: ' + uploadError.message);
    }
    
    // Obter URL pública da imagem
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
      
    if (!data.publicUrl) {
      throw new Error('Não foi possível obter URL pública do avatar');
    }
    
    return data.publicUrl;
  } catch (error: any) {
    console.error('Error in uploadAvatar:', error);
    throw error;
  }
};

// Função para excluir avatar antigo
export const deleteOldAvatar = async (avatarUrl: string, userId: string): Promise<void> => {
  try {
    if (!avatarUrl) return;
    
    // Extrair o nome do arquivo da URL
    const urlParts = avatarUrl.split('/');
    const fileName = urlParts.slice(-2).join('/');
    
    if (fileName.startsWith(userId)) {
      await supabase.storage
        .from('avatars')
        .remove([fileName]);
    }
  } catch (error) {
    console.error('Error deleting old avatar:', error);
    // Não lancar erro para não interromper o fluxo
  }
};
