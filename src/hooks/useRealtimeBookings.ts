import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

/**
 * Hook para escutar mudanças em bookings em tempo real
 * Mostra toasts e redireciona quando necessário
 */
export const useRealtimeBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    // Canal para escutar mudanças em bookings do usuário
    const userBookingsChannel = supabase
      .channel('user-bookings-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `user_id=eq.${user.id}`
        },
        (payload: any) => {
          const newBooking: any = payload.new;
          const oldBooking: any = payload.old;

          // Detectar mudanças de status e mostrar toasts apropriados
          if (newBooking.status !== oldBooking.status) {
            switch (newBooking.status) {
              case 'reservada':
                toast.success('Reserva aceita!', {
                  description: 'Sua reserva foi aceita pelo estabelecimento.',
                  duration: 5000,
                });
                // Redirecionar para explore com a rota
                setTimeout(() => {
                  navigate(`/explore?bookingId=${newBooking.id}`);
                }, 1000);
                break;

              case 'rejeitada':
                toast.error('Reserva rejeitada', {
                  description: 'Sua reserva foi rejeitada pelo estabelecimento.',
                  duration: 5000,
                });
                break;

              case 'ocupada':
                toast.info('Chegada confirmada', {
                  description: 'O estabelecimento confirmou sua chegada.',
                  duration: 5000,
                });
                break;

              case 'completada':
                toast.success('Reserva concluída', {
                  description: 'Sua reserva foi concluída. Obrigado por usar nosso serviço!',
                  duration: 5000,
                });
                break;

              case 'expirada':
                toast.warning('Reserva expirada', {
                  description: 'Sua reserva expirou por falta de confirmação.',
                  duration: 5000,
                });
                break;
            }
          }

          // Detectar confirmações de chegada/saída
          if (newBooking.arrival_confirmed_by_owner_at && !oldBooking.arrival_confirmed_by_owner_at) {
            toast.info('Chegada confirmada pelo estabelecimento', {
              description: 'O estabelecimento confirmou sua chegada. Confirme quando estiver na vaga.',
              duration: 6000,
            });
          }

          if (newBooking.departure_confirmed_by_owner_at && !oldBooking.departure_confirmed_by_owner_at) {
            toast.info('Saída confirmada pelo estabelecimento', {
              description: 'O estabelecimento confirmou sua saída. Confirme quando sair da vaga.',
              duration: 6000,
            });
          }
        }
      )
      .subscribe();

    // Canal para escutar mudanças em bookings de estacionamentos do usuário (dono)
    const ownerBookingsChannel = supabase
      .channel('owner-bookings-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        async (payload: any) => {
          // Verificar se o booking é de um estacionamento do usuário
          const bookingEstacionamentoId = payload.new?.estacionamento_id || payload.old?.estacionamento_id;
          
          if (!bookingEstacionamentoId) return;

          const { data: estacionamento } = await supabase
            .from('estacionamento')
            .select('user_id')
            .eq('id', bookingEstacionamentoId)
            .single();

          if (estacionamento?.user_id !== user.id) return;

          // Mostrar toasts para ações do cliente
          if (payload.eventType === 'INSERT') {
            toast.info('Nova solicitação de reserva', {
              description: 'Você recebeu uma nova solicitação de reserva.',
              duration: 5000,
            });
          }

          if (payload.eventType === 'UPDATE') {
            const newBooking: any = payload.new;
            const oldBooking: any = payload.old;

            // Cliente confirmou chegada
            if (newBooking.arrival_confirmed_by_user_at && !oldBooking.arrival_confirmed_by_user_at) {
              toast.info('Cliente confirmou chegada', {
                description: 'O cliente confirmou que chegou na vaga.',
                duration: 5000,
              });
            }

            // Cliente confirmou saída
            if (newBooking.departure_confirmed_by_user_at && !oldBooking.departure_confirmed_by_user_at) {
              toast.info('Cliente confirmou saída', {
                description: 'O cliente confirmou que saiu da vaga.',
                duration: 5000,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(userBookingsChannel);
      supabase.removeChannel(ownerBookingsChannel);
    };
  }, [user, navigate]);
};
