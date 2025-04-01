
import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Booking } from '@/types/booking';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Calendar, Clock, MapPin } from 'lucide-react';
import BookingDetailsDialog from './BookingDetailsDialog';
import CancelBookingDialog from './CancelBookingDialog';

interface BookingCardProps {
  booking: Booking;
  onCancelBooking: (id: string) => Promise<void>;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, onCancelBooking }) => {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMM", { locale: ptBR });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-500';
      case 'upcoming': return 'bg-blue-500';
      case 'completed': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

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
          <div className="flex-1">
            <h3 className="font-medium truncate">{booking.parkingName}</h3>
            <p className="text-sm text-muted-foreground truncate">{booking.parkingAddress}</p>
          </div>
          <Badge className={`${getStatusColor(booking.status)} text-white`}>
            {getStatusText(booking.status)}
          </Badge>
        </div>
        
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
        
        <div className="flex justify-between items-center">
          <p className="font-medium">{formatCurrency(booking.price)}</p>
          
          <div className="flex gap-2">
            <BookingDetailsDialog 
              booking={booking}
              trigger={
                <Button variant="outline" size="sm">
                  Ver detalhes
                </Button>
              }
            />
            
            {(booking.status === 'upcoming' || booking.status === 'active') && (
              <CancelBookingDialog
                bookingId={booking.id}
                onConfirm={onCancelBooking}
                trigger={
                  <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50">
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
