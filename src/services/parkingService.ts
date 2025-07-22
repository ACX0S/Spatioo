
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

// Buscar todos os estacionamentos
export const fetchAllParkingSpots = async (): Promise<Database['public']['Tables']['estacionamento']['Row'][]> => {
  try {
    const { data, error } = await supabase
      .from('estacionamento')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching estacionamento:', error);
      throw error;
    }
    
    return data || [];
  } catch (error: any) {
    console.error('Failed to fetch estacionamento:', error.message);
    // Return empty array instead of throwing to prevent infinite loading
    return [];
  }
};

// Buscar um estacionamento pelo ID
export const fetchParkingSpotById = async (id: string): Promise<Database['public']['Tables']['estacionamento']['Row'] | null> => {
  try {
    const { data, error } = await supabase
      .from('estacionamento')
      .select('*')
      .eq('id', id)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching estacionamento by ID:', error);
      throw error;
    }
    
    return data;
  } catch (error: any) {
    console.error('Failed to fetch estacionamento:', error.message);
    // Return null instead of throwing to prevent infinite loading
    return null;
  }
};

// Buscar estacionamentos próximos (limite de 3)
export const fetchNearbyParkingSpots = async (): Promise<Database['public']['Tables']['estacionamento']['Row'][]> => {
  try {
    const { data, error } = await supabase
      .from('estacionamento')
      .select('*')
      .limit(3);
      
    if (error) {
      console.error('Error fetching nearby estacionamentos:', error);
      throw error;
    }
    
    return data || [];
  } catch (error: any) {
    console.error('Failed to fetch nearby spots:', error.message);
    // Return empty array instead of throwing to prevent infinite loading
    return [];
  }
};

// Buscar estacionamentos populares (ordenados por data de criação)
export const fetchPopularParkingSpots = async (limit: number = 4): Promise<Database['public']['Tables']['estacionamento']['Row'][]> => {
  try {
    const { data, error } = await supabase
      .from('estacionamento')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error('Error fetching popular estacionamentos:', error);
      throw error;
    }
    
    return data || [];
  } catch (error: any) {
    console.error('Failed to fetch popular spots:', error.message);
    // Return empty array instead of throwing to prevent infinite loading
    return [];
  }
};

// Buscar estacionamentos por termo de busca
export const searchParkingSpots = async (searchTerm: string): Promise<Database['public']['Tables']['estacionamento']['Row'][]> => {
  try {
    const { data, error } = await supabase
      .from('estacionamento')
      .select('*')
      .or(`nome.ilike.%${searchTerm}%,endereco.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error searching estacionamentos:', error);
      throw error;
    }
    
    return data || [];
  } catch (error: any) {
    console.error('Failed to search spots:', error.message);
    // Return empty array instead of throwing to prevent infinite loading
    return [];
  }
};
