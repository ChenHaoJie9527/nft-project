import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function NFTCardSkeleton() {
  return (
    <Card className="overflow-hidden rounded-xl shadow-lg">
      <Skeleton className="aspect-square" />
      <CardContent className="p-4">
        <Skeleton className="mb-1 h-4 w-20" />
        <Skeleton className="mb-3 h-6 w-32" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}

export default function NFTsLoading() {
  return (
    <>
      <div className="mb-8">
        <Skeleton className="mb-2 h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <div className="mt-6 flex gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton className="h-6 w-20" key={i} />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3].map((i) => (
          <NFTCardSkeleton key={i} />
        ))}
      </div>
    </>
  );
}
