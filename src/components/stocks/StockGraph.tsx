"use client";

import { useOverlayStore } from "@/store/overlayStore";
import { PriceCandle } from "@/types/common";
import { cn } from "@/utils/classNames";
import { useCallback, useEffect, useMemo, useState } from "react";
import PriceChart from "./PriceChart";
import PriceModal from "./PriceModal";
import { getChartPriceRange, toAreaChartData, type ChartPriceRange } from "./chartData";

export type StockGraphProps = {
  currentPrice: number;
  candles: PriceCandle[];
  initialTargetPrice?: number;
  onChange?: (payload: { targetAveragePrice: number }) => void;
  className?: string;
};

function clampTargetPrice(price: number, range: ChartPriceRange | null) {
  if (!range) return price;
  return Math.min(Math.max(price, range.min), range.max);
}

export default function StockGraph({
  currentPrice,
  candles,
  initialTargetPrice,
  onChange,
  className,
}: StockGraphProps) {
  const { openModal } = useOverlayStore();
  const range = useMemo(() => getChartPriceRange(candles), [candles]);
  const data = useMemo(() => toAreaChartData(candles), [candles]);
  const [targetPrice, setTargetPrice] = useState(() =>
    clampTargetPrice(initialTargetPrice ?? currentPrice, range)
  );

  useEffect(() => {
    setTargetPrice((price) => clampTargetPrice(price, range));
  }, [range]);

  const handleTargetPriceChange = useCallback(
    (nextPrice: number) => {
      setTargetPrice(nextPrice);
      onChange?.({ targetAveragePrice: nextPrice });
    },
    [onChange]
  );

  return (
    <>
      <div
        className={cn("absolute inset-0 mt-10", className)}
        aria-label="평단가 그래프"
      >
        {range ? (
          <>
            <PriceChart
              data={data}
              targetPrice={targetPrice}
              minPrice={range.min}
              maxPrice={range.max}
              onTargetPriceChange={handleTargetPriceChange}
              onTargetPriceCommit={openModal}
            />
            <div className="absolute top-2 right-2 rounded bg-black/60 px-2 py-1 text-xs text-white">
              목표 평단 ${targetPrice.toFixed(2)}
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-500 dark:bg-zinc-900 dark:text-zinc-400">
            표시할 가격 기록이 없습니다.
          </div>
        )}
      </div>
      <PriceModal price={targetPrice} />
    </>
  );
}
