import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * @interface DeleteEstacionamentoDialogProps
 * @description Propriedades para o diálogo de confirmação de exclusão.
 */
interface DeleteEstacionamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estacionamentoId: string;
  estacionamentoNome: string;
  onSuccess?: () => void;
}

/**
 * @component DeleteEstacionamentoDialog
 * @description Diálogo de confirmação de exclusão com validação.
 * O usuário deve digitar o nome da rua do estacionamento para confirmar a exclusão.
 */
const DeleteEstacionamentoDialog = ({
  open,
  onOpenChange,
  estacionamentoId,
  estacionamentoNome,
  onSuccess,
}: DeleteEstacionamentoDialogProps) => {
  const { toast } = useToast();
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * @function extractStreetName
   * @description Extrai o nome da rua do nome completo do estacionamento.
   */
  const extractStreetName = (fullName: string): string => {
    // Remove vírgulas e extrai apenas o nome da rua (primeira parte antes da vírgula)
    const parts = fullName.split(',');
    return parts[0].trim();
  };

  const streetName = extractStreetName(estacionamentoNome);

  /**
   * @function handleDelete
   * @description Valida a confirmação e exclui o estacionamento do banco de dados.
   */
  const handleDelete = async () => {
    // Valida se o texto digitado corresponde ao nome da rua
    if (confirmationText.trim().toLowerCase() !== streetName.toLowerCase()) {
      toast({
        title: "Confirmação inválida",
        description: "O nome da rua digitado não corresponde ao estacionamento.",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);

    try {
      // Primeiro, exclui os preços associados ao estacionamento
      const { error: precosError } = await supabase
        .from("estacionamento_precos")
        .delete()
        .eq("estacionamento_id", estacionamentoId);

      if (precosError) throw precosError;

      // Depois, exclui as vagas associadas ao estacionamento
      const { error: vagasError } = await supabase
        .from("vagas")
        .delete()
        .eq("estacionamento_id", estacionamentoId);

      if (vagasError) throw vagasError;

      // Por fim, exclui o estacionamento
      const { error: estacionamentoError } = await supabase
        .from("estacionamento")
        .delete()
        .eq("id", estacionamentoId);

      if (estacionamentoError) throw estacionamentoError;

      toast({
        title: "Estacionamento excluído",
        description: "O estacionamento foi removido com sucesso.",
      });

      setConfirmationText("");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Erro ao excluir estacionamento:", error);
      toast({
        title: "Erro ao excluir",
        description: error.message || "Não foi possível excluir o estacionamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Excluir "{estacionamentoNome}"
          </DialogTitle>
          <DialogDescription>
            Deseja mesmo excluir "{estacionamentoNome}"? Esta ação é irreversível.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Esta ação não pode ser desfeita. Todos os dados relacionados a este estacionamento serão permanentemente removidos.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="confirmation-text">
              Insira o nome do servidor
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              Digite <span className="font-semibold text-foreground">{streetName}</span> para confirmar
            </p>
            <Input
              id="confirmation-text"
              placeholder={streetName}
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              className="border-destructive/50 focus-visible:ring-destructive"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setConfirmationText("");
              onOpenChange(false);
            }}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || confirmationText.trim().toLowerCase() !== streetName.toLowerCase()}
          >
            {isDeleting ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteEstacionamentoDialog;
