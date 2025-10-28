import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Clock } from 'lucide-react';
import { FaCar } from 'react-icons/fa';
import { PublicParkingData } from '@/services/parkingService';
import { RatingDisplay } from './RatingDisplay';

interface ParkingCardProps {
  parkingSpot: PublicParkingData;
  onSelect?: (spot: PublicParkingData) => void;
  showDistance?: boolean;
  distance?: number;
  className?: string;
}

const ParkingCard = memo(({ 
  parkingSpot, 
  onSelect, 
  showDistance = false, 
  distance, 
  className = "" 
}: ParkingCardProps) => {
  const handleClick = () => {
    onSelect?.(parkingSpot);
  };

  const formatHorario = (horario: any) => {
    if (typeof horario === 'object' && horario.abertura && horario.fechamento) {
      return `${horario.abertura} - ${horario.fechamento}`;
    }
    return 'Horário não informado';
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${className}`}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 
              className="font-semibold text-sm leading-tight truncate flex-1 min-w-0" 
              title={parkingSpot.nome}
            >
              {parkingSpot.nome}
            </h3>
            <RatingDisplay 
              rating={parkingSpot.media_avaliacao || 0}
              reviewCount={parkingSpot.total_avaliacoes || 0}
              size="sm"
            />
          </div>
          
          {showDistance && distance !== undefined && (
            <div className="text-xs text-muted-foreground">
              {distance.toFixed(1)} km de distância
            </div>
          )}

          <div className="flex items-center text-xs text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0 text-spatioo-primary dark:text-spatioo-secondary" />
            <span className="line-clamp-1 break-words dark:text-stone-400" title={parkingSpot.endereco}>
              {parkingSpot.endereco}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center text-muted-foreground">
              <FaCar className="w-3.5 h-3.5 mr-1 text-spatioo-green-dark dark:text-spatioo-secondary" />
              <span className="truncate dark:text-stone-400">{parkingSpot.numero_vagas} vagas disponíveis</span>
            </div>

            <div className="flex items-center text-muted-foreground min-w-0">
              <Clock className="w-3 h-3 mr-1 flex-shrink-0 text-spatioo-green-dark dark:text-spatioo-secondary" />
              <span className="truncate dark:text-stone-400" title={formatHorario(parkingSpot.horario_funcionamento)}>
                {formatHorario(parkingSpot.horario_funcionamento)}
              </span>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
});

ParkingCard.displayName = 'ParkingCard';

export default ParkingCard;