import { useUnitStore } from "@/store/unitStore";
import { PortfolioListItem } from "@/types/portfolio";
import { cn } from "@/utils/classNames";
import { formatDollar, formatNumberWithComma, formatWon } from "@/utils/common";
import { motion } from "motion/react";

export default function StockListItem({
  name,
  code,
  shares,
  currentPrice,
  profitLossMoney,
  profitLossRate,
}: PortfolioListItem) {
  const { isWon } = useUnitStore();
  const fontColor = profitLossRate > 0 ? "text-red-500" : profitLossRate < 0 ? "text-blue-500" : "";
  return (
    <motion.div
      className="flex-sides py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.025 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex-upper flex-col gap-1">
        <div className="flex-start gap-0.5">
          <span className="text-lg font-semibold">{name}</span>
          <span className="font-normal text-gray-400 dark:text-gray-600">({code})</span>
        </div>
        <div className="text-gray-500">{formatNumberWithComma(shares)}주</div>
      </div>
      <div className="flex-lower flex-col">
        <div className="text-lg">
          {isWon ? formatWon(currentPrice) : formatDollar(currentPrice)}
        </div>
        <div className={cn("flex gap-0.5 font-semibold", fontColor)}>
          <span>{isWon ? formatWon(profitLossMoney) : formatDollar(profitLossMoney)}</span>
          <span>({formatNumberWithComma(profitLossRate)}%)</span>
        </div>
      </div>
    </motion.div>
  );
}
