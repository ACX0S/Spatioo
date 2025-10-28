import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Building, MapPin } from "lucide-react";
import { FaCar } from "react-icons/fa";

interface Estacionamento {
  id: string;
  nome: string;
  endereco: string;
  tipo: string;
}

interface EstacionamentoSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estacionamentos: Estacionamento[];
  onSelect: (id: string) => void;
  title: string;
  description?: string;
}

const EstacionamentoSelectionModal = ({
  open,
  onOpenChange,
  estacionamentos,
  onSelect,
  title,
  description
}: EstacionamentoSelectionModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {estacionamentos.map((est) => (
            <Button
              key={est.id}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start text-left hover:border-spatioo-green hover:bg-spatioo-green/10"
              onClick={() => {
                onSelect(est.id);
                onOpenChange(false);
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                {est.tipo === 'residencial' ? (
                  <FaCar className="h-5 w-5 text-spatioo-green flex-shrink-0" />
                ) : (
                  <Building className="h-5 w-5 text-spatioo-green flex-shrink-0" />
                )}
                <span className="font-semibold truncate" title={est.nome}>{est.nome}</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2 break-words" title={est.endereco}>{est.endereco}</span>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EstacionamentoSelectionModal;
