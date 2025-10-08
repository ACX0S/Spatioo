import { useState, useEffect } from 'react';
import { Booking } from '@/types/booking';
import { confirmArrival, confirmDeparture } from '@/services/bookingService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook para gerenciar ações do usuário em suas reservas
 */
export const useUserBookingActions = () => {
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Buscar reserva ativa/ocupada do usuário
  const loadActiveBooking = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          estacionamento!bookings_estacionamento_id_fkey (nome, endereco, latitude, longitude)
        `)
        .eq('user_id', user.id)
        .in('status', ['reservada', 'ocupada'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setActiveBooking({
          ...data,
          status: data.status as Booking['status'],
          parkingName: data.estacionamento?.nome,
          parkingAddress: data.estacionamento?.endereco,
        });
      } else {
        setActiveBooking(null);
      }
    } catch (error: any) {
      console.error('Erro ao carregar reserva ativa:', error);
    }
  };

  const handleUserArrival = async (bookingId: string) => {
    try {
      setLoading(true);
      await confirmArrival(bookingId, 'user');
      toast({
        title: 'Chegada confirmada!',
        description: 'Sua chegada foi confirmada com sucesso.',
      });
      await loadActiveBooking();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível confirmar chegada',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserDeparture = async (bookingId: string) => {
    try {
      setLoading(true);
      await confirmDeparture(bookingId, 'user');
      toast({
        title: 'Saída confirmada!',
        description: 'Obrigado por usar o Spatioo!',
      });
      await loadActiveBooking();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível confirmar saída',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    loadActiveBooking();

    const channel = supabase
      .channel('user-booking-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadActiveBooking();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    activeBooking,
    loading,
    handleUserArrival,
    handleUserDeparture,
    refreshBooking: loadActiveBooking,
  };
};