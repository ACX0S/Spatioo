import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

const ErrorMessage = memo(({ 
  title = 'Erro',
  message = 'Algo deu errado. Tente novamente.',
  onRetry,
  className = ''
}: ErrorMessageProps) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-md">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Tentar Novamente
        </Button>
      )}
    </div>
  );
});

ErrorMessage.displayName = 'ErrorMessage';

export default ErrorMessage;