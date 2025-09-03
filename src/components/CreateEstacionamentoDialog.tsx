import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Clock, DollarSign, Car } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreateEstacionamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const CreateEstacionamentoDialog = ({ open, onOpenChange, onSuccess }: CreateEstacionamentoDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nome: "",
    endereco: "",
    cep: "",
    descricao: "",
    vagas: "",
    preco: "",
    horarioInicio: "",
    horarioFim: "",
    tipo: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Vaga registrada!",
      description: "Sua vaga foi registrada com sucesso.",
    });
    
    // Reset form
    setFormData({
      nome: "",
      endereco: "",
      cep: "",
      descricao: "",
      vagas: "",
      preco: "",
      horarioInicio: "",
      horarioFim: "",
      tipo: ""
    });
    
    onOpenChange(false);
    onSuccess?.();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5 text-spatioo-green" />
            Registrar Nova Vaga
          </DialogTitle>
          <DialogDescription>
            Preencha os dados da sua vaga de estacionamento
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Vaga</Label>
              <Input
                id="nome"
                placeholder="Ex: Vaga Residencial Centro"
                value={formData.nome}
                onChange={(e) => handleInputChange("nome", e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Vaga</Label>
              <Select value={formData.tipo} onValueChange={(value) => handleInputChange("tipo", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residencial">Residencial</SelectItem>
                  <SelectItem value="comercial">Comercial</SelectItem>
                  <SelectItem value="particular">Particular</SelectItem>
                  <SelectItem value="coberta">Coberta</SelectItem>
                  <SelectItem value="descoberta">Descoberta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Endereço
            </Label>
            <Input
              id="endereco"
              placeholder="Rua, número, bairro"
              value={formData.endereco}
              onChange={(e) => handleInputChange("endereco", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                placeholder="00000-000"
                value={formData.cep}
                onChange={(e) => handleInputChange("cep", e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vagas">Número de Vagas</Label>
              <Input
                id="vagas"
                type="number"
                min="1"
                placeholder="1"
                value={formData.vagas}
                onChange={(e) => handleInputChange("vagas", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preco" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Preço por Hora (R$)
            </Label>
            <Input
              id="preco"
              type="number"
              step="0.01"
              min="0"
              placeholder="15.00"
              value={formData.preco}
              onChange={(e) => handleInputChange("preco", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="horarioInicio" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Horário de Início
              </Label>
              <Input
                id="horarioInicio"
                type="time"
                value={formData.horarioInicio}
                onChange={(e) => handleInputChange("horarioInicio", e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="horarioFim">Horário de Fim</Label>
              <Input
                id="horarioFim"
                type="time"
                value={formData.horarioFim}
                onChange={(e) => handleInputChange("horarioFim", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição Adicional</Label>
            <Textarea
              id="descricao"
              placeholder="Informações extras sobre a vaga (opcional)"
              value={formData.descricao}
              onChange={(e) => handleInputChange("descricao", e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-spatioo-green hover:bg-spatioo-green/90">
              Registrar Vaga
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEstacionamentoDialog;