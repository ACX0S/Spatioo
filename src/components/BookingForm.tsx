
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Clock, Info } from 'lucide-react';
import { createImmediateBooking } from '@/services/bookingService';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { PublicParkingData } from '@/services/parkingService';
import { supabase } from '@/integrations/supabase/client';

interface BookingFormProps {
  parkingSpot: PublicParkingData;
}

const BookingForm: React.FC<BookingFormProps> = ({ parkingSpot }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [precoFixo1h, setPrecoFixo1h] = useState<number | null>(null);

  useEffect(() => {
    const fetchFixedPrice = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('estacionamento_precos')
          .select('preco')
          .eq('estacionamento_id', parkingSpot.id)
          .eq('horas', 1)
          .maybeSingle();

        if (error) throw error;
        
        setPrecoFixo1h(data?.preco || parkingSpot.preco);
      } catch (error) {
        console.error('Error fetching fixed price:', error);
        setPrecoFixo1h(parkingSpot.preco);
      } finally {
        setLoading(false);
      }
    };

    fetchFixedPrice();
  }, [parkingSpot.id, parkingSpot.preco]);

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

    if (!precoFixo1h) {
      toast({
        title: "Erro",
        description: "Preço não disponível.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      await createImmediateBooking({
        estacionamento_id: parkingSpot.id,
        duration_hours: 1,
        price: precoFixo1h
      });
      
      toast({
        title: "Reserva confirmada!",
        description: "Sua vaga foi reservada e já está ativa. O valor final será calculado na saída.",
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

  if (!precoFixo1h) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Realizar reserva</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Preço não disponível para este estacionamento.
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
          Sua vaga será reservada imediatamente. O valor final será calculado na saída.
        </p>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Info sobre cobrança */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-medium text-blue-900 dark:text-blue-100">Como funciona o pagamento</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Você paga um valor fixo de <strong>R$ {Number(precoFixo1h).toFixed(2)}</strong> para reservar a vaga. 
                  O valor final será calculado automaticamente com base no tempo real de permanência ao sair do estacionamento.
                </p>
              </div>
            </div>
          </div>

          {/* Resumo */}
          <div className="bg-gradient-to-r from-spatioo-green/10 to-spatioo-green/5 border border-spatioo-green/20 p-4 rounded-lg">
            <h3 className="font-medium mb-3 text-spatioo-green">Resumo da Reserva</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Valor da reserva:</span>
                <span className="text-xl font-bold text-spatioo-green">
                  R$ {Number(precoFixo1h).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-spatioo-green/20">
                <span className="text-xs text-muted-foreground">Status:</span>
                <span className="text-xs font-medium text-green-600">
                  Ativação imediata
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Cobrança final:</span>
                <span className="text-xs font-medium text-blue-600">
                  Calculada na saída
                </span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-spatioo-green hover:bg-spatioo-green-dark text-black"
            disabled={isSubmitting || !precoFixo1h}
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
