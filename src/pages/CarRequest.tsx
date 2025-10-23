import { Button } from '@/components/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useVehicles } from '@/hooks/useVehicles';
import { Car, Plus, Pencil, Trash2 } from 'lucide-react';
import { TAMANHO_REFERENCIAS } from '@/types/veiculo';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';

const CarRequest = () => {
  const { vehicles, loading, error, deleteVehicle } = useVehicles();

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este veículo?')) {
      await deleteVehicle(id);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Meus Veículos</h1>
          <p className="text-muted-foreground">Gerencie seus veículos cadastrados</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar veículo
        </Button>
      </div>

      {/* Lista de veículos */}
      {vehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Car className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Não há veículos cadastrados
          </h3>
          <p className="text-muted-foreground mb-6">
            Cadastre seu primeiro veículo para facilitar suas reservas
          </p>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Cadastrar veículo
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-spatioo-green/10 flex items-center justify-center">
                      <Car className="h-5 w-5 text-spatioo-green" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{vehicle.modelo}</CardTitle>
                      <p className="text-sm text-muted-foreground">{vehicle.tipo}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="font-semibold">
                    {vehicle.tamanho}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cor:</span>
                    <span className="font-medium text-foreground">{vehicle.cor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Placa:</span>
                    <span className="font-mono font-medium text-foreground">
                      {vehicle.placa}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tamanho:</span>
                    <span className="text-xs text-muted-foreground">
                      {TAMANHO_REFERENCIAS[vehicle.tamanho]}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-1">
                    <Pencil className="h-3 w-3" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(vehicle.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CarRequest;
