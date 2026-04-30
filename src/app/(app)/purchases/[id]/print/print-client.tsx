"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

export function PrintClientActions() {
  const [printing, setPrinting] = React.useState(false);

  return (
    <div className="print:hidden flex items-center justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        disabled={printing}
        onClick={() => {
          setPrinting(true);
          setTimeout(() => {
            window.print();
            setPrinting(false);
          }, 0);
        }}
      >
        طباعة / PDF
      </Button>
    </div>
  );
}

