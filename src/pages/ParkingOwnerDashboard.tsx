
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Car, 
  Clock, 
  CreditCard, 
  AlertCircle, 
  ChevronRight, 
  CheckCircle, 
  X, 
  Plus, 
  Edit, 
  Trash, 
  Filter, 
  Search,
  PieChart
} from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import CreateEstacionamentoDialog from "@/components/CreateEstacionamentoDialog"; // Reutiliza o mesmo formulário de Registrar Vaga

// Mock data for parking spots
const PARKING_SPOTS = [
  {
    id: 'spot-1',
    name: 'Downtown Secure Parking',
    address: 'Rua Conselheiro Lafayette, 180, São Caetano do Sul',
    totalSpots: 45,
    availableSpots: 12,
    pricePerHour: 5.50,
    features: ['covered', 'security', 'camera'],
    status: 'active',
  },
  {
    id: 'spot-2',
    name: 'Central Park & Go',
    address: 'Av. Goiás, 1500, São Caetano do Sul',
    totalSpots: 60,
    availableSpots: 8,
    pricePerHour: 4.25,
    features: ['covered', 'ev_charging'],
    status: 'active',
  },
  {
    id: 'spot-3',
    name: 'Riverside Parking Complex',
    address: 'Rua Amazonas, 800, São Caetano do Sul',
    totalSpots: 120,
    availableSpots: 35,
    pricePerHour: 3.75,
    features: ['security'],
    status: 'under_review',
  },
];

// Mock data for reservations
const RESERVATIONS = [
  {
    id: 'res-1',
    parkingName: 'Downtown Secure Parking',
    spotId: 'A12',
    customerName: 'Maria Silva',
    date: '2023-06-15',
    startTime: '14:00',
    endTime: '18:00',
    price: 22.00,
    status: 'active',
  },
  {
    id: 'res-2',
    parkingName: 'Downtown Secure Parking',
    spotId: 'A08',
    customerName: 'João Pereira',
    date: '2023-06-15',
    startTime: '10:00',
    endTime: '12:00',
    price: 11.00,
    status: 'completed',
  },
  {
    id: 'res-3',
    parkingName: 'Central Park & Go',
    spotId: 'B07',
    customerName: 'Ana Torres',
    date: '2023-06-18',
    startTime: '09:00',
    endTime: '11:00',
    price: 8.50,
    status: 'upcoming',
  },
  {
    id: 'res-4',
    parkingName: 'Central Park & Go',
    spotId: 'B12',
    customerName: 'Carlos Mendes',
    date: '2023-06-18',
    startTime: '12:00',
    endTime: '15:00',
    price: 12.75,
    status: 'upcoming',
  },
  {
    id: 'res-5',
    parkingName: 'Downtown Secure Parking',
    spotId: 'A15',
    customerName: 'Luisa Costa',
    date: '2023-06-14',
    startTime: '13:00',
    endTime: '17:00',
    price: 22.00,
    status: 'completed',
  },
];

// Mock data for earnings
const EARNINGS_DATA = {
  totalEarnings: 3867.50,
  monthlyEarnings: 1245.75,
  weeklyEarnings: 376.25,
  earningsByMonth: [
    { name: 'Jan', earnings: 850.25 },
    { name: 'Feb', earnings: 920.75 },
    { name: 'Mar', earnings: 810.50 },
    { name: 'Apr', earnings: 1050.25 },
    { name: 'May', earnings: 990.00 },
    { name: 'Jun', earnings: 1245.75 },
  ],
  earningsByParking: [
    { name: 'Downtown Secure', value: 2200.50 },
    { name: 'Central Park & Go', value: 1100.75 },
    { name: 'Riverside', value: 566.25 },
  ],
  occupancyRate: 68,
};

// Chart colors
const CHART_COLORS = ['#00e879', '#33ec91', '#66f0aa'];

