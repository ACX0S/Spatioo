import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Clock, DollarSign, Car } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCep } from "@/hooks/useCep";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import TimePickerDialog from "@/components/TimePickerDialog";
import PricingTable, { PricingRow } from "@/components/PricingTable";

interface CreateEstacionamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const CreateEstacionamentoDialog = ({ open, onOpenChange, onSuccess }: CreateEstacionamentoDialogProps) => {
  const { toast } = useToast();
  const { 
    fetchCep, 
    formatCep, 
    validateCepFormat, 
    formatAddress,
    loading: cepLoading, 
    error: cepError 
  } = useCep();
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [timePickerType, setTimePickerType] = useState<'inicio' | 'fim'>('inicio');
  const [cepData, setCepData] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    nome: "",
    endereco: "",
    cep: "",
    descricao: "",
    vagas: "",
    horarioInicio: "",
    horarioFim: "",
    tipo: "",
    cnpj: ""
  });
  
  const [pricing, setPricing] = useState<PricingRow[]>([]);
  const [pricingError, setPricingError] = useState("");

  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para registrar uma vaga.",
        variant: "destructive"
      });
      return;
    }

    // Validate required fields
    const requiredFields = [formData.nome, formData.endereco, formData.cep, formData.vagas, formData.horarioInicio, formData.horarioFim, formData.tipo];
    if (formData.tipo === 'estacionamento') {
      requiredFields.push(formData.cnpj);
    }
    
    if (requiredFields.some(field => !field)) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    // Validate pricing table
    if (pricing.length === 0) {
      setPricingError("Adicione pelo menos uma configuração de preço.");
      return;
    }

    const invalidPricing = pricing.some(row => {
      const horas = parseFloat(row.horas);
      const preco = parseFloat(row.preco);
      return !row.horas || !row.preco || horas <= 0 || preco <= 0;
    });

    if (invalidPricing) {
      setPricingError("Todos os campos de horas e preços devem ser preenchidos com valores positivos.");
      return;
    }

    // Check for duplicate hours
    const horasSet = new Set(pricing.map(row => row.horas));
    if (horasSet.size !== pricing.length) {
      setPricingError("Não é possível ter configurações duplicadas para a mesma quantidade de horas.");
      return;
    }

    setPricingError("");

    setIsSubmitting(true);

    try {
      // First, create the estacionamento record
      const { data: estacionamentoData, error: estacionamentoError } = await supabase
        .from('estacionamento')
        .insert({
          nome: formData.nome,
          endereco: formData.endereco,
          cep: formData.cep,
          descricao: formData.descricao || null,
          numero_vagas: parseInt(formData.vagas),
          preco: 0, // Will be replaced by pricing table
          horario_funcionamento: {
            abertura: formData.horarioInicio,
            fechamento: formData.horarioFim
          },
          user_id: user.id,
          cnpj: formData.tipo === 'estacionamento' ? formData.cnpj : '',
          tipo: formData.tipo
        })
        .select()
        .single();

      if (estacionamentoError) {
        console.error('Error creating estacionamento:', estacionamentoError);
        throw estacionamentoError;
      }

      // Then, create the pricing records using supabase client directly
      if (pricing.length > 0) {
        for (const row of pricing) {
          const { error: pricingError } = await supabase
            .from('estacionamento_precos' as any)
            .insert({
              estacionamento_id: estacionamentoData.id,
              horas: parseInt(row.horas),
              preco: parseFloat(row.preco)
            });

          if (pricingError) {
            console.error('Error creating pricing row:', pricingError);
            // Continue with other rows - estacionamento was created successfully
          }
        }
      }

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
        horarioInicio: "",
        horarioFim: "",
        tipo: "",
        cnpj: ""
      });
      setPricing([]);
      setPricingError("");
      
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error submitting form:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao registrar a vaga. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCepChange = async (value: string) => {
    const formattedCep = formatCep(value);
    handleInputChange("cep", formattedCep);
    
    if (formattedCep.length === 9) {
      // Validar o formato do CEP antes de fazer a requisição
      const validation = validateCepFormat(formattedCep);
      if (!validation.isValid) {
        toast({
          title: "CEP Inválido",
          description: validation.message,
          variant: "destructive"
        });
        return;
      }
      
      const cepData = await fetchCep(formattedCep);
      if (cepData) {
        setCepData(cepData);
        // Usar a função formatAddress para formatar o endereço completo
        handleInputChange("endereco", formatAddress(cepData));
      } else if (cepError) {
        toast({
          title: "Erro",
          description: cepError,
          variant: "destructive"
        });
      }
    }
  };

  const handleVagasChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    handleInputChange("vagas", numericValue);
  };

  const openTimePicker = (type: 'inicio' | 'fim') => {
    setTimePickerType(type);
    setTimePickerOpen(true);
  };

  const handleTimeSelect = (time: string) => {
    if (timePickerType === 'inicio') {
      handleInputChange("horarioInicio", time);
    } else {
      handleInputChange("horarioFim", time);
    }
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
              <Label htmlFor="create-nome">Nome da Vaga</Label>
              <Input
                id="create-nome"
                placeholder="Ex: Vaga Residencial Centro"
                value={formData.nome}
                onChange={(e) => handleInputChange("nome", e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="create-tipo">Tipo de Vaga</Label>
              <Select value={formData.tipo} onValueChange={(value) => handleInputChange("tipo", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residencial">Residencial</SelectItem>
                  <SelectItem value="estacionamento">Estacionamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-endereco" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Endereço
            </Label>
            <Input
              id="create-endereco"
              placeholder="Rua, número, bairro"
              value={formData.endereco}
              onChange={(e) => handleInputChange("endereco", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-cep">CEP</Label>
              <Input
                id="create-cep"
                placeholder="00000-000"
                value={formData.cep}
                onChange={(e) => handleCepChange(e.target.value)}
                required
                disabled={cepLoading}
              />
              {cepError && (
                <p className="text-sm text-destructive">{cepError}</p>
              )}
              {cepData && (
                <p className="text-sm text-muted-foreground">
                  {cepData.localidade} - {cepData.uf}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="create-vagas">Número de Vagas</Label>
              <Input
                id="create-vagas"
                placeholder="1"
                value={formData.vagas}
                onChange={(e) => handleVagasChange(e.target.value)}
                required
              />
            </div>
          </div>

          {formData.tipo === 'estacionamento' && (
            <div className="space-y-2">
              <Label htmlFor="create-cnpj">CNPJ</Label>
              <Input
                id="create-cnpj"
                placeholder="00.000.000/0001-00"
                value={formData.cnpj}
                onChange={(e) => handleInputChange("cnpj", e.target.value)}
                required
              />
            </div>
          )}

          <PricingTable 
            pricing={pricing}
            onChange={setPricing}
            error={pricingError}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Horário de Início
              </Label>
              <Button
                type="button"
                variant="outline"
                onClick={() => openTimePicker('inicio')}
                className="w-full justify-start text-left font-normal"
              >
                <Clock className="mr-2 h-4 w-4" />
                {formData.horarioInicio || "Selecionar horário"}
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label>Horário de Fim</Label>
              <Button
                type="button"
                variant="outline"
                onClick={() => openTimePicker('fim')}
                className="w-full justify-start text-left font-normal"
              >
                <Clock className="mr-2 h-4 w-4" />
                {formData.horarioFim || "Selecionar horário"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-descricao">Descrição Adicional</Label>
            <Textarea
              id="create-descricao"
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
            <Button 
              type="submit" 
              className="flex-1 bg-spatioo-green hover:bg-spatioo-green/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Registrando..." : "Registrar Vaga"}
            </Button>
          </div>
        </form>
      </DialogContent>
      
      <TimePickerDialog
        open={timePickerOpen}
        onOpenChange={setTimePickerOpen}
        value={timePickerType === 'inicio' ? formData.horarioInicio : formData.horarioFim}
        onTimeSelect={handleTimeSelect}
        title={timePickerType === 'inicio' ? 'Horário de Início' : 'Horário de Fim'}
      />
    </Dialog>
  );
};

export default CreateEstacionamentoDialog;