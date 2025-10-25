import { useState, useEffect } from 'react';
import { getPendingReviewBookings } from '@/services/reviewService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useReviews = () => {
  const [pendingReviews, setPendingReviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadPendingReviews = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const pending = await getPendingReviewBookings();
      setPendingReviews(pending);
    } catch (error) {
      console.error('Erro ao carregar avaliações pendentes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingReviews();
  }, [user]);

  // Atualizar quando uma nova reserva for concluída
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('booking-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.new.status === 'concluida') {
            loadPendingReviews();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    pendingReviews,
    loading,
    hasPendingReviews: pendingReviews.length > 0,
    refetch: loadPendingReviews
  };
};
