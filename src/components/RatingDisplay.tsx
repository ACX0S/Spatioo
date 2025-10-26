import { Star, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface RatingDisplayProps {
  rating: number;
  reviewCount?: number; // Total de avaliações
  showNumber?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const RatingDisplay = ({ 
  rating, 
  reviewCount = 0,
  showNumber = true, 
  size = 'md',
  className = '' 
}: RatingDisplayProps) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  // Se tem menos de 3 avaliações, mostrar "Novo!"
  if (reviewCount < 3) {
    return (
      <Badge variant="secondary" className={`${textSizeClasses[size]} ${className} bg-spatioo-green/20 text-spatioo-green border-spatioo-green/30 gap-1`}>
        <Sparkles className={sizeClasses[size]} />
        Novo!
      </Badge>
    );
  }

  // Se não tem avaliações (caso edge)
  if (rating === 0 || rating === null) {
    return (
      <span className={`text-muted-foreground ${textSizeClasses[size]} ${className}`}>
        Sem avaliações
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Star className={`${sizeClasses[size]} fill-primary text-primary`} />
      {showNumber && (
        <span className={`font-medium ${textSizeClasses[size]}`}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};
