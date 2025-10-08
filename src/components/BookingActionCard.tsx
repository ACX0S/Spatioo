import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Booking } from '@/types/booking';
import { Calendar, Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BookingActionCardProps {
  booking: Booking;
  onOwnerArrival?: (bookingId: string) => void;
  onUserArrival?: (bookingId: string) => void;
  onOwnerDeparture?: (bookingId: string) => void;
  onUserDeparture?: (bookingId: string) => void;
  isOwner: boolean;
  loading?: boolean;
}

export const BookingActionCard = ({ 
  booking, 
  onOwnerArrival,
  onUserArrival,
  onOwnerDeparture,
  onUserDeparture,
  isOwner,
  loading 
}: BookingActionCardProps) => {
  const statusBadge = {
    reservada: { label: 'Reservada', variant: 'secondary' as const, color: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300' },
    ocupada: { label: 'Ocupada', variant: 'destructive' as const },
    concluida: { label: 'Concluída', variant: 'default' as const },
  }[booking.status] || { label: booking.status, variant: 'outline' as const };

  const needsArrivalConfirmation = 
    booking.status === 'reservada' &&
    (!booking.arrival_confirmed_by_owner_at || !booking.arrival_confirmed_by_user_at);
  
  const needsDepartureConfirmation = 
    booking.status === 'ocupada' &&
    (!booking.departure_confirmed_by_owner_at || !booking.departure_confirmed_by_user_at);

  const canOwnerConfirmArrival = isOwner && !booking.arrival_confirmed_by_owner_at;
  const canUserConfirmArrival = !isOwner && booking.arrival_confirmed_by_owner_at && !booking.arrival_confirmed_by_user_at;
  
  const canOwnerConfirmDeparture = isOwner && !booking.departure_confirmed_by_owner_at;
  const canUserConfirmDeparture = !isOwner && booking.departure_confirmed_by_owner_at && !booking.departure_confirmed_by_user_at;

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{booking.parkingName}</CardTitle>
          <Badge variant={statusBadge.variant} className={statusBadge.color}>
            {statusBadge.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{format(new Date(booking.date), "dd 'de' MMMM", { locale: ptBR })}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{booking.start_time} - {booking.end_time}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>{booking.spot_number}</span>
        </div>

        {/* Status de confirmações */}
        {needsArrivalConfirmation && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg space-y-2">
            <p className="text-sm font-medium">Confirmação de Chegada:</p>
            <div className="flex items-center gap-2 text-sm">
              {booking.arrival_confirmed_by_owner_at ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-muted-foreground" />
              )}
              <span>Estabelecimento</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {booking.arrival_confirmed_by_user_at ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-muted-foreground" />
              )}
              <span>Motorista</span>
            </div>
          </div>
        )}

        {needsDepartureConfirmation && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg space-y-2">
            <p className="text-sm font-medium">Confirmação de Saída:</p>
            <div className="flex items-center gap-2 text-sm">
              {booking.departure_confirmed_by_owner_at ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-muted-foreground" />
              )}
              <span>Estabelecimento</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {booking.departure_confirmed_by_user_at ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-muted-foreground" />
              )}
              <span>Motorista</span>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex-col gap-2">
        {canOwnerConfirmArrival && onOwnerArrival && (
          <Button
            onClick={() => onOwnerArrival(booking.id)}
            className="w-full"
            disabled={loading}
          >
            Confirmar Chegada do Cliente
          </Button>
        )}
        
        {canUserConfirmArrival && onUserArrival && (
          <Button
            onClick={() => onUserArrival(booking.id)}
            className="w-full"
            disabled={loading}
          >
            Confirmar Minha Chegada
          </Button>
        )}
        
        {canOwnerConfirmDeparture && onOwnerDeparture && (
          <Button
            onClick={() => onOwnerDeparture(booking.id)}
            className="w-full"
            disabled={loading}
          >
            Confirmar Saída do Cliente
          </Button>
        )}
        
        {canUserConfirmDeparture && onUserDeparture && (
          <Button
            onClick={() => onUserDeparture(booking.id)}
            className="w-full"
            disabled={loading}
          >
            Confirmar Minha Saída
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};