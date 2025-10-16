import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap as GoogleMapComponent, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api';
import { PublicParkingData } from '@/services/parkingService';
import { Button } from '@/components/ui/button';
import { useMapOptions } from '@/components/ui/useMapOptions';
import { FaCar, FaWarehouse, FaHouseUser } from 'react-icons/fa';

interface GoogleMapProps {
  center: google.maps.LatLngLiteral;
  parkingSpots: PublicParkingData[];
  onParkingSelect: (spot: PublicParkingData) => void;
  userLocation?: [number, number] | null;
  origin?: google.maps.LatLngLiteral | null;
  destination?: google.maps.LatLngLiteral | null;
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

const GoogleMap: React.FC<GoogleMapProps> = ({
  center,
  parkingSpots,
  onParkingSelect,
  userLocation,
  origin,
  destination
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<PublicParkingData | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(14);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

  const mapOptions = useMapOptions();

  // Calcular rota quando origem e destino são fornecidos
  useEffect(() => {
    if (!origin || !destination || !window.google) {
      setDirections(null);
      return;
    }

    const directionsService = new google.maps.DirectionsService();

    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
        } else {
          console.error('Erro ao calcular rota:', status);
          setDirections(null);
        }
      }
    );
  }, [origin, destination]);

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
    const baseSize = 36;
    const zoomFactor = Math.min(Math.max((currentZoom - 12) * 0.3 + 1, 0.6), 1.8);
    const size = baseSize * zoomFactor;
    
    const isResidencial = tipo === 'residencial';
    const color = isResidencial ? '#3B82F6' : '#10B981';
    const scale = 0.8;
    const finalSize = size * scale;
    const strokeWidth = isSelected ? 3 : 2;
    
    // Ícones FontAwesome como SVG paths
    const housePath = 'M12 3l-8 8v10h6v-6h4v6h6V11L12 3z'; // Simplificado
    const warehousePath = 'M4 6h16v12H4V6zm2 2v8h12V8H6z'; // Simplificado

    const svg = `
      <svg width="${finalSize}" height="${finalSize * 1.2}" viewBox="0 0 24 29" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow${isSelected ? '-selected' : ''}">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.4"/>
          </filter>
        </defs>
        <path d="M12 0C7.58 0 4 3.58 4 8c0 5.25 8 16 8 16s8-10.75 8-16c0-4.42-3.58-8-8-8z" 
              fill="${color}" 
              stroke="white" 
              stroke-width="${strokeWidth}"
              filter="url(#shadow${isSelected ? '-selected' : ''})"
        />
        <circle cx="12" cy="8" r="5" fill="white" opacity="0.95"/>
        <g transform="translate(9.5, 5.5) scale(${isSelected ? 0.22 : 0.18})">
          <path d="${isResidencial ? housePath : warehousePath}" fill="${color}" />
        </g>
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
      {/* Renderizar rota se existir */}
      {directions && (
        <DirectionsRenderer
          directions={directions}
          options={{
            suppressMarkers: false,
            polylineOptions: {
              strokeColor: '#10B981',
              strokeWeight: 5,
              strokeOpacity: 0.8,
            },
          }}
        />
      )}

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

      {/* Renderiza marcador do destino se houver */}
      {destination && (
        <Marker
          position={destination}
          icon={{
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <filter id="shadow-dest">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.5"/>
                  </filter>
                </defs>
                <path d="M16 0C9.373 0 4 5.373 4 12c0 9 12 24 12 24s12-15 12-24c0-6.627-5.373-12-12-12z" 
                      fill="#EF4444" 
                      stroke="white" 
                      stroke-width="2"
                      filter="url(#shadow-dest)"
                />
                <circle cx="16" cy="12" r="5" fill="white" opacity="0.9"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(32, 42),
            anchor: new google.maps.Point(16, 42),
          }}
          title="Destino"
          animation={google.maps.Animation.DROP}
        />
      )}

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
              scale: 25,
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
          <div className="min-w-[200px] relative">
            <p className="text-sm text-muted-foreground line-clamp-2 text-stone-900">{selectedSpot.nome}</p>
            <div className="flex items-center gap-1 mb-3">
              <FaCar className="w-3.5 h-3.5 text-secondary text-spatioo-primary dark:text-spatioo-secondary" />
              <span className="text-[12.9px] dark:text-stone-800">{selectedSpot.numero_vagas} vagas disponíveis</span>
            </div>
            <Button
              size="sm"
              onClick={() => {
                onParkingSelect(selectedSpot);
                setSelectedSpot(null);
              }}
              className="w-full bg-primary hover:bg-primary/90 dark:text-stone-800 bg-spatioo-primary dark:bg-spatioo-secondary"
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