import { useState, useEffect, useCallback } from 'react';
import { Booking } from '@/types/booking';
import { 
  fetchPendingBookings, 
  acceptBooking, 
  rejectBooking,
  confirmArrival,
  confirmDeparture 
} from '@/services/bookingService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook para gerenciar reservas de um estacionamento específico
 */
export const useParkingBookings = (estacionamentoId: string | undefined) => {
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [activeBookings, setActiveBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { user } = useAuth();

  const loadBookings = useCallback(async () => {
    if (!estacionamentoId || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Buscar solicitações pendentes
      const pending = await fetchPendingBookings(estacionamentoId);
      setPendingBookings(pending);

      // Buscar reservas ativas/ocupadas
      const { data: active, error } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles!bookings_user_id_fkey (name)
        `)
        .eq('estacionamento_id', estacionamentoId)
        .in('status', ['reservada', 'ocupada'])
        .order('date', { ascending: true });

      if (error) throw error;
      setActiveBookings((active || []).map(b => ({ ...b, status: b.status as Booking['status'] })));
    } catch (error: any) {
      console.error('Erro ao carregar reservas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as reservas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [estacionamentoId, user]);

  const handleAccept = async (bookingId: string) => {
    try {
      setActionLoading(true);
      await acceptBooking(bookingId);
      toast({
        title: 'Reserva aceita',
        description: 'A reserva foi aceita com sucesso!',
      });
      await loadBookings();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível aceitar a reserva',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (bookingId: string) => {
    try {
      setActionLoading(true);
      await rejectBooking(bookingId);
      toast({
        title: 'Reserva recusada',
        description: 'A solicitação foi recusada.',
      });
      await loadBookings();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível recusar a reserva',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOwnerArrival = async (bookingId: string) => {
    try {
      setActionLoading(true);
      await confirmArrival(bookingId, 'owner');
      toast({
        title: 'Chegada confirmada',
        description: 'Aguardando confirmação do motorista.',
      });
      await loadBookings();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível confirmar chegada',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOwnerDeparture = async (bookingId: string) => {
    try {
      setActionLoading(true);
      await confirmDeparture(bookingId, 'owner');
      toast({
        title: 'Saída confirmada',
        description: 'Aguardando confirmação do motorista.',
      });
      await loadBookings();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível confirmar saída',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Realtime subscriptions
  useEffect(() => {
    if (!estacionamentoId) return;

    const channel = supabase
      .channel('parking-bookings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `estacionamento_id=eq.${estacionamentoId}`,
        },
        () => {
          loadBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [estacionamentoId, loadBookings]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  return {
    pendingBookings,
    activeBookings,
    loading,
    actionLoading,
    handleAccept,
    handleReject,
    handleOwnerArrival,
    handleOwnerDeparture,
    refreshBookings: loadBookings,
  };
};