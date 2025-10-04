import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Car, 
  Calendar, 
  Building,
  CirclePlus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import CreateEstacionamentoConfirmDialog from '@/components/CreateEstacionamentoConfirmDialog';
import CreateEstacionamentoComercialDialog from '@/components/CreateEstacionamentoComercialDialog';

const UserPanel = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [comercialDialogOpen, setComercialDialogOpen] = useState(false);

  // Lista de opções do painel, com o menu "Estacionamento" condicionado ao status de proprietário
  const panelOptions = [
    {
      title: "Minhas vagas",
      description: "Gerenciar vagas atuais e cadastrar novas",
      icon: Car,
      route: "/ofertar",
      color: "text-spatioo-green",
      bgColor: "bg-spatioo-green/10"
    },
    {
      title: "Reservas",
      description: "Visualizar suas reservas via chat e seu histórico pessoal",
      icon: Calendar,
      route: "/dashboard/reservas",
      color: "text-spatioo-green",
      bgColor: "bg-spatioo-green/10"
    },
    // Menu "Estacionamento" só aparece para proprietários (dono_estacionamento = true)
    ...(profile?.dono_estacionamento ? [{
      title: "Estacionamento",
      description: "Gerenciar sua empresa, vagas e ver seus dashboards",
      icon: Building,
      route: "/admin",
      color: "text-spatioo-green",
      bgColor: "bg-spatioo-green/10"
    }] : [])
  ];

  const handleOptionClick = (route: string) => {
    navigate(route);
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Painel do usuário</h1>
        <p className="text-muted-foreground">Suas opções disponíveis</p>
      </div>

      <div className="space-y-4">
        {panelOptions.map((option, index) => (
          <Card 
            key={index}
            className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-border"
            onClick={() => handleOptionClick(option.route)}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center",
                  option.bgColor
                )}>
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
          <div className="flex justify-center pt-4">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setConfirmDialogOpen(true)}
              className="flex flex-col items-center gap-2 h-auto py-6 hover:bg-spatioo-green/10 transition-colors"
            >
              <CirclePlus className="h-12 w-12 text-spatioo-green dark:text-spatioo-green" />
              <span className="text-sm font-medium text-muted-foreground">
                Cadastrar Estacionamento
              </span>
            </Button>
          </div>
        )}
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
    </div>
  );
};

export default UserPanel;