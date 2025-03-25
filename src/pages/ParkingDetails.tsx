
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Car, MapPin, Clock, CreditCard, Star, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Navigation, Wifi, ShieldCheck, ZapFast, HelpCircle, Calendar as CalendarIconBase } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock parking data
const PARKING_DATA = {
  id: '1',
  name: 'Downtown Secure Parking',
  address: 'Rua Conselheiro Lafayette, 180, São Caetano do Sul',
  description: 'Estacionamento seguro e coberto no centro da cidade, próximo a restaurantes e comércio local. Oferecemos segurança 24h e sistema de monitoramento por câmeras.',
  coordinates: [-46.5697, -23.6227],
  rating: 4.8,
  totalRatings: 124,
  pricePerHour: 5.50,
  totalSpots: 45,
  availableSpots: 12,
  openingHours: '06:00 - 22:00',
  features: ['covered', 'security', 'camera', 'ev_charging'],
  images: ['https://via.placeholder.com/400', 'https://via.placeholder.com/400', 'https://via.placeholder.com/400'],
  reviews: [
    {
      id: 'rev1',
      user: 'João Silva',
      date: '10/05/2023',
      rating: 5,
      comment: 'Excelente estacionamento, seguro e bem localizado. Funcionários muito atenciosos.'
    },
    {
      id: 'rev2',
      user: 'Maria Santos',
      date: '02/05/2023',
      rating: 4,
      comment: 'Bom custo-benefício, estacionamento espaçoso e bem cuidado.'
    },
    {
      id: 'rev3',
      user: 'Pedro Costa',
      date: '28/04/2023',
      rating: 5,
      comment: 'Sempre estaciono aqui quando venho ao centro. Preço justo e ótima localização.'
    }
  ]
};

const ParkingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('12:00');
  const [activeTab, setActiveTab] = useState('info');
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Generate available times
  const generateTimeSlots = () => {
    const times = [];
    for (let hour = 6; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        times.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    return times;
  };
  
  const availableTimes = generateTimeSlots();
  
  // Calculate hours between start and end time
  const calculateHours = () => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    
    return (endTotalMinutes - startTotalMinutes) / 60;
  };
  
  // Calculate total price
  const calculateTotalPrice = () => {
    const hours = calculateHours();
    return PARKING_DATA.pricePerHour * hours;
  };
  
  // Handle booking confirmation
  const handleBooking = () => {
    setShowConfirmation(true);
  };
  
  // Handle navigation to dashboard after booking
  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };
  
  // Feature icon mapping
  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'covered':
        return <Car className="h-4 w-4" />;
      case 'security':
        return <ShieldCheck className="h-4 w-4" />;
      case 'camera':
        return <Wifi className="h-4 w-4" />;
      case 'ev_charging':
        return <ZapFast className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };
  
  // Feature name mapping
  const getFeatureName = (feature: string) => {
    switch (feature) {
      case 'covered':
        return 'Coberto';
      case 'security':
        return 'Segurança 24h';
      case 'camera':
        return 'Câmeras';
      case 'ev_charging':
        return 'Carregamento EV';
      default:
        return feature;
    }
  };
  
  return (
    <div className="pb-20">
      {/* Header Images */}
      <div className="relative h-64">
        {PARKING_DATA.images.length > 0 ? (
          <div 
            className="h-full bg-center bg-cover"
            style={{ backgroundImage: `url(${PARKING_DATA.images[0]})` }}
          />
        ) : (
          <div className="h-full bg-muted flex items-center justify-center">
            <Car className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
        
        {/* Back button */}
        <Button 
          variant="secondary" 
          size="icon"
          className="absolute top-4 left-4 rounded-full shadow-md"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        {/* Image navigation dots */}
        {PARKING_DATA.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1">
            {PARKING_DATA.images.map((_, index) => (
              <div 
                key={index} 
                className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Parking info */}
      <div className="container p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">{PARKING_DATA.name}</h1>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{PARKING_DATA.address}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-spatioo-green/10 text-spatioo-green px-2 py-1 rounded-full">
            <Star className="h-4 w-4" />
            <span className="font-bold">{PARKING_DATA.rating}</span>
            <span className="text-xs text-muted-foreground">({PARKING_DATA.totalRatings})</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="flex items-center gap-2 p-3 bg-muted/40 rounded-lg">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Horário</p>
              <p className="font-medium">{PARKING_DATA.openingHours}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-muted/40 rounded-lg">
            <Car className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Disponibilidade</p>
              <p className="font-medium">{PARKING_DATA.availableSpots} de {PARKING_DATA.totalSpots} vagas</p>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="location">Localização</TabsTrigger>
            <TabsTrigger value="reviews">Avaliações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Sobre</h3>
              <p className="text-muted-foreground">{PARKING_DATA.description}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Características</h3>
              <div className="grid grid-cols-2 gap-2">
                {PARKING_DATA.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded-lg">
                    <div className="h-8 w-8 rounded-full bg-muted/60 flex items-center justify-center">
                      {getFeatureIcon(feature)}
                    </div>
                    <span>{getFeatureName(feature)}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Preços</h3>
              <div className="bg-muted/40 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span>Taxa por hora</span>
                  <span className="font-bold">R$ {PARKING_DATA.pricePerHour.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="location">
            <div className="bg-muted h-48 rounded-lg flex items-center justify-center mb-4">
              <Navigation className="h-8 w-8 text-muted-foreground" />
              <span className="ml-2">Mapa indisponível em modo demo</span>
            </div>
            
            <Button className="w-full rounded-lg bg-spatioo-green hover:bg-spatioo-green-dark text-black font-medium">
              <Navigation className="mr-2 h-5 w-5" />
              Obter direções
            </Button>
          </TabsContent>
          
          <TabsContent value="reviews">
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted/40 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-spatioo-green">{PARKING_DATA.rating}</div>
                  <div className="text-xs text-muted-foreground">{PARKING_DATA.totalRatings} avaliações</div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-1">
                    <div className="text-yellow-500 flex">
                      <Star className="h-4 w-4" />
                      <Star className="h-4 w-4" />
                      <Star className="h-4 w-4" />
                      <Star className="h-4 w-4" />
                      <Star className="h-4 w-4" />
                    </div>
                    <span className="text-xs text-muted-foreground">75%</span>
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    <div className="text-yellow-500 flex">
                      <Star className="h-4 w-4" />
                      <Star className="h-4 w-4" />
                      <Star className="h-4 w-4" />
                      <Star className="h-4 w-4" />
                    </div>
                    <span className="text-xs text-muted-foreground">20%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="text-yellow-500 flex">
                      <Star className="h-4 w-4" />
                      <Star className="h-4 w-4" />
                      <Star className="h-4 w-4" />
                    </div>
                    <span className="text-xs text-muted-foreground">5%</span>
                  </div>
                </div>
              </div>
              
              {PARKING_DATA.reviews.map((review) => (
                <Card key={review.id} className="border-border">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{review.user}</p>
                        <p className="text-xs text-muted-foreground">{review.date}</p>
                      </div>
                      <div className="flex text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className="h-3 w-3" 
                            fill={i < review.rating ? "currentColor" : "none"}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Booking Section */}
        <div className="bg-card rounded-lg border border-border p-4 space-y-4 mb-4">
          <h3 className="text-lg font-medium">Reserve sua vaga</h3>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Data</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Selecione uma data</span>}
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
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Entrada</label>
                <select 
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                >
                  {availableTimes.map((time) => (
                    <option key={`start-${time}`} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Saída</label>
                <select 
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                >
                  {availableTimes.map((time) => (
                    <option 
                      key={`end-${time}`} 
                      value={time}
                      disabled={time <= startTime}
                    >
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="bg-muted/40 p-3 rounded-lg">
            <div className="flex justify-between items-center text-sm mb-1">
              <span>Taxa por hora</span>
              <span>R$ {PARKING_DATA.pricePerHour.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm mb-1">
              <span>Período</span>
              <span>{calculateHours()} horas</span>
            </div>
            <div className="flex justify-between items-center font-bold mt-2 pt-2 border-t border-border">
              <span>Total</span>
              <span>R$ {calculateTotalPrice().toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Booking bottom bar */}
      <div className="fixed bottom-16 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border p-4 flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">Preço total</p>
          <p className="text-xl font-bold">R$ {calculateTotalPrice().toFixed(2)}</p>
        </div>
        
        <Button 
          className="h-12 bg-spatioo-green hover:bg-spatioo-green-dark text-black font-medium"
          onClick={handleBooking}
        >
          Reservar vaga
          <ChevronRight className="ml-1 h-5 w-5" />
        </Button>
      </div>
      
      {/* Booking confirmation dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reserva confirmada!</DialogTitle>
            <DialogDescription>
              Sua vaga foi reservada com sucesso. Confira os detalhes abaixo.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-spatioo-green/10 rounded-lg p-4 flex gap-4 border border-spatioo-green/30">
              <div className="h-10 w-10 rounded-full bg-spatioo-green/20 flex items-center justify-center">
                <CalendarIconBase className="h-5 w-5 text-spatioo-green" />
              </div>
              <div>
                <p className="font-medium text-spatioo-green">Reserva confirmada</p>
                <p className="text-sm">Sua vaga foi reservada com sucesso!</p>
              </div>
            </div>
            
            <div className="bg-card rounded-lg border border-border p-4 space-y-3">
              <h4 className="font-medium">{PARKING_DATA.name}</h4>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {PARKING_DATA.address}
              </p>
              
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Data</p>
                    <p className="text-sm font-medium">{date ? format(date, "PPP") : ""}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Horário</p>
                    <p className="text-sm font-medium">{startTime} - {endTime}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Vaga</p>
                    <p className="text-sm font-medium">A12</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-sm font-medium">R$ {calculateTotalPrice().toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              className="w-full bg-spatioo-green hover:bg-spatioo-green-dark text-black font-medium"
              onClick={handleGoToDashboard}
            >
              Ver minhas reservas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParkingDetails;
