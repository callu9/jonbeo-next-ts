import { useUnitStore } from "@/store/unitStore";
import { MyAccountSummary } from "@/types/portfolio";
import { cn } from "@/utils/classNames";
import { formatDollar, formatNumberWithComma, formatWon } from "@/utils/common";
import { AnimatePresence, motion } from "motion/react";
import UnitButton from "./UnitButton";
import AmountTransition from "./AmountTransition";

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
          <AmountTransition
            id="cashBalance"
            fontStyle="text-4xl font-bold"
            multiplier={upDown}
            durSec={300}
          >
            {isWon ? `${formatWon(cashBalance)}원` : `$${formatDollar(cashBalance)}`}
          </AmountTransition>
          <UnitButton />
        </div>
        <div className="flex-start gap-1">
          <AmountTransition
            id="todayProfit"
            fontStyle={`text-lg font-semibold ${fontColor}`}
            multiplier={upDown}
            durSec={400}
          >
            {isWon ? formatWon(todayProfitMoney) : formatDollar(todayProfitMoney)}
          </AmountTransition>
          <span className={(cn("text-md font-semibold"), fontColor)}>
            ({prefix}
            {formatNumberWithComma(todayProfitRate)}%)
          </span>
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
