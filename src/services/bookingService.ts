
import { supabase } from '@/integrations/supabase/client';
import { Booking } from '@/types/booking';
import { toast } from '@/components/ui/use-toast';

// Buscar todas as reservas do usuário
export const fetchUserBookings = async (): Promise<Booking[]> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No authenticated user found');
      return [];
    }
    
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        estacionamento!bookings_estacionamento_id_fkey (nome, endereco)
      `)
      .eq('user_id', user.id)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });
    
    if (error) throw error;
    
    // Processar resultados para formato mais fácil de usar
    return (bookings || []).map(booking => ({
      ...booking,
      parkingName: booking.estacionamento?.nome,
      parkingAddress: booking.estacionamento?.endereco,
      status: booking.status as Booking['status'],
    }));
  } catch (error: any) {
    console.error('Erro ao buscar reservas:', error.message);
    throw new Error('Falha ao carregar suas reservas: ' + error.message);
  }
};

// Criar uma nova reserva
export const createBooking = async (bookingData: Omit<Booking, 'id' | 'user_id' | 'created_at'>): Promise<Booking> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }
    
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        ...bookingData,
        user_id: user.id // Add the user_id field
      })
      .select(`
        *,
        estacionamento!bookings_estacionamento_id_fkey (nome, endereco)
      `)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      throw new Error('Erro ao criar reserva');
    }
    
    return {
      ...data,
      parkingName: data.estacionamento?.nome,
      parkingAddress: data.estacionamento?.endereco,
      status: data.status as Booking['status'],
    };
  } catch (error: any) {
    console.error('Erro ao criar reserva:', error.message);
    throw new Error('Falha ao criar sua reserva: ' + error.message);
  }
};

// Criar uma reserva com solicitação (aguardando confirmação)
export const createBookingRequest = async (bookingData: Omit<Booking, 'id' | 'user_id' | 'created_at' | 'status' | 'expires_at'>): Promise<Booking> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }
    
    // Verificar se o usuário pode fazer reserva para hoje
    const isToday = new Date(bookingData.date).toDateString() === new Date().toDateString();
    if (isToday) {
      const { data: canBook } = await supabase
        .rpc('can_user_book_today', { p_user_id: user.id });
      
      if (!canBook) {
        throw new Error('Você já possui uma reserva ativa para hoje. Aguarde a confirmação de saída antes de fazer uma nova reserva.');
      }
    }
    
    // Definir tempo de expiração (15 minutos)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);
    
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        ...bookingData,
        user_id: user.id,
        status: 'aguardando_confirmacao',
        expires_at: expiresAt.toISOString(),
      })
      .select(`
        *,
        estacionamento!bookings_estacionamento_id_fkey (nome, endereco, user_id),
        veiculo:veiculos(tipo, modelo, cor, placa, tamanho)
      `)
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Erro ao criar solicitação de reserva');
    
    // Buscar nome do usuário
    const { data: profileData } = await supabase
      .from('profiles')
      .select('name, apelido')
      .eq('id', user.id)
      .single();
    
    return {
      ...data,
      parkingName: data.estacionamento?.nome,
      parkingAddress: data.estacionamento?.endereco,
      status: data.status as Booking['status'],
      user: profileData ? { name: profileData.name || '', apelido: profileData.apelido } : undefined
    };
  } catch (error: any) {
    console.error('Erro ao criar solicitação:', error.message);
    throw new Error(error.message || 'Falha ao criar solicitação de reserva');
  }
};

// Aceitar reserva (edge function)
export const acceptBooking = async (bookingId: string): Promise<void> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await supabase.functions.invoke('booking-accept', {
      body: { bookingId },
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
      },
    });
    
    if (response.error) throw response.error;
  } catch (error: any) {
    console.error('Erro ao aceitar reserva:', error);
    throw new Error('Falha ao aceitar reserva: ' + error.message);
  }
};

// Rejeitar reserva (edge function)
export const rejectBooking = async (bookingId: string): Promise<void> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await supabase.functions.invoke('booking-reject', {
      body: { bookingId },
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
      },
    });
    
    if (response.error) throw response.error;
  } catch (error: any) {
    console.error('Erro ao rejeitar reserva:', error);
    throw new Error('Falha ao rejeitar reserva: ' + error.message);
  }
};

// Confirmar chegada
export const confirmArrival = async (bookingId: string, confirmedBy: 'owner' | 'user'): Promise<void> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await supabase.functions.invoke('booking-confirm-arrival', {
      body: { bookingId, confirmedBy },
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
      },
    });
    
    if (response.error) throw response.error;
  } catch (error: any) {
    console.error('Erro ao confirmar chegada:', error);
    throw new Error('Falha ao confirmar chegada: ' + error.message);
  }
};

// Confirmar saída
export const confirmDeparture = async (bookingId: string, confirmedBy: 'owner' | 'user'): Promise<void> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await supabase.functions.invoke('booking-confirm-departure', {
      body: { bookingId, confirmedBy },
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
      },
    });
    
    if (response.error) throw response.error;
  } catch (error: any) {
    console.error('Erro ao confirmar saída:', error);
    throw new Error('Falha ao confirmar saída: ' + error.message);
  }
};

// Buscar solicitações pendentes (para o dashboard do estabelecimento)
export const fetchPendingBookings = async (estacionamentoId: string): Promise<Booking[]> => {
  try {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        veiculo:veiculos(tipo, modelo, cor, placa, tamanho),
        estacionamento:estacionamento!inner(nome, endereco)
      `)
      .eq('estacionamento_id', estacionamentoId)
      .eq('status', 'aguardando_confirmacao')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Buscar nomes dos usuários
    const userIds = [...new Set((bookings || []).map(b => b.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, apelido')
      .in('id', userIds);
    
    const profilesMap = new Map(profiles?.map(p => [p.id, p]));
    
    return (bookings || []).map(b => ({
      ...b,
      status: b.status as Booking['status'],
      user: profilesMap.get(b.user_id) ? {
        name: profilesMap.get(b.user_id)!.name || '',
        apelido: profilesMap.get(b.user_id)!.apelido
      } : undefined,
      parkingName: b.estacionamento?.nome,
      parkingAddress: b.estacionamento?.endereco
    }));
  } catch (error: any) {
    console.error('Erro ao buscar solicitações:', error);
    throw new Error('Falha ao carregar solicitações: ' + error.message);
  }
};

// Cancelar uma reserva
export const cancelBooking = async (bookingId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelada' })
      .eq('id', bookingId);
    
    if (error) throw error;
  } catch (error: any) {
    console.error('Erro ao cancelar reserva:', error.message);
    throw new Error('Falha ao cancelar sua reserva: ' + error.message);
  }
};
