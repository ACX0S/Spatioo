
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useParkingDetail } from '@/hooks/useParkingDetail';
import { Car, MapPin, Star, Clock, ArrowLeft } from 'lucide-react';
import BookingForm from '@/components/BookingForm';
import PricingTable from '@/components/PricingDisplay';

const ParkingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { parkingSpot, loading, error } = useParkingDetail(id || '');

  if (loading) {
    return (
      <div className="container p-4 flex items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spatioo-green"></div>
      </div>
    );
  }

  if (error || !parkingSpot) {
    return (
      <div className="container p-4 max-w-md mx-auto text-center py-10">
        <Car className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">Estacionamento não encontrado</h2>
        <p className="text-muted-foreground mb-6">Não foi possível encontrar os detalhes deste estacionamento.</p>
        <Button 
          onClick={() => navigate(-1)}
          variant="outline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="container p-4 max-w-md mx-auto pb-20">
      {/* Image Carousel */}
      <div className="relative h-48 mb-4">
        {parkingSpot.fotos && parkingSpot.fotos.length > 0 ? (
          <Carousel className="w-full h-full">
            <CarouselContent>
              {parkingSpot.fotos.map((foto, index) => (
                <CarouselItem key={index}>
                  <div className="relative h-48 bg-muted rounded-lg overflow-hidden">
                    <img
                      src={foto}
                      alt={`${parkingSpot.nome} - Foto ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {parkingSpot.fotos.length > 1 && (
              <>
                <CarouselPrevious className="absolute top-1/2 left-2 -translate-y-1/2" />
                <CarouselNext className="absolute top-1/2 right-2 -translate-y-1/2" />
              </>
            )}
          </Carousel>
        ) : (
          <div className="h-48 w-full flex items-center justify-center bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg">
            <Car className="h-16 w-16 text-slate-500" />
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 left-2 z-10 rounded-full bg-background/80 backdrop-blur-sm"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      {/* Basic Info */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">{parkingSpot.nome}</h1>
        <div className="flex items-center text-muted-foreground mb-2">
          <MapPin className="h-4 w-4 mr-1 text-spatioo-green" />
          <span className="text-sm">{parkingSpot.endereco}</span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-spatioo-green" />
            <span className="text-sm font-medium">
              {typeof parkingSpot.horario_funcionamento === "object" &&
              parkingSpot.horario_funcionamento &&
              "abertura" in parkingSpot.horario_funcionamento &&
              "fechamento" in parkingSpot.horario_funcionamento
                ? `${parkingSpot.horario_funcionamento.abertura} - ${parkingSpot.horario_funcionamento.fechamento}`
                : "Horário não informado"}
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Table */}
      <PricingTable parkingSpotId={parkingSpot.id} />

      <div className="flex justify-between items-center p-2 bg-muted/30 rounded-lg mb-6">
        <div className="text-left w-full ml-2">
          <p className="text-lg  font-bold">
            Vagas disponíveis:{" "}
            <span className="text-spatioo-green">{parkingSpot.numero_vagas}</span>
          </p>
        </div>
      </div>

      {/* Comodidades - mostrar apenas se houver alguma comodidade ativa */}
      {(parkingSpot.funcionamento_24h ||
        parkingSpot.suporte_carro_eletrico ||
        parkingSpot.vaga_coberta ||
        parkingSpot.manobrista ||
        parkingSpot.suporte_caminhao ||
        parkingSpot.vaga_moto) && (
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2 pl-1">Comodidades</h2>
          <div className="grid grid-cols-2 gap-2">
            {parkingSpot.funcionamento_24h && (
              <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                <div className="bg-spatioo-green/20 p-1 rounded-md">
                  <Clock className="h-4 w-4 text-spatioo-green" />
                </div>
                <span className="text-sm">Funcionamento 24h</span>
              </div>
            )}
            {parkingSpot.suporte_carro_eletrico && (
              <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                <div className="bg-spatioo-green/20 p-1 rounded-md">
                  <Car className="h-4 w-4 text-spatioo-green" />
                </div>
                <span className="text-sm">Suporte a carro elétrico</span>
              </div>
            )}
            {parkingSpot.vaga_coberta && (
              <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                <div className="bg-spatioo-green/20 p-1 rounded-md">
                  <Car className="h-4 w-4 text-spatioo-green" />
                </div>
                <span className="text-sm">Vaga coberta</span>
              </div>
            )}
            {parkingSpot.manobrista && (
              <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                <div className="bg-spatioo-green/20 p-1 rounded-md">
                  <Car className="h-4 w-4 text-spatioo-green" />
                </div>
                <span className="text-sm">Manobrista</span>
              </div>
            )}
            {parkingSpot.suporte_caminhao && (
              <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                <div className="bg-spatioo-green/20 p-1 rounded-md">
                  <Car className="h-4 w-4 text-spatioo-green" />
                </div>
                <span className="text-sm">Suporte a caminhão</span>
              </div>
            )}
            {parkingSpot.vaga_moto && (
              <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                <div className="bg-spatioo-green/20 p-1 rounded-md">
                  <Car className="h-4 w-4 text-spatioo-green" />
                </div>
                <span className="text-sm">Vaga para motos</span>
              </div>
            )}
          </div>
        </div>
      )}

      <Separator className="my-6" />

      {/* Booking Form */}
      <BookingForm parkingSpot={parkingSpot} />
    </div>
  );
};

export default ParkingDetails;
