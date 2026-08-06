"use client";

import { useOverlayStore } from "@/store/overlayStore";
import { PriceCandle } from "@/types/common";
import { cn } from "@/utils/classNames";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PriceChartProps } from "./PriceChart";
import PriceModal from "./PriceModal";
import { getChartPriceRange, toAreaChartData, type ChartPriceRange } from "./chartData";

function PriceChartLoading() {
  return (
    <div
      data-testid="price-chart-loading"
      className="absolute inset-0 animate-pulse rounded-lg bg-gray-100 dark:bg-zinc-900"
    />
  );
}

const PriceChart = dynamic<PriceChartProps>(() => import("./PriceChart"), {
  ssr: false,
  loading: PriceChartLoading,
});

export type StockGraphProps = {
  currentPrice: number;
  profitLossRate: number;
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
  profitLossRate,
  candles,
  initialTargetPrice,
  onChange,
  className,
}: StockGraphProps) {
  const { openModal } = useOverlayStore();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const range = useMemo(() => getChartPriceRange(candles), [candles]);
  const data = useMemo(() => toAreaChartData(candles), [candles]);
  const [isChartVisible, setIsChartVisible] = useState(false);
  const [targetPrice, setTargetPrice] = useState(() =>
    clampTargetPrice(initialTargetPrice ?? currentPrice, range)
  );
  const currentPriceTone =
    profitLossRate > 0 ? "positive" : profitLossRate < 0 ? "negative" : "neutral";

  useEffect(() => {
    setTargetPrice((price) => clampTargetPrice(price, range));
  }, [range]);

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!range || !container || isChartVisible) return;
    if (typeof IntersectionObserver === "undefined") {
      setIsChartVisible(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setIsChartVisible(true);
      observer.disconnect();
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, [isChartVisible, range]);

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
        ref={chartContainerRef}
        className={cn("absolute inset-0 mt-10", className)}
        aria-label="평단가 그래프"
      >
        {range ? (
          <>
            {isChartVisible ? (
              <PriceChart
                data={data}
                targetPrice={targetPrice}
                minPrice={range.min}
                maxPrice={range.max}
                currentPrice={currentPrice}
                currentPriceTone={currentPriceTone}
                onTargetPriceChange={handleTargetPriceChange}
                onTargetPriceCommit={openModal}
              />
            ) : (
              <PriceChartLoading />
            )}
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
