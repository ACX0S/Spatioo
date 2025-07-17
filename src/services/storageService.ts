
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

// Function to upload avatar
export const uploadAvatar = async (file: File, userId: string): Promise<string> => {
  try {
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      throw new Error('O arquivo deve ter no máximo 2MB');
    }
    
    // Check file type (images only)
    if (!file.type.startsWith('image/')) {
      throw new Error('Apenas imagens são permitidas');
    }
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    // Upload the image
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });
      
    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Erro ao fazer upload: ' + uploadError.message);
    }
    
    // Get public URL of the image
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

// Function to delete old avatar
export const deleteOldAvatar = async (avatarUrl: string, userId: string): Promise<void> => {
  try {
    if (!avatarUrl) return;
    
    // Extract filename from the URL
    const urlParts = avatarUrl.split('/');
    const fileName = urlParts.slice(-2).join('/');
    
    if (fileName.startsWith(userId)) {
      const { error } = await supabase.storage
        .from('avatars')
        .remove([fileName]);
        
      if (error) {
        console.error('Error deleting old avatar:', error);
      }
    }
  } catch (error) {
    console.error('Error deleting old avatar:', error);
    // Don't throw error to avoid interrupting the flow
  }
};

// Function to upload estacionamento photos
export const uploadEstacionamentoPhoto = async (file: File, userId: string): Promise<string> => {
  try {
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('O arquivo deve ter no máximo 5MB');
    }
    
    // Check file type (images only)
    if (!file.type.startsWith('image/')) {
      throw new Error('Apenas imagens são permitidas');
    }
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    // Upload the image
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('estacionamento-photos')
      .upload(fileName, file, { upsert: true });
      
    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Erro ao fazer upload: ' + uploadError.message);
    }
    
    // Get public URL of the image
    const { data } = supabase.storage
      .from('estacionamento-photos')
      .getPublicUrl(fileName);
      
    if (!data.publicUrl) {
      throw new Error('Não foi possível obter URL pública da foto');
    }
    
    return data.publicUrl;
  } catch (error: any) {
    console.error('Error in uploadEstacionamentoPhoto:', error);
    throw error;
  }
};

// Function to delete estacionamento photos
export const deleteEstacionamentoPhotos = async (photoUrls: string[], userId: string): Promise<void> => {
  try {
    if (!photoUrls.length) return;
    
    const filesToDelete = photoUrls
      .map(url => {
        const urlParts = url.split('/');
        return urlParts.slice(-2).join('/');
      })
      .filter(fileName => fileName.startsWith(userId));
    
    if (filesToDelete.length > 0) {
      const { error } = await supabase.storage
        .from('estacionamento-photos')
        .remove(filesToDelete);
        
      if (error) {
        console.error('Error deleting estacionamento photos:', error);
      }
    }
  } catch (error) {
    console.error('Error deleting estacionamento photos:', error);
    // Don't throw error to avoid interrupting the flow
  }
};
