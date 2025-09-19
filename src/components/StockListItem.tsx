"use client";

import { useUnitStore } from "@/store/unitStore";
import { PortfolioListItem } from "@/types/portfolio";
import { cn } from "@/utils/classNames";
import { formatDollar, formatNumberWithComma, formatWon } from "@/utils/common";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";

export default function StockListItem({
  name,
  code,
  shares,
  currentPrice,
  profitLossMoney,
  profitLossRate,
}: PortfolioListItem) {
  const { isWon } = useUnitStore();
  const prefix = profitLossRate > 0 ? "+" : "";
  const fontColor = profitLossRate > 0 ? "text-red-500" : profitLossRate < 0 ? "text-blue-500" : "";
  return (
    <motion.button
      className="w-full py-2 hover:bg-gray-100 focus:bg-gray-200 dark:hover:bg-gray-800 focus:dark:bg-gray-700"
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.025 }}
      whileTap={{ scale: 0.99 }}
    >
      <Link className="flex-sides" href={`/stocks/${code}`}>
        <div className="flex-upper flex-col gap-1">
          <div className="flex-start gap-0.5">
            <span className="text-lg font-semibold">{name}</span>
            <span className="font-normal text-gray-400 dark:text-gray-600">({code})</span>
          </div>
          <div className="text-gray-500">{formatNumberWithComma(shares)}주</div>
        </div>
        <div className="flex-lower flex-col">
          <div className="relative overflow-hidden">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={`cashBalance-${Number(isWon)}`}
                className="inline-block text-lg"
                initial={{ y: 50, opacity: 1 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                transition={{ duration: 1 }}
              >
                {isWon ? formatWon(currentPrice) : formatDollar(currentPrice)}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className={cn("flex gap-0.5 font-semibold", fontColor)}>
            <div className="relative overflow-hidden">
              <AnimatePresence initial={false} mode="popLayout">
                <motion.span
                  key={`currentPrice-${Number(isWon)}`}
                  className="inline-block"
                  initial={{ y: 50, opacity: 1 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -50, opacity: 0 }}
                  transition={{ duration: 1 }}
                >
                  {isWon ? formatWon(currentPrice) : formatDollar(currentPrice)}
                </motion.span>
              </AnimatePresence>
            </div>
            <span>
              ({prefix}
              {formatNumberWithComma(profitLossRate)}%)
            </span>
          </div>
        </div>
      </Link>
    </motion.button>
  );
}

export function StockListItemSkeleton() {
  const skeletonClassName = "animate-pulse rounded-md bg-gray-300 dark:bg-gray-700";
  return (
    <div className="flex-sides py-2">
      <div className="flex-upper flex-col gap-1">
        <div className={cn(skeletonClassName, "h-7 w-26")} />
        <div className={cn(skeletonClassName, "h-6 w-20")} />
      </div>
      <div className="flex-lower flex-col gap-1">
        <div className={cn(skeletonClassName, "h-7 w-10")} />
        <div className={cn(skeletonClassName, "h-6 w-30")} />
      </div>
    </div>
  );
}
