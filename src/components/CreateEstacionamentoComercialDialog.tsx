import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Clock, DollarSign, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCep } from "@/hooks/useCep";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import TimePickerDialog from "@/components/TimePickerDialog";
import PricingTable, { PricingRow } from "@/components/PricingTable";

/**
 * @interface CreateEstacionamentoComercialDialogProps
 * @description Propriedades para o componente de criação de estacionamento comercial.
 */
interface CreateEstacionamentoComercialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

/**
 * @component CreateEstacionamentoComercialDialog
 * @description Formulário para registrar um novo estacionamento comercial com CNPJ e comodidades.
 */
const CreateEstacionamentoComercialDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: CreateEstacionamentoComercialDialogProps) => {
  const { toast } = useToast();
  const {
    fetchCep,
    formatCep,
    validateCepFormat,
    loading: cepLoading,
    error: cepError,
  } = useCep();

  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [timePickerType, setTimePickerType] = useState<"inicio" | "fim">("inicio");
  const [cepData, setCepData] = useState<any>(null);

  // Estado para armazenar os dados do formulário
  const [formData, setFormData] = useState({
    nome: "",
    cnpj: "",
    endereco: "",
    numero: "",
    cep: "",
    descricao: "",
    vagas: "",
    horarioInicio: "",
    horarioFim: "",
    horaExtra: "",
  });

  // Estado para comodidades do estacionamento comercial
  const [comodidades, setComodidades] = useState({
    funcionamento_24h: false,
    suporte_carro_eletrico: false,
    vaga_coberta: false,
    manobrista: false,
    suporte_caminhao: false,
    vaga_moto: false,
  });

  const [enderecoDisabled, setEnderecoDisabled] = useState(false);
  const [pricing, setPricing] = useState<PricingRow[]>([]);
  const [pricingError, setPricingError] = useState("");
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * @function formatCNPJ
   * @description Formata o CNPJ no padrão 00.000.000/0000-00
   */
  const formatCNPJ = (value: string) => {
    const numericValue = value.replace(/\D/g, "").substring(0, 14);
    
    if (numericValue.length <= 2) return numericValue;
    if (numericValue.length <= 5) return `${numericValue.slice(0, 2)}.${numericValue.slice(2)}`;
    if (numericValue.length <= 8) return `${numericValue.slice(0, 2)}.${numericValue.slice(2, 5)}.${numericValue.slice(5)}`;
    if (numericValue.length <= 12) return `${numericValue.slice(0, 2)}.${numericValue.slice(2, 5)}.${numericValue.slice(5, 8)}/${numericValue.slice(8)}`;
    return `${numericValue.slice(0, 2)}.${numericValue.slice(2, 5)}.${numericValue.slice(5, 8)}/${numericValue.slice(8, 12)}-${numericValue.slice(12, 14)}`;
  };

  /**
   * @function validatePricingTable
   * @description Valida se a tabela de preços está correta
   */
  const validatePricingTable = () => {
    const hasOneHour = pricing.some((row) => parseInt(row.horas) === 1);
    if (!hasOneHour) {
      setPricingError("É obrigatório ter pelo menos um valor configurado para 1 hora de estacionamento.");
      return false;
    }

    if (!formData.horaExtra || parseFloat(formData.horaExtra) <= 0) {
      setPricingError("É obrigatório definir o valor da hora extra.");
      return false;
    }

    if (pricing.length === 0) {
      setPricingError("Adicione pelo menos uma configuração de preço.");
      return false;
    }

    const invalidPricing = pricing.some(
      (row) => !row.horas || !row.preco || parseFloat(row.horas) <= 0 || parseFloat(row.preco) <= 0
    );
    if (invalidPricing) {
      setPricingError("Todos os campos de horas e preços devem ser preenchidos com valores positivos.");
      return false;
    }

    const horasSet = new Set(pricing.map((row) => row.horas));
    if (horasSet.size !== pricing.length) {
      setPricingError("Não é possível ter configurações duplicadas para a mesma quantidade de horas.");
      return false;
    }

    setPricingError("");
    return true;
  };

  /**
   * @function handleSubmit
   * @description Submete o formulário e cria um novo estacionamento comercial
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para registrar um estacionamento.",
        variant: "destructive",
      });
      return;
    }

    // Validação de campos obrigatórios
    // Se funcionamento 24h estiver ativado, horários serão definidos automaticamente
    const requiredFields = comodidades.funcionamento_24h
      ? [formData.nome, formData.cnpj, formData.endereco, formData.numero, formData.cep, formData.vagas, formData.horaExtra]
      : [formData.nome, formData.cnpj, formData.endereco, formData.numero, formData.cep, formData.vagas, formData.horarioInicio, formData.horarioFim, formData.horaExtra];

    if (requiredFields.some((field) => !field)) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Validação do CNPJ (deve ter 14 dígitos)
    const cnpjNumerico = formData.cnpj.replace(/\D/g, "");
    if (cnpjNumerico.length !== 14) {
      toast({
        title: "Erro",
        description: "CNPJ deve conter 14 dígitos.",
        variant: "destructive",
      });
      return;
    }

    if (!validatePricingTable()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Define horários para funcionamento 24h se a opção estiver marcada
      const horarioFuncionamento = comodidades.funcionamento_24h
        ? { abertura: "00:00", fechamento: "23:59" }
        : { abertura: formData.horarioInicio, fechamento: formData.horarioFim };

      // Insere o novo estacionamento comercial no banco de dados
      const { data: estacionamentoData, error: estacionamentoError } = await supabase
        .from("estacionamento")
        .insert({
          nome: formData.nome,
          cnpj: formData.cnpj,
          endereco: `${formData.endereco}, ${formData.numero}`,
          cep: formData.cep,
          descricao: formData.descricao || null,
          numero_vagas: parseInt(formData.vagas),
          preco: 0,
          horario_funcionamento: horarioFuncionamento,
          user_id: user.id,
          tipo: "comercial",
          hora_extra: parseFloat(formData.horaExtra),
          // Comodidades do estacionamento comercial
          funcionamento_24h: comodidades.funcionamento_24h,
          suporte_carro_eletrico: comodidades.suporte_carro_eletrico,
          vaga_coberta: comodidades.vaga_coberta,
          manobrista: comodidades.manobrista,
          suporte_caminhao: comodidades.suporte_caminhao,
          vaga_moto: comodidades.vaga_moto,
        })
        .select()
        .single();

      if (estacionamentoError) throw estacionamentoError;

      // Insere os registros da tabela de preços
      if (pricing.length > 0) {
        for (const row of pricing) {
          await supabase.from("estacionamento_precos" as any).insert({
            estacionamento_id: estacionamentoData.id,
            horas: parseInt(row.horas),
            preco: parseFloat(row.preco),
          });
        }
      }

      toast({
        title: "Estacionamento cadastrado!",
        description: "Seu estacionamento comercial foi registrado com sucesso.",
      });

      // Reseta o formulário
      setFormData({
        nome: "",
        cnpj: "",
        endereco: "",
        numero: "",
        cep: "",
        descricao: "",
        vagas: "",
        horarioInicio: "",
        horarioFim: "",
        horaExtra: "",
      });
      setComodidades({
        funcionamento_24h: false,
        suporte_carro_eletrico: false,
        vaga_coberta: false,
        manobrista: false,
        suporte_caminhao: false,
        vaga_moto: false,
      });
      setCepData(null);
      setEnderecoDisabled(false);
      setPricing([]);
      setPricingError("");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Erro ao submeter formulário:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao registrar o estacionamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCNPJChange = (value: string) => {
    const formatted = formatCNPJ(value);
    handleInputChange("cnpj", formatted);
  };

  const handleHoraExtraChange = (value: string) => {
    const numericValue = value.replace(/[^0-9.,]/g, "").replace(",", ".");
    const parts = numericValue.split(".");
    if (parts.length > 2) parts.length = 2;
    if (parts[1] && parts[1].length > 2) parts[1] = parts[1].substring(0, 2);
    const formattedValue = parts.join(".");
    handleInputChange("horaExtra", formattedValue);
  };

  const handleCepChange = async (value: string) => {
    const formattedCep = formatCep(value);
    handleInputChange("cep", formattedCep);

    if (formattedCep.length === 9 && validateCepFormat(formattedCep).isValid) {
      const cepData = await fetchCep(formattedCep);
      if (cepData) {
        setCepData(cepData);
        handleInputChange(
          "endereco",
          `${cepData.logradouro}, ${cepData.bairro}, ${cepData.localidade} - ${cepData.uf}`
        );
        setEnderecoDisabled(true);
      } else if (cepError) {
        toast({ title: "Erro", description: cepError, variant: "destructive" });
      }
    } else {
      setEnderecoDisabled(false);
      setCepData(null);
    }
  };

  const handleVagasChange = (value: string) => {
    handleInputChange("vagas", value.replace(/\D/g, ""));
  };

  const openTimePicker = (type: "inicio" | "fim") => {
    setTimePickerType(type);
    setTimePickerOpen(true);
  };

  const handleTimeSelect = (time: string) => {
    handleInputChange(timePickerType === "inicio" ? "horarioInicio" : "horarioFim", time);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-spatioo-green" />
              Adicionar Novo Estacionamento Comercial
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do seu estacionamento comercial
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome do Estacionamento */}
            <div className="space-y-2">
              <Label htmlFor="comercial-nome">Nome do Estacionamento *</Label>
              <Input
                id="comercial-nome"
                placeholder="Ex.: Estacionamento Central"
                value={formData.nome}
                onChange={(e) => handleInputChange("nome", e.target.value)}
                required
              />
            </div>

            {/* CNPJ */}
            <div className="space-y-2">
              <Label htmlFor="comercial-cnpj">CNPJ *</Label>
              <Input
                id="comercial-cnpj"
                placeholder="00.000.000/0000-00"
                value={formData.cnpj}
                onChange={(e) => handleCNPJChange(e.target.value)}
                required
                maxLength={18}
              />
              <p className="text-xs text-muted-foreground">Digite apenas números (14 dígitos)</p>
            </div>

            {/* CEP */}
            <div className="space-y-2">
              <Label htmlFor="comercial-cep">CEP *</Label>
              <Input
                id="comercial-cep"
                placeholder="00000-000"
                value={formData.cep}
                onChange={(e) => handleCepChange(e.target.value)}
                required
                disabled={cepLoading}
              />
              {cepError && <p className="text-sm text-destructive">{cepError}</p>}
              {cepData && (
                <p className="text-sm text-muted-foreground">
                  {cepData.localidade} - {cepData.uf}
                </p>
              )}
            </div>

            {/* Endereço */}
            <div className="space-y-2">
              <Label htmlFor="comercial-endereco" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Endereço *
              </Label>
              <Input
                id="comercial-endereco"
                placeholder="Será preenchido automaticamente pelo CEP"
                value={formData.endereco}
                onChange={(e) => handleInputChange("endereco", e.target.value)}
                required
                disabled={enderecoDisabled}
                className={enderecoDisabled ? "bg-muted" : ""}
              />
            </div>

            {/* Número e Total de Vagas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="comercial-numero">Número *</Label>
                <Input
                  id="comercial-numero"
                  placeholder="123"
                  value={formData.numero}
                  onChange={(e) => handleInputChange("numero", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comercial-vagas">Total de Vagas *</Label>
                <Input
                  id="comercial-vagas"
                  placeholder="50"
                  value={formData.vagas}
                  onChange={(e) => handleVagasChange(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Tabela de Preços */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Configuração de Preços *
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                Configure pelo menos o valor de 1 hora (obrigatório). Para períodos não cadastrados, será aplicado o valor da hora extra.
              </p>
              <PricingTable pricing={pricing} onChange={setPricing} error={pricingError} />
            </div>

            {/* Valor da Hora Extra */}
            <div className="space-y-2">
              <Label htmlFor="comercial-hora-extra" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Valor da Hora Extra (R$) *
              </Label>
              <Input
                id="comercial-hora-extra"
                placeholder="Ex: 5.00"
                value={formData.horaExtra}
                onChange={(e) => handleHoraExtraChange(e.target.value)}
                required
              />
            </div>

            {/* Horário de Funcionamento */}
            <div className="space-y-4">
              {/* Checkbox Funcionamento 24h */}
              <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                <Checkbox
                  id="comercial-funcionamento-24h"
                  checked={comodidades.funcionamento_24h}
                  onCheckedChange={(checked) =>
                    setComodidades((prev) => ({ ...prev, funcionamento_24h: checked as boolean }))
                  }
                />
                <Label htmlFor="comercial-funcionamento-24h" className="cursor-pointer font-medium">
                  Funcionamento 24 horas
                </Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Horário de Abertura *
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => openTimePicker("inicio")}
                    className="w-full justify-start text-left font-normal"
                    disabled={comodidades.funcionamento_24h}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {comodidades.funcionamento_24h ? "00:00" : (formData.horarioInicio || "Selecionar horário")}
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Horário de Fechamento *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => openTimePicker("fim")}
                    className="w-full justify-start text-left font-normal"
                    disabled={comodidades.funcionamento_24h}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {comodidades.funcionamento_24h ? "23:59" : (formData.horarioFim || "Selecionar horário")}
                  </Button>
                </div>
              </div>
            </div>

            {/* Comodidades */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Comodidades do Estacionamento</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="func-24h"
                    checked={comodidades.funcionamento_24h}
                    onCheckedChange={(checked) =>
                      setComodidades((prev) => ({ ...prev, funcionamento_24h: checked as boolean }))
                    }
                  />
                  <Label htmlFor="func-24h" className="cursor-pointer font-normal">
                    Funcionamento 24h
                  </Label>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="suporte-eletrico"
                    checked={comodidades.suporte_carro_eletrico}
                    onCheckedChange={(checked) =>
                      setComodidades((prev) => ({ ...prev, suporte_carro_eletrico: checked as boolean }))
                    }
                  />
                  <Label htmlFor="suporte-eletrico" className="cursor-pointer font-normal">
                    Suporte a carro elétrico
                  </Label>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="vaga-coberta"
                    checked={comodidades.vaga_coberta}
                    onCheckedChange={(checked) =>
                      setComodidades((prev) => ({ ...prev, vaga_coberta: checked as boolean }))
                    }
                  />
                  <Label htmlFor="vaga-coberta" className="cursor-pointer font-normal">
                    Vaga coberta
                  </Label>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="manobrista"
                    checked={comodidades.manobrista}
                    onCheckedChange={(checked) =>
                      setComodidades((prev) => ({ ...prev, manobrista: checked as boolean }))
                    }
                  />
                  <Label htmlFor="manobrista" className="cursor-pointer font-normal">
                    Manobrista
                  </Label>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="suporte-caminhao"
                    checked={comodidades.suporte_caminhao}
                    onCheckedChange={(checked) =>
                      setComodidades((prev) => ({ ...prev, suporte_caminhao: checked as boolean }))
                    }
                  />
                  <Label htmlFor="suporte-caminhao" className="cursor-pointer font-normal">
                    Suporte a caminhão
                  </Label>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="vaga-moto"
                    checked={comodidades.vaga_moto}
                    onCheckedChange={(checked) =>
                      setComodidades((prev) => ({ ...prev, vaga_moto: checked as boolean }))
                    }
                  />
                  <Label htmlFor="vaga-moto" className="cursor-pointer font-normal">
                    Vaga para motos
                  </Label>
                </div>
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="comercial-descricao">Descrição Adicional</Label>
              <Textarea
                id="comercial-descricao"
                placeholder="Informações extras sobre o estacionamento (opcional)"
                value={formData.descricao}
                onChange={(e) => handleInputChange("descricao", e.target.value)}
                rows={3}
              />
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1" disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1 bg-spatioo-green hover:bg-spatioo-green/90 text-black" disabled={isSubmitting}>
                {isSubmitting ? "Cadastrando..." : "Cadastrar Estacionamento"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <TimePickerDialog 
        open={timePickerOpen} 
        onOpenChange={setTimePickerOpen} 
        onTimeSelect={handleTimeSelect}
        value={timePickerType === "inicio" ? formData.horarioInicio : formData.horarioFim}
        title={timePickerType === "inicio" ? "Selecionar Horário de Abertura" : "Selecionar Horário de Fechamento"}
      />
    </>
  );
};

export default CreateEstacionamentoComercialDialog;
