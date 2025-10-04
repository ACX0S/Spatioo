import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * @interface CreateEstacionamentoConfirmDialogProps
 * @description Propriedades para o diálogo de confirmação de criação de estacionamento
 */
interface CreateEstacionamentoConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

/**
 * @component CreateEstacionamentoConfirmDialog
 * @description Modal de confirmação para criar um estacionamento comercial
 */
const CreateEstacionamentoConfirmDialog = ({
  open,
  onOpenChange,
  onConfirm,
}: CreateEstacionamentoConfirmDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="grid grid-cols-1 md:grid-cols-1 gap-4 max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-spatioo-gray-dark dark:text-spatioo-white">Deseja cadastrar um Estacionamento Comercial?</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="text-red-800 border-red-800 hover:bg-transparent hover:text-red-600 hover:border-red-600">Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Sim</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CreateEstacionamentoConfirmDialog;
