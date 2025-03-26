
import { useState, useEffect } from 'react';
import { Booking } from '@/types/booking';
import { fetchUserBookings, cancelBooking } from '@/services/bookingService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadBookings = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchUserBookings();
      setBookings(data);
    } catch (err: any) {
      console.error('Erro ao carregar reservas:', err);
      setError(err.message || 'Erro ao carregar suas reservas');
      toast({
        title: "Erro",
        description: err.message || "Não foi possível carregar suas reservas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await cancelBooking(bookingId);
      // Atualiza a lista de reservas
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'cancelled' as const } 
            : booking
        )
      );
      toast({
        title: "Sucesso!",
        description: "Sua reserva foi cancelada com sucesso.",
      });
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Não foi possível cancelar sua reserva.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadBookings();
  }, [user]);

  return { 
    bookings, 
    loading, 
    error, 
    refreshBookings: loadBookings,
    cancelBooking: handleCancelBooking,
    activeBookings: bookings.filter(b => ['active', 'upcoming'].includes(b.status)),
    historyBookings: bookings.filter(b => ['completed', 'cancelled'].includes(b.status))
  };
};
