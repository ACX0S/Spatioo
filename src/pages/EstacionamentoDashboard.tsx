import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Estacionamento } from "@/types/estacionamento";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Camera, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar,
  Upload,
  X,
  Building2,
  Clock,
  ArrowLeft
} from "lucide-react";
import { FaCar } from 'react-icons/fa';
import { uploadEstacionamentoPhoto, deleteEstacionamentoPhotos } from "@/services/storageService";
import { Input } from "@/components/ui/input";
import { useVagasStats } from "@/hooks/useVagasStats";
import { useVagas } from "@/hooks/useVagas";
import { useEstacionamentoBookings } from "@/hooks/useEstacionamentoBookings";
import { useParkingBookings } from "@/hooks/useParkingBookings";
import { BookingRequestCard } from "@/components/BookingRequestCard";
import { BookingActionCard } from "@/components/BookingActionCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Settings } from "lucide-react";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

type SidebarOption = 'dashboard' | 'fotos' | 'vagas' | 'solicitacoes';

const EstacionamentoDashboard = () => {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [estacionamento, setEstacionamento] = useState<Estacionamento | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<SidebarOption>('dashboard');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  
  // Estado para armazenar informações dos motoristas
  const [motoristas, setMotoristas] = useState<Record<string, string>>({});

  // Hooks for real data
  const { stats, refetch: refetchStats } = useVagasStats(estacionamento?.id);
  const { vagas, updateVagaStatus, deleteVaga, refetch: refetchVagas } = useVagas(estacionamento?.id);
  const { bookings, filterBookings } = useEstacionamentoBookings(estacionamento?.id);
  const { 
    pendingBookings, 
    activeBookings, 
    actionLoading,
    handleAccept, 
    handleReject,
    handleOwnerArrival,
    handleOwnerDeparture 
  } = useParkingBookings(estacionamento?.id);

  const isMobile = useIsMobile();

  const sidebarItems = [
    { id: 'dashboard', title: 'Dashboard', icon: LayoutDashboard },
    { id: 'fotos', title: 'Fotos', icon: Camera },
    { id: 'vagas', title: 'Vagas', icon: FaCar },
    { id: 'solicitacoes', title: 'Solicitações', icon: Calendar },
  ];

  // Efeito para buscar os nomes dos motoristas quando as vagas mudam
  useEffect(() => {
    const fetchMotoristas = async () => {
      const userIds = vagas
        .filter(vaga => vaga.user_id)
        .map(vaga => vaga.user_id)
        .filter((id): id is string => id !== null);

      if (userIds.length === 0) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', userIds);

      if (error) {
        console.error('Erro ao buscar motoristas:', error);
        return;
      }

      const motoristasMap: Record<string, string> = {};
      data?.forEach(profile => {
        motoristasMap[profile.id] = profile.name || 'Sem nome';
      });

      setMotoristas(motoristasMap);
    };

    fetchMotoristas();
  }, [vagas]);

  useEffect(() => {
    if (!profile?.dono_estacionamento) {
      navigate("/profile");
      return;
    }
    fetchEstacionamento();
  }, [profile, id]);

  const fetchEstacionamento = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('estacionamento')
        .select('*')
        .eq('id', id)
        .eq('user_id', profile?.id)
        .single();

      if (error) throw error;

      setEstacionamento(data as any);
    } catch (error: any) {
      console.error('Error fetching estacionamento:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do estacionamento",
        variant: "destructive",
      });
      navigate("/gerenciar-estacionamento");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !estacionamento || !profile?.id) return;

    setUploadingPhoto(true);
    try {
      const photoUrl = await uploadEstacionamentoPhoto(file, profile.id);
      
      const currentPhotos = estacionamento.fotos || [];
      const updatedPhotos = [...currentPhotos, photoUrl];
      
      const { error } = await supabase
        .from('estacionamento')
        .update({ fotos: updatedPhotos })
        .eq('id', estacionamento.id);

      if (error) throw error;

      setEstacionamento({ ...estacionamento, fotos: updatedPhotos });
      
      toast({
        title: "Sucesso",
        description: "Foto adicionada com sucesso!",
      });
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao fazer upload da foto",
        variant: "destructive",
      });
    } finally {
      setUploadingPhoto(false);
      event.target.value = '';
    }
  };

  const handleRemovePhoto = async (photoUrl: string) => {
    if (!estacionamento || !profile?.id) return;

    try {
      const updatedPhotos = (estacionamento.fotos || []).filter(url => url !== photoUrl);
      
      const { error } = await supabase
        .from('estacionamento')
        .update({ fotos: updatedPhotos })
        .eq('id', estacionamento.id);

      if (error) throw error;

      await deleteEstacionamentoPhotos([photoUrl], profile.id);

      setEstacionamento({ ...estacionamento, fotos: updatedPhotos });
      
      toast({
        title: "Sucesso",
        description: "Foto removida com sucesso!",
      });
    } catch (error: any) {
      console.error('Error removing photo:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover foto",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const renderDashboardContent = () => {
    if (!estacionamento) return null;

    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Vagas</CardTitle>
                  <FaCar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{estacionamento.numero_vagas}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Preço por Hora</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPrice(estacionamento.preco)}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Vagas Ocupadas</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.vagas_ocupadas || 0}</div>
                  <p className="text-xs text-muted-foreground">de {stats?.total_vagas || estacionamento.numero_vagas} vagas</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Hoje</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {bookings.length > 0 
                      ? formatPrice(bookings.reduce((total, booking) => total + Number(booking.price), 0))
                      : "R$ 0,00"
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">Total de reservas</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{estacionamento.nome}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>{estacionamento.endereco}</p>
                    <p>CEP: {estacionamento.cep}</p>
                    <p>CNPJ: {estacionamento.cnpj}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {estacionamento.horario_funcionamento.abertura} às {estacionamento.horario_funcionamento.fechamento}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Atividade Recente</CardTitle>
                </CardHeader>
                <CardContent>
                  {bookings.length > 0 ? (
                    <div className="space-y-3">
                      {bookings.slice(0, 3).map((booking) => (
                        <div key={booking.id} className="flex justify-between items-center p-2 bg-muted/20 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{booking.spot_number}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(booking.date), 'dd/MM/yyyy')} - {booking.start_time} às {booking.end_time}
                            </p>
                          </div>
                          <span className="text-sm font-medium">{formatPrice(Number(booking.price))}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-8 w-8 mx-auto mb-2" />
                      <p>Nenhuma reserva registrada</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );


      case 'fotos':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Gerenciar Fotos</CardTitle>
                    <CardDescription>
                      Adicione ou remova fotos do seu estacionamento (máximo 5 fotos)
                    </CardDescription>
                  </div>
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={uploadingPhoto}
                      className="hidden"
                      id="photo-upload"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('photo-upload')?.click()}
                      disabled={uploadingPhoto || (estacionamento.fotos?.length || 0) >= 5}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploadingPhoto ? "Enviando..." : "Adicionar Foto"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {estacionamento.fotos && estacionamento.fotos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {estacionamento.fotos.map((photoUrl, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={photoUrl}
                          alt={`Foto ${index + 1} do estacionamento`}
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemovePhoto(photoUrl)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Camera className="h-12 w-12 mx-auto mb-4" />
                    <p className="text-lg mb-2">Nenhuma foto adicionada</p>
                    <p className="text-sm">Adicione fotos para destacar seu estacionamento</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'vagas':
        const filteredBookings = filterBookings(filterStatus, filterStartDate, filterEndDate);
        
        return (
          <div className="space-y-6">
            {/* Estatísticas das Vagas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total</CardTitle>
                  <FaCar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.total_vagas || 0}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Disponíveis</CardTitle>
                  <div className="h-4 w-4 bg-green-500 rounded-full" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats?.vagas_disponiveis || 0}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ocupadas</CardTitle>
                  <div className="h-4 w-4 bg-red-500 rounded-full" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats?.vagas_ocupadas || 0}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reservadas</CardTitle>
                  <div className="h-4 w-4 bg-yellow-500 rounded-full" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats?.vagas_reservadas || 0}</div>
                </CardContent>
              </Card>
            </div>

            {/* Gerenciamento de Vagas */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Vagas Individuais</CardTitle>
                    <CardDescription>
                      Gerencie cada vaga individualmente
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => refetchVagas()}
                    variant="outline"
                    size="sm"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Atualizar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {vagas.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vagas.map((vaga) => (
                      <div key={vaga.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">{vaga.numero_vaga}</h4>
                          <Badge 
                            variant={vaga.status === 'disponivel' ? 'default' : 
                                   vaga.status === 'ocupada' ? 'destructive' : 
                                   vaga.status === 'reservada' ? 'secondary' : 'outline'}
                          >
                            {vaga.status === 'disponivel' ? 'Disponível' :
                             vaga.status === 'ocupada' ? 'Ocupada' :
                             vaga.status === 'reservada' ? 'Reservada' : 'Manutenção'}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          Tipo: {vaga.tipo_vaga === 'comum' ? 'Comum' : 
                                vaga.tipo_vaga === 'eletrico' ? 'Elétrico' :
                                vaga.tipo_vaga === 'deficiente' ? 'PCD' : 'Moto'}
                        </div>
                        
                        {/* Mostrar o nome do motorista se a vaga estiver reservada ou ocupada */}
                        {(vaga.status === 'reservada' || vaga.status === 'ocupada') && vaga.user_id && (
                          <div className="text-sm bg-muted/50 p-2 rounded">
                            <span className="font-medium">Motorista:</span>
                            <p className="text-muted-foreground truncate">
                              {motoristas[vaga.user_id] || 'Carregando...'}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <Select value={vaga.status} onValueChange={(value) => updateVagaStatus(vaga.id, value)}>
                            <SelectTrigger className="flex-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="disponivel">Disponível</SelectItem>
                              <SelectItem value="ocupada">Ocupada</SelectItem>
                              <SelectItem value="reservada">Reservada</SelectItem>
                              <SelectItem value="manutencao">Manutenção</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteVaga(vaga.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FaCar className="h-12 w-12 mx-auto mb-4" />
                    <p>Nenhuma vaga encontrada</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reservas */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Reservas</CardTitle>
                    <CardDescription>
                      Histórico de reservas do estacionamento
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filtrar status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="upcoming">Agendado</SelectItem>
                        <SelectItem value="confirmed">Confirmado</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                        <SelectItem value="completed">Concluído</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {bookings.length > 0 ? (
                  <div className="space-y-4">
                    {filteredBookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <p className="font-medium">
                              Cliente
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Vaga: {booking.spot_number}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(booking.date), 'dd/MM/yyyy')} • {booking.start_time} - {booking.end_time}
                            </p>
                          </div>
                          <div className="text-right space-y-1">
                            <Badge 
                              variant={booking.status === 'upcoming' ? 'default' : 
                                     booking.status === 'confirmed' ? 'secondary' : 
                                     booking.status === 'cancelled' ? 'destructive' : 'outline'}
                            >
                              {booking.status === 'upcoming' ? 'Agendado' :
                               booking.status === 'confirmed' ? 'Confirmado' :
                               booking.status === 'cancelled' ? 'Cancelado' : 'Concluído'}
                            </Badge>
                            <p className="text-sm font-medium">
                              R$ {booking.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4" />
                    <p>Nenhuma reserva encontrada</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'solicitacoes':
        return (
          <div className="space-y-6">
            {/* Solicitações Pendentes */}
            <Card>
              <CardHeader>
                <CardTitle>Solicitações Pendentes</CardTitle>
                <CardDescription>
                  Gerencie as solicitações de reserva recebidas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingBookings.length > 0 ? (
                  <div className="space-y-4">
                    {pendingBookings.map((booking) => (
                      <BookingRequestCard
                        key={booking.id}
                        booking={booking}
                        onAccept={handleAccept}
                        onReject={handleReject}
                        loading={actionLoading}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4" />
                    <p>Nenhuma solicitação pendente</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reservas Ativas */}
            <Card>
              <CardHeader>
                <CardTitle>Reservas Ativas</CardTitle>
                <CardDescription>
                  Gerenciar chegadas e saídas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeBookings.length > 0 ? (
                  <div className="space-y-4">
                    {activeBookings.map((booking) => (
                      <BookingActionCard
                        key={booking.id}
                        booking={booking}
                        onOwnerArrival={handleOwnerArrival}
                        onOwnerDeparture={handleOwnerDeparture}
                        isOwner={true}
                        loading={actionLoading}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FaCar className="h-12 w-12 mx-auto mb-4" />
                    <p>Nenhuma reserva ativa no momento</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  if (!estacionamento) {
    return <div className="flex justify-center items-center h-64">Estacionamento não encontrado</div>;
  }

  // Mobile Layout com Tabs
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background pb-20">
        {/* Header Mobile */}
        <div className="sticky top-0 z-10 bg-background border-b shadow-sm">
          <div className="flex items-center gap-3 p-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin')}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold truncate">{estacionamento.nome}</h1>
              <p className="text-xs text-muted-foreground truncate">{estacionamento.endereco}</p>
            </div>
          </div>
        </div>

        {/* Tabs Navigation Mobile - Scrollable horizontally */}
        <Tabs value={activeSection} onValueChange={(value) => setActiveSection(value as SidebarOption)} className="w-full">
          <div className="sticky top-[57px] z-10 bg-background border-b">
            <TabsList className="w-full h-auto rounded-none bg-background p-0 flex justify-start">
              <div className="flex overflow-x-auto scrollbar-hide w-full">
                {sidebarItems.map((item) => (
                  <TabsTrigger 
                    key={item.id} 
                    value={item.id}
                    className="flex-shrink-0 min-w-[120px] h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-accent data-[state=active]:text-primary font-medium px-4"
                  >
                    <item.icon className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </TabsTrigger>
                ))}
              </div>
            </TabsList>
          </div>

          <div className="p-3 space-y-4">
            <TabsContent value="dashboard" className="mt-0">
              {renderDashboardContent()}
            </TabsContent>
            <TabsContent value="fotos" className="mt-0">
              {renderDashboardContent()}
            </TabsContent>
            <TabsContent value="vagas" className="mt-0">
              {renderDashboardContent()}
            </TabsContent>
            <TabsContent value="solicitacoes" className="mt-0">
              {renderDashboardContent()}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    );
  }

  // Desktop Layout com Sidebar
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar collapsible="icon" className="border-r">
          <div className="p-4 border-b flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin')}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <SidebarTrigger />
          </div>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="px-2">
                <div className="truncate">{estacionamento.nome}</div>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveSection(item.id as SidebarOption)}
                        isActive={activeSection === item.id}
                        className="w-full justify-start"
                      >
                        <item.icon className="h-4 w-4 mr-2" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold capitalize">{activeSection}</h1>
              <p className="text-muted-foreground">{estacionamento.endereco}</p>
            </div>
            {renderDashboardContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default EstacionamentoDashboard;