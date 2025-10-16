import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, DollarSign } from 'lucide-react';

interface PricingData {
  id: string;
  horas: number;
  preco: number;
}

interface PricingDisplayProps {
  parkingSpotId: string;
}

const PricingDisplay: React.FC<PricingDisplayProps> = ({ parkingSpotId }) => {
  const [pricing, setPricing] = useState<PricingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('estacionamento_precos')
          .select('id, horas, preco')
          .eq('estacionamento_id', parkingSpotId)
          .order('horas', { ascending: true });

        if (error) throw error;
        setPricing(data || []);
      } catch (error) {
        console.error('Error fetching pricing:', error);
        setPricing([]);
      } finally {
        setLoading(false);
      }
    };

    if (parkingSpotId) {
      fetchPricing();
    }
  }, [parkingSpotId]);

  if (loading) {
    return (
      <div className="p-4 bg-muted/30 rounded-lg mb-6">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-24 mb-2"></div>
          <div className="h-6 bg-muted rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (pricing.length === 0) {
    return (
      <div className="p-4 bg-muted/30 rounded-lg mb-6">
        <p className="text-sm text-muted-foreground mb-1">Preços por hora</p>
        <p className="text-sm text-muted-foreground">Preços não disponíveis</p>
      </div>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-spatioo-green" />
          Tabela de Preços
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-spatioo-green/10 hover:bg-spatioo-green/10">
                <TableHead className="font-semibold text-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-spatioo-green" />
                    Duração
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-foreground text-right">
                  <div className="flex items-center justify-end gap-2">
                    <DollarSign className="h-4 w-4 text-spatioo-green" />
                    Valor
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pricing.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.horas} hora{item.horas > 1 ? 's' : ''}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-lg font-bold text-spatioo-green">
                      R$ {Number(item.preco).toFixed(2)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {pricing.length > 1 && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Valores relativos ao tempo de permanência no estacionamento.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PricingDisplay;