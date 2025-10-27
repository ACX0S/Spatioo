
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useParkingDetail } from '@/hooks/useParkingDetail';
import { ParkingDetailsSkeleton } from '@/components/skeletons/DetailsSkeleton';
import { MapPin, Clock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { FaCar } from 'react-icons/fa';
import BookingForm from '@/components/BookingForm';
import PricingTable from '@/components/PricingDisplay';
import { RatingDisplay } from '@/components/RatingDisplay';
import { Badge } from '@/components/ui/badge';

const ParkingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { parkingSpot, loading, error } = useParkingDetail(id || '');

  if (loading) {
    return <ParkingDetailsSkeleton />;
  }

  if (error || !parkingSpot) {
    return (
      <div className="container p-4 max-w-md mx-auto text-center py-10">
        <FaCar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
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
            <FaCar className="h-16 w-16 text-slate-500" />
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
        <div className="flex items-start justify-between gap-2 mb-1">
          <h1 className="text-2xl font-bold flex-1">{parkingSpot.nome}</h1>
          <RatingDisplay 
            rating={parkingSpot.media_avaliacao || 0}
            reviewCount={parkingSpot.total_avaliacoes || 0}
            size="lg"
          />
        </div>
        
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

        {/* Contador de reservas (apenas se >= 10) */}
        {parkingSpot.total_reservas_concluidas && parkingSpot.total_reservas_concluidas >= 10 && (
          <div className="mt-3">
            <Badge variant="outline" className="gap-1.5 bg-spatioo-green/10 border-spatioo-green/30 text-spatioo-green">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {parkingSpot.total_reservas_concluidas} reservas concluídas
            </Badge>
          </div>
        )}

        {/* Tipo de Vaga e Tamanho */}
        <div className="mt-3 space-y-2">
          <div className="p-3 bg-gradient-to-r from-spatioo-green/10 to-spatioo-green/5 rounded-lg border border-spatioo-green/20">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-spatioo-green uppercase tracking-wide">
                {parkingSpot.tipo === 'residencial' ? '🏠 Vaga Residencial' : '🏢 Estacionamento'}
              </span>
            </div>
            {parkingSpot.tipo === 'residencial' && parkingSpot.proprietario_nome && (
              <div className="mt-2 text-sm text-muted-foreground">
                Proprietário: <span className="font-medium text-foreground">{parkingSpot.proprietario_nome}</span>
              </div>
            )}
          </div>
          
          {/* Dimensões da Vaga */}
          {parkingSpot.largura_vaga && parkingSpot.comprimento_vaga && (
            <div className="p-3 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Dimensões da vaga:</span>
                <span className="text-sm font-bold">
                  {parkingSpot.largura_vaga.toFixed(1)}m x {parkingSpot.comprimento_vaga.toFixed(1)}m
                </span>
              </div>
            </div>
          )}
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
                  <FaCar className="h-4 w-4 text-spatioo-green" />
                </div>
                <span className="text-sm">Suporte a carro elétrico</span>
              </div>
            )}
            {parkingSpot.vaga_coberta && (
              <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                <div className="bg-spatioo-green/20 p-1 rounded-md">
                  <FaCar className="h-4 w-4 text-spatioo-green" />
                </div>
                <span className="text-sm">Vaga coberta</span>
              </div>
            )}
            {parkingSpot.manobrista && (
              <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                <div className="bg-spatioo-green/20 p-1 rounded-md">
                  <FaCar className="h-4 w-4 text-spatioo-green" />
                </div>
                <span className="text-sm">Manobrista</span>
              </div>
            )}
            {parkingSpot.suporte_caminhao && (
              <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                <div className="bg-spatioo-green/20 p-1 rounded-md">
                  <FaCar className="h-4 w-4 text-spatioo-green" />
                </div>
                <span className="text-sm">Suporte a caminhão</span>
              </div>
            )}
            {parkingSpot.vaga_moto && (
              <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                <div className="bg-spatioo-green/20 p-1 rounded-md">
                  <FaCar className="h-4 w-4 text-spatioo-green" />
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