const ParkingOwnerDashboard = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState('parking-spots');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Format status for display
  const formatStatus = (status: string) => {
    switch (status) {
      case 'active':
        return { label: 'Ativo', color: 'bg-green-500/20 text-green-600 dark:bg-green-900/40 dark:text-green-400' };
      case 'upcoming':
        return { label: 'Agendado', color: 'bg-orange-500/20 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400' };
      case 'completed':
        return { label: 'Concluído', color: 'bg-blue-500/20 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' };
      case 'under_review':
        return { label: 'Em análise', color: 'bg-yellow-500/20 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400' };
      default:
        return { label: status, color: 'bg-gray-500/20 text-gray-600 dark:bg-gray-900/40 dark:text-gray-400' };
    }
  };
  
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
            
              {/* Botão para abrir o formulário real de Registrar Vaga (reutilizando o componente existente) */
              }
              <Button 
                className="bg-spatioo-green hover:bg-spatioo-green-dark text-black font-medium"
                onClick={() => setShowAddDialog(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar novo
              </Button>

              {/* Reutiliza exatamente o mesmo formulário de "Registrar vaga" (residencial) */}
              {/* Mantemos um único formulário fonte para evitar divergência de lógica/validação */}
              <CreateEstacionamentoDialog 
                open={showAddDialog}
                onOpenChange={setShowAddDialog}
                // Quando cadastrar com sucesso, podemos futuramente atualizar uma lista real de estacionamentos
                onSuccess={() => {
                  // Comentário: aqui poderíamos disparar um refetch se a listagem fosse real (não mockada)
                }}
              />
          </div>
          
          <div className="grid gap-4">
            {PARKING_SPOTS.map((parking) => {
              const status = formatStatus(parking.status);
              
              return (
                <Card key={parking.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{parking.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {parking.address}
                        </CardDescription>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs ${status.color}`}>
                        {status.label}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <div className="grid grid-cols-4 gap-4 mt-2">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Total de vagas</p>
                        <p className="font-bold">{parking.totalSpots}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Vagas disponíveis</p>
                        <p className="font-bold text-spatioo-green">{parking.availableSpots}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Taxa de ocupação</p>
                        <p className="font-bold">{Math.round(((parking.totalSpots - parking.availableSpots) / parking.totalSpots) * 100)}%</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Preço / hora</p>
                        <p className="font-bold">R$ {parking.pricePerHour.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      {parking.features.includes('covered') && 
                        <Badge variant="outline" className="bg-background">Coberto</Badge>
                      }
                      {parking.features.includes('security') && 
                        <Badge variant="outline" className="bg-background">Segurança 24h</Badge>
                      }
                      {parking.features.includes('camera') && 
                        <Badge variant="outline" className="bg-background">Câmeras</Badge>
                      }
                      {parking.features.includes('ev_charging') && 
                        <Badge variant="outline" className="bg-background">Carregamento EV</Badge>
                      }
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between items-center pt-2">
                    <div>
                      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20">
                            <Trash className="h-4 w-4 mr-1" />
                            Remover
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Remover estacionamento</DialogTitle>
                            <DialogDescription>
                              Tem certeza que deseja remover este estacionamento? Esta ação não pode ser desfeita.
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="py-4">
                            <div className="p-3 border rounded-lg mb-4">
                              <p className="font-medium">{parking.name}</p>
                              <p className="text-sm text-muted-foreground">{parking.address}</p>
                            </div>
                            
                            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-red-600 dark:text-red-400">Atenção</p>
                                  <p className="text-sm text-red-600/80 dark:text-red-400/80">
                                    Ao remover este estacionamento, todas as reservas futuras serão canceladas e os clientes notificados.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                              Cancelar
                            </Button>
                            <Button variant="destructive" onClick={() => setShowDeleteDialog(false)}>
                              Confirmar remoção
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button size="sm" className="bg-spatioo-green hover:bg-spatioo-green-dark text-black font-medium">
                        Gerenciar vagas
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        
        {/* Reservations Tab */}
        <TabsContent value="reservations" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Button 
                variant={activeTab === 'all' ? 'default' : 'outline'} 
                size="sm" 
                className="text-xs"
                onClick={() => setActiveTab('all')}
              >
                Todos
              </Button>
              <Button 
                variant={activeTab === 'active' ? 'default' : 'outline'} 
                size="sm"
                className="text-xs"
                onClick={() => setActiveTab('active')}
              >
                Ativos
              </Button>
              <Button 
                variant={activeTab === 'upcoming' ? 'default' : 'outline'} 
                size="sm"
                className="text-xs"
                onClick={() => setActiveTab('upcoming')}
              >
                Agendados
              </Button>
              <Button 
                variant={activeTab === 'completed' ? 'default' : 'outline'} 
                size="sm"
                className="text-xs"
                onClick={() => setActiveTab('completed')}
              >
                Concluídos
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1"
                  >
                    <CalendarIcon className="h-3 w-3" />
                    {date ? format(date, 'PPP') : 'Selecionar data'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Estacionamento</TableHead>
                    <TableHead>Vaga</TableHead>
                    <TableHead>Data e hora</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {RESERVATIONS.map((reservation) => {
                    const status = formatStatus(reservation.status);
                    
                    return (
                      <TableRow key={reservation.id}>
                        <TableCell className="font-medium">{reservation.customerName}</TableCell>
                        <TableCell>{reservation.parkingName}</TableCell>
                        <TableCell>{reservation.spotId}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{reservation.date}</span>
                            <span className="text-xs text-muted-foreground">
                              {reservation.startTime} - {reservation.endTime}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>R$ {reservation.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className={`px-2 py-1 rounded-full text-xs inline-block ${status.color}`}>
                            {status.label}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Earnings Tab */}
        <TabsContent value="earnings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-6 flex gap-4 items-center">
                <div className="h-12 w-12 rounded-full bg-spatioo-green/20 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-spatioo-green" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ganhos totais</p>
                  <p className="text-2xl font-bold">R$ {EARNINGS_DATA.totalEarnings.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex gap-4 items-center">
                <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <CalendarIcon className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ganhos no mês</p>
                  <p className="text-2xl font-bold">R$ {EARNINGS_DATA.monthlyEarnings.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex gap-4 items-center">
                <div className="h-12 w-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <PieChart className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de ocupação</p>
                  <p className="text-2xl font-bold">{EARNINGS_DATA.occupancyRate}%</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Ganhos mensais</CardTitle>
              <CardDescription>Visualize a evolução dos seus ganhos ao longo dos meses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={EARNINGS_DATA.earningsByMonth}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`R$ ${value}`, 'Ganhos']}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                        border: '1px solid #eee', 
                        borderRadius: '8px' 
                      }}
                    />
                    <Bar dataKey="earnings" fill="#00e879" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Ganhos por estacionamento</CardTitle>
                <CardDescription>Visualize quais estacionamentos geram mais receita</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={EARNINGS_DATA.earningsByParking}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {EARNINGS_DATA.earningsByParking.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`R$ ${value}`, 'Ganhos']}
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                          border: '1px solid #eee', 
                          borderRadius: '8px' 
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Extrato financeiro</CardTitle>
                <CardDescription>Últimos pagamentos recebidos em sua conta</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Pagamento Spatioo - Junho Semana 2</p>
                        <p className="text-xs text-muted-foreground">Recebido em 15/06/2023</p>
                      </div>
                    </div>
                    <p className="font-bold text-spatioo-green">+ R$ 376.25</p>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Pagamento Spatioo - Junho Semana 1</p>
                        <p className="text-xs text-muted-foreground">Recebido em 08/06/2023</p>
                      </div>
                    </div>
                    <p className="font-bold text-spatioo-green">+ R$ 412.50</p>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Pagamento Spatioo - Maio Semana 4</p>
                        <p className="text-xs text-muted-foreground">Recebido em 01/06/2023</p>
                      </div>
                    </div>
                    <p className="font-bold text-spatioo-green">+ R$ 389.75</p>
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full">
                    Ver todos os pagamentos
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ParkingOwnerDashboard;
