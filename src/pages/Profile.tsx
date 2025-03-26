
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, Camera, ChevronLeft, CreditCard, Shield, Bell, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBookings } from '@/hooks/useBookings';
import ChangePasswordDialog from '@/components/ChangePasswordDialog';

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, updateProfile } = useAuth();
  const { activeBookings, historyBookings } = useBookings();
  
  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setPhone(profile.phone || '');
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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    try {
      setUploading(true);
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Fazer upload da imagem para o storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Obter URL pública da imagem
      const { data: publicURL } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      if (publicURL) {
        // Atualizar perfil com nova URL de avatar
        await updateProfile({ avatar_url: publicURL.publicUrl });
      }
      
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
      await updateProfile({ name, phone });
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso."
      });
    } catch (error: any) {
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
      <div className="flex items-center justify-between mb-6">
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
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="profile">Dados Pessoais</TabsTrigger>
          <TabsTrigger value="account">Conta</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card className="mb-6">
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
              <div className="space-y-2">
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
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-spatioo-green hover:bg-spatioo-green-dark text-black font-medium"
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </CardFooter>
          </Card>
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
                <div className="grid grid-cols-2 gap-4 mb-6">
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
            
            {/* Segurança */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Segurança</CardTitle>
                <CardDescription>Configurações de segurança da conta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Alterar senha</p>
                      <p className="text-xs text-muted-foreground">Atualizar sua senha de acesso</p>
                    </div>
                  </div>
                  <ChangePasswordDialog 
                    trigger={
                      <Button variant="ghost" size="sm" className="h-9">
                        <ChevronLeft className="h-4 w-4 rotate-180" />
                      </Button>
                    } 
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Notificações</p>
                      <p className="text-xs text-muted-foreground">Gerenciar alertas e mensagens</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-9">
                    <ChevronLeft className="h-4 w-4 rotate-180" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            
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
