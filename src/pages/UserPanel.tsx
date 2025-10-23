import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Building } from 'lucide-react';
import { FaCar } from 'react-icons/fa';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import CreateEstacionamentoConfirmDialog from '@/components/CreateEstacionamentoConfirmDialog';
import CreateEstacionamentoComercialDialog from '@/components/CreateEstacionamentoComercialDialog';
import EstacionamentoSelectionModal from '@/components/EstacionamentoSelectionModal';
import { supabase } from '@/integrations/supabase/client';

const UserPanel = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [comercialDialogOpen, setComercialDialogOpen] = useState(false);
  const [residentialModalOpen, setResidentialModalOpen] = useState(false);
  const [estacionamentoModalOpen, setEstacionamentoModalOpen] = useState(false);
  const [residenciais, setResidenciais] = useState<any[]>([]);
  const [estacionamentos, setEstacionamentos] = useState<any[]>([]);

  // Carregar vagas residenciais e estacionamentos
  useEffect(() => {
    if (profile?.id) {
      loadEstacionamentos();
    }
  }, [profile?.id]);

  const loadEstacionamentos = async () => {
    if (!profile?.id) return;

    const { data, error } = await supabase
      .from('estacionamento')
      .select('id, nome, endereco, tipo')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    if (data) {
      const residenciaisData = data.filter(e => e.tipo === 'residencial');
      const estacionamentosData = data.filter(e => e.tipo === 'comercial');
      setResidenciais(residenciaisData);
      setEstacionamentos(estacionamentosData);
    }
  };

  // Opções do painel pessoal
  const personalOptions = [
    {
      title: "Reservas",
      description: "Visualizar suas reservas e seu histórico",
      icon: Calendar,
      route: "/dashboard/reservas",
      color: "dark:text-spatioo-green light: text-spatioo-primary",
      bgColor: "bg-spatioo-green/10"
    },
    {
      title: "Meu(s) Veículo(s)",
      description: "Gerencie e cadastre seus veículos",
      icon: FaCar,
      route: "/car-request",
      color: "dark:text-spatioo-green light: text-spatioo-primary",
      bgColor: "bg-spatioo-green/10"
    }
  ];

  // Opções do painel administrativo
  const adminOptions = [
    {
      title: "Vagas Residenciais",
      description: "Gerenciar e cadastrar vagas",
      icon: FaCar,
      action: handleResidentialClick,
      color: "dark:text-spatioo-green light: text-spatioo-primary",
      bgColor: "bg-spatioo-green/10"
    },
    // Menu "Estacionamento" só aparece para proprietários (dono_estacionamento = true)
    ...(profile?.dono_estacionamento ? [{
      title: "Estacionamento",
      description: "Gerenciar sua empresa, vagas e ver seus dashboards",
      icon: Building,
      action: handleEstacionamentoClick,
      color: "dark:text-spatioo-green light: text-spatioo-primary",
      bgColor: "bg-spatioo-green/10"
    }] : [])
  ];

  function handleResidentialClick() {
    if (residenciais.length === 0) {
      navigate('/ofertar');
    } else if (residenciais.length === 1) {
      navigate(`/residential-dashboard/${residenciais[0].id}`);
    } else {
      setResidentialModalOpen(true);
    }
  }

  function handleEstacionamentoClick() {
    if (estacionamentos.length === 0) {
      // Não faz nada, usuário precisa criar primeiro
      return;
    } else if (estacionamentos.length === 1) {
      navigate(`/estacionamento-dashboard/${estacionamentos[0].id}`);
    } else {
      setEstacionamentoModalOpen(true);
    }
  }

  const handleSelectResidential = (id: string) => {
    navigate(`/residential-dashboard/${id}`);
  };

  const handleSelectEstacionamento = (id: string) => {
    navigate(`/estacionamento-dashboard/${id}`);
  };

  /**
   * @function handleConfirmCreateEstacionamento
   * @description Abre o formulário de criação de estacionamento após confirmação
   */
  const handleConfirmCreateEstacionamento = () => {
    setConfirmDialogOpen(false);
    setComercialDialogOpen(true);
  };

  /**
   * @function handleSuccessCreateEstacionamento
   * @description Callback após criar estacionamento com sucesso - recarrega a página
   */
  const handleSuccessCreateEstacionamento = () => {
    window.location.reload();
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Painel Pessoal */}
      <div className="mb-8">
        <div className="border-b border-border pb-2 mb-4">
          <h2 className="text-lg font-semibold text-foreground">Painel Pessoal</h2>
        </div>
        <div className="space-y-4">
          {personalOptions.map((option, index) => (
            <Card
              key={index}
              className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-border"
              onClick={() => navigate(option.route)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center",
                      option.bgColor
                    )}
                  >
                    <option.icon className={cn("h-6 w-6", option.color)} />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {option.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Painel Administrativo */}
      <div>
        <div className="border-b border-border pb-2 mb-4">
          <h2 className="text-lg font-semibold text-foreground">Painel Administrativo</h2>
        </div>
        <div className="space-y-4">
          {adminOptions.map((option, index) => (
            <Card
              key={index}
              className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-border"
              onClick={option.action}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center",
                      option.bgColor
                    )}
                  >
                    <option.icon className={cn("h-6 w-6", option.color)} />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {option.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Botão para criar estacionamento (visível apenas se o usuário não for dono de estacionamento) */}
          {!profile?.dono_estacionamento && (
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setConfirmDialogOpen(true)}
                className="hover:bg-spatioo-green/10 transition-colors rounded-full dark:hover:text-spatioo-green hover:text-spatioo-primary scale-125"
              >
                <Building className="dark:text-spatioo-green text-spatioo-primary" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Diálogos */}
      <CreateEstacionamentoConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={handleConfirmCreateEstacionamento}
      />

      <CreateEstacionamentoComercialDialog
        open={comercialDialogOpen}
        onOpenChange={setComercialDialogOpen}
        onSuccess={handleSuccessCreateEstacionamento}
      />

      {/* Modal de seleção de vagas residenciais */}
      <EstacionamentoSelectionModal
        open={residentialModalOpen}
        onOpenChange={setResidentialModalOpen}
        estacionamentos={residenciais}
        onSelect={handleSelectResidential}
        title="Selecione uma Vaga Residencial"
        description="Escolha qual vaga residencial você deseja gerenciar"
      />

      {/* Modal de seleção de estacionamentos */}
      <EstacionamentoSelectionModal
        open={estacionamentoModalOpen}
        onOpenChange={setEstacionamentoModalOpen}
        estacionamentos={estacionamentos}
        onSelect={handleSelectEstacionamento}
        title="Selecione um Estacionamento"
        description="Escolha qual estacionamento você deseja gerenciar"
      />
    </div>
  );
};

export default UserPanel;