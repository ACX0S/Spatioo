import { Star } from 'lucide-react';

interface RatingDisplayProps {
  rating: number;
  showNumber?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const RatingDisplay = ({ 
  rating, 
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

  if (rating === 0) {
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
