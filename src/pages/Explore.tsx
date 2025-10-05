import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaCar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Clock, Locate, GripVertical } from 'lucide-react';
import { useParkingData } from '@/hooks/useParkingData';
import { PublicParkingData } from '@/services/parkingService';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import LocationInput from '@/components/map/LocationInput';
import GoogleMap from '@/components/map/GoogleMap';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { toast } from 'sonner';

/**
 * Página Explore
 * Layout estilo Uber: sidebar com campos de pesquisa à esquerda, mapa à direita
 * Lista de estacionamentos próximos embaixo da sidebar
 */
const Explore = () => {
  const navigate = useNavigate();
  const { isLoaded, loadError } = useGoogleMaps();
  
  // Estados para origem e destino
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originCoords, setOriginCoords] = useState<google.maps.LatLngLiteral | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<google.maps.LatLngLiteral | null>(null);
  
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
    error
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

  // Função para usar localização atual como origem
  const handleUseCurrentLocation = useCallback(() => {
    if (userLocation) {
      setOriginCoords({ lat: userLocation[0], lng: userLocation[1] });
      setOrigin('Sua localização atual');
      setMapCenter({ lat: userLocation[0], lng: userLocation[1] });
      toast.success('Localização atual definida como partida');
    } else if (navigator.geolocation) {
      toast.info('Obtendo sua localização...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setOriginCoords({ lat: latitude, lng: longitude });
          setOrigin('Sua localização atual');
          setMapCenter({ lat: latitude, lng: longitude });
          toast.success('Localização atual definida como partida');
        },
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
    
    // Se não houver referência, retornar todos os estacionamentos
    if (!refCoords) {
      return parkingSpots;
    }

    // Separar estacionamentos com e sem coordenadas
    const spotsWithCoords = parkingSpots.filter(spot => spot.latitude && spot.longitude);
    const spotsWithoutCoords = parkingSpots.filter(spot => !spot.latitude || !spot.longitude);

    // Calcular distância para estacionamentos com coordenadas e ordenar
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

    // Retornar estacionamentos com coordenadas primeiro, depois os sem coordenadas
    return [...spotsWithDistance, ...spotsWithoutCoords];
  }, [parkingSpots, destinationCoords, userLocation, calculateDistance]);

  // Estacionamentos visíveis na lista (limitados por visibleCount)
  const visibleParkingSpots = useMemo(() => {
    return nearbyParkingSpots.slice(0, visibleCount);
  }, [nearbyParkingSpots, visibleCount]);

  // Verificar se há mais estacionamentos para mostrar
  const hasMoreSpots = nearbyParkingSpots.length > visibleCount;

  // Handler para "Ver mais estacionamentos"
  const handleShowMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + 5, nearbyParkingSpots.length));
  }, [nearbyParkingSpots.length]);

  // Handler para quando o usuário seleciona um lugar na origem
  const handleOriginSelect = useCallback((place: google.maps.places.PlaceResult) => {
    if (place.geometry?.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setOriginCoords({ lat, lng });
      setOrigin(place.formatted_address || place.name || '');
    }
  }, []);

  // Handler para quando o usuário seleciona um lugar no destino
  const handleDestinationSelect = useCallback((place: google.maps.places.PlaceResult) => {
    if (place.geometry?.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setDestinationCoords({ lat, lng });
      setDestination(place.formatted_address || place.name || '');
      setMapCenter({ lat, lng }); // Centralizar mapa no destino
    }
  }, []);

  // Handler para selecionar um estacionamento
  const handleParkingSelect = useCallback((spot: PublicParkingData) => {
    navigate(`/parking/${spot.id}`);
  }, [navigate]);

  // Formatar horário de funcionamento
  const formatHorario = (horario: any): string => {
    if (!horario) return 'Não informado';
    if (typeof horario === 'string') return horario;
    if (horario.abertura && horario.fechamento) {
      return `${horario.abertura} - ${horario.fechamento}`;
    }
    return 'Não informado';
  };

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">Erro ao carregar o Google Maps</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-background">
      {/* Layout Desktop - duas colunas lado a lado */}
      <div className="hidden lg:flex h-full">
        <div className="w-[420px] bg-background border-r border-border flex flex-col overflow-hidden shadow-lg">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <h1 className="text-2xl font-bold text-foreground">Explorar Estacionamentos</h1>
            <p className="text-sm text-muted-foreground mt-1">Encontre vagas próximas ao seu destino</p>
          </div>

          {/* Campos de pesquisa */}
          <div className="p-6 space-y-4 border-b border-border bg-gradient-to-br from-primary/5 to-secondary/5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Partida
              </label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleUseCurrentLocation}
                  className="flex-shrink-0 h-12 w-12 border-2 border-primary/30 hover:border-primary hover:bg-primary/10 hover:scale-105 transition-all duration-200 shadow-sm"
                  title="Usar localização atual"
                >
                  <Locate className="h-5 w-5 text-primary" />
                </Button>
                <LocationInput
                  value={origin}
                  onChange={setOrigin}
                  onPlaceSelect={handleOriginSelect}
                  placeholder="Digite o endereço de partida"
                  icon="origin"
                  className="flex-1"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-secondary" />
                Destino
              </label>
              <LocationInput
                value={destination}
                onChange={setDestination}
                onPlaceSelect={handleDestinationSelect}
                placeholder="Para onde você vai?"
                icon="destination"
              />
            </div>
          </div>

          {/* Lista de estacionamentos próximos */}
          <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-background to-muted/10">
            <div className="mb-6 p-4 bg-card border border-border rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FaCar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-foreground">
                      {loading ? 'Carregando...' : `${nearbyParkingSpots.length} encontrado(s)`}
                    </h2>
                    {(destinationCoords || userLocation) && nearbyParkingSpots.length > 0 && (
                      <p className="text-xs text-primary font-medium">Ordenado por distância</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {loading && (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            )}

            {error && (
              <div className="text-center py-8 text-destructive">
                <p>{error}</p>
              </div>
            )}

            {!loading && !error && nearbyParkingSpots.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum estacionamento encontrado</p>
              </div>
            )}

            <div className="space-y-4">
              {visibleParkingSpots.map((spot) => (
                <Card
                  key={spot.id}
                  className="group p-5 cursor-pointer hover:shadow-xl hover:border-primary hover:-translate-y-1 transition-all duration-300 bg-card border-2 border-border active:scale-[0.98]"
                  onClick={() => handleParkingSelect(spot)}
                >
                  <div className="flex items-start gap-3 mb-3">
                    {/* Badge do tipo de estacionamento */}
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      spot.tipo === 'residencial' 
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                        : 'bg-green-500/10 text-green-600 dark:text-green-400'
                    }`}>
                      {spot.tipo === 'residencial' ? '🏠 Residencial' : '🏢 Comercial'}
                    </div>
                    
                    {(spot as any).distance !== undefined && (
                      <div className="flex items-center gap-1.5 text-primary font-bold text-xs bg-primary/10 px-3 py-1 rounded-full">
                        <Navigation className="w-3 h-3" />
                        <span>{((spot as any).distance as number).toFixed(1)} km</span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-bold text-xl mb-3 text-foreground group-hover:text-primary transition-colors">{spot.nome}</h3>
                  
                  <div className="flex items-start gap-2 text-sm text-muted-foreground mb-4">
                    <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5 text-primary" />
                    <span className="line-clamp-2">{spot.endereco}</span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2 text-base font-semibold text-foreground">
                      <div className="p-2 bg-secondary/10 rounded-lg">
                        <FaCar className="w-5 h-5 text-secondary" />
                      </div>
                      <span>{spot.numero_vagas} vagas</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="line-clamp-1">{formatHorario(spot.horario_funcionamento)}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Botão "Ver mais estacionamentos" */}
            {!loading && hasMoreSpots && (
              <div className="mt-6 flex justify-center">
                <Button
                  variant="outline"
                  onClick={handleShowMore}
                  className="w-full max-w-xs border-spatioo-primary text-spatioo-primary hover:bg-spatioo-primary hover:text-white transition-colors"
                >
                  Ver mais estacionamentos
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mapa Desktop */}
        <div className="flex-1 relative">
          <GoogleMap
            center={mapCenter}
            parkingSpots={nearbyParkingSpots}
            onParkingSelect={handleParkingSelect}
            userLocation={userLocation}
          />
        </div>
      </div>

      {/* Layout Mobile - painel redimensionável estilo Uber */}
      <ResizablePanelGroup direction="vertical" className="lg:hidden h-full">
        {/* Painel do Mapa - superior */}
        <ResizablePanel defaultSize={60} minSize={30} maxSize={80}>
          <div className="relative h-full">
            <GoogleMap
              center={mapCenter}
              parkingSpots={nearbyParkingSpots}
              onParkingSelect={handleParkingSelect}
              userLocation={userLocation}
            />
            
            {/* Badge informativo */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-card/95 backdrop-blur-md px-5 py-3 rounded-full shadow-xl border-2 border-primary/20 z-10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/20 rounded-full">
                  <FaCar className="w-4 h-4 text-primary" />
                </div>
                <p className="text-sm font-bold text-foreground">
                  {nearbyParkingSpots.length} {nearbyParkingSpots.length === 1 ? 'estacionamento' : 'estacionamentos'}
                </p>
              </div>
            </div>
          </div>
        </ResizablePanel>

        {/* Handle de redimensionamento com visual de arrastar */}
        <ResizableHandle className="bg-border hover:bg-primary/20 transition-colors relative group">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-1 bg-muted-foreground/30 rounded-full group-hover:bg-primary/40 transition-colors" />
          </div>
        </ResizableHandle>

        {/* Painel da Lista - inferior */}
        <ResizablePanel defaultSize={40} minSize={20} maxSize={70}>
          <div className="h-full bg-background border-t border-border flex flex-col overflow-hidden">
            {/* Campos de pesquisa */}
            <div className="p-4 space-y-4 border-b border-border bg-gradient-to-br from-primary/5 to-secondary/5 flex-shrink-0">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Partida
                </label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleUseCurrentLocation}
                    className="flex-shrink-0 h-12 w-12 border-2 border-primary/30 hover:border-primary hover:bg-primary/10 hover:scale-105 transition-all duration-200 shadow-sm active:scale-95"
                    title="Usar localização atual"
                  >
                    <Locate className="h-5 w-5 text-primary" />
                  </Button>
                  <LocationInput
                    value={origin}
                    onChange={setOrigin}
                    onPlaceSelect={handleOriginSelect}
                    placeholder="Digite o endereço de partida"
                    icon="origin"
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                  Destino
                </label>
                <LocationInput
                  value={destination}
                  onChange={setDestination}
                  onPlaceSelect={handleDestinationSelect}
                  placeholder="Para onde você vai?"
                  icon="destination"
                />
              </div>
            </div>

            {/* Lista de estacionamentos */}
            <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-background to-muted/10">
              <div className="mb-4 p-4 bg-card border border-border rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FaCar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-foreground">
                      {loading ? 'Carregando...' : `${nearbyParkingSpots.length} encontrado(s)`}
                    </h2>
                    {(destinationCoords || userLocation) && nearbyParkingSpots.length > 0 && (
                      <p className="text-xs text-primary font-medium">Ordenado por distância</p>
                    )}
                  </div>
                </div>
              </div>

              {loading && (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              )}

              {error && (
                <div className="text-center py-8 text-destructive">
                  <p>{error}</p>
                </div>
              )}

              {!loading && !error && nearbyParkingSpots.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhum estacionamento encontrado</p>
                </div>
              )}

              <div className="space-y-4">
                {visibleParkingSpots.map((spot) => (
                  <Card
                    key={spot.id}
                    className="group p-5 cursor-pointer hover:shadow-xl hover:border-primary hover:-translate-y-1 transition-all duration-300 bg-card border-2 border-border active:scale-[0.98]"
                    onClick={() => handleParkingSelect(spot)}
                  >
                    <div className="flex items-start gap-2 mb-3 flex-wrap">
                      {/* Badge do tipo de estacionamento */}
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                        spot.tipo === 'residencial' 
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                          : 'bg-green-500/10 text-green-600 dark:text-green-400'
                      }`}>
                        {spot.tipo === 'residencial' ? '🏠 Residencial' : '🏢 Comercial'}
                      </div>
                      
                      {(spot as any).distance !== undefined && (
                        <div className="flex items-center gap-1.5 text-primary font-bold text-xs bg-primary/10 px-3 py-1 rounded-full">
                          <Navigation className="w-3 h-3" />
                          <span>{((spot as any).distance as number).toFixed(1)} km</span>
                        </div>
                      )}
                    </div>
                    
                    <h3 className="font-bold text-lg mb-3 text-foreground group-hover:text-primary transition-colors">{spot.nome}</h3>
                    
                    <div className="flex items-start gap-2 text-sm text-muted-foreground mb-4">
                      <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5 text-primary" />
                      <span className="line-clamp-2">{spot.endereco}</span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div className="flex items-center gap-2 text-base font-semibold text-foreground">
                        <div className="p-2 bg-secondary/10 rounded-lg">
                          <FaCar className="w-4 h-4 text-secondary" />
                        </div>
                        <span>{spot.numero_vagas} vagas</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="line-clamp-1">{formatHorario(spot.horario_funcionamento)}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Botão "Ver mais estacionamentos" para mobile */}
              {!loading && hasMoreSpots && (
                <div className="mt-6 flex justify-center pb-4">
                  <Button
                    variant="outline"
                    onClick={handleShowMore}
                    className="w-full max-w-xs border-spatioo-primary text-spatioo-primary hover:bg-spatioo-primary hover:text-white transition-colors"
                  >
                    Ver mais estacionamentos
                  </Button>
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Explore;