import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaCar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Clock, Locate, Loader2 } from 'lucide-react';
import { useParkingData } from '@/hooks/useParkingData';
import { PublicParkingData } from '@/services/parkingService';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import LocationInput from '@/components/map/LocationInput';
import GoogleMap from '@/components/map/GoogleMap';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { toast } from 'sonner';
import Layout from '@/components/Layout';

/**
 * Página Explore - Busca e visualização de estacionamentos
 * Layout responsivo com sidebar (desktop) e painel redimensionável (mobile)
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
      <Layout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] gap-4">
          <p className="text-destructive text-lg font-medium">Erro ao carregar o mapa</p>
          <p className="text-muted-foreground text-sm">Verifique sua conexão com a internet</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Tentar novamente
          </Button>
        </div>
      </Layout>
    );
  }

  if (!isLoaded) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Carregando mapa...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-[calc(100vh-4rem)] overflow-hidden">
        {/* Layout Desktop - duas colunas lado a lado */}
        <div className="hidden lg:flex h-full">
          <div className="w-[420px] bg-background border-r border-border flex flex-col overflow-hidden shadow-lg">
            {/* Header */}
            <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5">
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
                    className="flex-shrink-0 h-12 w-12 border-2 border-primary/30 hover:border-primary hover:bg-primary/10 hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm"
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
                {loading ? (
                  // Loading skeletons
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="overflow-hidden">
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-5 w-3/4" />
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-1/2" />
                            </div>
                            <Skeleton className="h-8 w-20" />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : visibleParkingSpots.length === 0 ? (
                  <Card className="border-dashed border-2">
                    <div className="p-8 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                        <MapPin className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">Nenhum estacionamento encontrado</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Tente ajustar sua localização ou ampliar a área de busca
                      </p>
                      <Button onClick={refetch} variant="outline" size="sm">
                        Atualizar lista
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <>
                    {visibleParkingSpots.map((spot, index) => {
                      const distance = (destinationCoords || userLocation) && spot.latitude && spot.longitude
                        ? calculateDistance(
                            (destinationCoords || userLocation)!.lat,
                            (destinationCoords || userLocation)!.lng,
                            spot.latitude,
                            spot.longitude
                          )
                        : null;

                      const isNearby = index < 5 && distance !== null;

                      return (
                        <Card
                          key={spot.id}
                          className={`cursor-pointer transition-all duration-200 hover:shadow-xl hover:border-primary hover:-translate-y-1 ${
                            isNearby ? 'border-primary/30 bg-primary/5' : ''
                          }`}
                          onClick={() => handleParkingSelect(spot)}
                        >
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <h3 className="font-semibold text-base line-clamp-1 flex-1 min-w-0">
                                    {spot.nome}
                                  </h3>
                                  {spot.tipo && (
                                    <Badge 
                                      variant="outline" 
                                      className={`flex-shrink-0 ${
                                        spot.tipo === 'residencial' 
                                          ? 'bg-blue-50 text-blue-700 border-blue-300' 
                                          : 'bg-green-50 text-green-700 border-green-300'
                                      }`}
                                    >
                                      {spot.tipo === 'residencial' ? '🏠' : '🏢'}
                                    </Badge>
                                  )}
                                  {isNearby && (
                                    <Badge className="bg-primary text-primary-foreground flex-shrink-0">
                                      Próximo
                                    </Badge>
                                  )}
                                </div>
                                <div className="space-y-1.5 text-sm">
                                  <div className="flex items-start gap-2 text-muted-foreground">
                                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                                    <span className="line-clamp-2">{spot.endereco}</span>
                                  </div>
                                  {distance !== null && (
                                    <div className="flex items-center gap-2 text-primary font-semibold">
                                      <Navigation className="h-4 w-4 flex-shrink-0" />
                                      {distance.toFixed(1)} km
                                    </div>
                                  )}
                                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                      <FaCar className="h-4 w-4 text-secondary" />
                                      <span className="font-medium">{spot.numero_vagas} vagas</span>
                                    </div>
                                    {spot.horario_funcionamento && (
                                      <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                                        <Clock className="h-3.5 w-3.5" />
                                        {formatHorario(spot.horario_funcionamento)}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-xl font-bold text-primary">
                                  {spot.preco_hora?.toLocaleString('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                  })}
                                </p>
                                <p className="text-xs text-muted-foreground">por hora</p>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}

                    {/* Botão "Ver mais" */}
                    {hasMoreSpots && (
                      <Button 
                        variant="outline" 
                        className="w-full hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={handleShowMore}
                      >
                        Ver mais estacionamentos
                        <Badge variant="secondary" className="ml-2">
                          +{nearbyParkingSpots.length - visibleCount}
                        </Badge>
                      </Button>
                    )}
                  </>
                )}
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
            />
          </div>
        </div>

        {/* Layout Mobile com ResizablePanel */}
        <div className="lg:hidden h-full">
          <ResizablePanelGroup direction="vertical">
            {/* Painel do Mapa */}
            <ResizablePanel defaultSize={60} minSize={30} maxSize={80}>
              <div className="relative h-full">
                <GoogleMap
                  center={mapCenter}
                  parkingSpots={parkingSpots.filter(spot => spot.latitude && spot.longitude)}
                  onParkingSelect={handleParkingSelect}
                  userLocation={userLocation}
                />
                
                {/* Badge de informações sobreposto ao mapa */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                  <Badge 
                    variant="secondary" 
                    className="shadow-lg backdrop-blur-sm bg-background/95 border-2 border-primary/20 px-4 py-2"
                  >
                    <FaCar className="h-4 w-4 mr-2 text-primary" />
                    <span className="font-semibold">{parkingSpots.filter(s => s.latitude && s.longitude).length}</span> no mapa
                  </Badge>
                </div>
              </div>
            </ResizablePanel>
            
            <ResizableHandle withHandle className="bg-primary/10 hover:bg-primary/20 active:bg-primary/30 transition-colors" />
            
            {/* Painel de Busca e Lista */}
            <ResizablePanel defaultSize={40} minSize={20} maxSize={70}>
              <div className="h-full flex flex-col bg-background p-4 overflow-hidden">
                {/* Inputs de localização - Design melhorado */}
                <div className="space-y-3 mb-4">
                  <div className="relative">
                    <LocationInput
                      placeholder="De onde você está saindo?"
                      icon="origin"
                      value={origin}
                      onChange={setOrigin}
                      onPlaceSelect={handleOriginSelect}
                    />
                  </div>
                  
                  <div className="relative">
                    <LocationInput
                      placeholder="Para onde você vai?"
                      icon="destination"
                      value={destination}
                      onChange={setDestination}
                      onPlaceSelect={handleDestinationSelect}
                    />
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full hover:bg-primary hover:text-primary-foreground hover:scale-105 active:scale-95 transition-all"
                    onClick={handleUseCurrentLocation}
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Usar minha localização
                  </Button>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <Badge 
                    variant="secondary" 
                    className="flex items-center gap-2 bg-primary/10 text-primary border-primary/20"
                  >
                    <FaCar className="h-4 w-4" />
                    <span className="font-semibold">{nearbyParkingSpots.length}</span>
                    {(destinationCoords || userLocation) && ' • Por distância'}
                  </Badge>
                </div>

                {/* Lista de estacionamentos */}
                <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2].map((i) => (
                        <Card key={i}>
                          <div className="p-4">
                            <div className="flex gap-3">
                              <div className="flex-1 space-y-2">
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-1/2" />
                              </div>
                              <Skeleton className="h-8 w-16" />
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : visibleParkingSpots.length === 0 ? (
                    <Card className="border-dashed border-2">
                      <div className="p-6 text-center">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted mb-3">
                          <MapPin className="h-7 w-7 text-muted-foreground" />
                        </div>
                        <p className="font-medium mb-1">Nenhum estacionamento</p>
                        <p className="text-xs text-muted-foreground">
                          Ajuste sua localização
                        </p>
                      </div>
                    </Card>
                  ) : (
                    <>
                      {visibleParkingSpots.map((spot, index) => {
                        const distance = (destinationCoords || userLocation) && spot.latitude && spot.longitude
                          ? calculateDistance(
                              (destinationCoords || userLocation)!.lat,
                              (destinationCoords || userLocation)!.lng,
                              spot.latitude,
                              spot.longitude
                            )
                          : null;

                        const isNearby = index < 5 && distance !== null;

                        return (
                          <Card
                            key={spot.id}
                            className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary hover:scale-[1.02] active:scale-100 ${
                              isNearby ? 'border-primary/40 bg-primary/5' : ''
                            }`}
                            onClick={() => handleParkingSelect(spot)}
                          >
                            <div className="p-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                                    <h3 className="font-semibold text-sm line-clamp-1 flex-1 min-w-0">
                                      {spot.nome}
                                    </h3>
                                    {spot.tipo && (
                                      <Badge 
                                        variant="outline" 
                                        className={`text-xs px-1.5 py-0 h-5 ${
                                          spot.tipo === 'residencial' 
                                            ? 'bg-blue-50 text-blue-700 border-blue-300' 
                                            : 'bg-green-50 text-green-700 border-green-300'
                                        }`}
                                      >
                                        {spot.tipo === 'residencial' ? '🏠' : '🏢'}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="space-y-1 text-xs">
                                    <div className="flex items-start gap-1.5 text-muted-foreground">
                                      <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-primary" />
                                      <span className="line-clamp-1">{spot.endereco}</span>
                                    </div>
                                    {distance !== null && (
                                      <div className="flex items-center gap-1.5 text-primary font-semibold">
                                        <Navigation className="h-3.5 w-3.5" />
                                        {distance.toFixed(1)} km
                                      </div>
                                    )}
                                    <div className="flex items-center gap-3">
                                      <div className="flex items-center gap-1 text-muted-foreground">
                                        <FaCar className="h-3.5 w-3.5 text-secondary" />
                                        <span>{spot.numero_vagas}</span>
                                      </div>
                                      {spot.horario_funcionamento && (
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                          <Clock className="h-3 w-3" />
                                          <span className="text-xs">{formatHorario(spot.horario_funcionamento)}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="text-base font-bold text-primary">
                                    {spot.preco_hora?.toLocaleString('pt-BR', {
                                      style: 'currency',
                                      currency: 'BRL'
                                    })}
                                  </p>
                                  <p className="text-xs text-muted-foreground">/h</p>
                                </div>
                              </div>
                            </div>
                          </Card>
                        );
                      })}

                      {hasMoreSpots && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full hover:bg-primary hover:text-primary-foreground"
                          onClick={handleShowMore}
                        >
                          Ver mais <Badge variant="secondary" className="ml-2">+{nearbyParkingSpots.length - visibleCount}</Badge>
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </Layout>
  );
};

export default Explore;