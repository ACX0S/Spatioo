import React, { useState, useCallback } from 'react';
import { GoogleMap as GoogleMapComponent, Marker, InfoWindow } from '@react-google-maps/api';
import { PublicParkingData } from '@/services/parkingService';
import { Button } from '@/components/ui/button';
import { FaCar } from 'react-icons/fa';

interface GoogleMapProps {
  center: google.maps.LatLngLiteral;
  parkingSpots: PublicParkingData[];
  onParkingSelect: (spot: PublicParkingData) => void;
  userLocation?: [number, number] | null;
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

/**
 * Opções de configuração do mapa
 * gestureHandling: 'greedy' permite navegação com um único dedo no mobile
 */
const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  gestureHandling: 'greedy', // Permite navegação com um dedo no mobile
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    }
  ]
};

/**
 * Componente do mapa do Google Maps
 * Exibe marcadores dos estacionamentos e permite interação
 */
const GoogleMap: React.FC<GoogleMapProps> = ({
  center,
  parkingSpots,
  onParkingSelect,
  userLocation
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<PublicParkingData | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(14);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMarkerClick = useCallback((spot: PublicParkingData) => {
    setSelectedSpot(spot);
  }, []);

  /**
   * Gera um ícone SVG personalizado e otimizado para os marcadores no mapa
   * @param tipo - Tipo do estacionamento ('residencial' ou 'comercial')
   * @param isSelected - Se o marcador está selecionado
   * @returns Configuração do ícone do Google Maps
   */
  const getMarkerIcon = (tipo: string | undefined, isSelected: boolean = false) => {
    const baseSize = 32;
    const zoomFactor = Math.min(Math.max((currentZoom - 12) * 0.3 + 1, 0.6), 1.8);
    const size = baseSize * zoomFactor;
    
    const isResidencial = tipo === 'residencial';
    const color = isResidencial ? '#3B82F6' : '#10B981';
    const icon = isResidencial ? '🏠' : '🏢';
    const scale = isSelected ? 1.4 : 1;
    const finalSize = size * scale;
    const strokeWidth = isSelected ? 3 : 2;

    const svg = `
      <svg width="${finalSize}" height="${finalSize * 1.2}" viewBox="0 0 24 29" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow${isSelected ? '-selected' : ''}">
            <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
          </filter>
        </defs>
        <path d="M12 0C7.58 0 4 3.58 4 8c0 5.25 8 16 8 16s8-10.75 8-16c0-4.42-3.58-8-8-8z" 
              fill="${color}" 
              stroke="white" 
              stroke-width="${strokeWidth}"
              filter="url(#shadow${isSelected ? '-selected' : ''})"
        />
        <text x="12" y="11" 
              font-size="${isSelected ? '10' : '8'}" 
              text-anchor="middle" 
              dominant-baseline="middle"
        >${icon}</text>
      </svg>
    `;

    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
      scaledSize: new google.maps.Size(finalSize, finalSize * 1.2),
      anchor: new google.maps.Point(finalSize / 2, finalSize * 1.2),
    };
  };

  return (
    <GoogleMapComponent
      mapContainerStyle={containerStyle}
      center={center}
      zoom={14}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={mapOptions}
      onZoomChanged={() => {
        if (map) {
          const zoom = map.getZoom();
          if (zoom) setCurrentZoom(zoom);
        }
      }}
    >
      {/* Renderiza os marcadores de estacionamento no mapa com animação */}
      {parkingSpots.map((spot) => {
        if (!spot.latitude || !spot.longitude) return null;
        
        return (
          <Marker
            key={spot.id}
            position={{ lat: spot.latitude, lng: spot.longitude }}
            onClick={() => handleMarkerClick(spot)}
            icon={getMarkerIcon(spot.tipo, selectedSpot?.id === spot.id)}
            animation={selectedSpot?.id === spot.id ? google.maps.Animation.BOUNCE : undefined}
            title={spot.nome}
          />
        );
      })}

      {/* Renderiza marcador da localização do usuário com animação */}
      {userLocation && (
        <>
          <Marker
            position={{ lat: userLocation[0], lng: userLocation[1] }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
            }}
            title="Você está aqui"
            animation={google.maps.Animation.DROP}
          />
          {/* Círculo de precisão ao redor da localização do usuário */}
          <Marker
            position={{ lat: userLocation[0], lng: userLocation[1] }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 30,
              fillColor: '#4285F4',
              fillOpacity: 0.1,
              strokeColor: '#4285F4',
              strokeWeight: 1,
              strokeOpacity: 0.3,
            }}
          />
        </>
      )}

      {/* InfoWindow para o estacionamento selecionado */}
      {selectedSpot && selectedSpot.latitude && selectedSpot.longitude && (
        <InfoWindow
          position={{ lat: Number(selectedSpot.latitude), lng: Number(selectedSpot.longitude) }}
          onCloseClick={() => setSelectedSpot(null)}
        >
          <div className="p-3 min-w-[220px]">
            <h3 className="font-bold text-base mb-2 text-primary">{selectedSpot.nome}</h3>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{selectedSpot.endereco}</p>
            <div className="flex items-center gap-2 mb-3">
              <FaCar className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium">{selectedSpot.numero_vagas} vagas disponíveis</span>
            </div>
            <Button
              size="sm"
              onClick={() => {
                onParkingSelect(selectedSpot);
                setSelectedSpot(null);
              }}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Ver Detalhes
            </Button>
          </div>
        </InfoWindow>
      )}
    </GoogleMapComponent>
  );
};

export default GoogleMap;