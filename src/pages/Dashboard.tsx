
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Car, 
  Clock, 
  AlertCircle, 
  X 
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useBookings } from '@/hooks/useBookings';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const { activeBookings, historyBookings, loading, cancelBooking } = useBookings();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  
  const handleCancelRequest = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setShowCancelDialog(true);
  };
  
  const handleConfirmCancel = async () => {
    if (selectedBookingId) {
      await cancelBooking(selectedBookingId);
      setShowCancelDialog(false);
      setSelectedBookingId(null);
    }
  };
  
  // Format date and time for display
  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };
  
  // Format hours for display
  const formatHours = (startTime: string, endTime: string) => {
    return `${startTime.substring(0, 5)} - ${endTime.substring(0, 5)}`;
  };
  
  if (loading) {
    return (
      <div className="container p-4 flex items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spatioo-green"></div>
      </div>
    );
  }
  
  return (
    <div className="container p-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Meus agendamentos</h1>
        <p className="text-muted-foreground">Gerenciar suas reservas de estacionamento</p>
      </div>
      
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="active">Agendamentos</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>
        
        {/* Active Bookings Tab */}
        <TabsContent value="active" className="space-y-4">
          {activeBookings.length > 0 ? (
            <>
              {/* Active or upcoming bookings */}
              {activeBookings.map((booking) => (
                <Card key={booking.id} className={`${booking.status === 'active' ? 'border-spatioo-green' : ''}`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{booking.parkingName}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {booking.parkingAddress}
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
                          <p className="font-medium">{formatDate(booking.date)}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Horário</p>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-spatioo-green" />
                          <p className="font-medium">{formatHours(booking.start_time, booking.end_time)}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Vaga</p>
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-spatioo-green" />
                          <p className="font-medium">{booking.spot_number}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">Preço total</p>
                      <p className="text-xl font-bold text-spatioo-green">R$ {booking.price.toFixed(2)}</p>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleCancelRequest(booking.id)}
                    >
                      Cancelar
                    </Button>
                    
                    <Button 
                      size="sm" 
                      className="bg-spatioo-green hover:bg-spatioo-green-dark text-black"
                      onClick={() => navigate(`/parking/${booking.parking_spot_id}`)}
                    >
                      Ver detalhes
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </>
          ) : (
            <div className="text-center py-10">
              <Car className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum agendamento ativo</h3>
              <p className="text-muted-foreground mb-6">Você não possui agendamentos ativos ou futuros no momento.</p>
              <Button 
                className="bg-spatioo-green hover:bg-spatioo-green-dark text-black"
                onClick={() => navigate('/explore')}
              >
                Encontrar estacionamento
              </Button>
            </div>
          )}
        </TabsContent>
        
        {/* Booking History Tab */}
        <TabsContent value="history" className="space-y-4">
          {historyBookings.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-muted-foreground">{historyBookings.length} reservas anteriores</p>
              </div>
              
              {historyBookings.map((booking) => (
                <Card key={booking.id} className="bg-muted/40">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div>
                        <CardTitle className="text-lg">{booking.parkingName}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {booking.parkingAddress}
                        </CardDescription>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        booking.status === 'completed' 
                          ? 'bg-green-500/20 text-green-600 dark:bg-green-900/40 dark:text-green-400' 
                          : 'bg-red-500/20 text-red-600 dark:bg-red-900/40 dark:text-red-400'
                      }`}>
                        {booking.status === 'completed' ? 'Concluído' : 'Cancelado'}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Data</p>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">{formatDate(booking.date)}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Horário</p>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">{formatHours(booking.start_time, booking.end_time)}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Vaga</p>
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">{booking.spot_number}</p>
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
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/parking/${booking.parking_spot_id}`)}
                    >
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
      </Tabs>
      
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
            <Button variant="destructive" onClick={handleConfirmCancel}>
              Confirmar cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
