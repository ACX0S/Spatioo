
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Clock, Info, Calendar, AlertCircle } from 'lucide-react';
import { createBookingRequest } from '@/services/bookingService';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { PublicParkingData } from '@/services/parkingService';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, parse, isAfter, isBefore } from 'date-fns';
import { Veiculo, TamanhoVeiculo } from '@/types/veiculo';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  
  // Estados para validação de veículo
  const [userVehicles, setUserVehicles] = useState<Veiculo[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [hasVehicle, setHasVehicle] = useState(false);
  const [isVehicleCompatible, setIsVehicleCompatible] = useState(true);
  const [vehicleCheckMessage, setVehicleCheckMessage] = useState<string>('');

  // Efeito para buscar veículos do usuário
  useEffect(() => {
    const fetchUserVehicles = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('veiculos')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const vehicles = data as unknown as Veiculo[] || [];
        setUserVehicles(vehicles);
        setHasVehicle(vehicles.length > 0);
        
        // Se houver apenas um veículo, seleciona automaticamente
        if (vehicles.length === 1) {
          setSelectedVehicleId(vehicles[0].id);
        }
        
        // Verificar compatibilidade com base nas dimensões reais
        if (vehicles.length > 0 && parkingSpot.largura_vaga && parkingSpot.comprimento_vaga) {
          const isCompatible = checkVehicleCompatibility(
            vehicles[0], 
            parkingSpot.largura_vaga, 
            parkingSpot.comprimento_vaga
          );
          setIsVehicleCompatible(isCompatible);
          
          if (!isCompatible) {
            setVehicleCheckMessage('Seu veículo excede o tamanho máximo permitido para esta vaga.');
          }
        }
      } catch (error) {
        console.error('Erro ao buscar veículos:', error);
      }
    };
    
    fetchUserVehicles();
  }, [user, parkingSpot.largura_vaga, parkingSpot.comprimento_vaga]);

  // Função helper para verificar compatibilidade
  const checkVehicleCompatibility = (
    vehicle: Veiculo, 
    vagaLargura: number, 
    vagaComprimento: number
  ): boolean => {
    // Adiciona uma margem de segurança de 10cm (0.1m)
    const margem = 0.1;
    
    return vehicle.largura <= (vagaLargura + margem) && 
           vehicle.comprimento <= (vagaComprimento + margem);
  };

  // Validar compatibilidade quando um veículo é selecionado
  useEffect(() => {
    if (!selectedVehicleId || !parkingSpot.largura_vaga || !parkingSpot.comprimento_vaga) return;

    const selectedVehicle = userVehicles.find(v => v.id === selectedVehicleId);
    if (!selectedVehicle) return;

    const compatible = checkVehicleCompatibility(
      selectedVehicle, 
      parkingSpot.largura_vaga, 
      parkingSpot.comprimento_vaga
    );
    setIsVehicleCompatible(compatible);
    
    if (!compatible) {
      setVehicleCheckMessage('O veículo selecionado excede o tamanho máximo permitido para esta vaga.');
    } else {
      setVehicleCheckMessage('');
    }
  }, [selectedVehicleId, userVehicles, parkingSpot.largura_vaga, parkingSpot.comprimento_vaga]);

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
   * @description Lida com a submissão do formulário de reserva - agora cria uma solicitação que precisa ser aceita.
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
      
      // Buscar uma vaga disponível
      const { data: vagasDisponiveis, error: vagasError } = await supabase
        .from('vagas')
        .select('*')
        .eq('estacionamento_id', parkingSpot.id)
        .eq('status', 'disponivel')
        .limit(1);

      if (vagasError) throw vagasError;

      if (!vagasDisponiveis || vagasDisponiveis.length === 0) {
        throw new Error('Não há vagas disponíveis no momento. Por favor, tente novamente mais tarde.');
      }

      const vagaSelecionada = vagasDisponiveis[0];

      // Validar seleção de veículo
      if (userVehicles.length > 0 && !selectedVehicleId) {
        toast({ 
          title: "Erro", 
          description: "Por favor, selecione um veículo", 
          variant: "destructive" 
        });
        return;
      }

      // Criar solicitação de reserva (aguardando confirmação)
      await createBookingRequest({
        estacionamento_id: parkingSpot.id,
        veiculo_id: selectedVehicleId || undefined,
        date: format(bookingDate, 'yyyy-MM-dd'),
        start_time: format(bookingDate, 'HH:mm:ss'),
        end_time: format(endTime, 'HH:mm:ss'),
        price: calculatedPrice,
        spot_number: vagaSelecionada.numero_vaga
      });

      // Atualizar vaga para aguardando confirmação
      await supabase
        .from('vagas')
        .update({ status: 'aguardando_confirmacao' })
        .eq('id', vagaSelecionada.id);
      
      toast({ 
        title: "Solicitação enviada!", 
        description: "Sua solicitação de reserva foi enviada. Aguarde a confirmação do estabelecimento.", 
        duration: 5000 
      });
      
      navigate('/dashboard/reservas'); // Redireciona para o dashboard após a solicitação.
    } catch (error: any) {
      console.error('Erro ao criar solicitação:', error);
      toast({ title: "Erro", description: error.message || "Não foi possível completar sua solicitação.", variant: "destructive" });
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
  const canBook = hasVehicle && isVehicleCompatible;

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
          {/* Alerta quando não há veículos cadastrados */}
          {!hasVehicle && (
            <Alert className="bg-yellow-500/10 border-yellow-500/50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-600">
                Não há veículos cadastrados. Cadastre um veículo para realizar reservas.
                <Button 
                  variant="link" 
                  className="h-auto p-0 ml-1 text-yellow-600 underline"
                  onClick={() => navigate('/car-request')}
                  type="button"
                >
                  Cadastrar veículo
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Alerta quando veículo é incompatível */}
          {hasVehicle && !isVehicleCompatible && vehicleCheckMessage && (
            <Alert className="bg-red-500/10 border-red-500/50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-600">
                {vehicleCheckMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Seletor de veículo */}
          {hasVehicle && userVehicles.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="vehicle-select">Selecione o veículo *</Label>
              <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
                <SelectTrigger id="vehicle-select">
                  <SelectValue placeholder="Escolha qual veículo você usará" />
                </SelectTrigger>
                <SelectContent>
                  {userVehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.nome} - {vehicle.placa}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Mostrar veículo selecionado */}
          {selectedVehicleId && userVehicles.length > 0 && (
            <div className="p-3 bg-muted/50 rounded-lg border">
              <p className="text-sm font-medium mb-1">Veículo selecionado:</p>
              <p className="text-sm text-muted-foreground">
                {userVehicles.find(v => v.id === selectedVehicleId)?.nome}
                {isVehicleCompatible && (
                  <span className="text-green-600 ml-2">✓ Compatível com a vaga</span>
                )}
              </p>
            </div>
          )}
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

          {/* Campo de duração removido - duração será calculada automaticamente */}

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
            className="w-full bg-spatioo-green hover:bg-spatioo-green-dark text-black disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting || !calculatedPrice || !selectedStartTime || !canBook}
            title={!canBook ? vehicleCheckMessage : ''}
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
