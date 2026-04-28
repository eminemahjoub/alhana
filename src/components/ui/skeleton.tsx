import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("rounded-xl border bg-card/60 shimmer", className)} />;
}

