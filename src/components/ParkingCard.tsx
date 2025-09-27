import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Car, MapPin, Clock, Star } from 'lucide-react';
import { PublicParkingData } from '@/services/parkingService';

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
        {/* Image with lazy loading */}
        {parkingSpot.fotos && parkingSpot.fotos.length > 0 && (
          <div className="w-full h-32 bg-gray-200 rounded-lg mb-3 overflow-hidden">
            <img
              src={parkingSpot.fotos[0]}
              alt={`Foto de ${parkingSpot.nome}`}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            {showDistance && distance !== undefined ? (
              <div className="flex items-center text-primary font-semibold text-sm">
                <Star className="w-3 h-3 mr-1" />
                <span>{distance.toFixed(1)} km de distância</span>
              </div>
            ) : (
              <h3 
                className="font-semibold text-sm leading-tight truncate flex-1 min-w-0" 
                title={parkingSpot.nome}
              >
                {parkingSpot.nome}
              </h3>
            )}
            <div className="flex flex-col items-end flex-shrink-0">
              <Badge variant="secondary" className="text-xs">
                R$ {parkingSpot.preco_fixo_1h ? Number(parkingSpot.preco_fixo_1h).toFixed(2) : parkingSpot.preco.toFixed(2)}/h
              </Badge>
              <span className="text-[10px] text-muted-foreground mt-1">
                Preço fixo (1h)
              </span>
            </div>
          </div>

          <div className="flex items-center text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="truncate" title={parkingSpot.endereco}>
              {parkingSpot.endereco}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center text-muted-foreground">
              <Car className="w-3 h-3 mr-1" />
              <span>{parkingSpot.numero_vagas} vagas disponíveis</span>
            </div>

            <div className="flex items-center text-muted-foreground min-w-0">
              <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate" title={formatHorario(parkingSpot.horario_funcionamento)}>
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