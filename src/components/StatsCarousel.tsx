import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaCar } from 'react-icons/fa';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface StatsCarouselProps {
  stats: {
    total_vagas: number;
    vagas_disponiveis: number;
    vagas_ocupadas: number;
    vagas_reservadas: number;
  };
}

export const StatsCarousel = ({ stats }: StatsCarouselProps) => {
  const statCards = [
    {
      title: "Total",
      value: stats.total_vagas,
      icon: FaCar,
      color: "text-foreground",
      bgColor: "bg-muted/50"
    },
    {
      title: "Disponíveis",
      value: stats.vagas_disponiveis,
      icon: FaCar,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Ocupadas",
      value: stats.vagas_ocupadas,
      icon: FaCar,
      color: "text-red-500",
      bgColor: "bg-red-500/10"
    },
    {
      title: "Reservadas",
      value: stats.vagas_reservadas,
      icon: FaCar,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    }
  ];

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-3 pb-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="flex-shrink-0 w-[160px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};
