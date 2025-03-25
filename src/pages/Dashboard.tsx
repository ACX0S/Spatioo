
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
  X 
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

// Mock data for active bookings
const ACTIVE_BOOKINGS = [
  {
    id: 'book-1',
    parkingName: 'Downtown Secure Parking',
    address: 'Rua Conselheiro Lafayette, 180, São Caetano do Sul',
    date: '2023-06-15',
    startTime: '14:00',
    endTime: '18:00',
    price: 22.00,
    spotNumber: 'A12',
    status: 'active',
    timeRemaining: '2h 15m',
  },
  {
    id: 'book-2',
    parkingName: 'Central Park & Go',
    address: 'Av. Goiás, 1500, São Caetano do Sul',
    date: '2023-06-18',
    startTime: '09:00',
    endTime: '11:00',
    price: 8.50,
    spotNumber: 'B07',
    status: 'upcoming',
    timeRemaining: 'In 3 days',
  },
];

// Mock data for booking history
const BOOKING_HISTORY = [
  {
    id: 'hist-1',
    parkingName: 'North Station Parking',
    address: 'Rua Manoel Coelho, 500, São Caetano do Sul',
    date: '2023-06-10',
    startTime: '10:00',
    endTime: '12:00',
    price: 8.00,
    spotNumber: 'C05',
    status: 'completed',
  },
  {
    id: 'hist-2',
    parkingName: 'Riverside Parking Complex',
    address: 'Rua Amazonas, 800, São Caetano do Sul',
    date: '2023-06-05',
    startTime: '16:00',
    endTime: '19:00',
    price: 11.25,
    spotNumber: 'D19',
    status: 'completed',
  },
  {
    id: 'hist-3',
    parkingName: 'Downtown Secure Parking',
    address: 'Rua Conselheiro Lafayette, 180, São Caetano do Sul',
    date: '2023-05-28',
    startTime: '13:00',
    endTime: '15:30',
    price: 12.50,
    spotNumber: 'A08',
    status: 'completed',
  },
];

// Data for profile usage statistics
const PROFILE_STATS = {
  totalBookings: 15,
  totalSpent: 187.25,
  averagePerUse: 12.48,
  favoriteLocation: 'Downtown Secure Parking',
  usageByLocation: [
    { name: 'Downtown Secure', value: 7 },
    { name: 'Central Park & Go', value: 3 },
    { name: 'North Station', value: 2 },
    { name: 'Riverside', value: 3 },
  ],
  usageByMonth: {
    'Jan': 1,
    'Feb': 2,
    'Mar': 1,
    'Apr': 3,
    'May': 4,
    'Jun': 4,
  }
};

// Pie chart colors
const CHART_COLORS = ['#00e879', '#33eC91', '#66f0aa', '#99f4c2'];

