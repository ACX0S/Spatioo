import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Plus, 
  Search,
  Building2,
  DollarSign,
  Settings,
  Trash2
} from 'lucide-react';
import CreateEstacionamentoComercialDialog from "@/components/CreateEstacionamentoComercialDialog";
import { useUserEstacionamentos } from "@/hooks/useUserEstacionamentos";
import { useNavigate } from "react-router-dom";
import EditEstacionamentoDialog from "@/components/EditEstacionamentoDialog";
import DeleteEstacionamentoDialog from "@/components/DeleteEstacionamentoDialog";

const ParkingOwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState('parking-spots');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingEstacionamento, setEditingEstacionamento] = useState<string | null>(null);
  const [deletingEstacionamento, setDeletingEstacionamento] = useState<{ id: string; nome: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  // Busca os estacionamentos reais do banco de dados
  const { estacionamentos, loading, error, refetch } = useUserEstacionamentos();
  
  // Filtra estacionamentos baseado na busca
  const filteredEstacionamentos = estacionamentos.filter(est => 
    est.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    est.endereco.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="container p-4 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Painel do Proprietário</h1>
        <p className="text-muted-foreground">Gerencie seus estacionamentos e acompanhe seus ganhos</p>
      </div>
      
      <Tabs defaultValue="parking-spots" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4 md:max-w-[300px]">
          <TabsTrigger value="parking-spots">Vagas</TabsTrigger>
          <TabsTrigger value="earnings">Ganhos</TabsTrigger>
        </TabsList>
        
        {/* Parking Spots Tab */}
        <TabsContent value="parking-spots" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar estacionamentos..."
                  className="pl-9 pr-4"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {/* Botão para abrir o formulário de estacionamento comercial com CNPJ e comodidades */}
            <Button 
              className="bg-spatioo-green hover:bg-spatioo-green-dark text-black font-medium w-full sm:w-auto"
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Estacionamento
            </Button>
          </div>
          
          {/* Loading e Error States */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="text-muted-foreground">Carregando estacionamentos...</div>
            </div>
          )}
          
          {error && (
            <div className="flex justify-center items-center py-12">
              <div className="text-destructive">{error}</div>
            </div>
          )}
          
          {/* Lista de Estacionamentos Reais */}
          {!loading && !error && (
            <div className="grid gap-4">
              {estacionamentos.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">Nenhum estacionamento cadastrado</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Comece adicionando seu primeiro estacionamento comercial
                    </p>
                    <Button 
                      className="bg-spatioo-green hover:bg-spatioo-green-dark text-black font-medium"
                      onClick={() => setShowAddDialog(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar estacionamento
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredEstacionamentos.map((parking) => {
                  const availableSpots = parking.numero_vagas; // Pode ser calculado dinamicamente futuramente
                  const occupancyRate = 0; // Pode ser calculado dinamicamente futuramente
                  
                  return (
                    <Card key={parking.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{parking.nome}</CardTitle>
                            <CardDescription className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {parking.endereco}
                            </CardDescription>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs ${parking.ativo ? 'bg-green-500/20 text-green-600 dark:bg-green-900/40 dark:text-green-400' : 'bg-gray-500/20 text-gray-600'}`}>
                            {parking.ativo ? 'Ativo' : 'Inativo'}
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pb-2">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-2">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Total de vagas</p>
                            <p className="text-lg sm:text-xl font-bold">{parking.numero_vagas}</p>
                          </div>
                          
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Disponíveis</p>
                            <p className="text-lg sm:text-xl font-bold text-spatioo-green">{availableSpots}</p>
                          </div>
                          
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Taxa ocupação</p>
                            <p className="text-lg sm:text-xl font-bold">{occupancyRate}%</p>
                          </div>
                          
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Hora extra</p>
                            <p className="text-lg sm:text-xl font-bold">R$ {parking.hora_extra?.toFixed(2) || '0.00'}</p>
                          </div>
                        </div>
                        
                        {/* Exibe comodidades se existirem */}
                        {(parking.funcionamento_24h || parking.suporte_carro_eletrico || parking.vaga_coberta || 
                          parking.manobrista || parking.suporte_caminhao || parking.vaga_moto) && (
                          <div className="flex flex-wrap gap-1.5 mt-4">
                            {parking.funcionamento_24h && <Badge variant="outline" className="text-xs">24h</Badge>}
                            {parking.vaga_coberta && <Badge variant="outline" className="text-xs">Coberto</Badge>}
                            {parking.manobrista && <Badge variant="outline" className="text-xs">Manobrista</Badge>}
                            {parking.suporte_carro_eletrico && <Badge variant="outline" className="text-xs">Elétrico</Badge>}
                            {parking.suporte_caminhao && <Badge variant="outline" className="text-xs">Caminhão</Badge>}
                            {parking.vaga_moto && <Badge variant="outline" className="text-xs">Moto</Badge>}
                          </div>
                        )}
                      </CardContent>
                      
                      <CardFooter className="sm:flex-row justify-between items-stretch sm:items-center pt-2 gap-2">
                        <div className="flex flex-row sm:flex-row gap-2 w-full">
                          {/* Botão Gerenciar - destaque em verde */}
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => navigate(`/estacionamento-dashboard/${parking.id}`)}
                            className="sm:flex-initial sm:min-w-[130px] bg-spatioo-green hover:bg-spatioo-green/90 text-black font-medium"
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Gerenciar
                          </Button>
                          
                          {/* Botão Excluir */}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeletingEstacionamento({ id: parking.id, nome: parking.nome })}
                            className="sm:flex-initial"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  );
                })
              )}
            </div>
          )}
          
          {/* Dialog de Criação de Estacionamento Comercial */}
          <CreateEstacionamentoComercialDialog 
            open={showAddDialog}
            onOpenChange={setShowAddDialog}
            onSuccess={refetch}
          />
          
          {/* Dialog de Edição */}
          {editingEstacionamento && (
            <EditEstacionamentoDialog
              estacionamento={estacionamentos.find(e => e.id === editingEstacionamento)}
              onSuccess={() => {
                refetch();
                setEditingEstacionamento(null);
              }}
              open={!!editingEstacionamento}
              onOpenChange={(open) => !open && setEditingEstacionamento(null)}
            />
          )}

          {/* Dialog de Exclusão com confirmação */}
          {deletingEstacionamento && (
            <DeleteEstacionamentoDialog
              open={!!deletingEstacionamento}
              onOpenChange={(open) => !open && setDeletingEstacionamento(null)}
              estacionamentoId={deletingEstacionamento.id}
              estacionamentoNome={deletingEstacionamento.nome}
              onSuccess={() => {
                refetch();
                setDeletingEstacionamento(null);
              }}
            />
          )}
        </TabsContent>    
        {/* Earnings Tab */}
        <TabsContent value="earnings" className="space-y-4">
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">Relatórios de ganhos em desenvolvimento</p>
              <p className="text-sm text-muted-foreground">
                Em breve você poderá visualizar relatórios detalhados dos seus ganhos aqui.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ParkingOwnerDashboard;
