import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Check, CheckCheck } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { ReviewNotificationModal } from "./ReviewNotificationModal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const NotificationsList = () => {
  const { 
    notifications, 
    loading, 
    error, 
    unreadCount, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();
  const { user } = useAuth();
  
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [reviewTarget, setReviewTarget] = useState<{
    tipo: 'motorista' | 'estacionamento';
    id: string;
    name: string;
  } | null>(null);

  const handleReviewClick = async (notification: any) => {
    if (!notification.booking_id) return;

    try {
      // Buscar detalhes da reserva
      const { data: booking, error } = await supabase
        .from('bookings')
        .select(`
          *,
          estacionamento!bookings_estacionamento_id_fkey (id, nome, user_id)
        `)
        .eq('id', notification.booking_id)
        .single();

      if (error) throw error;

      setSelectedBooking(booking);

      // Determinar quem está avaliando quem
      if (user?.id === booking.user_id) {
        // Motorista avaliando estacionamento
        setReviewTarget({
          tipo: 'estacionamento',
          id: booking.estacionamento.id,
          name: booking.estacionamento.nome
        });
      } else {
        // Estacionamento avaliando motorista - buscar nome do usuário
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, apelido')
          .eq('id', booking.user_id)
          .single();

        setReviewTarget({
          tipo: 'motorista',
          id: booking.user_id,
          name: profile?.apelido || profile?.name || 'Motorista'
        });
      }

      setReviewModalOpen(true);
    } catch (error) {
      console.error('Erro ao carregar reserva:', error);
    }
  };

  const handleReviewClose = () => {
    setReviewModalOpen(false);
    setSelectedBooking(null);
    setReviewTarget(null);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificações
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
        {notifications.length > 0 && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={markAllAsRead}
            className="flex items-center gap-2"
          >
            <CheckCheck className="h-4 w-4" />
            Remover todas
          </Button>
        )}
      </CardHeader>
      
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma notificação encontrada</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    notification.read 
                      ? 'bg-background border-border' 
                      : 'bg-accent/50 border-accent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-spatioo-green rounded-full" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(notification.created_at), "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR
                        })}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      {notification.type === 'review_request' && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleReviewClick(notification)}
                          className="flex items-center gap-1 text-xs bg-spatioo-green hover:bg-spatioo-green/90"
                        >
                          Avaliar
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="flex items-center gap-1 text-xs"
                      >
                        <Check className="h-3 w-3" />
                        Remover
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      {/* Modal de avaliação */}
      {selectedBooking && reviewTarget && (
        <ReviewNotificationModal
          isOpen={reviewModalOpen}
          onClose={handleReviewClose}
          bookingId={selectedBooking.id}
          avaliadoTipo={reviewTarget.tipo}
          avaliadoId={reviewTarget.id}
          targetName={reviewTarget.name}
        />
      )}
    </Card>
  );
};

export default NotificationsList;