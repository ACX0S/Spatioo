
import { supabase } from '@/integrations/supabase/client';
import { Booking } from '@/types/booking';
import { toast } from '@/components/ui/use-toast';

// Buscar todas as reservas do usuário
export const fetchUserBookings = async (): Promise<Booking[]> => {
  try {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        parking_spots:parking_spot_id (name, address)
      `)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });
    
    if (error) throw error;
    
    // Processar resultados para formato mais fácil de usar
    return (bookings || []).map(booking => ({
      ...booking,
      parkingName: booking.parking_spots?.name,
      parkingAddress: booking.parking_spots?.address
    }));
  } catch (error: any) {
    console.error('Erro ao buscar reservas:', error.message);
    throw new Error('Falha ao carregar suas reservas.');
  }
};

// Criar uma nova reserva
export const createBooking = async (bookingData: Omit<Booking, 'id' | 'user_id' | 'created_at'>): Promise<Booking> => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        ...bookingData
      })
      .select(`
        *,
        parking_spots:parking_spot_id (name, address)
      `)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      throw new Error('Erro ao criar reserva');
    }
    
    return {
      ...data,
      parkingName: data.parking_spots?.name,
      parkingAddress: data.parking_spots?.address
    };
  } catch (error: any) {
    console.error('Erro ao criar reserva:', error.message);
    throw new Error('Falha ao criar sua reserva.');
  }
};

// Cancelar uma reserva
export const cancelBooking = async (bookingId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);
    
    if (error) throw error;
  } catch (error: any) {
    console.error('Erro ao cancelar reserva:', error.message);
    throw new Error('Falha ao cancelar sua reserva.');
  }
};
