
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface CancelBookingDialogProps {
  onConfirm: () => Promise<void>;
  trigger: React.ReactNode;
}

const CancelBookingDialog: React.FC<CancelBookingDialogProps> = ({ 
  onConfirm,
  trigger 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await onConfirm();
      setOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[350px]">
        <AlertDialogHeader>
          <div className="mx-auto bg-orange-100 p-3 rounded-full mb-2">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
          </div>
          <AlertDialogTitle className="text-center">Cancelar Reserva</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Tem certeza que deseja cancelar esta reserva? 
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <AlertDialogAction
            onClick={handleConfirm}
            className="w-full bg-red-600 hover:bg-red-700"
            disabled={isLoading}
          >
            {isLoading ? 'Cancelando...' : 'Sim, cancelar reserva'}
          </AlertDialogAction>
          <AlertDialogCancel className="w-full mt-0">
            Não, manter reserva
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CancelBookingDialog;
