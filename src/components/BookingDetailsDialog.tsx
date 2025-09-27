
import React, { useState } from 'react';
import { Booking } from '@/types/booking';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Calendar, Clock, MapPin, Car, Tag } from 'lucide-react';

/**
 * @interface BookingDetailsDialogProps
 * @description Propriedades para o componente BookingDetailsDialog.
 * @param booking - O objeto de reserva a ser exibido.
 * @param open - Estado opcional para controlar a abertura do diálogo externamente.
 * @param onOpenChange - Função opcional para notificar sobre a mudança no estado de abertura.
 * @param trigger - Elemento React opcional que acionará a abertura do diálogo.
 */
interface BookingDetailsDialogProps {
  booking: Booking;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

/**
 * @component BookingDetailsDialog
 * @description Um diálogo que exibe informações detalhadas sobre uma reserva específica.
 */
const BookingDetailsDialog = ({ booking, open, onOpenChange, trigger }: BookingDetailsDialogProps) => {
  // Estado interno para controlar a visibilidade do diálogo, caso não seja controlado externamente.
  const [dialogOpen, setDialogOpen] = useState(open || false);

  /**
   * @function handleOpenChange
   * @description Lida com a mudança do estado de abertura do diálogo, atualizando o estado interno e notificando o componente pai.
   * @param value - O novo estado de abertura (true ou false).
   */
  const handleOpenChange = (value: boolean) => {
    setDialogOpen(value);
    onOpenChange?.(value);
  };

  /**
   * @function formatDate
   * @description Formata uma string de data para o formato de data local (dd/mm/aaaa).
   * @param dateString - A data em formato de string.
   * @returns A data formatada.
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  return (
    <Dialog open={open !== undefined ? open : dialogOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Detalhes da Reserva</DialogTitle>
          <DialogDescription>
            Informações sobre sua reserva
          </DialogDescription>
        </DialogHeader>
        
        {/* Corpo do diálogo com os detalhes da reserva */}
        <div className="space-y-4 py-4">
          {/* Informações do estacionamento */}
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">{booking.parkingName}</p>
              <p className="text-sm text-muted-foreground">{booking.parkingAddress}</p>
            </div>
          </div>
          
          {/* Data da reserva */}
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Data</p>
              <p>{formatDate(booking.date)}</p>
            </div>
          </div>
          
          {/* Horário da reserva */}
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Horário</p>
              <p>{booking.start_time} - {booking.end_time}</p>
            </div>
          </div>
          
          {/* Número da vaga */}
          <div className="flex items-center gap-3">
            <Car className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Vaga</p>
              <p>{booking.spot_number}</p>
            </div>
          </div>
          
          {/* Valor da reserva */}
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
            onClick={() => handleOpenChange(false)}
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
