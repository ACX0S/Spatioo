import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
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
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deseja cadastrar um Estacionamento Comercial?</AlertDialogTitle>
          <AlertDialogDescription>
            Você será redirecionado para o formulário de cadastro de estacionamento comercial.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Sim</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CreateEstacionamentoConfirmDialog;
