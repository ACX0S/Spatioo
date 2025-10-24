import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Booking } from '@/types/booking';
import { Calendar, Clock, User, MapPin, Car } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BookingRequestCardProps {
  booking: Booking;
  onAccept: (bookingId: string) => void;
  onReject: (bookingId: string) => void;
  loading?: boolean;
}

export const BookingRequestCard = ({ booking, onAccept, onReject, loading }: BookingRequestCardProps) => {
  const isExpired = booking.expires_at && new Date(booking.expires_at) < new Date();
  
  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Solicitação de Reserva
          </CardTitle>
          {isExpired && (
            <Badge variant="destructive">Expirada</Badge>
          )}
          {!isExpired && booking.status === 'aguardando_confirmacao' && (
            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-300">
              Aguardando
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Data:</span>
          <span>{format(new Date(booking.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Horário:</span>
          <span>{booking.start_time} - {booking.end_time}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Vaga:</span>
          <span>{booking.spot_number}</span>
        </div>
        
        {booking.user && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Solicitante:</span>
            <span>{booking.user.apelido || booking.user.name}</span>
          </div>
        )}

        {booking.veiculo && (
          <div className="flex items-center gap-2 text-sm">
            <Car className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Veículo:</span>
            <span>{booking.veiculo.modelo} - {booking.veiculo.placa} ({booking.veiculo.cor})</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">Valor:</span>
          <span className="text-lg font-bold text-primary">
            R$ {booking.price.toFixed(2)}
          </span>
        </div>

        {booking.expires_at && !isExpired && (
          <div className="text-xs text-muted-foreground mt-2">
            Expira em: {format(new Date(booking.expires_at), "HH:mm 'de' dd/MM", { locale: ptBR })}
          </div>
        )}
      </CardContent>
      
      {!isExpired && booking.status === 'aguardando_confirmacao' && (
        <CardFooter className="gap-2 flex-col sm:flex-row">
          <Button
            onClick={() => onReject(booking.id)}
            variant="outline"
            className="w-full sm:w-auto"
            disabled={loading}
          >
            Recusar
          </Button>
          <Button
            onClick={() => onAccept(booking.id)}
            className="w-full sm:w-auto"
            disabled={loading}
          >
            Aceitar Reserva
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};