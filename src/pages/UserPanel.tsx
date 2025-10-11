import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Building, CirclePlus} from 'lucide-react';
import { FaCar } from 'react-icons/fa';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import CreateEstacionamentoConfirmDialog from '@/components/CreateEstacionamentoConfirmDialog';
import CreateEstacionamentoComercialDialog from '@/components/CreateEstacionamentoComercialDialog';

const UserPanel = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [comercialDialogOpen, setComercialDialogOpen] = useState(false);

  // Opções do painel pessoal
  const personalOptions = [
    {
      title: "Reservas",
      description: "Visualizar suas reservas e seu histórico",
      icon: Calendar,
      route: "/dashboard/reservas",
      color: "dark:text-spatioo-green light: text-spatioo-primary",
      bgColor: "bg-spatioo-green/10"
    }
  ];

  // Opções do painel administrativo
  const adminOptions = [
    {
      title: "Minhas vagas",
      description: "Gerenciar e cadastrar vagas",
      icon: FaCar,
      route: "/ofertar",
      color: "dark:text-spatioo-green light: text-spatioo-primary",
      bgColor: "bg-spatioo-green/10"
    },
    // Menu "Estacionamento" só aparece para proprietários (dono_estacionamento = true)
    ...(profile?.dono_estacionamento ? [{
      title: "Estacionamento",
      description: "Gerenciar sua empresa, vagas e ver seus dashboards",
      icon: Building,
      route: "/admin",
      color: "dark:text-spatioo-green light: text-spatioo-primary",
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
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Painel do usuário
        </h1>
        <p className="text-muted-foreground">Suas opções disponíveis</p>
      </div>

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
              onClick={() => handleOptionClick(option.route)}
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
              onClick={() => handleOptionClick(option.route)}
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
            <div className="flex justify-center pt-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setConfirmDialogOpen(true)}
                className="hover:bg-spatioo-green/10 transition-colors rounded-full dark:hover:text-spatioo-green hover:text-spatioo-primary"
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
    </div>
  );
};

export default UserPanel;