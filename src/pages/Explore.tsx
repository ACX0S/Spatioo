import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaCar } from 'react-icons/fa';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useParkingData } from '@/hooks/useParkingData';
import { PublicParkingData } from '@/services/parkingService';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import GoogleMap from '@/components/map/GoogleMap';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { toast } from 'sonner';
import SearchInputs from '@/components/explore/SearchInputs';
import ParkingList from '@/components/explore/ParkingList';
import { supabase } from '@/integrations/supabase/client';
import { Booking } from '@/types/booking';

/**
 * Página Explore - Busca e visualização de estacionamentos
 * Layout responsivo com sidebar (desktop) e painel redimensionável (mobile)
 * Suporta visualização de rota quando há uma reserva aceita (bookingId na URL)
 */
const Explore = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingIdParam = searchParams.get('bookingId');
  const { isLoaded, loadError } = useGoogleMaps();
  
  // Estados para origem e destino
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originCoords, setOriginCoords] = useState<google.maps.LatLngLiteral | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<google.maps.LatLngLiteral | null>(null);
  
  // Estado para reserva aceita
  const [acceptedBooking, setAcceptedBooking] = useState<Booking | null>(null);
  
  // Centro do mapa (baseado no destino ou localização do usuário)
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>({ 
    lat: -23.5505, 
    lng: -46.6333 // São Paulo como padrão
  });
  
  // Localização do usuário
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  
  // Controle de quantos estacionamentos mostrar na lista
  const [visibleCount, setVisibleCount] = useState(5);

  // Buscar todos os estacionamentos
  const { 
    data: parkingSpots, 
    loading, 
    error,
    refetch
  } = useParkingData({ 
    type: 'all',
    autoLoad: true 
  });

  // Obter localização do usuário ao carregar
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setMapCenter({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
        }
      );
    }
  }, []);

  // Buscar dados da reserva aceita e configurar rota
  useEffect(() => {
    const loadBookingRoute = async () => {
      if (!bookingIdParam) return;

      try {
        const { data: booking, error } = await supabase
          .from('bookings')
          .select(`
            *,
            estacionamento!bookings_estacionamento_id_fkey (nome, endereco, latitude, longitude)
          `)
          .eq('id', bookingIdParam)
          .single();

        if (error) throw error;

        if (booking && booking.estacionamento) {
          const parkingLat = Number(booking.estacionamento.latitude);
          const parkingLng = Number(booking.estacionamento.longitude);

          if (parkingLat && parkingLng) {
            setDestinationCoords({ lat: parkingLat, lng: parkingLng });
            setDestination(booking.estacionamento.endereco);
            setMapCenter({ lat: parkingLat, lng: parkingLng });

            setAcceptedBooking({
              ...booking,
              status: booking.status as Booking['status'],
              parkingName: booking.estacionamento.nome,
              parkingAddress: booking.estacionamento.endereco,
            });

            // Obter localização atual como origem
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const { latitude, longitude } = position.coords;
                  setOriginCoords({ lat: latitude, lng: longitude });
                  setOrigin('Sua localização atual');
                  toast.success('Rota para o estacionamento carregada!');
                },
                (error) => {
                  console.error('Erro ao obter localização:', error);
                  toast.error('Não foi possível obter sua localização para traçar a rota');
                }
              );
            }
          }
        }
      } catch (error: any) {
        console.error('Erro ao carregar dados da reserva:', error);
        toast.error('Erro ao carregar dados da reserva');
      }
    };

    loadBookingRoute();
  }, [bookingIdParam]);

  // Usar localização atual como origem
  const handleUseCurrentLocation = useCallback(() => {
    const setLocation = (lat: number, lng: number) => {
      setUserLocation([lat, lng]);
      setOriginCoords({ lat, lng });
      setOrigin('Sua localização atual');
      setMapCenter({ lat, lng });
      toast.success('Localização atual definida como partida');
    };

    if (userLocation) {
      setLocation(userLocation[0], userLocation[1]);
    } else if (navigator.geolocation) {
      toast.info('Obtendo sua localização...');
      navigator.geolocation.getCurrentPosition(
        (position) => setLocation(position.coords.latitude, position.coords.longitude),
        (error) => {
          console.error('Erro ao obter localização:', error);
          toast.error('Não foi possível obter sua localização');
        }
      );
    } else {
      toast.error('Geolocalização não suportada pelo navegador');
    }
  }, [userLocation]);

  // Calcular distância entre dois pontos (fórmula de Haversine)
  const calculateDistance = useCallback((
    lat1: number, 
    lng1: number, 
    lat2: number, 
    lng2: number
  ): number => {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  // Estacionamentos próximos ordenados por distância
  const nearbyParkingSpots = useMemo(() => {
    if (!parkingSpots.length) return [];
    
    // Usar destino ou localização do usuário como referência
    const refCoords = destinationCoords || (userLocation ? { lat: userLocation[0], lng: userLocation[1] } : null);
    
    // Separar estacionamentos com e sem coordenadas
    const spotsWithCoords = parkingSpots.filter(spot => spot.latitude && spot.longitude);
    const spotsWithoutCoords = parkingSpots.filter(spot => !spot.latitude || !spot.longitude);

    // Se houver referência, ordenar por distância
    if (refCoords && spotsWithCoords.length > 0) {
      const spotsWithDistance = spotsWithCoords
        .map(spot => ({
          ...spot,
          distance: calculateDistance(
            refCoords.lat,
            refCoords.lng,
            Number(spot.latitude),
            Number(spot.longitude)
          )
        }))
        .sort((a, b) => (a.distance || 0) - (b.distance || 0));

      return [...spotsWithDistance, ...spotsWithoutCoords];
    }
    
    // Se não houver referência, retornar com coordenadas primeiro
    return [...spotsWithCoords, ...spotsWithoutCoords];
  }, [parkingSpots, destinationCoords, userLocation, calculateDistance]);

  // Estacionamentos visíveis na lista (limitados por visibleCount)
  const visibleParkingSpots = useMemo(() => {
    return nearbyParkingSpots.slice(0, visibleCount);
  }, [nearbyParkingSpots, visibleCount]);

  // Reseta o contador quando a lista muda
  useEffect(() => {
    setVisibleCount(5);
  }, [nearbyParkingSpots]);

  // Verificar se há mais estacionamentos para mostrar
  const hasMoreSpots = nearbyParkingSpots.length > visibleCount;

  // Handler para "Ver mais estacionamentos"
  const handleShowMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + 5, nearbyParkingSpots.length));
  }, [nearbyParkingSpots.length]);

  // Handler para seleção de lugares
  const handleOriginSelect = useCallback((place: google.maps.places.PlaceResult) => {
    if (place.geometry?.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setOriginCoords({ lat, lng });
      setOrigin(place.formatted_address || place.name || '');
    }
  }, []);

  const handleDestinationSelect = useCallback((place: google.maps.places.PlaceResult) => {
    if (place.geometry?.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setDestinationCoords({ lat, lng });
      setDestination(place.formatted_address || place.name || '');
      setMapCenter({ lat, lng });
    }
  }, []);

  const handleParkingSelect = useCallback((spot: PublicParkingData) => {
    navigate(`/parking/${spot.id}`);
  }, [navigate]);

  // Converter coordenadas para referência
  const referenceCoords = useMemo(() => {
    if (destinationCoords) return destinationCoords;
    if (userLocation) return { lat: userLocation[0], lng: userLocation[1] };
    return null;
  }, [destinationCoords, userLocation]);

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-destructive text-lg font-medium">Erro ao carregar o mapa</p>
        <p className="text-muted-foreground text-sm">Verifique sua conexão com a internet</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Carregando mapa...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="h-screen overflow-hidden">
        {/* Layout Desktop - duas colunas lado a lado */}
        <div className="hidden lg:flex h-full">
          <div className="w-[420px] bg-background border-r border-border flex flex-col overflow-hidden shadow-lg">
            {/* Header */}
            <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5">
              <h1 className="text-2xl font-bold text-foreground">Explorar Estacionamentos</h1>
              <p className="text-sm text-muted-foreground mt-1">Encontre vagas próximas ao seu destino</p>
            </div>

            {/* Campos de pesquisa */}
            <SearchInputs
              origin={origin}
              destination={destination}
              onOriginChange={setOrigin}
              onDestinationChange={setDestination}
              onOriginSelect={handleOriginSelect}
              onDestinationSelect={handleDestinationSelect}
              onUseCurrentLocation={handleUseCurrentLocation}
            />

            {/* Lista de estacionamentos próximos */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <Badge 
                  variant="secondary" 
                  className="flex items-center gap-2 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
                >
                  <FaCar className="h-4 w-4" />
                  <span className="font-semibold">{nearbyParkingSpots.length}</span> 
                  {nearbyParkingSpots.length === 1 ? 'estacionamento' : 'estacionamentos'}
                  {(destinationCoords || userLocation) && ' • Por distância'}
                </Badge>
              </div>

              {/* Lista de estacionamentos */}
              <div className="space-y-3">
                <ParkingList
                  spots={nearbyParkingSpots}
                  visibleSpots={visibleParkingSpots}
                  loading={loading}
                  hasMore={hasMoreSpots}
                  totalCount={nearbyParkingSpots.length}
                  visibleCount={visibleCount}
                  showDistance={!!referenceCoords}
                  onShowMore={handleShowMore}
                  onRetry={refetch}
                  onParkingSelect={handleParkingSelect}
                  calculateDistance={calculateDistance}
                  referenceCoords={referenceCoords}
                />
              </div>
            </div>
          </div>

          {/* Mapa Desktop */}
          <div className="flex-1 relative">
            <GoogleMap
              center={mapCenter}
              parkingSpots={parkingSpots.filter(s => s.latitude && s.longitude)}
              onParkingSelect={handleParkingSelect}
              userLocation={userLocation}
              origin={originCoords}
              destination={destinationCoords}
            />
          </div>
        </div>

        {/* Layout Mobile com ResizablePanel */}
        <div className="lg:hidden h-full">
          <ResizablePanelGroup direction="vertical">
            {/* Painel do Mapa */}
            <ResizablePanel defaultSize={40} minSize={12} maxSize={76}>
              <div className="relative h-full">
                <GoogleMap
                  center={mapCenter}
                  parkingSpots={parkingSpots.filter(spot => spot.latitude && spot.longitude)}
                  onParkingSelect={handleParkingSelect}
                  userLocation={userLocation}
                  origin={originCoords}
                  destination={destinationCoords}
                />
              </div>
            </ResizablePanel>
            
            <ResizableHandle withHandle className="bg-background p-2" />
            
            {/* Painel de Busca e Lista */}
            <ResizablePanel defaultSize={40} minSize={14} maxSize={88}>
              <div className="h-full flex flex-col bg-background p-2 overflow-hidden">
                {/* Inputs de localização */}
                <SearchInputs
                  origin={origin}
                  destination={destination}
                  onOriginChange={setOrigin}
                  onDestinationChange={setDestination}
                  onOriginSelect={handleOriginSelect}
                  onDestinationSelect={handleDestinationSelect}
                  onUseCurrentLocation={handleUseCurrentLocation}
                  isMobile
                />

                <div className="flex items-center justify-between mb-2.5">
                  <Badge 
                    variant="secondary" 
                    className="flex items-center gap-2 bg-primary/10 text-primary border-primary/20"
                  >
                    <FaCar className="h-3.5 w-3.5" />
                    <span className="font-semibold">{nearbyParkingSpots.length}</span>
                    {(destinationCoords || userLocation) && ' • Por distância'}
                  </Badge>
                </div>

                {/* Lista de estacionamentos */}
                <div className="space-y-2 overflow-y-auto flex-1 px-2">
                  <ParkingList
                    spots={nearbyParkingSpots}
                    visibleSpots={visibleParkingSpots}
                    loading={loading}
                    hasMore={hasMoreSpots}
                    totalCount={nearbyParkingSpots.length}
                    visibleCount={visibleCount}
                    showDistance={!!referenceCoords}
                    isMobile
                    onShowMore={handleShowMore}
                    onRetry={refetch}
                    onParkingSelect={handleParkingSelect}
                    calculateDistance={calculateDistance}
                    referenceCoords={referenceCoords}
                  />
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </div>
  );
};

export default Explore;