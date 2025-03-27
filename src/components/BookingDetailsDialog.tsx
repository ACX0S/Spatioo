
import React from 'react';
import { Booking } from '@/types/booking';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Calendar, Clock, MapPin, Car, Tag } from 'lucide-react';

interface BookingDetailsDialogProps {
  booking: Booking;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BookingDetailsDialog = ({ booking, open, onOpenChange }: BookingDetailsDialogProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Detalhes da Reserva</DialogTitle>
          <DialogDescription>
            Informações sobre sua reserva
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">{booking.parkingName}</p>
              <p className="text-sm text-muted-foreground">{booking.parkingAddress}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Data</p>
              <p>{formatDate(booking.date)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Horário</p>
              <p>{booking.start_time} - {booking.end_time}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Car className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Vaga</p>
              <p>{booking.spot_number}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Tag className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Valor</p>
              <p className="font-semibold text-spatioo-green">
                {formatCurrency(booking.price)}
              </p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDetailsDialog;
