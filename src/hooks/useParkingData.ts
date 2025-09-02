import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  fetchAllParkingSpots, 
  fetchNearbyParkingSpots, 
  fetchPopularParkingSpots,
  searchParkingSpots,
  PublicParkingData 
} from '@/services/parkingService';
import { toast } from '@/hooks/use-toast';

export type ParkingDataType = 'all' | 'nearby' | 'popular' | 'search';

interface UseParkingDataOptions {
  type: ParkingDataType;
  searchTerm?: string;
  limit?: number;
  autoLoad?: boolean;
}

export const useParkingData = ({ 
  type, 
  searchTerm = '', 
  limit = 4, 
  autoLoad = true 
}: UseParkingDataOptions) => {
  const [data, setData] = useState<PublicParkingData[]>([]);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let result: PublicParkingData[] = [];
      
      switch (type) {
        case 'all':
          result = await fetchAllParkingSpots();
          break;
        case 'nearby':
          result = await fetchNearbyParkingSpots();
          break;
        case 'popular':
          result = await fetchPopularParkingSpots(limit);
          break;
        case 'search':
          if (searchTerm.trim()) {
            result = await searchParkingSpots(searchTerm);
          }
          break;
        default:
          result = [];
      }
      
      setData(result);
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar dados';
      setError(errorMessage);
      console.error('Error loading parking data:', err);
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [type, searchTerm, limit]);

  const refetch = useCallback(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (autoLoad) {
      loadData();
    }
  }, [loadData, autoLoad]);

  const memoizedData = useMemo(() => data, [data]);

  return {
    data: memoizedData,
    loading,
    error,
    refetch,
    loadData
  };
};