"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <TooltipProvider>
          {children}
          <Toaster richColors position="top-center" />
        </TooltipProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}

