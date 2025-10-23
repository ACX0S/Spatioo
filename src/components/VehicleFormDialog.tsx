import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input, Button } from '@/components/ui';
import { Veiculo, VeiculoInsert, TAMANHO_REFERENCIAS, TamanhoVeiculo } from '@/types/veiculo';
import { Loader2 } from 'lucide-react';

// Schema de validação
const vehicleSchema = z.object({
  tipo: z.string().min(2, 'Tipo deve ter no mínimo 2 caracteres').max(50, 'Tipo muito longo'),
  modelo: z.string().min(2, 'Modelo deve ter no mínimo 2 caracteres').max(100, 'Modelo muito longo'),
  cor: z.string().min(3, 'Cor deve ter no mínimo 3 caracteres').max(30, 'Cor muito longa'),
  placa: z
    .string()
    .min(7, 'Placa inválida')
    .max(8, 'Placa inválida')
    .regex(
      /^[A-Z]{3}[0-9]{1}[A-Z0-9]{1}[0-9]{2}$|^[A-Z]{3}[0-9]{4}$/,
      'Formato de placa inválido (use ABC1234 ou ABC1D23)'
    )
    .transform((val) => val.toUpperCase()),
  tamanho: z.enum(['P', 'M', 'G'], {
    required_error: 'Selecione um tamanho'
  })
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

interface VehicleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: VehicleFormData) => Promise<any>;
  vehicle?: Veiculo | null;
}

export function VehicleFormDialog({
  open,
  onOpenChange,
  onSubmit,
  vehicle
}: VehicleFormDialogProps) {
  const isEditing = !!vehicle;
  
  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      tipo: '',
      modelo: '',
      cor: '',
      placa: '',
      tamanho: undefined
    }
  });

  // Reset form quando o modal abre/fecha ou o veículo muda
  useEffect(() => {
    if (open) {
      if (vehicle) {
        form.reset({
          tipo: vehicle.tipo,
          modelo: vehicle.modelo,
          cor: vehicle.cor,
          placa: vehicle.placa,
          tamanho: vehicle.tamanho
        });
      } else {
        form.reset({
          tipo: '',
          modelo: '',
          cor: '',
          placa: '',
          tamanho: undefined
        });
      }
    }
  }, [open, vehicle, form]);

  const handleSubmit = async (data: VehicleFormData) => {
    const result = await onSubmit(data);
    if (result !== null) {
      form.reset();
      onOpenChange(false);
    }
  };

  // Função para formatar placa durante digitação
  const formatPlaca = (value: string) => {
    // Remove caracteres não alfanuméricos e converte para maiúsculo
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    
    // Limita a 7 caracteres
    return cleaned.slice(0, 7);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Veículo' : 'Adicionar Veículo'}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do veículo abaixo
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Tipo */}
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Sedan, SUV, Hatch..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Modelo */}
            <FormField
              control={form.control}
              name="modelo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modelo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Honda Civic, Toyota Corolla..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cor */}
            <FormField
              control={form.control}
              name="cor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Preto, Branco, Prata..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Placa */}
            <FormField
              control={form.control}
              name="placa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Placa</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ABC1234 ou ABC1D23"
                      maxLength={7}
                      className="uppercase font-mono"
                      {...field}
                      onChange={(e) => {
                        const formatted = formatPlaca(e.target.value);
                        field.onChange(formatted);
                      }}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Formato: ABC1234 (antigo) ou ABC1D23 (Mercosul)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tamanho */}
            <FormField
              control={form.control}
              name="tamanho"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tamanho do Veículo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tamanho" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="P">
                        <div className="flex flex-col">
                          <span className="font-semibold">P - Pequeno</span>
                          <span className="text-xs text-muted-foreground">
                            {TAMANHO_REFERENCIAS.P}
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="M">
                        <div className="flex flex-col">
                          <span className="font-semibold">M - Médio</span>
                          <span className="text-xs text-muted-foreground">
                            {TAMANHO_REFERENCIAS.M}
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="G">
                        <div className="flex flex-col">
                          <span className="font-semibold">G - Grande</span>
                          <span className="text-xs text-muted-foreground">
                            {TAMANHO_REFERENCIAS.G}
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs">
                    Escolha o tamanho baseado nas dimensões do seu veículo
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={form.formState.isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditing ? 'Salvar alterações' : 'Cadastrar veículo'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
