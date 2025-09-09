import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Car, 
  Calendar, 
  Building 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const UserPanel = () => {
  const navigate = useNavigate();

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
    {
      title: "Estacionamento",
      description: "Gerenciar sua empresa, vagas e ver seus dashboards",
      icon: Building,
      route: "/admin",
      color: "text-spatioo-green",
      bgColor: "bg-spatioo-green/10"
    }
  ];

  const handleOptionClick = (route: string) => {
    navigate(route);
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
      </div>
    </div>
  );
};

export default UserPanel;