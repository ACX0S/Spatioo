import React, { memo } from 'react';
import ParkingCard from './ParkingCard';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { PublicParkingData } from '@/services/parkingService';

interface ParkingGridProps {
  data: PublicParkingData[];
  loading?: boolean;
  error?: string | null;
  onParkingSelect?: (spot: PublicParkingData) => void;
  onRetry?: () => void;
  emptyMessage?: string;
  loadingText?: string;
  showDistance?: boolean;
  calculateDistance?: (spot: PublicParkingData) => number;
  className?: string;
  cardClassName?: string;
}

const ParkingGrid = memo(({
  data,
  loading = false,
  error = null,
  onParkingSelect,
  onRetry,
  emptyMessage = 'Nenhum estacionamento encontrado.',
  loadingText = 'Carregando estacionamentos...',
  showDistance = false,
  calculateDistance,
  className = '',
  cardClassName = ''
}: ParkingGridProps) => {
  if (loading) {
    return <LoadingSpinner text={loadingText} className={className} />;
  }

  if (error) {
    return (
      <ErrorMessage 
        title="Erro ao carregar estacionamentos"
        message={error}
        onRetry={onRetry}
        className={className}
      />
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}>
      {data.map((spot) => (
        <ParkingCard
          key={spot.id}
          parkingSpot={spot}
          onSelect={onParkingSelect}
          showDistance={showDistance}
          distance={calculateDistance?.(spot)}
          className={cardClassName}
        />
      ))}
    </div>
  );
});

ParkingGrid.displayName = 'ParkingGrid';

export default ParkingGrid;