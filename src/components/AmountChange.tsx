import { useUnitStore } from "@/store/unitStore";
import { MyAccountSummary } from "@/types/portfolio";
import { formatDollar, formatNumberWithComma, formatWon } from "@/utils/common";
import { AnimatePresence, motion } from "motion/react";
import UnitButton from "./UnitButton";

interface AmountChangeProps extends MyAccountSummary {
  isWon?: boolean;
}

export default function AmountChange({
  cashBalance,
  todayProfitMoney,
  todayProfitRate,
}: AmountChangeProps) {
  const { isWon = false } = useUnitStore();

  return (
    <div className="flex w-full flex-col gap-1">
      <div className="flex-sides">
        <div className="relative overflow-hidden">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={`cashBalance-${Number(isWon)}`}
              className="inline-block text-4xl font-bold"
              initial={{ y: 50, opacity: 1 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 1 }}
            >
              {isWon ? formatWon(cashBalance) : formatDollar(cashBalance)}
            </motion.span>
          </AnimatePresence>
        </div>
        <UnitButton />
      </div>
      <div className="relative overflow-hidden">
        <div className="flex-start gap-1">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={`todayProfit-${Number(isWon)}`}
              className="inline-block text-lg font-semibold text-red-500"
              initial={{ y: 50, opacity: 1 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 1 }}
            >
              +{isWon ? formatWon(todayProfitMoney) : formatDollar(todayProfitMoney)}
            </motion.span>
          </AnimatePresence>
          <span className="text-md font-semibold text-red-500">
            (+{formatNumberWithComma(todayProfitRate)}%)
          </span>
        </div>
      </div>
    </div>
  );
}
