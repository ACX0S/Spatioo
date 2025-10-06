
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Booking } from '@/types/booking';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Calendar, Clock, MapPin } from 'lucide-react';
import CancelBookingDialog from './CancelBookingDialog';

/**
 * @interface BookingCardProps
 * @description Propriedades para o componente BookingCard.
 * @param booking - O objeto de reserva contendo todos os detalhes.
 * @param onCancelBooking - Função para lidar com o cancelamento de uma reserva.
 */
interface BookingCardProps {
  booking: Booking;
  onCancelBooking: (id: string) => Promise<void>;
}

/**
 * @component BookingCard
 * @description Exibe um card com os detalhes de uma reserva, incluindo status, data, hora e preço.
 * Permite o cancelamento de reservas futuras ou ativas.
 */
const BookingCard: React.FC<BookingCardProps> = ({ booking, onCancelBooking }) => {
  
  /**
   * @function formatDate
   * @description Formata uma string de data para o formato 'dd de MMM'.
   * @param dateString - A data em formato de string.
   * @returns A data formatada.
   */
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMM", { locale: ptBR });
  };

  /**
   * @function formatTime
   * @description Formata uma string de tempo para o formato 'HH:mm'.
   * @param timeString - A hora em formato de string.
   * @returns A hora formatada.
   */
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  /**
   * @function getStatusColor
   * @description Retorna a cor de fundo com base no status da reserva.
   * @param status - O status da reserva ('active', 'upcoming', 'completed', 'cancelled').
   * @returns Uma string de classe CSS para a cor de fundo.
   */
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-spatioo-primary';
      case 'upcoming': return 'bg-spatioo-primary dark:bg-spatioo-green/90';
      case 'completed': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  /**
   * @function getStatusText
   * @description Retorna o texto traduzido para o status da reserva.
   * @param status - O status da reserva.
   * @returns O texto do status em português.
   */
  const getStatusText = (status: string) => {
    switch(status) {
      case 'active': return 'Ativa';
      case 'upcoming': return 'Agendada';
      case 'completed': return 'Concluída';
      case 'cancelled': return 'Cancelada';
      default: return 'Desconhecido';
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          {/* Seção de informações do estacionamento e status da reserva */}
          <div className="flex-1">
            <h3 className="font-medium truncate">{booking.parkingName}</h3>
            <p className="text-sm text-muted-foreground truncate">{booking.parkingAddress}</p>
          </div>
          <Badge className={`${getStatusColor(booking.status)} text-white pointer-events-none select-none rounded-sm`}>
            {getStatusText(booking.status)}
          </Badge>
        </div>
        
        {/* Seção de detalhes da reserva (data, hora, vaga) */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatDate(booking.date)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>Vaga {booking.spot_number}</span>
          </div>
        </div>
        
        {/* Seção de preço e ações (cancelar) */}
        <div className="flex justify-between items-center">
          <p className="font-medium">{formatCurrency(booking.price)}</p>
          
          <div className="flex gap-2">
            {/* O botão de cancelar só é exibido para reservas futuras ou ativas */}
            {(booking.status === 'upcoming' || booking.status === 'active') && (
              <CancelBookingDialog
                bookingId={booking.id}
                onConfirm={onCancelBooking}
                trigger={
                  <Button variant="outline" size="sm" className="border-red-600 dark:border-red-600 text-red-600 hover:bg-red-600 hover:text-black dark:hover:text-black">
                    Cancelar
                  </Button>
                }
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingCard;
