import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Loader2, Check, ChevronsUpDown } from 'lucide-react';
import { Veiculo, CORES_DISPONIVEIS } from '@/types/veiculo';
import { cn } from '@/lib/utils';
import carDictionary from '@/components/ui/car_dictionary.json';

const vehicleSchema = z.object({
  nome: z.string().min(1, 'Nome do veículo é obrigatório'),
  cor: z.string().min(1, 'Cor é obrigatória'),
  placa: z.string()
    .min(7, 'Placa deve ter 7 caracteres')
    .max(7, 'Placa deve ter 7 caracteres')
    .regex(/^[A-Z0-9]{7}$/, 'Placa inválida'),
  largura: z.number().positive('Largura deve ser positiva'),
  comprimento: z.number().positive('Comprimento deve ser positivo'),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

interface VehicleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: VehicleFormData) => Promise<any>;
  vehicle?: Veiculo;
}

interface CarData {
  marca: string;
  largura: number;
  comprimento: number;
}

export function VehicleFormDialog({
  open,
  onOpenChange,
  onSubmit,
  vehicle,
}: VehicleFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openCombobox, setOpenCombobox] = useState(false);
  const isEditing = !!vehicle;

  const cars = carDictionary as CarData[];

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      nome: '',
      cor: '',
      placa: '',
      largura: 0,
      comprimento: 0,
    },
  });

  useEffect(() => {
    if (open) {
      if (vehicle) {
        form.reset({
          nome: vehicle.nome,
          cor: vehicle.cor,
          placa: vehicle.placa,
          largura: vehicle.largura,
          comprimento: vehicle.comprimento,
        });
      } else {
        form.reset({
          nome: '',
          cor: '',
          placa: '',
          largura: 0,
          comprimento: 0,
        });
      }
    }
  }, [open, vehicle, form]);

  const handleSubmit = async (data: VehicleFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPlaca = (value: string) => {
    return value.replace(/[^A-Z0-9]/g, '').toUpperCase().slice(0, 7);
  };

  const handleCarSelect = (carName: string) => {
    const selectedCar = cars.find(car => car.marca === carName);
    if (selectedCar) {
      form.setValue('nome', carName);
      // Converter de mm para metros
      form.setValue('largura', selectedCar.largura / 1000);
      form.setValue('comprimento', selectedCar.comprimento / 1000);
    }
    setOpenCombobox(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Veículo' : 'Cadastrar Novo Veículo'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Edite as informações do seu veículo'
              : 'Preencha os dados do seu veículo'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Nome do Veículo</FormLabel>
                  <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            'w-full justify-between',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value
                            ? cars.find((car) => car.marca === field.value)?.marca
                            : 'Selecione o veículo'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Buscar veículo..." />
                        <CommandEmpty>Nenhum veículo encontrado.</CommandEmpty>
                        <CommandGroup className="max-h-[300px] overflow-auto">
                          {cars.map((car) => (
                            <CommandItem
                              key={car.marca}
                              value={car.marca}
                              onSelect={() => handleCarSelect(car.marca)}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  car.marca === field.value
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              {car.marca}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Digite para buscar seu veículo na lista
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a cor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CORES_DISPONIVEIS.map((cor) => (
                        <SelectItem key={cor} value={cor}>
                          {cor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="placa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Placa</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="ABC1D23"
                      onChange={(e) => {
                        const formatted = formatPlaca(e.target.value);
                        field.onChange(formatted);
                      }}
                      maxLength={7}
                    />
                  </FormControl>
                  <FormDescription>
                    Digite a placa sem traços ou espaços
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Salvar alterações' : 'Cadastrar veículo'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
