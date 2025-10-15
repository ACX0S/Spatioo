import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Estacionamento, EstacionamentoUpdate } from "@/types/estacionamento";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  estacionamento: any;
  onSuccess?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditEstacionamentoDialog = ({ estacionamento, onSuccess, open, onOpenChange }: EditEstacionamentoDialogProps) => {
  const { toast } = useToast();
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
    // Comodidades
    funcionamento_24h: estacionamento.funcionamento_24h || false,
    suporte_carro_eletrico: estacionamento.suporte_carro_eletrico || false,
    vaga_coberta: estacionamento.vaga_coberta || false,
    manobrista: estacionamento.manobrista || false,
    suporte_caminhao: estacionamento.suporte_caminhao || false,
    vaga_moto: estacionamento.vaga_moto || false,
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
      // Comodidades
      funcionamento_24h: estacionamento.funcionamento_24h || false,
      suporte_carro_eletrico: estacionamento.suporte_carro_eletrico || false,
      vaga_coberta: estacionamento.vaga_coberta || false,
      manobrista: estacionamento.manobrista || false,
      suporte_caminhao: estacionamento.suporte_caminhao || false,
      vaga_moto: estacionamento.vaga_moto || false,
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

      onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Estacionamento</DialogTitle>
          <DialogDescription>
            Atualize os dados do seu estacionamento
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-nome">Nome do Estacionamento *</Label>
            <Input
              id="edit-nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: Estacionamento Centro"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-cnpj">CNPJ *</Label>
            <Input
              id="edit-cnpj"
              value={formData.cnpj}
              onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
              placeholder="00.000.000/0000-00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-cep">CEP *</Label>
            <Input
              id="edit-cep"
              value={formData.cep}
              onChange={(e) => handleCepChange(e.target.value)}
              placeholder="00000-000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-endereco">Endereço *</Label>
            <Input
              id="edit-endereco"
              value={formData.endereco}
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
              placeholder="Rua, número, bairro"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-numero_vagas">Número de Vagas *</Label>
            <Input
              id="edit-numero_vagas"
              type="number"
              min="1"
              value={formData.numero_vagas}
              onChange={(e) => setFormData({ ...formData, numero_vagas: parseInt(e.target.value) || 0 })}
              placeholder="Ex: 50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-preco">Preço por Hora (R$) *</Label>
            <Input
              id="edit-preco"
              type="number"
              step="0.01"
              min="0"
              value={formData.preco}
              onChange={(e) => setFormData({ ...formData, preco: parseFloat(e.target.value) || 0 })}
              placeholder="Ex: 5.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-abertura">Horário de Abertura</Label>
            <Input
              id="edit-abertura"
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
            <Label htmlFor="edit-fechamento">Horário de Fechamento</Label>
            <Input
              id="edit-fechamento"
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

        {/* Comodidades do Estacionamento */}
        <div className="space-y-4 mt-4">
          <Label className="text-base font-semibold">Comodidades</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-funcionamento-24h"
                checked={formData.funcionamento_24h || false}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, funcionamento_24h: checked as boolean })
                }
              />
              <Label htmlFor="edit-funcionamento-24h" className="text-sm font-normal cursor-pointer">
                Funcionamento 24h
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-suporte-carro-eletrico"
                checked={formData.suporte_carro_eletrico || false}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, suporte_carro_eletrico: checked as boolean })
                }
              />
              <Label htmlFor="edit-suporte-carro-eletrico" className="text-sm font-normal cursor-pointer">
                Suporte a carro elétrico
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-vaga-coberta"
                checked={formData.vaga_coberta || false}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, vaga_coberta: checked as boolean })
                }
              />
              <Label htmlFor="edit-vaga-coberta" className="text-sm font-normal cursor-pointer">
                Vaga coberta
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-manobrista"
                checked={formData.manobrista || false}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, manobrista: checked as boolean })
                }
              />
              <Label htmlFor="edit-manobrista" className="text-sm font-normal cursor-pointer">
                Manobrista
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-suporte-caminhao"
                checked={formData.suporte_caminhao || false}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, suporte_caminhao: checked as boolean })
                }
              />
              <Label htmlFor="edit-suporte-caminhao" className="text-sm font-normal cursor-pointer">
                Suporte a caminhão
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-vaga-moto"
                checked={formData.vaga_moto || false}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, vaga_moto: checked as boolean })
                }
              />
              <Label htmlFor="edit-vaga-moto" className="text-sm font-normal cursor-pointer">
                Vaga para motos
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
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