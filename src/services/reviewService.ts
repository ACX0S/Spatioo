import { supabase } from '@/integrations/supabase/client';
import { Review } from '@/types/review';

export const createReview = async (reviewData: Omit<Review, 'id' | 'created_at' | 'avaliador_id'>): Promise<Review> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        ...reviewData,
        avaliador_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Erro ao criar avaliação');

    return data as Review;
  } catch (error: any) {
    console.error('Erro ao criar avaliação:', error);
    throw new Error(error.message || 'Falha ao criar avaliação');
  }
};

export const checkIfBookingHasReview = async (bookingId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('id')
      .eq('booking_id', bookingId)
      .maybeSingle();

    if (error) throw error;
    
    return !!data;
  } catch (error: any) {
    console.error('Erro ao verificar avaliação:', error);
    return false;
  }
};

export const getPendingReviewBookings = async (): Promise<string[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return [];

    // Buscar reservas concluídas do usuário
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'concluida')
      .order('completed_at', { ascending: false });

    if (bookingsError) throw bookingsError;
    if (!bookings || bookings.length === 0) return [];

    const bookingIds = bookings.map(b => b.id);

    // Buscar avaliações já feitas
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('booking_id')
      .in('booking_id', bookingIds);

    if (reviewsError) throw reviewsError;

    const reviewedBookingIds = new Set(reviews?.map(r => r.booking_id) || []);
    
    return bookingIds.filter(id => !reviewedBookingIds.has(id));
  } catch (error: any) {
    console.error('Erro ao buscar reservas pendentes de avaliação:', error);
    return [];
  }
};

export const getEstacionamentoReviews = async (estacionamentoId: string): Promise<Review[]> => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('avaliado_id', estacionamentoId)
      .eq('avaliado_tipo', 'estacionamento')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []) as Review[];
  } catch (error: any) {
    console.error('Erro ao buscar avaliações:', error);
    return [];
  }
};
