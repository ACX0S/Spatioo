import React from 'react';
import { FaCar, FaWarehouse, FaHouseUser } from 'react-icons/fa';
import { MapPin, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PublicParkingData } from '@/services/parkingService';

interface ParkingListItemProps {
  spot: PublicParkingData;
  distance: number | null;
  isNearby: boolean;
  isMobile?: boolean;
  onClick: () => void;
}

/**
 * Componente de item da lista de estacionamentos
 * Reutilizável para desktop e mobile com variações de layout
 */
const ParkingListItem: React.FC<ParkingListItemProps> = ({
  spot,
  distance,
  isNearby,
  isMobile = false,
  onClick
}) => {
  // Formatar distância de forma legível
  const formatDistance = (dist: number): string => {
    if (dist < 1) {
      return `${(dist * 1000).toFixed(0)} m`;
    }
    return `${dist.toFixed(1)} km`;
  };

  // Formatar horário de funcionamento
  const formatHorario = (horario: any): string => {
    if (!horario) return 'Não informado';
    if (typeof horario === 'string') return horario;
    if (horario.abertura && horario.fechamento) {
      return `${horario.abertura} - ${horario.fechamento}`;
    }
    return 'Não informado';
  };

  // Obter classe de tipo de estacionamento
  const getTipoBadgeClass = (tipo: string) => {
    return tipo === 'residencial'
      ? 'bg-blue-50 text-blue-700 border-blue-300'
      : 'bg-green-50 text-green-700 border-green-300';
  };

  // Estilos específicos para mobile/desktop
  const cardPadding = isMobile ? 'p-3' : 'p-4';
  const titleSize = isMobile ? 'text-base' : 'text-lg';
  const nameSize = isMobile ? 'text-sm' : 'text-base';
  const addressSize = isMobile ? 'text-xs' : 'text-xs';
  const priceSize = isMobile ? 'text-base' : 'text-xl';
  const iconSize = isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4';

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 ${
        isMobile
          ? 'hover:shadow-lg hover:border-primary hover:scale-[1.02] active:scale-100'
          : 'hover:shadow-xl hover:border-primary hover:-translate-y-1'
      } ${isNearby ? 'border-primary/30 bg-primary/5' : ''}`}
      onClick={onClick}
    >
      <div className={cardPadding}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className={`flex items-center gap-2 ${isMobile ? 'mb-1.5' : 'mb-2'} flex-wrap`}>
              {distance !== null ? (
                <h3 className={`font-bold ${titleSize} text-primary flex-1 min-w-0`}>
                  {formatDistance(distance)}
                </h3>
              ) : (
                <h3 className={`font-semibold ${nameSize} line-clamp-1 flex-1 min-w-0`}>
                  {spot.nome}
                </h3>
              )}
              
              {spot.tipo && (
                <Badge
                  variant="outline"
                  className={`${isMobile ? 'text-xs px-1.5 py-0 h-5' : ''} flex items-center gap-1 ${getTipoBadgeClass(spot.tipo)}`}
                >
                  {spot.tipo === 'residencial' ? (
                    <FaHouseUser className="h-3 w-3" />
                  ) : (
                    <FaWarehouse className="h-3 w-3" />
                  )}
                  {!isMobile && <span>{spot.tipo === 'residencial' ? 'Residencial' : 'Estacionamento'}</span>}
                </Badge>
              )}
              
              {isNearby && !isMobile && (
                <Badge className="bg-primary text-primary-foreground flex-shrink-0">
                  Próximo
                </Badge>
              )}
            </div>

            <div className={`space-y-${isMobile ? '1' : '1.5'} text-sm`}>
              <div className="flex items-start gap-2 text-muted-foreground">
                {!isMobile && <MapPin className={`${iconSize} mt-0.5 flex-shrink-0 text-primary`} />}
                <span className={`${isMobile ? 'line-clamp-1' : 'line-clamp-2'} font-medium`}>
                  {spot.nome}
                </span>
              </div>
              
              <div className={`flex items-start gap-${isMobile ? '1.5' : '2'} text-muted-foreground ${addressSize}`}>
                {isMobile && <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-primary" />}
                <span className="line-clamp-1">{spot.endereco}</span>
              </div>

              <div className={`flex items-center gap-${isMobile ? '3' : '4'} mt-2 flex-wrap`}>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <FaCar className={`${iconSize} text-secondary`} />
                  <span className={isMobile ? '' : 'font-medium'}>{spot.numero_vagas} {!isMobile && 'vagas'}</span>
                </div>
                
                {spot.horario_funcionamento && (
                  <div className={`flex items-center gap-${isMobile ? '1' : '1.5'} text-muted-foreground ${isMobile ? 'text-xs' : 'text-xs'}`}>
                    <Clock className={isMobile ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
                    {formatHorario(spot.horario_funcionamento)}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <p className={`${priceSize} font-bold text-primary`}>
              {(spot.preco_fixo_1h || spot.preco)?.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
            </p>
            <p className="text-xs text-muted-foreground">{isMobile ? '/h' : 'por hora'}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ParkingListItem;
