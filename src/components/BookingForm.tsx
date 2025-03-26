
import React, { useState } from 'react';
import { ParkingSpot } from '@/types/parking';
import { useNavigate } from 'react-router-dom';
import { format, add, set } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, Clock, CreditCard } from 'lucide-react';
import { createBooking } from '@/services/bookingService';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface BookingFormProps {
  parkingSpot: ParkingSpot;
}

const SPOTS = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3'];
const TIME_OPTIONS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

const BookingForm: React.FC<BookingFormProps> = ({ parkingSpot }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState<string>(TIME_OPTIONS[0]);
  const [duration, setDuration] = useState<number>(1);
  const [selectedSpot, setSelectedSpot] = useState<string>(SPOTS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalPrice = parkingSpot.price_per_hour * duration;
  
  const endTime = (): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endDate = add(
      set(new Date(), { hours, minutes }), 
      { hours: duration }
    );
    return format(endDate, 'HH:mm');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para fazer uma reserva.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      await createBooking({
        parking_spot_id: parkingSpot.id,
        date: format(date, 'yyyy-MM-dd'),
        start_time: startTime,
        end_time: endTime(),
        spot_number: selectedSpot,
        price: totalPrice,
        status: 'upcoming'
      });
      
      toast({
        title: "Reserva confirmada!",
        description: "Sua reserva foi realizada com sucesso."
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível completar sua reserva.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Realizar reserva</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Date Picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Data</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'dd/MM/yyyy') : 'Selecione uma data'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Horário de início</label>
            <div className="grid grid-cols-4 gap-2">
              {TIME_OPTIONS.map((time) => (
                <Button
                  key={time}
                  type="button"
                  variant={startTime === time ? "default" : "outline"}
                  className={cn(
                    "h-9",
                    startTime === time && "bg-spatioo-green text-black hover:bg-spatioo-green hover:text-black"
                  )}
                  onClick={() => setStartTime(time)}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>

          {/* Duration Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Duração</label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((hours) => (
                <Button
                  key={hours}
                  type="button"
                  variant={duration === hours ? "default" : "outline"}
                  className={cn(
                    "h-9",
                    duration === hours && "bg-spatioo-green text-black hover:bg-spatioo-green hover:text-black"
                  )}
                  onClick={() => setDuration(hours)}
                >
                  {hours}h
                </Button>
              ))}
            </div>
          </div>

          {/* Spot Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Vaga</label>
            <div className="grid grid-cols-3 gap-2">
              {SPOTS.map((spot) => (
                <Button
                  key={spot}
                  type="button"
                  variant={selectedSpot === spot ? "default" : "outline"}
                  className={cn(
                    "h-9",
                    selectedSpot === spot && "bg-spatioo-green text-black hover:bg-spatioo-green hover:text-black"
                  )}
                  onClick={() => setSelectedSpot(spot)}
                >
                  {spot}
                </Button>
              ))}
            </div>
          </div>

          {/* Resumo */}
          <div className="bg-muted/30 p-3 rounded-md">
            <h3 className="font-medium mb-2">Resumo da reserva</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data:</span>
                <span>{format(date, 'dd/MM/yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Horário:</span>
                <span>{startTime} - {endTime()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vaga:</span>
                <span>{selectedSpot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor por hora:</span>
                <span>R$ {parkingSpot.price_per_hour.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Valor total:</span>
                <span className="text-lg text-spatioo-green">R$ {totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-spatioo-green hover:bg-spatioo-green-dark text-black"
            disabled={isSubmitting}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Processando...' : 'Confirmar reserva'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default BookingForm;
