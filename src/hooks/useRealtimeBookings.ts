import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// Debounce helper to prevent toast spam
const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Hook otimizado para escutar mudanças em bookings em tempo real
 * Implementa debouncing, rate limiting e event deduplication
 */
export const useRealtimeBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const processedEvents = useRef<Set<string>>(new Set());
  const lastNotificationTime = useRef<{ [key: string]: number }>({});

  // Debounced toast functions to prevent spam
  const showSuccessToast = useCallback(
    debounce((title: string, description: string) => {
      toast.success(title, { description, duration: 5000 });
    }, 500),
    []
  );

  const showErrorToast = useCallback(
    debounce((title: string, description: string) => {
      toast.error(title, { description, duration: 5000 });
    }, 500),
    []
  );

  const showInfoToast = useCallback(
    debounce((title: string, description: string) => {
      toast.info(title, { description, duration: 5000 });
    }, 500),
    []
  );

  // Check if we should show notification (rate limiting)
  const shouldShowNotification = useCallback((key: string, cooldownMs = 2000) => {
    const now = Date.now();
    const lastTime = lastNotificationTime.current[key];
    
    if (lastTime && now - lastTime < cooldownMs) {
      return false;
    }
    
    lastNotificationTime.current[key] = now;
    return true;
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    // Subscription for user bookings
    const userChannel = supabase
      .channel(`user-bookings-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const eventKey = `${payload.eventType}_${payload.new.id}_${payload.new.status}`;
          if (processedEvents.current.has(eventKey)) return;
          processedEvents.current.add(eventKey);

          const newRecord = payload.new;
          const oldRecord = payload.old;

          if (newRecord.status === 'reservada' && oldRecord?.status === 'aguardando_confirmacao') {
            const notifKey = `accepted_${newRecord.id}`;
            if (shouldShowNotification(notifKey)) {
              showSuccessToast('Reserva aceita!', 'Sua reserva foi aceita. Você será redirecionado para a rota.');
              
              setTimeout(() => {
                navigate('/dashboard/reservas');
              }, 1500);
            }
          }

          if (newRecord.status === 'rejeitada') {
            const notifKey = `rejected_${newRecord.id}`;
            if (shouldShowNotification(notifKey)) {
              showErrorToast('Reserva rejeitada', 'Sua reserva foi rejeitada pelo estabelecimento.');
            }
          }

          if (newRecord.status === 'ocupada' && oldRecord?.status === 'reservada') {
            const notifKey = `occupied_${newRecord.id}`;
            if (shouldShowNotification(notifKey)) {
              showInfoToast('Vaga ocupada', 'O estabelecimento confirmou sua entrada na vaga.');
            }
          }

          if (newRecord.status === 'concluida' && oldRecord?.status === 'ocupada') {
            const notifKey = `completed_${newRecord.id}`;
            if (shouldShowNotification(notifKey)) {
              showSuccessToast('Reserva concluída!', 'Sua reserva foi finalizada com sucesso.');
            }
          }

          if (newRecord.status === 'expirada') {
            const notifKey = `expired_${newRecord.id}`;
            if (shouldShowNotification(notifKey)) {
              showErrorToast('Reserva expirada', 'Sua solicitação expirou pois não foi confirmada a tempo.');
            }
          }

          if (newRecord.arrival_confirmed_by_owner_at && !oldRecord?.arrival_confirmed_by_owner_at) {
            const notifKey = `arrival_owner_${newRecord.id}`;
            if (shouldShowNotification(notifKey)) {
              showInfoToast('Entrada confirmada', 'O estabelecimento confirmou sua chegada.');
            }
          }

          if (newRecord.departure_confirmed_by_owner_at && !oldRecord?.departure_confirmed_by_owner_at) {
            const notifKey = `departure_owner_${newRecord.id}`;
            if (shouldShowNotification(notifKey)) {
              showInfoToast('Saída confirmada', 'O estabelecimento confirmou sua saída.');
            }
          }
        }
      )
      .subscribe();

    // Subscription for parking owner bookings
    const estacionamentoChannel = supabase
      .channel(`estacionamento-bookings-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        async (payload: any) => {
          const eventKey = `${payload.eventType}_${payload.new?.id || payload.old?.id}`;
          if (processedEvents.current.has(eventKey)) return;

          const bookingData: any = payload.new || payload.old;
          if (!bookingData?.estacionamento_id) return;

          const { data: estacionamento } = await supabase
            .from('estacionamento')
            .select('user_id')
            .eq('id', bookingData.estacionamento_id)
            .single();

          if (!estacionamento || estacionamento.user_id !== user.id) return;

          processedEvents.current.add(eventKey);

          if (payload.eventType === 'INSERT') {
            if (payload.new && payload.new.user_id !== user?.id) {
              const notifKey = `new_booking_${payload.new.id}`;
              if (shouldShowNotification(notifKey, 3000)) {
                showInfoToast('Nova reserva recebida!', `Nova solicitação para ${payload.new.date}`);
              }
            }
          }

          if (payload.eventType === 'UPDATE') {
            const newRecord = payload.new;
            const oldRecord = payload.old;

            if (!newRecord || !oldRecord) return;

            if (newRecord.arrival_confirmed_by_user_at && !oldRecord?.arrival_confirmed_by_user_at) {
              const notifKey = `client_arrival_${newRecord.id}`;
              if (shouldShowNotification(notifKey)) {
                showInfoToast('Cliente chegou', 'O cliente confirmou sua chegada.');
              }
            }

            if (newRecord.departure_confirmed_by_user_at && !oldRecord?.departure_confirmed_by_user_at) {
              const notifKey = `client_departure_${newRecord.id}`;
              if (shouldShowNotification(notifKey)) {
                showInfoToast('Cliente saiu', 'O cliente confirmou sua saída.');
              }
            }
          }
        }
      )
      .subscribe();

    // Cleanup: remove channels when component unmounts
    return () => {
      supabase.removeChannel(userChannel);
      supabase.removeChannel(estacionamentoChannel);
      processedEvents.current.clear();
      lastNotificationTime.current = {};
    };
  }, [user?.id, navigate, showSuccessToast, showErrorToast, showInfoToast, shouldShowNotification]);
};
