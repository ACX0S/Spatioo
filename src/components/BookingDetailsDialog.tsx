
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Booking } from '@/types/booking';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Clock, Car, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface BookingDetailsDialogProps {
  booking: Booking;
  trigger: React.ReactNode;
}

const BookingDetailsDialog: React.FC<BookingDetailsDialogProps> = ({ booking, trigger }) => {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Detalhes da Reserva</DialogTitle>
          <DialogDescription>
            Informações da sua reserva
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-spatioo-green mt-0.5" />
            <div>
              <p className="font-medium">{booking.parkingName}</p>
              <p className="text-sm text-muted-foreground">{booking.parkingAddress}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-spatioo-green" />
            <p>{formatDate(booking.date)}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-spatioo-green" />
            <p>{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Car className="h-5 w-5 text-spatioo-green" />
            <p>Vaga {booking.spot_number}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-spatioo-green" />
            <p>{formatCurrency(booking.price)}</p>
          </div>
          
          <div className="pt-2">
            <p className="text-sm text-muted-foreground text-center">
              Status: {booking.status === 'active' ? 'Ativa' : 
                      booking.status === 'upcoming' ? 'Agendada' : 
                      booking.status === 'completed' ? 'Concluída' : 'Cancelada'}
            </p>
          </div>
        </div>
        
        <DialogClose asChild>
          <Button className="w-full">Fechar</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDetailsDialog;
