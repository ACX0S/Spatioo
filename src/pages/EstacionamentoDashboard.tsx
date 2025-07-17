import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Estacionamento } from "@/types/estacionamento";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  useSidebar
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Edit, 
  Camera, 
  Car, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar,
  Upload,
  X,
  Building2,
  Clock
} from "lucide-react";
import { uploadEstacionamentoPhoto, deleteEstacionamentoPhotos } from "@/services/storageService";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import EditEstacionamentoDialog from "@/components/EditEstacionamentoDialog";

type SidebarOption = 'dashboard' | 'editar' | 'fotos' | 'vagas';

const EstacionamentoDashboard = () => {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [estacionamento, setEstacionamento] = useState<Estacionamento | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<SidebarOption>('dashboard');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const sidebarItems = [
    { id: 'dashboard', title: 'Dashboard', icon: LayoutDashboard },
    { id: 'editar', title: 'Editar', icon: Edit },
    { id: 'fotos', title: 'Fotos', icon: Camera },
    { id: 'vagas', title: 'Vagas', icon: Car },
  ];

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

      setEstacionamento(data as Estacionamento);
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
                  <Car className="h-4 w-4 text-muted-foreground" />
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
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">de {estacionamento.numero_vagas} vagas</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Hoje</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ 0,00</div>
                  <p className="text-xs text-muted-foreground">Últimas 24h</p>
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
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-8 w-8 mx-auto mb-2" />
                    <p>Nenhuma atividade recente</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'editar':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Editar Estacionamento</CardTitle>
                <CardDescription>
                  Atualize as informações do seu estacionamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EditEstacionamentoDialog 
                  estacionamento={estacionamento} 
                  onSuccess={fetchEstacionamento}
                />
              </CardContent>
            </Card>
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
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Vagas</CardTitle>
                <CardDescription>
                  Monitore e gerencie as vagas do seu estacionamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">Vagas Disponíveis</h3>
                        <p className="text-2xl font-bold text-green-600">{estacionamento.numero_vagas}</p>
                      </div>
                      <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Car className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">Vagas Ocupadas</h3>
                        <p className="text-2xl font-bold text-red-600">0</p>
                      </div>
                      <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-red-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Status das Vagas</h3>
                    <div className="space-y-2">
                      {Array.from({ length: Math.min(estacionamento.numero_vagas, 10) }, (_, i) => (
                        <div key={i} className="flex items-center justify-between p-2 border rounded">
                          <span>Vaga {i + 1}</span>
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Disponível
                          </Badge>
                        </div>
                      ))}
                      {estacionamento.numero_vagas > 10 && (
                        <p className="text-sm text-muted-foreground text-center pt-2">
                          ... e mais {estacionamento.numero_vagas - 10} vagas disponíveis
                        </p>
                      )}
                    </div>
                  </div>
                </div>
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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar collapsible="icon" className="border-r">
          <div className="p-4 border-b">
            <SidebarTrigger />
          </div>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>{estacionamento.nome}</SidebarGroupLabel>
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

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold capitalize">{activeSection}</h1>
              <p className="text-muted-foreground">{estacionamento.nome}</p>
            </div>
            {renderDashboardContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default EstacionamentoDashboard;