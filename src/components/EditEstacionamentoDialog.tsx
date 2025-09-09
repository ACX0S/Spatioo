import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Estacionamento, EstacionamentoUpdate } from "@/types/estacionamento";
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
import { Edit2 } from "lucide-react";
import { useCep } from "@/hooks/useCep";
import { useGeocoding } from "@/hooks/useGeocoding";

interface EditEstacionamentoDialogProps {
  estacionamento: any; // Use any to handle the Database type compatibility
  onSuccess?: () => void;
}

const EditEstacionamentoDialog = ({ estacionamento, onSuccess }: EditEstacionamentoDialogProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { fetchCep, formatCep } = useCep();
  const { geocodeCep } = useGeocoding();
  const [formData, setFormData] = useState<EstacionamentoUpdate>({
    nome: estacionamento.nome,
    cnpj: estacionamento.cnpj,
    cep: estacionamento.cep,
    endereco: estacionamento.endereco,
    numero_vagas: estacionamento.numero_vagas,
    fotos: estacionamento.fotos || [],
    horario_funcionamento: estacionamento.horario_funcionamento,
    preco: estacionamento.preco,
    latitude: estacionamento.latitude,
    longitude: estacionamento.longitude,
  });

  useEffect(() => {
    setFormData({
      nome: estacionamento.nome,
      cnpj: estacionamento.cnpj,
      cep: estacionamento.cep,
      endereco: estacionamento.endereco,
      numero_vagas: estacionamento.numero_vagas,
      fotos: estacionamento.fotos || [],
      horario_funcionamento: estacionamento.horario_funcionamento,
      preco: estacionamento.preco,
      latitude: estacionamento.latitude,
      longitude: estacionamento.longitude,
    });
  }, [estacionamento]);

  const handleCepChange = async (newCep: string) => {
    const formatted = formatCep(newCep);
    setFormData({ ...formData, cep: formatted });

    // Auto-fill address when CEP is complete
    if (formatted.replace(/\D/g, '').length === 8) {
      try {
        const cepData = await fetchCep(formatted);
        if (cepData) {
          const fullAddress = `${cepData.logradouro}, ${cepData.bairro}, ${cepData.localidade}, ${cepData.uf}`;
          setFormData(prev => ({ 
            ...prev, 
            endereco: fullAddress
          }));

          // Geocode the address to get coordinates
          const coordinates = await geocodeCep(formatted);
          if (coordinates) {
            setFormData(prev => ({
              ...prev,
              latitude: coordinates.latitude,
              longitude: coordinates.longitude
            }));
          }
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  const handleUpdateEstacionamento = async () => {
    try {
      setLoading(true);

      // Validar campos obrigatórios
      if (!formData.nome || !formData.cnpj || !formData.cep || !formData.endereco || !formData.numero_vagas || formData.numero_vagas <= 0 || !formData.preco || formData.preco <= 0) {
        toast({
          title: "Erro",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive",
        });
        return;
      }

      // If coordinates are not available, try to geocode the address
      let finalFormData = { ...formData };
      if (!finalFormData.latitude || !finalFormData.longitude) {
        const coordinates = await geocodeCep(formData.cep || '');
        if (coordinates) {
          finalFormData = {
            ...finalFormData,
            latitude: coordinates.latitude,
            longitude: coordinates.longitude
          };
        }
      }

      const { error } = await supabase
        .from('estacionamento')
        .update(finalFormData)
        .eq('id', estacionamento.id);

      if (error) throw error;

      setIsOpen(false);
      toast({
        title: "Sucesso",
        description: "Estacionamento atualizado com sucesso!",
      });

      onSuccess?.();
    } catch (error: any) {
      console.error('Error updating estacionamento:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar estacionamento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit2 className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Estacionamento</DialogTitle>
          <DialogDescription>
            Atualize os dados do seu estacionamento
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
              onChange={(e) => handleCepChange(e.target.value)}
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
              value={formData.horario_funcionamento?.abertura || "08:00"}
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
              value={formData.horario_funcionamento?.fechamento || "18:00"}
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
          <Button onClick={handleUpdateEstacionamento} disabled={loading}>
            {loading ? 'Atualizando...' : 'Atualizar Estacionamento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditEstacionamentoDialog;