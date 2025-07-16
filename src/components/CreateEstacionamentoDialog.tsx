import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EstacionamentoInsert } from "@/types/estacionamento";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Building2 } from "lucide-react";

interface CreateEstacionamentoDialogProps {
  onSuccess?: () => void;
}

const CreateEstacionamentoDialog = ({ onSuccess }: CreateEstacionamentoDialogProps) => {
  const { profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const handleCreateEstacionamento = async () => {
    try {
      setLoading(true);

      // Validar campos obrigatórios
      if (!formData.nome || !formData.cnpj || !formData.cep || !formData.endereco || formData.numero_vagas <= 0 || formData.preco <= 0) {
        toast({
          title: "Erro",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive",
        });
        return;
      }

      // Primeiro criar o estacionamento
      const { data, error } = await supabase
        .from('estacionamento')
        .insert(formData)
        .select()
        .single();

      if (error) throw error;

      // Depois atualizar o perfil para dono_estacionamento = true
      await updateProfile({ dono_estacionamento: true });

      setIsOpen(false);
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

      onSuccess?.();
    } catch (error: any) {
      console.error('Error creating estacionamento:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar estacionamento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-spatioo-green/20 rounded-lg">
              <Building2 className="h-5 w-5 text-spatioo-green" />
            </div>
            <div>
              <p className="font-medium">Criar Estacionamento</p>
              <p className="text-sm text-muted-foreground">
                Cadastre seu estacionamento na plataforma
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            Criar
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Estacionamento</DialogTitle>
          <DialogDescription>
            Preencha os dados do seu estacionamento para começar a gerenciá-lo
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Estacionamento *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: Estacionamento Centro"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ *</Label>
            <Input
              id="cnpj"
              value={formData.cnpj}
              onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
              placeholder="00.000.000/0000-00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cep">CEP *</Label>
            <Input
              id="cep"
              value={formData.cep}
              onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
              placeholder="00000-000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço *</Label>
            <Input
              id="endereco"
              value={formData.endereco}
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
              placeholder="Rua, número, bairro"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="numero_vagas">Número de Vagas *</Label>
            <Input
              id="numero_vagas"
              type="number"
              min="1"
              value={formData.numero_vagas}
              onChange={(e) => setFormData({ ...formData, numero_vagas: parseInt(e.target.value) || 0 })}
              placeholder="Ex: 50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="preco">Preço por Hora (R$) *</Label>
            <Input
              id="preco"
              type="number"
              step="0.01"
              min="0"
              value={formData.preco}
              onChange={(e) => setFormData({ ...formData, preco: parseFloat(e.target.value) || 0 })}
              placeholder="Ex: 5.00"
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
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleCreateEstacionamento} disabled={loading}>
            {loading ? 'Criando...' : 'Criar Estacionamento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEstacionamentoDialog;