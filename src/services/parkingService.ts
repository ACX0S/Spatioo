
import { supabase } from '@/integrations/supabase/client';
import { ParkingSpot } from '@/types/parking';

// Buscar todos os estacionamentos
export const fetchAllParkingSpots = async (): Promise<ParkingSpot[]> => {
  const { data, error } = await supabase
    .from('parking_spots')
    .select('*')
    .order('rating', { ascending: false });
    
  if (error) {
    throw error;
  }
  
  return data || [];
};

// Buscar um estacionamento pelo ID
export const fetchParkingSpotById = async (id: string): Promise<ParkingSpot> => {
  const { data, error } = await supabase
    .from('parking_spots')
    .select('*')
    .eq('id', id)
    .maybeSingle();
    
  if (error) {
    throw error;
  }
  
  if (!data) {
    throw new Error('Estacionamento não encontrado');
  }
  
  return data;
};

// Buscar estacionamentos próximos (limite de 3)
export const fetchNearbyParkingSpots = async (): Promise<ParkingSpot[]> => {
  const { data, error } = await supabase
    .from('parking_spots')
    .select('*')
    .limit(3);
    
  if (error) {
    throw error;
  }
  
  return data || [];
};

// Buscar estacionamentos populares (com mais avaliações)
export const fetchPopularParkingSpots = async (limit: number = 4): Promise<ParkingSpot[]> => {
  const { data, error } = await supabase
    .from('parking_spots')
    .select('*')
    .order('reviews_count', { ascending: false })
    .limit(limit);
    
  if (error) {
    throw error;
  }
  
  return data || [];
};

// Buscar estacionamentos por termo de busca
export const searchParkingSpots = async (searchTerm: string): Promise<ParkingSpot[]> => {
  const { data, error } = await supabase
    .from('parking_spots')
    .select('*')
    .ilike('name', `%${searchTerm}%`)
    .order('rating', { ascending: false });
    
  if (error) {
    throw error;
  }
  
  return data || [];
};
