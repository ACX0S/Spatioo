import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BookingCard from "@/components/BookingCard";
import { useBookings } from "@/hooks/useBookings";
import { BookingListSkeleton } from "@/components/skeletons/BookingCardSkeleton";
import ErrorMessage from "@/components/ErrorMessage";
import { Calendar, History, Bell } from "lucide-react";
import NotificationsList from "@/components/NotificationsList";
import { ActiveBookingBanner } from "@/components/ActiveBookingBanner";
import { UserBookingStatus } from "@/components/UserBookingStatus";
import { PendingReviewBanner } from "@/components/PendingReviewBanner";

const Dashboard = () => {
  const { bookings, loading, error, cancelBooking, activeBookings, historyBookings } = useBookings();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Reservas</h1>
          <p className="text-muted-foreground">Suas reservas e notificações</p>
        </div>
        <BookingListSkeleton count={3} />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Banner de avaliação pendente */}
      <PendingReviewBanner />
      
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Ativas ({activeBookings.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Histórico ({historyBookings.length})
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeBookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma reserva ativa</p>
            </div>
          ) : (
            activeBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancelBooking={cancelBooking}
              />
            ))
          )}
        </TabsContent>
        {/* Banner de reserva ativa (redireciona para rota) */}
        <div className="mb-4">
          <ActiveBookingBanner />
        </div>

        {/* Status detalhado da reserva ativa */}
        <div className="mb-6">
          <UserBookingStatus />
        </div>

        <TabsContent value="history" className="space-y-4">
          {historyBookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma reserva no histórico</p>
            </div>
          ) : (
            historyBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancelBooking={cancelBooking}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;