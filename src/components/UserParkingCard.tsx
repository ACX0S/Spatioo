import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Edit2, Trash2, MapPin, Clock, DollarSign } from "lucide-react";
import { FaCar } from "react-icons/fa";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import EditEstacionamentoDialog from "./EditEstacionamentoDialog";

type EstacionamentoData = Database['public']['Tables']['estacionamento']['Row'];

interface UserParkingCardProps {
  estacionamento: EstacionamentoData;
  onEdit?: (id: string) => void;
  onUpdate?: () => void;
}

export const UserParkingCard = ({ estacionamento, onEdit, onUpdate }: UserParkingCardProps) => {
  const { toast } = useToast();
  const [isActive, setIsActive] = useState(estacionamento.ativo);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

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

  const handleDeleteEstacionamento = async () => {
    if (!confirm('Tem certeza que deseja deletar este estacionamento? Esta ação não pode ser desfeita.')) {
      return;
    }

    setIsUpdating(true);
    try {
      // First delete all related vagas
      const { error: vagasError } = await supabase
        .from('vagas')
        .delete()
        .eq('estacionamento_id', estacionamento.id);

      if (vagasError) throw vagasError;

      // Then delete the estacionamento
      const { error } = await supabase
        .from('estacionamento')
        .delete()
        .eq('id', estacionamento.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Estacionamento deletado com sucesso!",
      });

      onUpdate?.();
    } catch (error: any) {
      console.error('Error deleting estacionamento:', error);
      toast({
        title: "Erro",
        description: "Erro ao deletar estacionamento",
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
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground mb-1 truncate" title={estacionamento.nome}>
              {estacionamento.nome}
            </h3>
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate" title={estacionamento.endereco}>
                {estacionamento.endereco}
              </span>
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
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowEditDialog(true)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDeleteEstacionamento}
                disabled={isUpdating}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            <Switch
              checked={isActive}
              onCheckedChange={handleActiveToggle}
              disabled={isUpdating}
              className="data-[state=checked]:bg-spatioo-green"
            />
          </div>
        </div>
      </CardContent>
      
      {showEditDialog && (
        <EditEstacionamentoDialog
          estacionamento={estacionamento}
          onSuccess={() => {
            setShowEditDialog(false);
            onUpdate?.();
          }}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
        />
      )}
    </Card>
  );
};