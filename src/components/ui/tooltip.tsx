"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <TooltipPrimitive.Provider delayDuration={250}>{children}</TooltipPrimitive.Provider>;
}

export function Tooltip({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TooltipPrimitive.Root>{children}</TooltipPrimitive.Root>;
}

export function TooltipTrigger({ children }: { children: React.ReactNode }) {
  return <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>;
}

export function TooltipContent({
  className,
  sideOffset = 8,
  ...props
}: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
  sideOffset?: number;
}) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "z-[80] rounded-xl border bg-card/80 px-3 py-1.5 text-xs text-foreground shadow-luxury backdrop-blur",
          className
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}

