
import { useState, useEffect } from 'react';
import { Booking } from '@/types/booking';
import { fetchUserBookings, cancelBooking } from '@/services/bookingService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();

  const loadBookings = async () => {
    // Don't attempt to load bookings if auth is still loading
    if (authLoading) {
      return;
    }
    
    // If no user, set loading to false and return early
    if (!user) {
      setLoading(false);
      setBookings([]);
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
      
      // Set empty bookings array to avoid undefined errors
      setBookings([]);
      
      toast({
        title: "Erro",
        description: err.message || "Não foi possível carregar suas reservas.",
        variant: "destructive"
      });
    } finally {
      // Always set loading to false regardless of success or failure
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
            ? { ...booking, status: 'cancelada' as const } 
            : booking
        )
      );
      toast({
        title: "Reserva cancelada",
        description: "Sua reserva foi cancelada com sucesso.",
      });
    } catch (err: any) {
      console.error('Error canceling booking:', err);
      toast({
        title: "Erro",
        description: err.message || "Não foi possível cancelar sua reserva.",
        variant: "destructive"
      });
    }
  };

  // Add a timeout to ensure loading state doesn't get stuck
  useEffect(() => {
    // Only load bookings if auth is not loading
    if (!authLoading) {
      loadBookings();
    }
    
    // Add a safety timeout to ensure loading state doesn't get stuck
    const safetyTimeout = setTimeout(() => {
      if (loading) setLoading(false);
    }, 5000);
    
    return () => clearTimeout(safetyTimeout);
  }, [user, authLoading]);

  return { 
    bookings, 
    loading, 
    error, 
    refreshBookings: loadBookings,
    cancelBooking: handleCancelBooking,
    activeBookings: bookings.filter(b => ['aguardando_confirmacao', 'reservada', 'ocupada'].includes(b.status)),
    historyBookings: bookings.filter(b => ['concluida', 'cancelada', 'rejeitada', 'expirada'].includes(b.status))
  };
};
