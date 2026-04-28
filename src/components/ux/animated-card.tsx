"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function AnimatedCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        scale: 1.015,
        rotateX: 2.5,
        rotateY: -2.5,
      }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className={cn(
        "glass rounded-2xl p-5 shadow-luxury will-change-transform [transform-style:preserve-3d]",
        className
      )}
    >
      {children}
    </motion.section>
  );
}

