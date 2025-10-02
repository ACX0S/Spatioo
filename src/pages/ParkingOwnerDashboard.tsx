import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Plus, 
  Filter, 
  Search,
  Building2,
  DollarSign,
  Edit,
  Settings,
  Trash2
} from 'lucide-react';
import CreateEstacionamentoComercialDialog from "@/components/CreateEstacionamentoComercialDialog";
import { useUserEstacionamentos } from "@/hooks/useUserEstacionamentos";
import { useNavigate } from "react-router-dom";
import EditEstacionamentoDialog from "@/components/EditEstacionamentoDialog";
import DeleteEstacionamentoDialog from "@/components/DeleteEstacionamentoDialog";

const ParkingOwnerDashboard = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState('parking-spots');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingEstacionamento, setEditingEstacionamento] = useState<string | null>(null);
  const [deletingEstacionamento, setDeletingEstacionamento] = useState<{ id: string; nome: string } | null>(null);
  const navigate = useNavigate();
  
  // Busca os estacionamentos reais do banco de dados
  const { estacionamentos, loading, error, refetch } = useUserEstacionamentos();
  
  return (
    <div className="container p-4 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Painel do Proprietário</h1>
        <p className="text-muted-foreground">Gerencie seus estacionamentos e acompanhe seus ganhos</p>
      </div>
      
      <Tabs defaultValue="parking-spots" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="parking-spots">Meus estacionamentos</TabsTrigger>
          <TabsTrigger value="reservations">Reservas</TabsTrigger>
          <TabsTrigger value="earnings">Ganhos</TabsTrigger>
        </TabsList>
        
        {/* Parking Spots Tab */}
        <TabsContent value="parking-spots" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar estacionamentos..."
                  className="pl-9 pr-4 w-[300px]"
                />
              </div>
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
            </div>
            
            {/* Botão para abrir o formulário de estacionamento comercial com CNPJ e comodidades */}
            <Button 
              className="bg-spatioo-green hover:bg-spatioo-green-dark text-black font-medium"
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar novo
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
                estacionamentos.map((parking) => {
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
                        <div className="grid grid-cols-4 gap-4 mt-2">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Total de vagas</p>
                            <p className="font-bold">{parking.numero_vagas}</p>
                          </div>
                          
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Vagas disponíveis</p>
                            <p className="font-bold text-spatioo-green">{availableSpots}</p>
                          </div>
                          
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Taxa de ocupação</p>
                            <p className="font-bold">{occupancyRate}%</p>
                          </div>
                          
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Hora extra</p>
                            <p className="font-bold">R$ {parking.hora_extra?.toFixed(2) || '0.00'}</p>
                          </div>
                        </div>
                        
                        {/* Exibe comodidades se existirem */}
                        <div className="flex flex-wrap gap-2 mt-4">
                          {parking.funcionamento_24h && <Badge variant="outline" className="bg-background">Funcionamento 24h</Badge>}
                          {parking.suporte_carro_eletrico && <Badge variant="outline" className="bg-background">Carro elétrico</Badge>}
                          {parking.vaga_coberta && <Badge variant="outline" className="bg-background">Coberto</Badge>}
                          {parking.manobrista && <Badge variant="outline" className="bg-background">Manobrista</Badge>}
                          {parking.suporte_caminhao && <Badge variant="outline" className="bg-background">Caminhão</Badge>}
                          {parking.vaga_moto && <Badge variant="outline" className="bg-background">Moto</Badge>}
                        </div>
                      </CardContent>
                      
                      <CardFooter className="flex justify-between items-center pt-2 gap-2">
                        {/* Botões de ação ajustados conforme referência */}
                        <div className="flex gap-2 w-full">
                          {/* Botões alinhados à esquerda com mesmo tamanho */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingEstacionamento(parking.id)}
                            className="w-[110px]"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => navigate(`/gerenciar-estacionamento?id=${parking.id}`)}
                            className="w-[110px] bg-spatioo-green hover:bg-spatioo-green/90 text-black"
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Gerenciar
                          </Button>
                          
                          {/* Botão Excluir alinhado à direita */}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeletingEstacionamento({ id: parking.id, nome: parking.nome })}
                            className="ml-auto"
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
        
        {/* Reservations Tab */}
        <TabsContent value="reservations" className="space-y-4">
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">Reservas em desenvolvimento</p>
              <p className="text-sm text-muted-foreground">
                Em breve você poderá visualizar todas as reservas dos seus estacionamentos aqui.
              </p>
            </div>
          </div>
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
