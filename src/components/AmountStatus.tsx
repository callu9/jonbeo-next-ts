import { useUnitStore } from "@/store/unitStore";
import { MyAccountSummary } from "@/types/portfolio";
import { cn } from "@/utils/classNames";
import { formatDollar, formatNumberWithComma, formatWon } from "@/utils/common";
import { AnimatePresence, motion } from "motion/react";
import UnitButton from "./UnitButton";

interface AmountStatusProps extends MyAccountSummary {
  name?: string;
}

export default function AmountStatus({
  name,
  cashBalance,
  todayProfitMoney,
  todayProfitRate,
}: AmountStatusProps) {
  const { isWon = false } = useUnitStore();
  const upDown = todayProfitRate >= 0 ? 1 : -1;
  const prefix = todayProfitRate > 0 ? "+" : "";
  const fontColor =
    todayProfitRate > 0 ? "text-red-500" : todayProfitRate < 0 ? "text-blue-500" : "";

  return (
    <div className="flex flex-col gap-2">
      {name && <h2 className="text-lg text-gray-700 dark:text-gray-300">{name}</h2>}
      <div className="flex w-full flex-col gap-1">
        <div className="flex-sides">
          <div className="relative overflow-hidden">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={`cashBalance-${Number(isWon)}`}
                className="inline-block text-4xl font-bold"
                initial={{ y: 50 * upDown, opacity: 1 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50 * upDown, opacity: 0 }}
                transition={{ duration: 1 }}
              >
                {isWon ? `${formatWon(cashBalance)}원` : `$${formatDollar(cashBalance)}`}
              </motion.span>
            </AnimatePresence>
          </div>
          <UnitButton />
        </div>
        <div className="relative overflow-hidden">
          <div className="flex-start gap-1">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={`todayProfit-${Number(isWon)}`}
                className={cn("inline-block text-lg font-semibold", fontColor)}
                initial={{ y: 50 * upDown, opacity: 1 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50 * upDown, opacity: 0 }}
                transition={{ duration: 1 }}
              >
                {isWon ? formatWon(todayProfitMoney) : formatDollar(todayProfitMoney)}
              </motion.span>
            </AnimatePresence>
            <span className={(cn("text-md font-semibold"), fontColor)}>
              ({prefix}
              {formatNumberWithComma(todayProfitRate)}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AmountStatusSkeleton({ isNameNeeded = false }: { isNameNeeded?: boolean }) {
  const skeletonClassName = "animate-pulse rounded-md bg-gray-300 dark:bg-gray-700";
  return (
    <div className="flex flex-col gap-2">
      {isNameNeeded && <div className={cn(skeletonClassName, "h-7 w-[30%]")} />}
      <div className="flex w-full flex-col gap-1">
        <div className={cn(skeletonClassName, "h-10 w-[60%]")} />
        <div className={cn(skeletonClassName, "h-7 w-[40%]")} />
      </div>
    </div>
  );
}
