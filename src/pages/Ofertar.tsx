import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import CreateEstacionamentoDialog from "@/components/CreateEstacionamentoDialog";
import { UserParkingCard } from "@/components/UserParkingCard";
import { useUserEstacionamentos } from "@/hooks/useUserEstacionamentos";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";

const Ofertar = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { estacionamentos, loading, error, refetch } = useUserEstacionamentos();

  const handleEdit = (id: string) => {
    // TODO: Implementar navegação para edição
    console.log('Edit estacionamento:', id);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {estacionamentos.length > 0 ? "Minhas Vagas" : "Nenhuma vaga ativa"}
        </h1>
        <p className="text-muted-foreground">
          {estacionamentos.length > 0 
            ? "No momento você não possui vagas ativas." 
            : "Gerencie suas vagas de estacionamento"
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
          Registrar vaga
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
  );
};

export default Ofertar;