import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type BookingData = Database['public']['Tables']['bookings']['Row'] & {
  profiles?: {
    name: string | null;
  };
};

export const useEstacionamentoBookings = (estacionamentoId: string | undefined) => {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchBookings = async () => {
    if (!estacionamentoId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('estacionamento_id', estacionamentoId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBookings(data || []);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError(err.message || 'Erro ao carregar reservas');
      toast({
        title: "Erro",
        description: "Erro ao carregar reservas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = (status?: string, startDate?: string, endDate?: string) => {
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
  };

  useEffect(() => {
    fetchBookings();
  }, [estacionamentoId]);

  return {
    bookings,
    loading,
    error,
    refetch: fetchBookings,
    filterBookings
  };
};