import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export const ParkingDetailsSkeleton = () => {
  return (
    <div className="container p-4 max-w-md mx-auto pb-20">
      {/* Image Skeleton */}
      <Skeleton className="h-48 w-full rounded-lg mb-4" />
      
      {/* Title and Address */}
      <div className="mb-6 space-y-2">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Pricing Table */}
      <Card className="mb-6">
        <CardContent className="p-4 space-y-2">
          <Skeleton className="h-5 w-24 mb-3" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Available Spots */}
      <Skeleton className="h-12 w-full rounded-lg mb-6" />

      {/* Amenities */}
      <div className="mb-6 space-y-3">
        <Skeleton className="h-5 w-32" />
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      </div>

      {/* Booking Form */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
};
