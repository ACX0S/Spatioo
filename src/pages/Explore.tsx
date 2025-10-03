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
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Sidebar de pesquisa - esquerda no desktop, topo no mobile */}
      <div className="w-full lg:w-[400px] bg-background border-r flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold">Explorar Estacionamentos</h1>
        </div>

        {/* Campos de pesquisa */}
        <div className="p-4 space-y-4 border-b">
          <LocationInput
            value={origin}
            onChange={setOrigin}
            onPlaceSelect={handleOriginSelect}
            placeholder="Local de partida"
            icon="origin"
          />
          
          <LocationInput
            value={destination}
            onChange={setDestination}
            onPlaceSelect={handleDestinationSelect}
            placeholder="Local de destino"
            icon="destination"
          />
        </div>

        {/* Lista de estacionamentos próximos */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground">
              {loading ? 'Carregando...' : `${nearbyParkingSpots.length} estacionamento(s) próximo(s)`}
            </h2>
            {destinationCoords && (
              <p className="text-xs text-muted-foreground">Ordenado por distância</p>
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
                className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleParkingSelect(spot)}
              >
                {/* Distância */}
                {(spot as any).distance !== undefined && (
                  <div className="flex items-center gap-1 text-spatioo-primary font-semibold text-sm mb-2">
                    <Navigation className="w-4 h-4" />
                    <span>{((spot as any).distance as number).toFixed(1)} km de distância</span>
                  </div>
                )}

                {/* Nome */}
                <h3 className="font-semibold text-base mb-1">{spot.nome}</h3>

                {/* Endereço */}
                <div className="flex items-start gap-2 text-sm text-muted-foreground mb-2">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{spot.endereco}</span>
                </div>

                {/* Vagas disponíveis */}
                <div className="flex items-center gap-2 text-sm mb-2">
                  <Car className="w-4 h-4 text-spatioo-secondary" />
                  <span>{spot.numero_vagas} vagas disponíveis</span>
                </div>

                {/* Horário */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{formatHorario(spot.horario_funcionamento)}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Mapa - direita no desktop, parte inferior no mobile */}
      <div className="flex-1 relative">
        <GoogleMap
          center={mapCenter}
          parkingSpots={nearbyParkingSpots}
          onParkingSelect={handleParkingSelect}
          userLocation={userLocation}
        />
      </div>
    </div>
  );
};

export default Explore;