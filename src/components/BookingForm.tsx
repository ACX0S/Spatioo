
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Clock } from 'lucide-react';
import { createImmediateBooking } from '@/services/bookingService';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { PublicParkingData } from '@/services/parkingService';
import { supabase } from '@/integrations/supabase/client';

interface BookingFormProps {
  parkingSpot: PublicParkingData;
}

interface PricingOption {
  id: string;
  horas: number;
  preco: number;
}

const BookingForm: React.FC<BookingFormProps> = ({ parkingSpot }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedDuration, setSelectedDuration] = useState<string>('');
  const [pricingOptions, setPricingOptions] = useState<PricingOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPricingOptions = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('estacionamento_precos')
          .select('id, horas, preco')
          .eq('estacionamento_id', parkingSpot.id)
          .order('horas', { ascending: true });

        if (error) throw error;
        
        setPricingOptions(data || []);
        if (data && data.length > 0) {
          setSelectedDuration(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching pricing options:', error);
        setPricingOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPricingOptions();
  }, [parkingSpot.id]);

  const selectedOption = pricingOptions.find(option => option.id === selectedDuration);
  const selectedPrice = selectedOption?.preco || 0;
  const selectedHours = selectedOption?.horas || 1;

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

    if (!selectedOption) {
      toast({
        title: "Erro",
        description: "Selecione uma opção de tempo.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      await createImmediateBooking({
        estacionamento_id: parkingSpot.id,
        duration_hours: selectedHours,
        price: selectedPrice
      });
      
      toast({
        title: "Reserva confirmada!",
        description: `Sua vaga foi reservada por ${selectedHours} hora${selectedHours > 1 ? 's' : ''} e já está ativa.`,
        duration: 4000
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Realizar reserva</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pricingOptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Realizar reserva</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Opções de preço não disponíveis para este estacionamento.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-spatioo-green" />
          Reserva Imediata
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Sua vaga será reservada imediatamente e ficará ativa por tempo selecionado
        </p>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Duration Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tempo de permanência</label>
            <Select value={selectedDuration} onValueChange={setSelectedDuration}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o tempo de permanência" />
              </SelectTrigger>
              <SelectContent>
                {pricingOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.horas} hora{option.horas > 1 ? 's' : ''} - R$ {Number(option.preco).toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Resumo */}
          <div className="bg-gradient-to-r from-spatioo-green/10 to-spatioo-green/5 border border-spatioo-green/20 p-4 rounded-lg">
            <h3 className="font-medium mb-3 text-spatioo-green">Resumo da Reserva</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Duração:</span>
                <span className="font-medium">
                  {selectedHours} hora{selectedHours > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Valor total:</span>
                <span className="text-xl font-bold text-spatioo-green">
                  R$ {Number(selectedPrice).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-spatioo-green/20">
                <span className="text-xs text-muted-foreground">Status:</span>
                <span className="text-xs font-medium text-green-600">
                  ⚡ Ativação imediata
                </span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-spatioo-green hover:bg-spatioo-green-dark text-black"
            disabled={isSubmitting || !selectedOption}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Processando...' : 'Confirmar Reserva Imediata'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default BookingForm;
