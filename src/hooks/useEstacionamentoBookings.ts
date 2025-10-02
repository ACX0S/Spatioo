import { useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useSupabaseQuery } from './useSupabaseQuery';

type BookingData = Database['public']['Tables']['bookings']['Row'] & {
  profiles?: {
    name: string | null;
  };
};

/**
 * @hook useEstacionamentoBookings
 * @description Hook otimizado para gerenciar reservas de um estacionamento
 * Agora usa useSupabaseQuery e useMemo para melhor performance
 */
export const useEstacionamentoBookings = (estacionamentoId: string | undefined) => {
  // Usa o hook genérico para buscar bookings
  const { data: bookings, loading, error, refetch } = useSupabaseQuery<BookingData>(
    async () => supabase
      .from('bookings')
      .select('*')
      .eq('estacionamento_id', estacionamentoId!)
      .order('created_at', { ascending: false }),
    [estacionamentoId],
    {
      enabled: !!estacionamentoId,
      errorMessage: 'Erro ao carregar reservas'
    }
  );

  // Otimizado com useCallback para evitar re-criação da função
  const filterBookings = useCallback((status?: string, startDate?: string, endDate?: string) => {
    let filtered = bookings;

    if (status && status !== 'all') {
      filtered = filtered.filter(booking => booking.status === status);
    }

    if (startDate) {
      filtered = filtered.filter(booking => booking.date >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter(booking => booking.date <= endDate);
    }

    return filtered;
  }, [bookings]);

  return {
    bookings,
    loading,
    error,
    refetch,
    filterBookings
  };
};