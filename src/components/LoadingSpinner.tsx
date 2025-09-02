import React, { memo } from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const LoadingSpinner = memo(({ 
  size = 'md', 
  className = '',
  text = 'Carregando...'
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  };

  return (
    <div className={cn("flex flex-col items-center justify-center p-4", className)}>
      <div className={cn(
        "animate-spin rounded-full border-b-2 border-primary",
        sizeClasses[size]
      )}></div>
      {text && (
        <p className="text-sm text-muted-foreground mt-2">{text}</p>
      )}
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;