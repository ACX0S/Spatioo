
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface CancelBookingDialogProps {
  bookingId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (bookingId: string) => Promise<void>;
}

const CancelBookingDialog = ({ 
  bookingId, 
  open, 
  onOpenChange, 
  onConfirm 
}: CancelBookingDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = async () => {
    try {
      setIsLoading(true);
      await onConfirm(bookingId);
      onOpenChange(false);
    } catch (error) {
      console.error("Error canceling booking:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="mt-2 sm:mt-0"
          >
            Voltar
          </Button>
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
