
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

/**
 * @interface BookingFormProps
 * @description Propriedades para o componente BookingForm.
 * @param parkingSpot - Os dados do estacionamento para o qual a reserva será feita.
 */
interface BookingFormProps {
  parkingSpot: PublicParkingData;
}

/**
 * @component BookingForm
 * @description Formulário para criar uma reserva imediata de 1 hora em um estacionamento.
 */
const BookingForm: React.FC<BookingFormProps> = ({ parkingSpot }) => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Hook para acessar informações do usuário autenticado.
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para controlar o status de submissão.
  const [loading, setLoading] = useState(true); // Estado para controlar o carregamento do preço.
  const [precoFixo1h, setPrecoFixo1h] = useState<number | null>(null); // Estado para armazenar o preço fixo de 1 hora.

  // Efeito para buscar o preço fixo de 1 hora para o estacionamento.
  useEffect(() => {
    const fetchFixedPrice = async () => {
      try {
        setLoading(true);
        // Busca o preço para 1 hora na tabela de preços do estacionamento.
        const { data, error } = await supabase
          .from('estacionamento_precos')
          .select('preco')
          .eq('estacionamento_id', parkingSpot.id)
          .eq('horas', 1)
          .maybeSingle();

        if (error) throw error;
        
        // Define o preço encontrado ou usa o preço padrão do estacionamento.
        setPrecoFixo1h(data?.preco || parkingSpot.preco);
      } catch (error) {
        console.error('Erro ao buscar preço fixo:', error);
        setPrecoFixo1h(parkingSpot.preco); // Fallback para o preço padrão em caso de erro.
      } finally {
        setLoading(false);
      }
    };

    fetchFixedPrice();
  }, [parkingSpot.id, parkingSpot.preco]);

  /**
   * @function handleSubmit
   * @description Lida com a submissão do formulário de reserva.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verifica se o usuário está logado.
    if (!user) {
      toast({ title: "Erro", description: "Você precisa estar logado para fazer uma reserva.", variant: "destructive" });
      navigate('/login');
      return;
    }

    // Verifica se o preço foi carregado.
    if (!precoFixo1h) {
      toast({ title: "Erro", description: "Preço não disponível.", variant: "destructive" });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Chama a função para criar uma reserva imediata.
      await createImmediateBooking({
        estacionamento_id: parkingSpot.id,
        duration_hours: 1, // Duração fixa de 1 hora para reserva imediata.
        price: precoFixo1h
      });
      
      toast({ title: "Reserva confirmada!", description: "Sua vaga foi reservada e já está ativa. O valor final será calculado na saída.", duration: 4000 });
      
      navigate('/dashboard'); // Redireciona para o dashboard após a reserva.
    } catch (error: any) {
      toast({ title: "Erro", description: error.message || "Não foi possível completar sua reserva.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Exibe um skeleton loader enquanto o preço está sendo carregado.
  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>Realizar reserva</CardTitle></CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Exibe uma mensagem se o preço não estiver disponível.
  if (!precoFixo1h) {
    return (
      <Card>
        <CardHeader><CardTitle>Realizar reserva</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">Preço não disponível para este estacionamento.</p>
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

          {/* Seção com o resumo da reserva */}
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
                <span className="text-xs font-medium text-green-600">Ativação imediata</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Cobrança final:</span>
                <span className="text-xs font-medium text-green-600">Calculada na saída</span>
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
