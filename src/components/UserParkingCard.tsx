import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Edit3, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Database } from '@/integrations/supabase/types';
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import EditEstacionamentoDialog from "./EditEstacionamentoDialog";

type EstacionamentoData = Database['public']['Tables']['estacionamento']['Row'];

interface UserParkingCardProps {
  estacionamento: EstacionamentoData;
  onEdit?: (id: string) => void;
  onUpdate?: () => void;
}

export const UserParkingCard = ({ estacionamento, onEdit, onUpdate }: UserParkingCardProps) => {
  const [isActive, setIsActive] = useState(estacionamento.ativo || false);
  const [isUpdating, setIsUpdating] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getHorarioFormatted = () => {
    if (estacionamento.horario_funcionamento && typeof estacionamento.horario_funcionamento === 'object') {
      const horario = estacionamento.horario_funcionamento as any;
      if (horario.abertura && horario.fechamento) {
        return `${horario.abertura} - ${horario.fechamento}`;
      }
    }
    return "24h";
  };

  const handleActiveToggle = async (checked: boolean) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('estacionamento')
        .update({ ativo: checked })
        .eq('id', estacionamento.id);

      if (error) throw error;

      setIsActive(checked);
      onUpdate?.();
      
      toast({
        title: checked ? "Vaga ativada" : "Vaga desativada",
        description: checked 
          ? "Sua vaga está agora visível para outros usuários." 
          : "Sua vaga não aparecerá mais para outros usuários.",
      });
    } catch (error: any) {
      console.error('Error updating estacionamento status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da vaga.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">{estacionamento.nome}</h3>
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <MapPin className="h-3 w-3 mr-1" />
              <span className="truncate">{estacionamento.endereco}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Vagas</span>
                <p className="font-medium">{estacionamento.numero_vagas}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Valor / Hora</span>
                <p className="font-medium text-spatioo-green">{formatPrice(estacionamento.preco)}</p>
              </div>
            </div>
            
            <div className="mt-2 text-sm">
              <span className="text-muted-foreground">Horário: </span>
              <span className="font-medium">{getHorarioFormatted()}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2 ml-4">
            <EditEstacionamentoDialog 
              estacionamento={estacionamento}
              onSuccess={onUpdate}
            />
            
            <Switch
              checked={isActive}
              onCheckedChange={handleActiveToggle}
              disabled={isUpdating}
              className="data-[state=checked]:bg-spatioo-green"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};