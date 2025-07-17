import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Estacionamento, EstacionamentoInsert, EstacionamentoUpdate } from "@/types/estacionamento";
import { Plus, Edit2, Trash2, Building2, Clock, DollarSign, Car, Upload, X } from "lucide-react";
import EditEstacionamentoDialog from "@/components/EditEstacionamentoDialog";
import { uploadEstacionamentoPhoto, deleteEstacionamentoPhotos } from "@/services/storageService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const GerenciarEstacionamento = () => {
  const { profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [estacionamento, setEstacionamento] = useState<Estacionamento | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [formData, setFormData] = useState<EstacionamentoInsert>({
    nome: "",
    cnpj: "",
    cep: "",
    endereco: "",
    numero_vagas: 0,
    fotos: [],
    horario_funcionamento: {
      abertura: "08:00",
      fechamento: "18:00"
    },
    preco: 0,
    user_id: profile?.id || ""
  });

  useEffect(() => {
    if (!profile?.dono_estacionamento) {
      navigate("/profile");
      return;
    }
    fetchEstacionamento();
  }, [profile]);

  const fetchEstacionamento = async () => {
    try {
      const { data, error } = await supabase
        .from('estacionamento')
        .select('*')
        .eq('user_id', profile?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setEstacionamento(data as Estacionamento);
    } catch (error: any) {
      console.error('Error fetching estacionamento:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do estacionamento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEstacionamento = async () => {
    try {
      const { data, error } = await supabase
        .from('estacionamento')
        .insert(formData)
        .select()
        .single();

      if (error) throw error;

      setEstacionamento(data as Estacionamento);
      setIsDialogOpen(false);
      toast({
        title: "Sucesso",
        description: "Estacionamento criado com sucesso!",
      });

      // Reset form
      setFormData({
        nome: "",
        cnpj: "",
        cep: "",
        endereco: "",
        numero_vagas: 0,
        fotos: [],
        horario_funcionamento: {
          abertura: "08:00",
          fechamento: "18:00"
        },
        preco: 0,
        user_id: profile?.id || ""
      });
    } catch (error: any) {
      console.error('Error creating estacionamento:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar estacionamento",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEstacionamento = async () => {
    if (!estacionamento) return;

    try {
      // Primeiro excluir o estacionamento
      const { error } = await supabase
        .from('estacionamento')
        .delete()
        .eq('id', estacionamento.id);

      if (error) throw error;

      // Depois atualizar o perfil para dono_estacionamento = false
      await updateProfile({ dono_estacionamento: false });

      setEstacionamento(null);
      toast({
        title: "Sucesso",
        description: "Estacionamento excluído com sucesso!",
      });

      // Redirecionar para o perfil após a exclusão
      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    } catch (error: any) {
      console.error('Error deleting estacionamento:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir estacionamento",
        variant: "destructive",
      });
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
      // Reset input
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

      // Delete from storage
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

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gerenciar Estacionamento</h1>
        {!estacionamento && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Criar Estacionamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Estacionamento</DialogTitle>
                <DialogDescription>
                  Preencha os dados do seu estacionamento
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Estacionamento</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={formData.cep}
                    onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero_vagas">Número de Vagas</Label>
                  <Input
                    id="numero_vagas"
                    type="number"
                    value={formData.numero_vagas}
                    onChange={(e) => setFormData({ ...formData, numero_vagas: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preco">Preço por Hora (R$)</Label>
                  <Input
                    id="preco"
                    type="number"
                    step="0.01"
                    value={formData.preco}
                    onChange={(e) => setFormData({ ...formData, preco: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="abertura">Horário de Abertura</Label>
                  <Input
                    id="abertura"
                    type="time"
                    value={formData.horario_funcionamento.abertura}
                    onChange={(e) => setFormData({
                      ...formData,
                      horario_funcionamento: {
                        ...formData.horario_funcionamento,
                        abertura: e.target.value
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechamento">Horário de Fechamento</Label>
                  <Input
                    id="fechamento"
                    type="time"
                    value={formData.horario_funcionamento.fechamento}
                    onChange={(e) => setFormData({
                      ...formData,
                      horario_funcionamento: {
                        ...formData.horario_funcionamento,
                        fechamento: e.target.value
                      }
                    })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateEstacionamento}>
                  Criar Estacionamento
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {estacionamento ? (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {estacionamento.nome}
                </CardTitle>
                <CardDescription>CNPJ: {estacionamento.cnpj}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate(`/estacionamento-dashboard/${estacionamento.id}`)}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Gerenciar
                </Button>
                <EditEstacionamentoDialog 
                  estacionamento={estacionamento} 
                  onSuccess={fetchEstacionamento}
                />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir este estacionamento? Esta ação não pode ser desfeita e você precisará criar um novo para voltar a ser dono de estacionamento.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteEstacionamento}>
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Localização</h3>
                  <p className="text-sm text-muted-foreground">{estacionamento.endereco}</p>
                  <p className="text-sm text-muted-foreground">CEP: {estacionamento.cep}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    Vagas Disponíveis
                  </h3>
                  <Badge variant="secondary" className="text-lg">
                    {estacionamento.numero_vagas} vagas
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Horário de Funcionamento
                  </h3>
                  <p className="text-sm">
                    {estacionamento.horario_funcionamento.abertura} às {estacionamento.horario_funcionamento.fechamento}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Preço por Hora
                  </h3>
                  <Badge variant="outline" className="text-lg">
                    {formatPrice(estacionamento.preco)}
                  </Badge>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Fotos do Estacionamento
                </h3>
                <div className="flex items-center gap-2">
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
                    size="sm"
                    onClick={() => document.getElementById('photo-upload')?.click()}
                    disabled={uploadingPhoto || (estacionamento.fotos?.length || 0) >= 5}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingPhoto ? "Enviando..." : "Adicionar Foto"}
                  </Button>
                </div>
              </div>
              
              {estacionamento.fotos && estacionamento.fotos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {estacionamento.fotos.map((photoUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photoUrl}
                        alt={`Foto ${index + 1} do estacionamento`}
                        className="w-full h-32 object-cover rounded-md border"
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
                <div className="text-center py-8 text-muted-foreground">
                  <Upload className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma foto adicionada ainda</p>
                  <p className="text-sm">Adicione fotos para mostrar seu estacionamento</p>
                </div>
              )}
              
              {(estacionamento.fotos?.length || 0) >= 5 && (
                <p className="text-sm text-muted-foreground text-center">
                  Máximo de 5 fotos permitidas
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum estacionamento cadastrado</h3>
            <p className="text-muted-foreground mb-4">
              Crie seu primeiro estacionamento para começar a gerenciar suas vagas
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GerenciarEstacionamento;