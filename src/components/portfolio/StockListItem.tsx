"use client";

import { useUnitStore } from "@/store/unitStore";
import { PortfolioListItem } from "@/types/portfolio";
import { cn } from "@/utils/classNames";
import { formatDollar, formatNumberWithComma, formatWon } from "@/utils/common";
import * as motion from "motion/react-m";
import Link from "next/link";
import AmountTransition from "../AmountTransition";

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
  const upDown = profitLossRate >= 0 ? 1 : -1;
  const fontColor = profitLossRate > 0 ? "text-red-500" : profitLossRate < 0 ? "text-blue-500" : "";
  return (
    <motion.button
      className="w-full py-2 hover:bg-gray-100 focus:bg-gray-200 dark:hover:bg-gray-800 focus:dark:bg-gray-700"
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.025 }}
      whileTap={{ scale: 0.99, backgroundColor: "#e5e7eb" }}
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
          <AmountTransition
            id={`${code}-currentPrice`}
            fontStyle="text-lg"
            multiplier={upDown}
            durSec={300}
          >
            {isWon ? formatWon(currentPrice) : formatDollar(currentPrice)}
          </AmountTransition>
          <div className={cn("flex gap-0.5 font-semibold", fontColor)}>
            <AmountTransition id={`${code}-profitLossMoney`} multiplier={upDown} durSec={400}>
              {isWon ? formatWon(profitLossMoney) : formatDollar(profitLossMoney)}
            </AmountTransition>
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
