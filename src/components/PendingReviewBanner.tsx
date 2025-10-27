import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { useReviews } from '@/hooks/useReviews';
import { ReviewNotificationModal } from './ReviewNotificationModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const PendingReviewBanner = () => {
  const { pendingReviews, loading, refetch } = useReviews();
  const { user } = useAuth();
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [reviewTarget, setReviewTarget] = useState<{
    tipo: 'motorista' | 'estacionamento';
    id: string;
    name: string;
  } | null>(null);

  if (loading || pendingReviews.length === 0) {
    return null;
  }

  const handleOpenReview = async () => {
    const firstPendingBookingId = pendingReviews[0];
    
    try {
      // Buscar detalhes da reserva
      const { data: booking, error } = await supabase
        .from('bookings')
        .select(`
          *,
          estacionamento!bookings_estacionamento_id_fkey (id, nome, user_id)
        `)
        .eq('id', firstPendingBookingId)
        .single();

      if (error) throw error;

      setSelectedBooking(booking);

      // Determinar quem está avaliando quem
      if (user?.id === booking.user_id) {
        // Motorista avaliando estacionamento
        setReviewTarget({
          tipo: 'estacionamento',
          id: booking.estacionamento.id,
          name: booking.estacionamento.nome
        });
      } else {
        // Estacionamento avaliando motorista
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, apelido')
          .eq('id', booking.user_id)
          .single();

        setReviewTarget({
          tipo: 'motorista',
          id: booking.user_id,
          name: profile?.apelido || profile?.name || 'Motorista'
        });
      }

      setReviewModalOpen(true);
    } catch (error) {
      console.error('Erro ao carregar reserva:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados da reserva.',
        variant: 'destructive'
      });
    }
  };

  const handleReviewClose = () => {
    setReviewModalOpen(false);
    setSelectedBooking(null);
    setReviewTarget(null);
    // Recarrega lista de avaliações pendentes
    refetch();
  };

  return (
    <>
      <div className="bg-gradient-to-r from-spatioo-green to-primary p-4 rounded-lg shadow-lg mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Star className="h-6 w-6 text-white" />
          <p className="text-white font-medium">
            Você ainda não avaliou sua última reserva.
          </p>
        </div>
        <Button
          onClick={handleOpenReview}
          variant="secondary"
          className="bg-white text-spatioo-green hover:bg-white/90"
        >
          Avaliar agora
        </Button>
      </div>

      {selectedBooking && reviewTarget && (
        <ReviewNotificationModal
          isOpen={reviewModalOpen}
          onClose={handleReviewClose}
          bookingId={selectedBooking.id}
          avaliadoTipo={reviewTarget.tipo}
          avaliadoId={reviewTarget.id}
          targetName={reviewTarget.name}
        />
      )}
    </>
  );
};
