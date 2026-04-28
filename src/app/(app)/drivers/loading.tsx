import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingDrivers() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>

      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[420px] w-full" />
      </div>
    </div>
  );
}

