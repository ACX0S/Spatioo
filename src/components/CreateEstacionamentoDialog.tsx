import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Clock, DollarSign, Car } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCep } from "@/hooks/useCep";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import TimePickerDialog from "@/components/TimePickerDialog";
import PricingTable, { PricingRow } from "@/components/PricingTable";

/**
 * @interface CreateEstacionamentoDialogProps
 * @description Propriedades para o componente CreateEstacionamentoDialog.
 * @param open - Controla a visibilidade do diálogo.
 * @param onOpenChange - Função para atualizar o estado de visibilidade.
 * @param onSuccess - Callback opcional executado após o sucesso do registro.
 */
interface CreateEstacionamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

/**
 * @component CreateEstacionamentoDialog
 * @description Um diálogo com um formulário completo para registrar um novo estacionamento (residencial ou comercial).
 *
 * Este componente é responsável por gerenciar o formulário de registro de estacionamento,
 * incluindo a validação de campos, a busca de CEP e a inserção de dados no banco de dados.
 */
const CreateEstacionamentoDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: CreateEstacionamentoDialogProps) => {
  // Hook para exibir notificações ao usuário.
  const { toast } = useToast();

  // Hook para buscar informações de CEP.
  const {
    fetchCep,
    formatCep,
    validateCepFormat,
    loading: cepLoading,
    error: cepError,
  } = useCep();

  // Estados para controle de componentes internos e dados do formulário.
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [timePickerType, setTimePickerType] = useState<"inicio" | "fim">(
    "inicio"
  );
  const [cepData, setCepData] = useState<any>(null);

  // Estado para armazenar os dados do formulário com tipo definido como residencial.
  const [formData, setFormData] = useState({
    nome: "",
    endereco: "",
    numero: "",
    cep: "",
    descricao: "",
    vagas: "",
    horarioInicio: "",
    horarioFim: "",
    tipo: "residencial", // Tipo fixo como residencial, não mais selecionável
    horaExtra: "", // Valor para hora adicional quando não há preço específico cadastrado
  });

  // Estado para controlar a edição do campo de endereço.
  const [enderecoDisabled, setEnderecoDisabled] = useState(false);

  // Estado para a tabela de preços.
  const [pricing, setPricing] = useState<PricingRow[]>([]);
  const [pricingError, setPricingError] = useState("");

  // Hook de autenticação para obter o usuário logado.
  const { user } = useAuth();

  // Estado para controlar o status de submissão.
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * @function validatePricingTable
   * @description Valida se a tabela de preços tem pelo menos o valor de 1 hora e hora extra.
   */
  const validatePricingTable = () => {
    // Verifica se existe pelo menos uma configuração de 1 hora
    const hasOneHour = pricing.some((row) => parseInt(row.horas) === 1);
    if (!hasOneHour) {
      setPricingError(
        "É obrigatório ter pelo menos um valor configurado para 1 hora de estacionamento."
      );
      return false;
    }

    // Verifica se o campo hora extra está preenchido
    if (!formData.horaExtra || parseFloat(formData.horaExtra) <= 0) {
      setPricingError("É obrigatório definir o valor da hora extra.");
      return false;
    }

    // Validações existentes
    if (pricing.length === 0) {
      setPricingError("Adicione pelo menos uma configuração de preço.");
      return false;
    }
    const invalidPricing = pricing.some(
      (row) =>
        !row.horas ||
        !row.preco ||
        parseFloat(row.horas) <= 0 ||
        parseFloat(row.preco) <= 0
    );
    if (invalidPricing) {
      setPricingError(
        "Todos os campos de horas e preços devem ser preenchidos com valores positivos."
      );
      return false;
    }
    const horasSet = new Set(pricing.map((row) => row.horas));
    if (horasSet.size !== pricing.length) {
      setPricingError(
        "Não é possível ter configurações duplicadas para a mesma quantidade de horas."
      );
      return false;
    }

    setPricingError("");
    return true;
  };
  /**
   * @function handleSubmit
   * @description Lida com a submissão do formulário, valida os dados e envia para o Supabase.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para registrar uma vaga.",
        variant: "destructive",
      });
      return;
    }

    // Validação de campos obrigatórios (sem campos específicos de estacionamento).
    const requiredFields = [
      formData.endereco,
      formData.numero,
      formData.cep,
      formData.vagas,
      formData.horarioInicio,
      formData.horarioFim,
      formData.horaExtra,
    ];
    if (requiredFields.some((field) => !field)) {
      toast({
        title: "Erro",
        description:
          "Por favor, preencha todos os campos obrigatórios, incluindo o valor da hora extra.",
        variant: "destructive",
      });
      return;
    }

    // Validação da tabela de preços com as novas regras.
    if (!validatePricingTable()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Gera o nome do estacionamento com base no tipo.
      const nomeToSave =
        formData.tipo === "residencial"
          ? cepData
            ? `${cepData.logradouro}, ${formData.numero} - ${cepData.bairro}`
            : `${formData.endereco}, ${formData.numero}`
          : formData.nome;

      // Insere o novo estacionamento no banco de dados incluindo hora_extra.
      const { data: estacionamentoData, error: estacionamentoError } =
        await supabase
          .from("estacionamento")
          .insert({
            nome: nomeToSave,
            endereco: `${formData.endereco}, ${formData.numero}`,
            cep: formData.cep,
            descricao: formData.descricao || null,
            numero_vagas: parseInt(formData.vagas),
            preco: 0, // O preço base é 0, pois será usado a tabela de preços.
            horario_funcionamento: {
              abertura: formData.horarioInicio,
              fechamento: formData.horarioFim,
            },
            user_id: user.id,
            cnpj: "", // CNPJ vazio para vagas residenciais
            tipo: formData.tipo,
            hora_extra: parseFloat(formData.horaExtra), // Adiciona o valor da hora extra
          })
          .select()
          .single();

      if (estacionamentoError) throw estacionamentoError;

      // Insere os registros da tabela de preços.
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
        title: "Vaga registrada!",
        description: "Sua vaga foi registrada com sucesso.",
      });

      // Reseta o formulário e fecha o diálogo.
      setFormData({
        nome: "",
        endereco: "",
        numero: "",
        cep: "",
        descricao: "",
        vagas: "",
        horarioInicio: "",
        horarioFim: "",
        tipo: "residencial",
        horaExtra: "",
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
        description:
          error.message || "Erro ao registrar a vaga. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Funções para lidar com mudanças nos inputs.
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * @function handleHoraExtraChange
   * @description Permite apenas valores numéricos com até 2 casas decimais para hora extra.
   */
  const handleHoraExtraChange = (value: string) => {
    // Permite apenas números e ponto decimal
    const numericValue = value.replace(/[^0-9.,]/g, "").replace(",", ".");
    // Limita a 2 casas decimais
    const parts = numericValue.split(".");
    if (parts.length > 2) {
      parts.length = 2;
    }
    if (parts[1] && parts[1].length > 2) {
      parts[1] = parts[1].substring(0, 2);
    }
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
    handleInputChange(
      timePickerType === "inicio" ? "horarioInicio" : "horarioFim",
      time
    );
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
          {/* Tipo de vaga definido automaticamente como "residencial" */}

          {/* Campos de Endereço */}
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
            {cepError && <p className="text-sm text-destructive">{cepError}</p>}
            {cepData && (
              <p className="text-sm text-muted-foreground">
                {cepData.localidade} - {cepData.uf}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="create-endereco"
              className="flex items-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              Endereço
            </Label>
            <Input
              id="create-endereco"
              placeholder="Será preenchido automaticamente pelo CEP"
              value={formData.endereco}
              onChange={(e) => handleInputChange("endereco", e.target.value)}
              required
              disabled={enderecoDisabled}
              className={enderecoDisabled ? "bg-muted" : ""}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-numero">Número</Label>
              <Input
                id="create-numero"
                placeholder="123"
                value={formData.numero}
                onChange={(e) => handleInputChange("numero", e.target.value)}
                required
              />
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

          {/* Tabela de Preços */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Configuração de Preços *
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              Configure pelo menos o valor de 1 hora (obrigatório). Para
              períodos não cadastrados, será aplicado o valor da hora extra.
            </p>
            <PricingTable
              pricing={pricing}
              onChange={setPricing}
              error={pricingError}
            />
          </div>
          
          {/* Campo obrigatório para Hora Extra */}
          <div>
            <Label
              htmlFor="create-hora-extra"
              className="flex items-center gap-2 mb-2"
            >
              <DollarSign className="h-4 w-4" />
              Valor da Hora Extra *
            </Label>
            <Input
              id="create-hora-extra"
              placeholder="Ex: 5.00"
              value={formData.horaExtra}
              onChange={(e) => handleHoraExtraChange(e.target.value)}
              required
            />
          </div>

          {/* Seletores de Horário */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Horário de Abertura
              </Label>
              <Button
                type="button"
                variant="outline"
                onClick={() => openTimePicker("inicio")}
                className="w-full justify-start text-left font-normal"
              >
                <Clock className="mr-2 h-4 w-4" />
                {formData.horarioInicio || "Selecionar horário"}
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Horário de Fechamento</Label>
              <Button
                type="button"
                variant="outline"
                onClick={() => openTimePicker("fim")}
                className="w-full justify-start text-left font-normal"
              >
                <Clock className="mr-2 h-4 w-4" />
                {formData.horarioFim || "Selecionar horário"}
              </Button>
            </div>
          </div>

          {/* Descrição Adicional */}
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

          {/* Botões de Ação */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
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

      {/* Diálogo para selecionar a hora */}
      <TimePickerDialog
        open={timePickerOpen}
        onOpenChange={setTimePickerOpen}
        value={
          timePickerType === "inicio"
            ? formData.horarioInicio
            : formData.horarioFim
        }
        onTimeSelect={handleTimeSelect}
        title={
          timePickerType === "inicio"
            ? "Horário de Abertura"
            : "Horário de Fechamento"
        }
      />
    </Dialog>
  );
};

export default CreateEstacionamentoDialog;
