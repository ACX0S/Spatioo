
import { supabase } from '@/integrations/supabase/client';
import { ParkingSpot } from '@/types/parking';

// Buscar todos os estacionamentos
export const fetchAllParkingSpots = async (): Promise<ParkingSpot[]> => {
  try {
    const { data, error } = await supabase
      .from('parking_spots')
      .select('*')
      .order('rating', { ascending: false });
      
    if (error) {
      console.error('Error fetching parking spots:', error);
      throw error;
    }
    
    return data || [];
  } catch (error: any) {
    console.error('Failed to fetch parking spots:', error.message);
    // Return empty array instead of throwing to prevent infinite loading
    return [];
  }
};

// Buscar um estacionamento pelo ID
export const fetchParkingSpotById = async (id: string): Promise<ParkingSpot | null> => {
  try {
    const { data, error } = await supabase
      .from('parking_spots')
      .select('*')
      .eq('id', id)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching parking spot by ID:', error);
      throw error;
    }
    
    return data;
  } catch (error: any) {
    console.error('Failed to fetch parking spot:', error.message);
    // Return null instead of throwing to prevent infinite loading
    return null;
  }
};

// Buscar estacionamentos próximos (limite de 3)
export const fetchNearbyParkingSpots = async (): Promise<ParkingSpot[]> => {
  try {
    const { data, error } = await supabase
      .from('parking_spots')
      .select('*')
      .limit(3);
      
    if (error) {
      console.error('Error fetching nearby parking spots:', error);
      throw error;
    }
    
    return data || [];
  } catch (error: any) {
    console.error('Failed to fetch nearby spots:', error.message);
    // Return empty array instead of throwing to prevent infinite loading
    return [];
  }
};

// Buscar estacionamentos populares (com mais avaliações)
export const fetchPopularParkingSpots = async (limit: number = 4): Promise<ParkingSpot[]> => {
  try {
    const { data, error } = await supabase
      .from('parking_spots')
      .select('*')
      .order('reviews_count', { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error('Error fetching popular parking spots:', error);
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
export const searchParkingSpots = async (searchTerm: string): Promise<ParkingSpot[]> => {
  try {
    const { data, error } = await supabase
      .from('parking_spots')
      .select('*')
      .ilike('name', `%${searchTerm}%`)
      .order('rating', { ascending: false });
      
    if (error) {
      console.error('Error searching parking spots:', error);
      throw error;
    }
    
    return data || [];
  } catch (error: any) {
    console.error('Failed to search spots:', error.message);
    // Return empty array instead of throwing to prevent infinite loading
    return [];
  }
};
