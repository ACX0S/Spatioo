import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Car, Clock } from 'lucide-react';
import { useParkingData } from '@/hooks/useParkingData';
import { PublicParkingData } from '@/services/parkingService';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import LocationInput from '@/components/map/LocationInput';
import GoogleMap from '@/components/map/GoogleMap';
import { Card } from '@/components/ui/card';
import LoadingSpinner from '@/components/LoadingSpinner';

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
          setOrigin('Sua localização');
          setOriginCoords({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
        }
      );
    }
  }, []);

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
    
    if (!refCoords) return parkingSpots.slice(0, 10);

    // Calcular distância para cada estacionamento
    const spotsWithDistance = parkingSpots
      .filter(spot => spot.latitude && spot.longitude)
      .map(spot => ({
        ...spot,
        distance: calculateDistance(
          refCoords.lat,
          refCoords.lng,
          Number(spot.latitude),
          Number(spot.longitude)
        )
      }))
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))
      .slice(0, 10); // Mostrar apenas os 10 mais próximos

    return spotsWithDistance;
  }, [parkingSpots, destinationCoords, userLocation, calculateDistance]);

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
    <div className="h-screen flex flex-col-reverse lg:flex-row overflow-hidden bg-background">
      {/* Sidebar de pesquisa - esquerda no desktop, parte inferior no mobile */}
      <div className="w-full lg:w-[420px] h-[45vh] lg:h-full bg-background border-t lg:border-t-0 lg:border-r border-border flex flex-col overflow-hidden shadow-lg lg:shadow-none">
        {/* Header - oculto no mobile */}
        <div className="hidden lg:block p-6 border-b border-border">
          <h1 className="text-2xl font-bold text-foreground">Explorar Estacionamentos</h1>
          <p className="text-sm text-muted-foreground mt-1">Encontre vagas próximas ao seu destino</p>
        </div>

        {/* Campos de pesquisa */}
        <div className="p-4 lg:p-6 space-y-3 border-b border-border bg-card">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Partida
            </label>
            <LocationInput
              value={origin}
              onChange={setOrigin}
              onPlaceSelect={handleOriginSelect}
              placeholder="Sua localização atual"
              icon="origin"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
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
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">
              {loading ? 'Carregando...' : `${nearbyParkingSpots.length} encontrado(s)`}
            </h2>
            {destinationCoords && (
              <p className="text-xs text-spatioo-primary font-medium">Por distância</p>
            )}
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

          <div className="space-y-3">
            {nearbyParkingSpots.map((spot) => (
              <Card
                key={spot.id}
                className="p-4 cursor-pointer hover:shadow-lg hover:border-spatioo-primary transition-all duration-200 bg-card"
                onClick={() => handleParkingSelect(spot)}
              >
                {/* Distância */}
                {(spot as any).distance !== undefined && (
                  <div className="flex items-center gap-1.5 text-spatioo-primary font-bold text-sm mb-3">
                    <Navigation className="w-4 h-4" />
                    <span>{((spot as any).distance as number).toFixed(1)} km</span>
                  </div>
                )}

                {/* Nome */}
                <h3 className="font-bold text-lg mb-2 text-foreground">{spot.nome}</h3>

                {/* Endereço */}
                <div className="flex items-start gap-2 text-sm text-muted-foreground mb-3">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-spatioo-secondary" />
                  <span className="line-clamp-1">{spot.endereco}</span>
                </div>

                {/* Info rápida */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <Car className="w-4 h-4 text-spatioo-secondary" />
                    <span>{spot.numero_vagas} vagas</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span className="line-clamp-1">{formatHorario(spot.horario_funcionamento)}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Mapa - direita no desktop, parte superior no mobile */}
      <div className="flex-1 relative h-[55vh] lg:h-full">
        <GoogleMap
          center={mapCenter}
          parkingSpots={nearbyParkingSpots}
          onParkingSelect={handleParkingSelect}
          userLocation={userLocation}
        />
        
        {/* Badge mobile informativo */}
        <div className="lg:hidden absolute top-4 left-1/2 transform -translate-x-1/2 bg-background/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-border">
          <p className="text-xs font-medium text-foreground">
            {nearbyParkingSpots.length} estacionamento(s) próximo(s)
          </p>
        </div>
      </div>
    </div>
  );
};

export default Explore;