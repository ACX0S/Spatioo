import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';
import { useUserBookingActions } from '@/hooks/useUserBookingActions';

/**
 * Banner que aparece quando o usuário tem uma reserva aceita
 * Mostra um botão para ver a rota
 */
export const ActiveBookingBanner = () => {
  const { activeBooking } = useUserBookingActions();
  const navigate = useNavigate();

  // Se a reserva foi recém aceita, redirecionar para explore com rota
  useEffect(() => {
    if (activeBooking && activeBooking.accepted_at) {
      const acceptedTime = new Date(activeBooking.accepted_at).getTime();
      const now = new Date().getTime();
      const timeDiff = now - acceptedTime;
      
      // Se foi aceita nos últimos 30 segundos, redirecionar automaticamente
      if (timeDiff < 30000 && activeBooking.status === 'reservada') {
        navigate('/dashboard/reservas');
      }
    }
  }, [activeBooking, navigate]);

  if (!activeBooking || activeBooking.status !== 'reservada') {
    return null;
  }

  const handleViewRoute = () => {
    navigate('/dashboard/reservas');
  };

  return (
    <Card className="border-primary bg-gradient-to-r from-primary/10 to-primary/5">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary p-2">
              <MapPin className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-semibold text-sm">Reserva Confirmada!</p>
              <p className="text-xs text-muted-foreground">
                {activeBooking.parkingName} - Vaga {activeBooking.spot_number}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleViewRoute}
            className="shrink-0"
          >
            <Navigation className="h-4 w-4 mr-2" />
            Ver Rota
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};