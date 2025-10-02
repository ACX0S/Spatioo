import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, Camera, ChevronLeft, CreditCard, Shield, Bell, LogOut, MapPin, Home, Building2, Check, KeyRound } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBookings } from '@/hooks/useBookings';
import ChangePasswordDialog from '@/components/ChangePasswordDialog';
import CreateEstacionamentoComercialDialog from '@/components/CreateEstacionamentoComercialDialog';
import { uploadAvatar, deleteOldAvatar } from '@/services/storageService';
import { useCep } from '@/hooks/useCep';

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, updateProfile } = useAuth();
  const { activeBookings, historyBookings } = useBookings();
  const { fetchCep, formatCep, loading: cepLoading } = useCep();
  
  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [cep, setCep] = useState(profile?.cep || '');
  const [street, setStreet] = useState(profile?.street || '');
  const [number, setNumber] = useState(profile?.number || '');
  const [complement, setComplement] = useState(profile?.complement || '');
  const [neighborhood, setNeighborhood] = useState(profile?.neighborhood || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [createEstacionamentoDialogOpen, setCreateEstacionamentoDialogOpen] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setPhone(profile.phone || '');
      setCep(profile.cep || '');
      setStreet(profile.street || '');
      setNumber(profile.number || '');
      setComplement(profile.complement || '');
      setNeighborhood(profile.neighborhood || '');
    }
  }, [profile]);

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleCepChange = async (value: string) => {
    const formattedCep = formatCep(value);
    setCep(formattedCep);

    if (formattedCep.replace(/\D/g, '').length === 8) {
      const cepData = await fetchCep(formattedCep);
      if (cepData) {
        setStreet(cepData.logradouro || '');
        setNeighborhood(cepData.bairro || '');
      }
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !user) {
      return;
    }

    try {
      setUploading(true);
      
      const file = event.target.files[0];
      
      // Upload da nova imagem
      const publicUrl = await uploadAvatar(file, user.id);
      
      // Se o usuário já tiver um avatar, excluir o antigo
      if (profile?.avatar_url) {
        await deleteOldAvatar(profile.avatar_url, user.id);
      }
      
      // Atualizar perfil com nova URL de avatar
      await updateProfile({ avatar_url: publicUrl });
      
      toast({
        title: "Avatar atualizado",
        description: "Sua foto de perfil foi atualizada com sucesso."
      });
      
    } catch (error: any) {
      toast({
        title: "Erro ao fazer upload",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      const profileData = { 
        name, 
        phone: phone.trim() || null, // Se vazio, enviar null ao invés de string vazia
        cep: cep.trim() || null, 
        street: street.trim() || null, 
        number: number.trim() || null, 
        complement: complement.trim() || null, 
        neighborhood: neighborhood.trim() || null
      };
      
      console.log('Saving profile data:', profileData);
      
      await updateProfile(profileData);
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso."
      });
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container p-4 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full" 
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Meu Perfil</h1>
        <div className="w-10"></div>
      </div>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="profile">Dados Pessoais</TabsTrigger>
          <TabsTrigger value="account">Conta</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>Atualize seus dados de perfil</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profile?.avatar_url || ''} />
                      <AvatarFallback className="bg-spatioo-green/20 text-spatioo-green text-xl">
                        {getInitials(profile?.name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <label 
                      htmlFor="avatar-upload" 
                      className="absolute bottom-0 right-0 bg-spatioo-green text-black p-1.5 rounded-full cursor-pointer"
                    >
                      <Camera className="h-4 w-4" />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                  
                  {uploading && <p className="text-xs mt-2">Enviando...</p>}
                </div>
                
                {/* Email */}
                <div className="space-y-1">
                  <label className="text-sm font-medium">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      value={user?.email || ''}
                      className="pl-10 bg-muted/40"
                      disabled
                    />
                  </div>
                </div>
                
                {/* Nome */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Seu nome completo"
                      className="pl-10"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
                
                {/* Telefone */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Telefone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="tel"
                      placeholder="(11) 98765-4321"
                      className="pl-10"
                      value={phone}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 11) {
                          if (value.length >= 11) {
                            value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                          } else if (value.length >= 7) {
                            value = value.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
                          } else if (value.length >= 3) {
                            value = value.replace(/(\d{2})(\d+)/, '($1) $2');
                          }
                          setPhone(value);
                        }
                      }}
                      maxLength={15}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Endereço */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle>Endereço</CardTitle>
                <CardDescription>Seus dados de localização</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* CEP */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">CEP</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="00000-000"
                      className="pl-10"
                      value={cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      disabled={cepLoading}
                    />
                  </div>
                  {cepLoading && <p className="text-xs text-muted-foreground">Buscando CEP...</p>}
                </div>

                {/* Rua */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rua</label>
                  <div className="relative">
                    <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Nome da rua"
                      className="pl-10"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                    />
                  </div>
                </div>

                {/* Número e Complemento */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Número</label>
                    <Input
                      type="text"
                      placeholder="123"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Complemento</label>
                    <Input
                      type="text"
                      placeholder="Apto 12"
                      value={complement}
                      onChange={(e) => setComplement(e.target.value)}
                    />
                  </div>
                </div>

                {/* Bairro */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bairro</label>
                  <Input
                    type="text"
                    placeholder="Nome do bairro"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    readOnly={cep && cep.replace(/\D/g, '').length === 8}
                  />
                  {cep && cep.replace(/\D/g, '').length === 8 && (
                    <p className="text-xs text-muted-foreground">Campo preenchido automaticamente pelo CEP</p>
                  )}
                 </div>
               </CardContent>
             </Card>
             
             <Card>
               <CardFooter>
                 <Button 
                   className="w-full mt-6 bg-spatioo-green hover:bg-spatioo-green-dark text-black font-medium"
                   onClick={handleSaveProfile}
                   disabled={saving}
                 >
                   {saving ? 'Salvando...' : 'Salvar Alterações'}
                 </Button>
               </CardFooter>
             </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="account">
          <div className="space-y-6">
            {/* Métodos de Pagamento */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Métodos de Pagamento</CardTitle>
                <CardDescription>Gerencie seus cartões e formas de pagamento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">•••• •••• •••• 4892</p>
                      <p className="text-xs text-muted-foreground">Mastercard • Expira em 06/25</p>
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Adicionar novo cartão
                </Button>
              </CardContent>
            </Card>
            
            {/* Estatísticas de uso */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estatísticas de uso</CardTitle>
                <CardDescription>Resumo da sua atividade</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4 ">
                  <div className="bg-muted/40 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Reservas ativas</p>
                    <p className="text-2xl font-bold">{activeBookings.length}</p>
                  </div>
                  <div className="bg-muted/40 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Reservas concluídas</p>
                    <p className="text-2xl font-bold">{historyBookings.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Configurações de Negócio */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configurações de Negócio</CardTitle>
                <CardDescription>Gerencie suas opções empresariais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!profile?.dono_estacionamento ? (
                  <div>
                    <Button 
                      onClick={() => setCreateEstacionamentoDialogOpen(true)}
                      className="w-full bg-spatioo-green hover:bg-spatioo-green/90"
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      Cadastrar Estacionamento
                    </Button>
                    <CreateEstacionamentoComercialDialog 
                      open={createEstacionamentoDialogOpen}
                      onOpenChange={setCreateEstacionamentoDialogOpen}
                      onSuccess={() => window.location.reload()} 
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between space-x-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-spatioo-green/20 rounded-lg">
                        <Building2 className="h-5 w-5 text-spatioo-green" />
                      </div>  
                      <div>
                        <p className="font-medium text-spatioo-green/90">Estacionamento Cadastrado</p>
                        <p className="text-sm text-muted-foreground">
                          Você pode gerenciar seu estacionamento na página Painel.
                        </p>
                      </div>
                    </div>
                    <div className="">
                      <span className="text-spatioo-green"><Check/></span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Segurança */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Segurança</CardTitle>
                <CardDescription>Configurações de segurança da conta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <KeyRound className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium">Alterar senha</p>
                      <p className="text-sm text-muted-foreground">Mantenha sua conta segura</p>
                    </div>
                  </div>
                  <ChangePasswordDialog trigger={
                    <Button variant="outline" size="sm">
                      Alterar
                    </Button>
                  } />
                </div>
              </CardContent>
            </Card>
            
            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notificações</CardTitle>
                <CardDescription>Configure suas preferências de notificação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Bell className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Notificações push</p>
                      <p className="text-sm text-muted-foreground">Receba atualizações sobre suas reservas</p>
                    </div>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
              </CardContent>
            </Card>
            
            {/* Sair da conta */}
            <Button 
              variant="outline"
              className="w-full border-destructive text-destructive hover:bg-destructive/10"
              onClick={signOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair da Conta
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;