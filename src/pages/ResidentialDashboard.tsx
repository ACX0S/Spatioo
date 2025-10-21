import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Estacionamento } from "@/types/estacionamento";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, X, Bell, DollarSign, TrendingUp, Activity } from "lucide-react";
import { uploadEstacionamentoPhoto, deleteEstacionamentoPhotos } from "@/services/storageService";
import { Input } from "@/components/ui/input";
import { useParkingBookings } from "@/hooks/useParkingBookings";
import { BookingRequestCard } from "@/components/BookingRequestCard";
import { BookingActionCard } from "@/components/BookingActionCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ResidentialDashboard = () => {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [vaga, setVaga] = useState<Estacionamento | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'dashboard' | 'fotos' | 'solicitacoes'>('dashboard');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const { 
    pendingBookings, 
    activeBookings, 
    actionLoading,
    handleAccept, 
    handleReject,
    handleOwnerArrival,
    handleOwnerDeparture 
  } = useParkingBookings(vaga?.id);

  useEffect(() => {
    if (!id) return;
    fetchVaga();
  }, [id]);

  const fetchVaga = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('estacionamento')
        .select('*')
        .eq('id', id)
        .eq('user_id', profile?.id)
        .eq('tipo', 'residencial')
        .single();

      if (error) throw error;
      setVaga(data as any);
    } catch (error: any) {
      console.error('Erro ao carregar vaga:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados da vaga",
        variant: "destructive",
      });
      navigate("/painel");
    } finally {
      setLoading(false);
    }
  };

  // Cálculos financeiros baseados nas reservas
  const financialStats = useMemo(() => {
    const allBookings = [...activeBookings, ...pendingBookings];
    const completedBookings = allBookings.filter(b => b.status === 'concluida');
    
    const totalRevenue = completedBookings.reduce((sum, booking) => sum + Number(booking.price), 0);
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const monthlyRevenue = completedBookings
      .filter(booking => {
        const bookingDate = new Date(booking.date);
        return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
      })
      .reduce((sum, booking) => sum + Number(booking.price), 0);

    return {
      pricePerHour: vaga?.preco || 0,
      totalRevenue,
      monthlyRevenue,
      totalBookings: completedBookings.length,
      monthlyBookings: completedBookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
      }).length
    };
  }, [activeBookings, pendingBookings, vaga]);

  // Atividades recentes (últimas 5 reservas)
  const recentActivity = useMemo(() => {
    return [...activeBookings, ...pendingBookings]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [activeBookings, pendingBookings]);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !vaga || !profile?.id) return;

    setUploadingPhoto(true);
    try {
      const photoUrl = await uploadEstacionamentoPhoto(file, profile.id);
      
      const currentPhotos = vaga.fotos || [];
      const updatedPhotos = [...currentPhotos, photoUrl];
      
      const { error } = await supabase
        .from('estacionamento')
        .update({ fotos: updatedPhotos })
        .eq('id', vaga.id);

      if (error) throw error;

      setVaga({ ...vaga, fotos: updatedPhotos });
      
      toast({
        title: "Sucesso",
        description: "Foto adicionada com sucesso!",
      });
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer upload da foto",
        variant: "destructive",
      });
    } finally {
      setUploadingPhoto(false);
      event.target.value = '';
    }
  };

  const handleRemovePhoto = async (photoUrl: string) => {
    if (!vaga || !profile?.id) return;

    try {
      const updatedPhotos = (vaga.fotos || []).filter(url => url !== photoUrl);
      
      const { error } = await supabase
        .from('estacionamento')
        .update({ fotos: updatedPhotos })
        .eq('id', vaga.id);

      if (error) throw error;

      await deleteEstacionamentoPhotos([photoUrl], profile.id);

      setVaga({ ...vaga, fotos: updatedPhotos });
      
      toast({
        title: "Sucesso",
        description: "Foto removida com sucesso!",
      });
    } catch (error: any) {
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

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      'aguardando_confirmacao': { label: 'Pendente', variant: 'secondary' },
      'reservada': { label: 'Reservada', variant: 'default' },
      'ocupada': { label: 'Em uso', variant: 'outline' },
      'concluida': { label: 'Concluída', variant: 'outline' }
    };
    
    const config = statusMap[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) return <LoadingSpinner />;
  if (!vaga) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-4">
          <div className="flex-1">
            <h1 className="text-lg font-semibold">{vaga.nome}</h1>
            <p className="text-xs text-muted-foreground">{vaga.endereco}</p>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b">
        <div className="container px-4">
          <nav className="flex space-x-4 overflow-x-auto scrollbar-hide">
            <Button
              variant="ghost"
              className={activeSection === 'dashboard' ? 'border-b-2 border-primary rounded-none' : 'rounded-none'}
              onClick={() => setActiveSection('dashboard')}
            >
              Dashboard
            </Button>
            <Button
              variant="ghost"
              className={activeSection === 'fotos' ? 'border-b-2 border-primary rounded-none' : 'rounded-none'}
              onClick={() => setActiveSection('fotos')}
            >
              <Camera className="h-4 w-4 mr-2" />
              Fotos
            </Button>
            <Button
              variant="ghost"
              className={activeSection === 'solicitacoes' ? 'border-b-2 border-primary rounded-none' : 'rounded-none'}
              onClick={() => setActiveSection('solicitacoes')}
            >
              <Bell className="h-4 w-4 mr-2" />
              Solicitações
              {pendingBookings.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingBookings.length}
                </Badge>
              )}
            </Button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="container px-4 py-6 max-w-6xl">
        {activeSection === 'dashboard' && (
          <div className="space-y-6">
            {/* Financial Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Preço por Hora
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {formatPrice(financialStats.pricePerHour)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Valor configurado
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Receita do Mês
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatPrice(financialStats.monthlyRevenue)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {financialStats.monthlyBookings} reservas este mês
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Receita Total
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatPrice(financialStats.totalRevenue)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {financialStats.totalBookings} reservas concluídas
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Informações da Vaga
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Endereço:</span>
                    <span className="text-sm font-medium text-right">{vaga.endereco}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">CEP:</span>
                    <span className="text-sm font-medium">{vaga.cep}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Horário:</span>
                    <span className="text-sm font-medium">
                      {vaga.horario_funcionamento.abertura} às {vaga.horario_funcionamento.fechamento}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge variant={vaga.ativo ? "default" : "secondary"}>
                      {vaga.ativo ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Atividade Recente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivity.map((booking: any) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            Reserva #{booking.id.slice(0, 8)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(booking.date), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-sm">{formatPrice(Number(booking.price))}</span>
                          {getStatusBadge(booking.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhuma atividade recente</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === 'fotos' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Gerenciar Fotos</CardTitle>
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
                    disabled={uploadingPhoto || (vaga.fotos?.length || 0) >= 10}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingPhoto ? "Enviando..." : "Adicionar Foto"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {vaga.fotos && vaga.fotos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {vaga.fotos.map((photoUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photoUrl}
                        alt={`Foto ${index + 1}`}
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
                  <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma foto adicionada</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeSection === 'solicitacoes' && (
          <div className="space-y-6">
            {/* Solicitações Pendentes */}
            {pendingBookings.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Solicitações Pendentes</h2>
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
              </div>
            )}

            {/* Reservas Ativas */}
            {activeBookings.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Reservas Ativas</h2>
                <div className="space-y-4">
                  {activeBookings.map((booking) => (
                    <BookingActionCard
                      key={booking.id}
                      booking={booking}
                      onOwnerArrival={handleOwnerArrival}
                      onOwnerDeparture={handleOwnerDeparture}
                      loading={actionLoading}
                      isOwner={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {pendingBookings.length === 0 && activeBookings.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma solicitação no momento</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResidentialDashboard;
