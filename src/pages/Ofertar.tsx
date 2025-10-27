import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CreateEstacionamentoDialog from "@/components/CreateEstacionamentoDialog";
import { UserParkingCard } from "@/components/UserParkingCard";
import EditEstacionamentoDialog from "@/components/EditEstacionamentoDialog";
import { useUserEstacionamentos } from "@/hooks/useUserEstacionamentos";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";

const Ofertar = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEstacionamento, setEditingEstacionamento] = useState<any>(null);
  const { estacionamentos, loading, error, refetch } = useUserEstacionamentos();

  const handleEdit = (id: string) => {
    const est = estacionamentos.find(e => e.id === id);
    if (est) {
      setEditingEstacionamento(est);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <>
      {editingEstacionamento && (
        <EditEstacionamentoDialog
          estacionamento={editingEstacionamento}
          onSuccess={() => {
            setEditingEstacionamento(null);
            refetch();
          }}
          open={true}
          onOpenChange={(open) => !open && setEditingEstacionamento(null)}
        />
      )}

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {estacionamentos.length > 0 ? "Minhas Vagas" : "Nenhuma vaga cadastrada"}
          </h1>
          <p className="text-muted-foreground">
            {estacionamentos.length > 0 
              ? "Gerencie suas vagas residenciais e estacionamentos" 
              : "Cadastre sua primeira vaga"
            }
          </p>
        </div>

        {/* Register Button */}
        <div className="mb-6">
          <Button 
            onClick={() => setDialogOpen(true)}
            className="w-full bg-spatioo-green hover:bg-spatioo-green/90 h-12"
          >
            <Plus className="h-5 w-5 mr-2" />
            Ofertar vaga
          </Button>
        </div>

        {/* User's Parking Spots */}
        {estacionamentos.length > 0 && (
          <div className="space-y-3">
            {estacionamentos.map((estacionamento) => (
              <UserParkingCard 
                key={estacionamento.id} 
                estacionamento={estacionamento}
                onEdit={handleEdit}
                onUpdate={refetch}
              />
            ))}
          </div>
        )}

        {/* Create Dialog */}
        <CreateEstacionamentoDialog 
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={refetch}
        />
      </div>
    </>
  );
};

export default Ofertar;