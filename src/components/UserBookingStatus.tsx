import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUserBookingActions } from '@/hooks/useUserBookingActions';
import { MapPin, Clock, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const UserBookingStatus = () => {
  const { activeBooking, loading, handleUserArrival, handleUserDeparture } = useUserBookingActions();

  if (!activeBooking) return null;

  const needsUserArrivalConfirmation = 
    activeBooking.arrival_confirmed_by_owner_at && 
    !activeBooking.arrival_confirmed_by_user_at;

  const needsUserDepartureConfirmation = 
    activeBooking.departure_confirmed_by_owner_at && 
    !activeBooking.departure_confirmed_by_user_at;

  const statusBadge = {
    reservada: { label: 'Reservada', color: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300' },
    ocupada: { label: 'Ocupada', color: 'bg-red-500/20 text-red-700 dark:text-red-300' },
  }[activeBooking.status] || { label: activeBooking.status, color: '' };

  return (
    <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Reserva Ativa</CardTitle>
          <Badge className={statusBadge.color}>
            {statusBadge.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg">{activeBooking.parkingName}</h3>
          <p className="text-sm text-muted-foreground">{activeBooking.parkingAddress}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(new Date(activeBooking.date), "dd/MM/yyyy", { locale: ptBR })}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{activeBooking.start_time} - {activeBooking.end_time}</span>
          </div>
          
          <div className="flex items-center gap-2 col-span-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>Vaga: {activeBooking.spot_number}</span>
          </div>
        </div>

        {/* Status de confirmações */}
        {activeBooking.status === 'reservada' && (
          <div className="p-3 bg-muted/50 rounded-lg space-y-2">
            <p className="text-sm font-medium">Status de Chegada:</p>
            <div className="flex items-center gap-2 text-sm">
              {activeBooking.arrival_confirmed_by_owner_at ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-muted-foreground" />
              )}
              <span>Estabelecimento confirmou</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {activeBooking.arrival_confirmed_by_user_at ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-muted-foreground" />
              )}
              <span>Você confirmou</span>
            </div>
          </div>
        )}

        {activeBooking.status === 'ocupada' && (
          <div className="p-3 bg-muted/50 rounded-lg space-y-2">
            <p className="text-sm font-medium">Status de Saída:</p>
            <div className="flex items-center gap-2 text-sm">
              {activeBooking.departure_confirmed_by_owner_at ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-muted-foreground" />
              )}
              <span>Estabelecimento confirmou</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {activeBooking.departure_confirmed_by_user_at ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-muted-foreground" />
              )}
              <span>Você confirmou</span>
            </div>
          </div>
        )}

        {/* Alertas e botões de ação */}
        {needsUserArrivalConfirmation && (
          <>
            <Alert>
              <AlertDescription>
                O estabelecimento confirmou que você chegou. Por favor, confirme sua chegada.
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => handleUserArrival(activeBooking.id)}
              className="w-full"
              disabled={loading}
            >
              Confirmar Minha Chegada
            </Button>
          </>
        )}

        {needsUserDepartureConfirmation && (
          <>
            <Alert>
              <AlertDescription>
                O estabelecimento confirmou sua saída. Por favor, confirme.
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => handleUserDeparture(activeBooking.id)}
              className="w-full"
              disabled={loading}
            >
              Confirmar Minha Saída
            </Button>
          </>
        )}

        {activeBooking.status === 'reservada' && 
         !needsUserArrivalConfirmation && 
         !activeBooking.arrival_confirmed_by_user_at && (
          <Alert>
            <AlertDescription>
              Aguardando confirmação de chegada pelo estabelecimento.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};