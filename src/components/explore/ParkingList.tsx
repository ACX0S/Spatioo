import React from 'react';
import { FaCar } from 'react-icons/fa';
import { MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PublicParkingData } from '@/services/parkingService';
import ParkingListItem from '@/components/ParkingListItem';

interface ParkingListProps {
  spots: PublicParkingData[];
  visibleSpots: PublicParkingData[];
  loading: boolean;
  hasMore: boolean;
  totalCount: number;
  visibleCount: number;
  showDistance: boolean;
  isMobile?: boolean;
  onShowMore: () => void;
  onRetry: () => void;
  onParkingSelect: (spot: PublicParkingData) => void;
  calculateDistance: (refLat: number, refLng: number, spotLat: number, spotLng: number) => number;
  referenceCoords: { lat: number; lng: number } | null;
}

/**
 * Componente de lista de estacionamentos
 * Gerencia loading, empty states e paginação
 */
const ParkingList: React.FC<ParkingListProps> = ({
  spots,
  visibleSpots,
  loading,
  hasMore,
  totalCount,
  visibleCount,
  showDistance,
  isMobile = false,
  onShowMore,
  onRetry,
  onParkingSelect,
  calculateDistance,
  referenceCoords
}) => {
  const skeletonCount = isMobile ? 2 : 3;

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className={isMobile ? 'p-4' : 'p-4'}>
              <div className="flex gap-3">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className={isMobile ? 'h-8 w-16' : 'h-8 w-20'} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (visibleSpots.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <div className={`${isMobile ? 'p-6' : 'p-8'} text-center`}>
          <div className={`inline-flex items-center justify-center ${isMobile ? 'w-14 h-14' : 'w-16 h-16'} rounded-full bg-muted ${isMobile ? 'mb-3' : 'mb-4'}`}>
            <MapPin className={`${isMobile ? 'h-7 w-7' : 'h-8 w-8'} text-muted-foreground`} />
          </div>
          <h3 className={`font-${isMobile ? 'medium' : 'semibold'} ${isMobile ? 'text-base mb-1' : 'text-lg mb-2'}`}>
            Nenhum estacionamento encontrado
          </h3>
          {!isMobile && (
            <p className="text-sm text-muted-foreground mb-4">
              Tente ajustar sua localização ou ampliar a área de busca
            </p>
          )}
          {isMobile ? (
            <p className="text-xs text-muted-foreground">
              Ajuste sua localização
            </p>
          ) : (
            <Button onClick={onRetry} variant="outline" size="sm">
              Atualizar lista
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <>
      {visibleSpots.map((spot, index) => {
        const distance = referenceCoords && spot.latitude && spot.longitude
          ? calculateDistance(
              referenceCoords.lat,
              referenceCoords.lng,
              spot.latitude,
              spot.longitude
            )
          : null;

        const isNearby = index < 5 && distance !== null;

        return (
          <ParkingListItem
            key={spot.id}
            spot={spot}
            distance={distance}
            isNearby={isNearby}
            isMobile={isMobile}
            onClick={() => onParkingSelect(spot)}
          />
        );
      })}

      {hasMore && (
        <Button
          variant="outline"
          size={isMobile ? 'sm' : 'default'}
          className="w-full hover:bg-primary hover:text-primary-foreground transition-colors"
          onClick={onShowMore}
        >
          Ver mais {!isMobile && 'estacionamentos'}
          <Badge variant="secondary" className="ml-2">
            +{totalCount - visibleCount}
          </Badge>
        </Button>
      )}
    </>
  );
};

export default ParkingList;
