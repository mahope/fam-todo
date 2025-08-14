import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

// Specific skeleton components for common use cases
export function ListSkeleton() {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-6 w-12" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

export function TaskSkeleton() {
  return (
    <div className="flex items-center space-x-3 p-3 border rounded-lg">
      <Skeleton className="h-5 w-5 rounded" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-5 w-64" />
        <Skeleton className="h-4 w-40" />
      </div>
      <Skeleton className="h-6 w-16" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border rounded-lg p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-4" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="border rounded-lg p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <TaskSkeleton key={i} />
            ))}
          </div>
        </div>
        
        <div className="border rounded-lg p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <ListSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export { Skeleton };