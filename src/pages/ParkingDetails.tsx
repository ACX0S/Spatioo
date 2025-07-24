
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useParkingDetail } from '@/hooks/useParkingDetail';
import { Car, MapPin, Star, Clock, ArrowLeft } from 'lucide-react';
import BookingForm from '@/components/BookingForm';

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
      {/* Image Header */}
      <div className="relative h-48 bg-muted rounded-lg mb-4 overflow-hidden">
        {parkingSpot.fotos && parkingSpot.fotos.length > 0 ? (
          <img 
            src={`https://ojnayvmppwpbdcsddpaw.supabase.co/storage/v1/object/public/estacionamento-photos/${parkingSpot.fotos[0]}`}
            alt={parkingSpot.nome} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-r from-slate-800 to-slate-900">
            <Car className="h-16 w-16 text-slate-500" />
          </div>
        )}
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 left-2 rounded-full bg-background/80 backdrop-blur-sm"
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
              {typeof parkingSpot.horario_funcionamento === 'object' && parkingSpot.horario_funcionamento && 
              'abertura' in parkingSpot.horario_funcionamento && 'fechamento' in parkingSpot.horario_funcionamento ? 
                `${parkingSpot.horario_funcionamento.abertura} - ${parkingSpot.horario_funcionamento.fechamento}` : 
                'Horário não informado'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Price and Availability */}
      <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg mb-6">
        <div>
          <p className="text-sm text-muted-foreground">Preço por hora</p>
          <p className="text-2xl font-bold text-spatioo-green">
            R$ {Number(parkingSpot.preco).toFixed(2)}
          </p>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total de vagas</p>
          <p className="text-xl font-bold">{parkingSpot.numero_vagas}</p>
        </div>
      </div>
      
      {/* Endereço Info */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Informações do estabelecimento</h2>
        <div className="p-3 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">Endereço: {parkingSpot.endereco}</p>
          <p className="text-sm text-muted-foreground">CEP: {parkingSpot.cep}</p>
        </div>
      </div>
      
      {/* Amenities */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Comodidades</h2>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
            <div className="bg-spatioo-green/20 p-1 rounded-md">
              <Car className="h-4 w-4 text-spatioo-green" />
            </div>
            <span className="text-sm">Vigilância 24h</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
            <div className="bg-spatioo-green/20 p-1 rounded-md">
              <Car className="h-4 w-4 text-spatioo-green" />
            </div>
            <span className="text-sm">Cobertura</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
            <div className="bg-spatioo-green/20 p-1 rounded-md">
              <Car className="h-4 w-4 text-spatioo-green" />
            </div>
            <span className="text-sm">Seguro incluso</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
            <div className="bg-spatioo-green/20 p-1 rounded-md">
              <Car className="h-4 w-4 text-spatioo-green" />
            </div>
            <span className="text-sm">Câmeras</span>
          </div>
        </div>
      </div>
      
      <Separator className="my-6" />
      
      {/* Booking Form */}
      <BookingForm parkingSpot={parkingSpot} />
    </div>
  );
};

export default ParkingDetails;
