
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

// Public parking data type (excluding sensitive information)
export type PublicParkingData = {
  id: string;
  nome: string;
  endereco: string;
  numero_vagas: number;
  horario_funcionamento: any;
  preco: number;
  fotos: string[];
  created_at: string;
  latitude: number | null;
  longitude: number | null;
};

// Add owner-specific functions that return full data
export const fetchOwnerEstacionamentos = async (): Promise<Database['public']['Tables']['estacionamento']['Row'][]> => {
  try {
  const { data, error } = await supabase
    .from('estacionamento')
    .select('*')
    .eq('ativo', true)
    .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching owner estacionamentos:', error);
      throw error;
    }
    
    return data || [];
  } catch (error: any) {
    console.error('Failed to fetch owner estacionamentos:', error.message);
    return [];
  }
};

export const fetchOwnerEstacionamentoById = async (id: string): Promise<Database['public']['Tables']['estacionamento']['Row'] | null> => {
  try {
    const { data, error } = await supabase
      .from('estacionamento')
      .select('*')
      .eq('id', id)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching owner estacionamento by ID:', error);
      throw error;
    }
    
    return data;
  } catch (error: any) {
    console.error('Failed to fetch owner estacionamento:', error.message);
    return null;
  }
};

// Buscar todos os estacionamentos (dados públicos apenas)
export const fetchAllParkingSpots = async (): Promise<PublicParkingData[]> => {
  try {
  const { data, error } = await supabase
    .from('estacionamento')
    .select('id, nome, endereco, numero_vagas, horario_funcionamento, preco, fotos, created_at, latitude, longitude')
    .eq('ativo', true)
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

// Buscar um estacionamento pelo ID (dados públicos apenas)
export const fetchParkingSpotById = async (id: string): Promise<PublicParkingData | null> => {
  try {
  const { data, error } = await supabase
    .from('estacionamento')
    .select('id, nome, endereco, numero_vagas, horario_funcionamento, preco, fotos, created_at, latitude, longitude')
    .eq('id', id)
    .eq('ativo', true)
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

// Buscar estacionamentos próximos (limite de 3, dados públicos apenas)
export const fetchNearbyParkingSpots = async (): Promise<PublicParkingData[]> => {
  try {
  const { data, error } = await supabase
    .from('estacionamento')
    .select('id, nome, endereco, numero_vagas, horario_funcionamento, preco, fotos, created_at, latitude, longitude')
    .eq('ativo', true)
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

// Buscar estacionamentos populares (ordenados por data de criação, dados públicos apenas)
export const fetchPopularParkingSpots = async (limit: number = 4): Promise<PublicParkingData[]> => {
  try {
  const { data, error } = await supabase
    .from('estacionamento')
    .select('id, nome, endereco, numero_vagas, horario_funcionamento, preco, fotos, created_at, latitude, longitude')
    .eq('ativo', true)
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

// Buscar estacionamentos por termo de busca (dados públicos apenas)
export const searchParkingSpots = async (searchTerm: string): Promise<PublicParkingData[]> => {
  try {
  const { data, error } = await supabase
    .from('estacionamento')
    .select('id, nome, endereco, numero_vagas, horario_funcionamento, preco, fotos, created_at, latitude, longitude')
    .eq('ativo', true)
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