const Dashboard = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState<string>('bookings');
  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  
  // Format hours for display
  const formatHours = (startTime: string, endTime: string) => {
    return `${startTime} - ${endTime}`;
  };
  
  return (
    <div className="container p-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Meus agendamentos</h1>
        <p className="text-muted-foreground">Gerenciar suas reservas de estacionamento</p>
      </div>
      
      <Tabs defaultValue="bookings" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="bookings">Agendamentos</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
        </TabsList>
        
        {/* Active Bookings Tab */}
        <TabsContent value="bookings" className="space-y-4">
          {ACTIVE_BOOKINGS.length > 0 ? (
            <>
              {/* Active or upcoming bookings */}
              {ACTIVE_BOOKINGS.map((booking) => (
                <Card key={booking.id} className={`${booking.status === 'active' ? 'border-spatioo-green' : ''}`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{booking.parkingName}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {booking.address}
                        </CardDescription>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs ${booking.status === 'active' ? 'bg-spatioo-green/20 text-spatioo-green' : 'bg-orange-500/20 text-orange-500'}`}>
                        {booking.status === 'active' ? 'Em uso' : 'Agendado'}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Data</p>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-spatioo-green" />
                          <p className="font-medium">{booking.date}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Horário</p>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-spatioo-green" />
                          <p className="font-medium">{formatHours(booking.startTime, booking.endTime)}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Vaga</p>
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-spatioo-green" />
                          <p className="font-medium">{booking.spotNumber}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Preço total</p>
                        <p className="text-xl font-bold text-spatioo-green">R$ {booking.price.toFixed(2)}</p>
                      </div>
                      
                      {booking.status === 'active' && (
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Tempo restante</p>
                          <p className="text-sm font-medium">{booking.timeRemaining}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between pt-2">
                    <Button variant="outline" size="sm" onClick={() => setShowCancelDialog(true)}>
                      Cancelar
                    </Button>
                    
                    {booking.status === 'active' && (
                      <Dialog open={showExtendDialog} onOpenChange={setShowExtendDialog}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="bg-spatioo-green hover:bg-spatioo-green-dark text-black">
                            Estender tempo
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Estender tempo de estacionamento</DialogTitle>
                            <DialogDescription>
                              Escolha por quanto tempo você deseja estender sua reserva atual.
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Reserva atual</p>
                              <div className="flex gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Horário atual:</p>
                                  <p className="font-medium">{formatHours(booking.startTime, booking.endTime)}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Tempo restante:</p>
                                  <p className="font-medium">{booking.timeRemaining}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Quanto tempo deseja adicionar?</p>
                              <div className="grid grid-cols-4 gap-2">
                                <Button variant="outline" size="sm">+30min</Button>
                                <Button variant="outline" size="sm">+1h</Button>
                                <Button variant="outline" size="sm">+2h</Button>
                                <Button variant="outline" size="sm">+4h</Button>
                              </div>
                            </div>
                            
                            <Alert>
                              <AlertCircle className="h-4 w-4" />
                              <AlertTitle>Informação</AlertTitle>
                              <AlertDescription>
                                A extensão será cobrada com a mesma tarifa horária de R$ {(booking.price / 4).toFixed(2)}/hora.
                              </AlertDescription>
                            </Alert>
                          </div>
                          
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowExtendDialog(false)}>
                              Cancelar
                            </Button>
                            <Button className="bg-spatioo-green hover:bg-spatioo-green-dark text-black">
                              Confirmar extensão
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                    
                    {booking.status === 'upcoming' && (
                      <Button size="sm" className="bg-spatioo-green hover:bg-spatioo-green-dark text-black">
                        Ver detalhes
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
              
              {/* Cancel Booking Dialog */}
              <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cancelar reserva</DialogTitle>
                    <DialogDescription>
                      Tem certeza que deseja cancelar esta reserva? Verifique a política de cancelamento.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Aviso importante</AlertTitle>
                      <AlertDescription>
                        Cancelamentos com menos de 2 horas de antecedência podem estar sujeitos a cobranças parciais.
                      </AlertDescription>
                    </Alert>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                      Voltar
                    </Button>
                    <Button variant="destructive" onClick={() => setShowCancelDialog(false)}>
                      Confirmar cancelamento
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <div className="text-center py-10">
              <Car className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum agendamento ativo</h3>
              <p className="text-muted-foreground mb-6">Você não possui agendamentos ativos ou futuros no momento.</p>
              <Button className="bg-spatioo-green hover:bg-spatioo-green-dark text-black">
                Encontrar estacionamento
              </Button>
            </div>
          )}
        </TabsContent>
        
        {/* Booking History Tab */}
        <TabsContent value="history" className="space-y-4">
          {BOOKING_HISTORY.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-muted-foreground">{BOOKING_HISTORY.length} reservas anteriores</p>
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="text-xs h-8 flex items-center gap-1"
                      >
                        <CalendarIcon className="h-3 w-3" />
                        Filtrar por data
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
                </div>
              </div>
              
              {BOOKING_HISTORY.map((booking) => (
                <Card key={booking.id} className="bg-muted/40">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div>
                        <CardTitle className="text-lg">{booking.parkingName}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {booking.address}
                        </CardDescription>
                      </div>
                      <div className="bg-green-500/20 text-green-600 px-2 py-1 rounded-full text-xs dark:bg-green-900/40 dark:text-green-400">
                        Concluído
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Data</p>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">{booking.date}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Horário</p>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">{formatHours(booking.startTime, booking.endTime)}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Vaga</p>
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">{booking.spotNumber}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">Preço total</p>
                      <p className="text-xl font-bold text-foreground">R$ {booking.price.toFixed(2)}</p>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between pt-2">
                    <Button variant="ghost" size="sm">
                      Recibo
                    </Button>
                    <Button variant="outline" size="sm">
                      Reservar novamente
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </>
          ) : (
            <div className="text-center py-10">
              <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum histórico ainda</h3>
              <p className="text-muted-foreground mb-6">Seus agendamentos concluídos aparecerão aqui.</p>
            </div>
          )}
        </TabsContent>
        
        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Meu Perfil</CardTitle>
              <CardDescription>Gerencie suas informações pessoais e métodos de pagamento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Informações Pessoais</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Nome</p>
                    <Input value="Maria Silva" className="h-9" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <Input value="maria.silva@email.com" className="h-9" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Telefone</p>
                    <Input value="(11) 98765-4321" className="h-9" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">CPF</p>
                    <Input value="123.456.789-00" className="h-9" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Métodos de Pagamento</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">•••• •••• •••• 4892</p>
                        <p className="text-xs text-muted-foreground">Mastercard • Expira em 06/25</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <CheckCircle className="h-4 w-4 text-spatioo-green" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <X className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Adicionar novo método de pagamento
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="bg-spatioo-green hover:bg-spatioo-green-dark text-black font-medium">
                Salvar alterações
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas de uso</CardTitle>
              <CardDescription>Veja como você tem utilizado o Spatioo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-muted/40 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total de reservas</p>
                  <p className="text-2xl font-bold">{PROFILE_STATS.totalBookings}</p>
                </div>
                <div className="bg-muted/40 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total gasto</p>
                  <p className="text-2xl font-bold">R$ {PROFILE_STATS.totalSpent.toFixed(2)}</p>
                </div>
                <div className="bg-muted/40 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Média por uso</p>
                  <p className="text-2xl font-bold">R$ {PROFILE_STATS.averagePerUse.toFixed(2)}</p>
                </div>
                <div className="bg-muted/40 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Local favorito</p>
                  <p className="text-sm font-bold">{PROFILE_STATS.favoriteLocation}</p>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <p className="text-sm font-medium mb-2">Uso por estacionamento</p>
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={PROFILE_STATS.usageByLocation}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {PROFILE_STATS.usageByLocation.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="flex-1">
                  <p className="text-sm font-medium mb-2">Uso mensal</p>
                  <div className="h-[180px] flex items-end gap-2 pt-4">
                    {Object.entries(PROFILE_STATS.usageByMonth).map(([month, count]) => (
                      <div key={month} className="flex flex-col items-center flex-1">
                        <div 
                          className="w-full bg-spatioo-green rounded-t-md transition-all"
                          style={{ height: `${count * 20}px` }}
                        ></div>
                        <p className="text-xs mt-2">{month}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
