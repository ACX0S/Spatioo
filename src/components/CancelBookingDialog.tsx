
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

/**
 * @interface CancelBookingDialogProps
 * @description Propriedades para o componente CancelBookingDialog.
 * @param bookingId - O ID da reserva a ser cancelada.
 * @param open - Estado opcional para controlar a abertura do diálogo externamente.
 * @param onOpenChange - Função opcional para notificar sobre a mudança no estado de abertura.
 * @param onConfirm - Função chamada quando o usuário confirma o cancelamento.
 * @param trigger - Elemento React que aciona a abertura do diálogo.
 */
interface CancelBookingDialogProps {
  bookingId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm: (bookingId: string) => Promise<void>;
  trigger?: React.ReactNode;
}

/**
 * @component CancelBookingDialog
 * @description Um diálogo de confirmação para cancelar uma reserva.
 */
const CancelBookingDialog = ({ 
  bookingId, 
  open, 
  onOpenChange, 
  onConfirm,
  trigger
}: CancelBookingDialogProps) => {
  // Estado para controlar o feedback de carregamento durante o cancelamento.
  const [isLoading, setIsLoading] = useState(false);
  // Estado para controlar a visibilidade do diálogo.
  const [dialogOpen, setDialogOpen] = useState(open || false);

  /**
   * @function handleOpenChange
   * @description Gerencia a abertura e o fechamento do diálogo.
   * @param value - O novo estado de visibilidade.
   */
  const handleOpenChange = (value: boolean) => {
    setDialogOpen(value);
    onOpenChange?.(value);
  };

  /**
   * @function handleCancel
   * @description Executa a lógica de cancelamento quando o usuário confirma a ação.
   */
  const handleCancel = async () => {
    try {
      setIsLoading(true);
      await onConfirm(bookingId); // Chama a função de confirmação passada como prop.
      handleOpenChange(false); // Fecha o diálogo após o sucesso.
    } catch (error) {
      console.error("Erro ao cancelar reserva:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open !== undefined ? open : dialogOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Cancelar Reserva
          </DialogTitle>
          <DialogDescription>
            Tem certeza que deseja cancelar esta reserva?
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-3">
          <p className="text-sm text-muted-foreground">
            Esta ação não pode ser desfeita. Após o cancelamento, a vaga será liberada para outros usuários.
          </p>
        </div>
        
        <DialogFooter className="sm:justify-between">
          {/* Botão para fechar o diálogo sem cancelar */}
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
            className="mt-2 sm:mt-0"
          >
            Voltar
          </Button>
          {/* Botão para confirmar o cancelamento */}
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? "Cancelando..." : "Sim, cancelar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelBookingDialog;
