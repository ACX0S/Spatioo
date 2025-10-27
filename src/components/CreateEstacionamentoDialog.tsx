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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Clock, DollarSign} from "lucide-react";
import { FaCar } from 'react-icons/fa';
import { useToast } from "@/hooks/use-toast";
import { useCep } from "@/hooks/useCep";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useGeocoding } from "@/hooks/useGeocoding";
import TimePickerDialog from "@/components/TimePickerDialog";
import PricingTable, { PricingRow } from "@/components/PricingTable";
import { uploadEstacionamentoPhoto } from "@/services/storageService";
import { Upload, X, Image as ImageIcon } from "lucide-react";

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

  // Hook para geocodificação automática
  const { geocodeCep, geocodeAddress, loading: geocodingLoading } = useGeocoding();

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
    horaExtraNumeric: 0, // Valor numérico para salvar no banco
    funcionamento_24h: false, // Opção de funcionamento 24 horas
    largura_vaga: "", // Largura da vaga em metros
    comprimento_vaga: "", // Comprimento da vaga em metros
  });

  // Estado para upload de fotos
  const [photos, setPhotos] = useState<File[]>([]);
  const [photosPreviews, setPhotosPreviews] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  // Comodidades não são necessárias para vagas residenciais

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
    // Se funcionamento 24h estiver ativado, horários serão definidos automaticamente
    const requiredFields = formData.funcionamento_24h
      ? [
          formData.endereco,
          formData.numero,
          formData.cep,
          formData.vagas,
        ]
      : [
          formData.endereco,
          formData.numero,
          formData.cep,
          formData.vagas,
          formData.horarioInicio,
          formData.horarioFim,
        ];

    if (requiredFields.some((field) => !field)) {
      toast({
        title: "Erro",
        description:
          "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Validação de fotos (obrigatório no mínimo 2)
    if (photos.length < 2) {
      toast({
        title: "Erro",
        description: "Adicione no mínimo 2 fotos da vaga.",
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
      // Upload das fotos primeiro
      setUploadingPhotos(true);
      const uploadedPhotoUrls: string[] = [];
      
      for (const photo of photos) {
        try {
          const url = await uploadEstacionamentoPhoto(photo, user.id);
          uploadedPhotoUrls.push(url);
        } catch (error) {
          console.error("Erro ao fazer upload da foto:", error);
          toast({
            title: "Erro no upload",
            description: "Erro ao fazer upload de uma das fotos.",
            variant: "destructive",
          });
          setUploadingPhotos(false);
          setIsSubmitting(false);
          return;
        }
      }
      setUploadingPhotos(false);

      // Gera o nome do estacionamento com base no tipo.
      const nomeToSave =
        formData.tipo === "residencial"
          ? cepData
            ? `${cepData.logradouro}, ${formData.numero} - ${cepData.bairro}`
            : `${formData.endereco}, ${formData.numero}`
          : formData.nome;

      // Define horários para funcionamento 24h se a opção estiver marcada
      const horarioFuncionamento = formData.funcionamento_24h
        ? { abertura: "00:00", fechamento: "23:59" }
        : { abertura: formData.horarioInicio, fechamento: formData.horarioFim };

      // Geocodifica o endereço completo (CEP + número) para obter coordenadas precisas
      let coordinates = null;
      try {
        const fullAddress = cepData 
          ? `${cepData.logradouro}, ${formData.numero}, ${cepData.bairro}, ${cepData.localidade}, ${cepData.uf}, Brasil`
          : `${formData.endereco}, ${formData.numero}, Brasil`;
        
        coordinates = await geocodeAddress(fullAddress);
        
        if (!coordinates) {
          console.warn('Tentando geocodificar apenas com CEP...');
          coordinates = await geocodeCep(formData.cep);
        }
        
        if (coordinates) {
          console.log('Coordenadas obtidas:', coordinates);
        } else {
          console.warn('Não foi possível geocodificar o endereço. Continuando sem coordenadas.');
        }
      } catch (error) {
        console.error('Erro ao geocodificar:', error);
      }

      // Insere o novo estacionamento no banco de dados incluindo hora_extra, funcionamento_24h e coordenadas
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
            horario_funcionamento: horarioFuncionamento,
            user_id: user.id,
            cnpj: "", // CNPJ vazio para vagas residenciais
            tipo: formData.tipo,
            fotos: uploadedPhotoUrls,
            hora_extra: formData.horaExtraNumeric > 0 ? formData.horaExtraNumeric : null,
            funcionamento_24h: formData.funcionamento_24h, // Marca se funciona 24h
            latitude: coordinates?.latitude || null,
            longitude: coordinates?.longitude || null,
            largura_vaga: formData.largura_vaga ? parseFloat(formData.largura_vaga) : null,
            comprimento_vaga: formData.comprimento_vaga ? parseFloat(formData.comprimento_vaga) : null,
            // Vagas residenciais não possuem outras comodidades
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

      // Atualiza o perfil do usuário para marcar como dono de estacionamento
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ dono_estacionamento: true })
        .eq("id", user.id);

      if (profileError) {
        console.error("Erro ao atualizar perfil:", profileError);
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
        horaExtraNumeric: 0,
        funcionamento_24h: false,
        largura_vaga: "",
        comprimento_vaga: "",
      });
      setPhotos([]);
      setPhotosPreviews([]);
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
   * @description Formata o valor da hora extra como moeda brasileira e armazena o valor numérico
   */
  const handleHoraExtraChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    if (numericValue === "") {
      handleInputChange("horaExtra", "");
      setFormData((prev) => ({ ...prev, horaExtraNumeric: 0 }));
      return;
    }
    const cents = Number.parseInt(numericValue, 10) / 100;
    const formattedValue = cents.toLocaleString('pt-BR', {
      style: "currency",
      currency: "BRL",
    });
    handleInputChange("horaExtra", formattedValue);
    setFormData((prev) => ({ ...prev, horaExtraNumeric: cents }));
  };

  /**
   * @function handlePhotoSelect
   * @description Manipula a seleção de fotos para upload
   */
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    
    // Validação de tamanho (máx 100MB por foto)
    const oversizedFiles = newFiles.filter(file => file.size > 100 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast({
        title: "Erro",
        description: "Cada foto deve ter no máximo 100MB.",
        variant: "destructive",
      });
      return;
    }

    // Limitar a 10 fotos no total
    if (photos.length + newFiles.length > 10) {
      toast({
        title: "Erro",
        description: "Você pode adicionar no máximo 10 fotos.",
        variant: "destructive",
      });
      return;
    }

    // Adiciona as novas fotos
    setPhotos(prev => [...prev, ...newFiles]);

    // Cria previews
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotosPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  /**
   * @function removePhoto
   * @description Remove uma foto da lista
   */
  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotosPreviews(prev => prev.filter((_, i) => i !== index));
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
            <FaCar className="h-5 w-5 text-spatioo-green" />
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
              <DollarSign className="h-4 w-4 dark:text-spatioo-green" />
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

          {/* Campo opcional para Hora Extra */}
          <div>
            <Label
              htmlFor="create-hora-extra"
              className="flex items-center gap-2 mb-2"
            >
              <DollarSign className="h-4 w-4 dark:text-spatioo-green" />
              Valor da Hora Extra
            </Label>
            <Input
              id="create-hora-extra"
              placeholder="Ex: 5.00"
              value={formData.horaExtra}
              onChange={(e) => handleHoraExtraChange(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Opcional. Valor cobrado por hora adicional quando não há preço específico cadastrado.
            </p>
          </div>

          {/* Upload de Fotos */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-spatioo-green" />
              Fotos da Vaga *
            </Label>
            <div className="space-y-3">
              <div className="flex items-center justify-center w-full">
                <label htmlFor="residencial-photo-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="mb-1 text-sm text-muted-foreground">
                      <span className="font-semibold">Clique para adicionar</span> ou arraste as fotos
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG até 5MB (máx. 10 fotos)</p>
                  </div>
                  <input
                    id="residencial-photo-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoSelect}
                  />
                </label>
              </div>

              {/* Preview das fotos */}
              {photosPreviews.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {photosPreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {photos.length === 0 && (
                <p className="text-sm text-destructive">* Adicione pelo menos uma foto da vaga</p>
              )}
            </div>
          </div>

          {/* Seletores de Horário */}
          <div className="space-y-4">
            {/* Checkbox Funcionamento 24h */}
            <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
              <Checkbox
                id="funcionamento-24h"
                checked={formData.funcionamento_24h}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    funcionamento_24h: checked as boolean,
                  }))
                }
              />
              <Label
                htmlFor="funcionamento-24h"
                className="cursor-pointer font-medium"
              >
                Funcionamento 24 horas
              </Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4 m-1 ml-0 dark:text-spatioo-green " />
                  Horário de Abertura
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => openTimePicker("inicio")}
                  className="w-full justify-start text-left font-normal"
                  disabled={formData.funcionamento_24h}
                >
                  {formData.funcionamento_24h
                    ? "00:00"
                    : formData.horarioInicio || "Selecionar horário"}
                </Button>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4 m-1 ml-0 dark:text-spatioo-green" />
                  Horário de Fechamento
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => openTimePicker("fim")}
                  className="w-full justify-start text-left font-normal"
                  disabled={formData.funcionamento_24h}
                >
                  {formData.funcionamento_24h
                    ? "23:59"
                    : formData.horarioFim || "Selecionar horário"}
                </Button>
              </div>
            </div>
          </div>

          {/* Dimensões da Vaga */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FaCar className="h-4 w-4 text-spatioo-green" />
              Dimensões da Vaga *
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="largura-vaga" className="text-sm text-muted-foreground">
                  Largura (metros)
                </Label>
                <Input
                  id="largura-vaga"
                  type="number"
                  step="0.1"
                  min="1.5"
                  max="5"
                  placeholder="Ex: 2.5"
                  value={formData.largura_vaga}
                  onChange={(e) => handleInputChange("largura_vaga", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comprimento-vaga" className="text-sm text-muted-foreground">
                  Comprimento (metros)
                </Label>
                <Input
                  id="comprimento-vaga"
                  type="number"
                  step="0.1"
                  min="3"
                  max="10"
                  placeholder="Ex: 5.0"
                  value={formData.comprimento_vaga}
                  onChange={(e) => handleInputChange("comprimento_vaga", e.target.value)}
                  required
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Informe as dimensões reais da vaga em metros
            </p>
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
              disabled={isSubmitting || uploadingPhotos}
            >
              {uploadingPhotos ? "Fazendo upload das fotos..." : isSubmitting ? "Registrando..." : "Registrar Vaga"}
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
