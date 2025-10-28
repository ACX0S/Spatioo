import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, Camera, ChevronLeft, CreditCard, Shield, Bell, LogOut, KeyRound, Plus, Trash2, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBookings } from '@/hooks/useBookings';
import ChangePasswordDialog from '@/components/ChangePasswordDialog';
import { uploadAvatar, deleteOldAvatar } from '@/services/storageService';
import { useCep } from '@/hooks/useCep';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface PaymentCard {
  id: string;
  last4: string;
  brand: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
}

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

  // Mock de cartões para demonstração - futuramente integrar com API de pagamento
  const [paymentCards, setPaymentCards] = useState<PaymentCard[]>([
    {
      id: '1',
      last4: '4892',
      brand: 'Mastercard',
      expiryMonth: '06',
      expiryYear: '25',
      isDefault: true
    }
  ]);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setPhone(profile.phone?.replace(/\D/g, '') || '');
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
      const publicUrl = await uploadAvatar(file, user.id);
      
      if (profile?.avatar_url) {
        await deleteOldAvatar(profile.avatar_url, user.id);
      }
      
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
        phone: phone.replace(/\D/g, '') || null,
        cep: cep.trim() || null, 
        street: street.trim() || null, 
        number: number.trim() || null, 
        complement: complement.trim() || null, 
        neighborhood: neighborhood.trim() || null
      };
      
      await updateProfile(profileData);
      
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

  const handleSetDefaultCard = (cardId: string) => {
    setPaymentCards(cards =>
      cards.map(card => ({
        ...card,
        isDefault: card.id === cardId
      }))
    );
    toast({
      title: "Cartão padrão alterado",
      description: "Seu cartão padrão foi atualizado."
    });
  };

  const handleRemoveCard = (cardId: string) => {
    setPaymentCards(cards => cards.filter(card => card.id !== cardId));
    toast({
      title: "Cartão removido",
      description: "O cartão foi removido com sucesso."
    });
  };

  const getBrandColor = (brand: string) => {
    const colors: Record<string, string> = {
      'Visa': 'text-blue-600',
      'Mastercard': 'text-orange-600',
      'Elo': 'text-yellow-600',
      'American Express': 'text-green-600'
    };
    return colors[brand] || 'text-gray-600';
  };

  return (
    <div className="container p-4 max-w-4xl mx-auto">
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

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6 h-auto">
          <TabsTrigger value="personal" className="text-xs sm:text-sm">Dados</TabsTrigger>
          <TabsTrigger value="security" className="text-xs sm:text-sm">Segurança</TabsTrigger>
          <TabsTrigger value="account" className="text-xs sm:text-sm">Conta</TabsTrigger>
        </TabsList>

        {/* Dados Pessoais */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Gerencie seus dados de perfil</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile?.avatar_url || ""} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xl">
                      {getInitials(profile?.name)}
                    </AvatarFallback>
                  </Avatar>

                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-full cursor-pointer hover:scale-110 transition-transform"
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

                {uploading && <p className="text-xs mt-2 text-muted-foreground">Enviando...</p>}
              </div>

              <Separator />

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={user?.email || ""}
                    className="pl-10 bg-muted/40"
                    disabled
                  />
                </div>
                <p className="text-xs text-muted-foreground">O email não pode ser alterado</p>
              </div>

              {/* Nome */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome Completo</label>
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
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
                      const len = digits.length;
                      let formatted = "";
                      if (len > 0) formatted += `(${digits.slice(0, 2)}`;
                      if (len >= 3) formatted += `) ${digits.slice(2, 7)}`;
                      if (len >= 8) formatted += `-${digits.slice(7)}`;
                      setPhone(formatted);
                    }}
                    maxLength={15}
                  />
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Segurança */}
        <TabsContent value="security">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Segurança da Conta</CardTitle>
                <CardDescription>
                  Mantenha sua conta protegida
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-destructive/10 rounded-lg">
                      <KeyRound className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <p className="font-medium">Alterar Senha</p>
                      <p className="text-sm text-muted-foreground">
                        Atualize sua senha periodicamente
                      </p>
                    </div>
                  </div>
                  <ChangePasswordDialog
                    trigger={
                      <Button variant="outline" size="sm">
                        Alterar
                      </Button>
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Conta */}
        <TabsContent value="account">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas de Uso</CardTitle>
                <CardDescription>Resumo da sua atividade na Spatioo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/40 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">
                      Reservas Ativas
                    </p>
                    <p className="text-3xl font-bold text-primary">
                      {activeBookings.length}
                    </p>
                  </div>
                  <div className="p-4 bg-muted/40 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">
                      Total de Reservas
                    </p>
                    <p className="text-3xl font-bold">
                      {activeBookings.length + historyBookings.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notificações</CardTitle>
                <CardDescription>
                  Gerencie suas preferências de notificação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium">Notificações Push</p>
                      <p className="text-sm text-muted-foreground">
                        Receba atualizações sobre suas reservas
                      </p>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    defaultChecked 
                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">Sair da conta</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full border-destructive text-destructive hover:bg-destructive/10 dark:hover:text-white hover:text-black"
                  onClick={signOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
