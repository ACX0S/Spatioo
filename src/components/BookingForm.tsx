
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Clock, Info, Calendar } from 'lucide-react';
import { createImmediateBooking } from '@/services/bookingService';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { PublicParkingData } from '@/services/parkingService';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, parse, isAfter, isBefore } from 'date-fns';

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
  
  // Estados para reserva flexível de horários
  const [selectedDate, setSelectedDate] = useState<'hoje' | 'amanha'>('hoje'); // Data selecionada (hoje ou amanhã)
  const [selectedStartTime, setSelectedStartTime] = useState<string>(''); // Horário de início selecionado
  const [selectedDuration, setSelectedDuration] = useState<number>(1); // Duração em horas
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null); // Preço calculado baseado na duração
  const [tabelaPrecos, setTabelaPrecos] = useState<Array<{ horas: number; preco: number }>>([]); // Tabela de preços do estacionamento
  const [horaExtra, setHoraExtra] = useState<number>(0); // Valor da hora extra

  // Efeito para buscar os preços e configurações do estacionamento.
  useEffect(() => {
    const fetchPricingData = async () => {
      try {
        setLoading(true);
        
        // Busca todos os preços cadastrados para o estacionamento
        const { data: precosData, error: precosError } = await supabase
          .from('estacionamento_precos')
          .select('horas, preco')
          .eq('estacionamento_id', parkingSpot.id)
          .order('horas', { ascending: true });

        if (precosError) throw precosError;
        
        setTabelaPrecos(precosData || []);
        
        // Define o preço de 1 hora
        const preco1h = precosData?.find(p => p.horas === 1)?.preco || parkingSpot.preco;
        setPrecoFixo1h(preco1h);
        
        // Busca o valor da hora extra do estacionamento
        const { data: estacionamentoData, error: estacionamentoError } = await supabase
          .from('estacionamento')
          .select('hora_extra')
          .eq('id', parkingSpot.id)
          .single();
          
        if (estacionamentoError) throw estacionamentoError;
        
        setHoraExtra(estacionamentoData?.hora_extra || 0);
        
        // Define o horário inicial padrão como o horário de abertura
        if (parkingSpot.horario_funcionamento?.abertura) {
          setSelectedStartTime(parkingSpot.horario_funcionamento.abertura);
        }
      } catch (error) {
        console.error('Erro ao buscar dados de preço:', error);
        setPrecoFixo1h(parkingSpot.preco);
      } finally {
        setLoading(false);
      }
    };

    fetchPricingData();
  }, [parkingSpot.id, parkingSpot.preco]);

  // Efeito para calcular o preço baseado na duração selecionada
  useEffect(() => {
    if (selectedDuration && tabelaPrecos.length > 0) {
      // Verifica se existe um preço específico para a duração selecionada
      const precoEspecifico = tabelaPrecos.find(p => p.horas === selectedDuration);
      
      if (precoEspecifico) {
        setCalculatedPrice(precoEspecifico.preco);
      } else {
        // Calcula o preço usando o valor da hora extra
        // Encontra o maior período cadastrado que é menor que a duração selecionada
        const periodosOrdenados = [...tabelaPrecos].sort((a, b) => b.horas - a.horas);
        const maiorPeriodo = periodosOrdenados.find(p => p.horas <= selectedDuration);
        
        if (maiorPeriodo) {
          const horasRestantes = selectedDuration - maiorPeriodo.horas;
          const precoTotal = maiorPeriodo.preco + (horasRestantes * horaExtra);
          setCalculatedPrice(precoTotal);
        } else {
          // Se não houver período cadastrado, usa apenas hora extra
          setCalculatedPrice(selectedDuration * horaExtra);
        }
      }
    }
  }, [selectedDuration, tabelaPrecos, horaExtra]);

  /**
   * @function generateTimeOptions
   * @description Gera as opções de horário de início baseado no horário de funcionamento.
   * @returns Array de horários disponíveis
   */
  const generateTimeOptions = (): string[] => {
    const times: string[] = [];
    const { abertura, fechamento } = parkingSpot.horario_funcionamento || {};
    
    if (!abertura || !fechamento) return times;
    
    // Converte os horários de abertura e fechamento para objetos Date
    const hoje = new Date();
    const horaAbertura = parse(abertura, 'HH:mm', hoje);
    const horaFechamento = parse(fechamento, 'HH:mm', hoje);
    
    // Gera horários de 30 em 30 minutos
    let currentTime = horaAbertura;
    
    while (isBefore(currentTime, horaFechamento) || currentTime.getTime() === horaFechamento.getTime()) {
      times.push(format(currentTime, 'HH:mm'));
      currentTime = new Date(currentTime.getTime() + 30 * 60 * 1000); // Adiciona 30 minutos
    }
    
    return times;
  };

  /**
   * @function validateBookingTime
   * @description Valida se o horário de início e fim estão dentro do horário de funcionamento.
   * @returns true se válido, false caso contrário
   */
  const validateBookingTime = (): boolean => {
    const { abertura, fechamento } = parkingSpot.horario_funcionamento || {};
    
    if (!abertura || !fechamento || !selectedStartTime) return false;
    
    const hoje = new Date();
    const horaInicio = parse(selectedStartTime, 'HH:mm', hoje);
    const horaFim = new Date(horaInicio.getTime() + selectedDuration * 60 * 60 * 1000);
    const horaAbertura = parse(abertura, 'HH:mm', hoje);
    const horaFechamento = parse(fechamento, 'HH:mm', hoje);
    
    return (isBefore(horaInicio, horaFechamento) || horaInicio.getTime() === horaFechamento.getTime()) &&
           (isBefore(horaFim, horaFechamento) || horaFim.getTime() === horaFechamento.getTime()) &&
           (isAfter(horaInicio, horaAbertura) || horaInicio.getTime() === horaAbertura.getTime());
  };

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

    // Verifica se o preço foi calculado.
    if (!calculatedPrice) {
      toast({ title: "Erro", description: "Preço não disponível.", variant: "destructive" });
      return;
    }
    
    // Valida o horário da reserva
    if (!validateBookingTime()) {
      toast({ 
        title: "Erro", 
        description: "O horário selecionado está fora do horário de funcionamento do estacionamento.", 
        variant: "destructive" 
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Calcula a data da reserva
      const bookingDate = selectedDate === 'hoje' ? new Date() : addDays(new Date(), 1);
      const [hours, minutes] = selectedStartTime.split(':').map(Number);
      bookingDate.setHours(hours, minutes, 0, 0);
      
      // Calcula o horário de fim
      const endTime = new Date(bookingDate.getTime() + selectedDuration * 60 * 60 * 1000);
      
      // Cria a reserva no banco de dados
      const { error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          estacionamento_id: parkingSpot.id,
          date: format(bookingDate, 'yyyy-MM-dd'),
          start_time: format(bookingDate, 'HH:mm:ss'),
          end_time: format(endTime, 'HH:mm:ss'),
          price: calculatedPrice,
          status: 'upcoming',
          spot_number: 'A ser definido' // Será definido pelo sistema
        });
      
      if (error) throw error;
      
      toast({ 
        title: "Reserva confirmada!", 
        description: `Sua vaga foi reservada para ${selectedDate === 'hoje' ? 'hoje' : 'amanhã'} às ${selectedStartTime} por ${selectedDuration} hora(s).`, 
        duration: 4000 
      });
      
      navigate('/dashboard'); // Redireciona para o dashboard após a reserva.
    } catch (error: any) {
      console.error('Erro ao criar reserva:', error);
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

  const timeOptions = generateTimeOptions();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-spatioo-green" />
          Reservar Vaga
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Escolha a data, horário e duração da sua reserva.
        </p>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Seleção de Data */}
          <div className="space-y-2">
            <Label htmlFor="date-select" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Data da Reserva
            </Label>
            <Select value={selectedDate} onValueChange={(value: 'hoje' | 'amanha') => setSelectedDate(value)}>
              <SelectTrigger id="date-select">
                <SelectValue placeholder="Selecione a data" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hoje">Hoje ({format(new Date(), 'dd/MM/yyyy')})</SelectItem>
                <SelectItem value="amanha">Amanhã ({format(addDays(new Date(), 1), 'dd/MM/yyyy')})</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Seleção de Horário de Início */}
          <div className="space-y-2">
            <Label htmlFor="time-select" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horário de Início
            </Label>
            <Select value={selectedStartTime} onValueChange={setSelectedStartTime}>
              <SelectTrigger id="time-select">
                <SelectValue placeholder="Selecione o horário" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {timeOptions.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Horário de funcionamento: {parkingSpot.horario_funcionamento?.abertura} - {parkingSpot.horario_funcionamento?.fechamento}
            </p>
          </div>

          {/* Seleção de Duração */}
          <div className="space-y-2">
            <Label htmlFor="duration-select">Duração (horas)</Label>
            <Select value={selectedDuration.toString()} onValueChange={(value) => setSelectedDuration(parseInt(value))}>
              <SelectTrigger id="duration-select">
                <SelectValue placeholder="Selecione a duração" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((hours) => (
                  <SelectItem key={hours} value={hours.toString()}>
                    {hours} {hours === 1 ? 'hora' : 'horas'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Resumo da Reserva */}
          {calculatedPrice !== null && (
            <div className="bg-gradient-to-r from-spatioo-green/10 to-spatioo-green/5 border border-spatioo-green/20 p-4 rounded-lg">
              <h3 className="font-medium mb-3 text-spatioo-green">Resumo da Reserva</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Data:</span>
                  <span className="font-medium">
                    {selectedDate === 'hoje' ? 'Hoje' : 'Amanhã'} ({format(selectedDate === 'hoje' ? new Date() : addDays(new Date(), 1), 'dd/MM/yyyy')})
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Horário:</span>
                  <span className="font-medium">{selectedStartTime}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Duração:</span>
                  <span className="font-medium">{selectedDuration} {selectedDuration === 1 ? 'hora' : 'horas'}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-spatioo-green/20">
                  <span className="text-muted-foreground">Valor Total:</span>
                  <span className="text-xl font-bold text-spatioo-green">
                    R$ {calculatedPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-spatioo-green hover:bg-spatioo-green-dark text-black"
            disabled={isSubmitting || !calculatedPrice || !selectedStartTime}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Processando...' : 'Confirmar Reserva'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default BookingForm;
