"use client";

import { useUnitStore } from "@/store/unitStore";
import { cn } from "@/utils/classNames";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-m";

export default function AmountTransition({
  id,
  multiplier = 1,
  fontStyle = "",
  children,
  durSec = 500,
}: {
  id: string;
  multiplier?: 1 | -1;
  fontStyle?: string;
  children: React.ReactNode;
  durSec?: number;
}) {
  const { isWon } = useUnitStore();

  return (
    <div className="relative overflow-hidden">
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={`${id}-${Number(isWon)}`}
          className={cn("inline-block", fontStyle)}
          initial={{ y: 50 * multiplier, opacity: 1 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50 * multiplier, opacity: 0 }}
          transition={{ duration: durSec / 1_000 }}
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
