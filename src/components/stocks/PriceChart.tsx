"use client";

import {
  AreaSeries,
  ColorType,
  createChart,
  LineStyle,
  type IChartApi,
  type IPriceLine,
  type ISeriesApi,
  type CreatePriceLineOptions,
  type Time,
} from "lightweight-charts";
import { useCallback, useEffect, useRef, useState } from "react";
import PriceHandle from "./PriceHandle";
import type { AreaChartPoint } from "./chartData";

export type PriceChartProps = {
  data: AreaChartPoint[];
  targetPrice: number;
  minPrice: number;
  maxPrice: number;
  currentPrice: number;
  currentPriceTone: CurrentPriceTone;
  onTargetPriceChange: (price: number) => void;
  onTargetPriceCommit: () => void;
};

type AreaSeriesApi = ISeriesApi<"Area", Time>;
export type CurrentPriceTone = "positive" | "negative" | "neutral";

const priceLineOptions = (price: number): CreatePriceLineOptions => ({
  price,
  color: "#71717a",
  lineWidth: 1,
  lineStyle: LineStyle.Dotted,
  axisLabelVisible: false,
  title: "",
});

/** Lightweight Charts area series with a React-owned, accessible target-price handle. */
export default function PriceChart({
  data,
  targetPrice,
  minPrice,
  maxPrice,
  currentPrice,
  currentPriceTone,
  onTargetPriceChange,
  onTargetPriceCommit,
}: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartHostRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<AreaSeriesApi | null>(null);
  const priceLineRef = useRef<IPriceLine | null>(null);
  const [handleY, setHandleY] = useState<number | null>(null);
  const [currentPriceY, setCurrentPriceY] = useState<number | null>(null);

  useEffect(() => {
    const host = chartHostRef.current;
    if (!host) return;

    const chart = createChart(host, {
      autoSize: true,
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: "#71717a" },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
      leftPriceScale: { visible: false },
      rightPriceScale: { visible: false },
      crosshair: { vertLine: { visible: false }, horzLine: { visible: false } },
      timeScale: { visible: false, borderVisible: false },
    });
    const series = chart.addSeries(AreaSeries, {
      lineColor: "#2563eb",
      topColor: "rgba(37, 99, 235, 0.34)",
      bottomColor: "rgba(37, 99, 235, 0.02)",
      lineWidth: 3,
      lastValueVisible: false,
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    });

    chartRef.current = chart;
    seriesRef.current = series;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      priceLineRef.current = null;
    };
  }, []);

  useEffect(() => {
    seriesRef.current?.setData(data);
    chartRef.current?.timeScale().fitContent();
  }, [data]);

  useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;

    if (priceLineRef.current) series.removePriceLine(priceLineRef.current);
    priceLineRef.current = series.createPriceLine(priceLineOptions(targetPrice));
    setHandleY(series.priceToCoordinate(targetPrice));
    setCurrentPriceY(series.priceToCoordinate(currentPrice));
  }, [currentPrice, data, targetPrice]);

  const handleChangeY = useCallback(
    (y: number) => {
      const price = seriesRef.current?.coordinateToPrice(y);
      if (price === null || price === undefined) return;

      const clampedPrice = Math.min(Math.max(price, minPrice), maxPrice);
      onTargetPriceChange(Math.round(clampedPrice * 100) / 100);
    },
    [maxPrice, minPrice, onTargetPriceChange]
  );
  const currentPriceToneClasses =
    currentPriceTone === "positive"
      ? "bg-red-500"
      : currentPriceTone === "negative"
        ? "bg-blue-500"
        : "bg-gray-400 dark:bg-gray-200";

  return (
    <div ref={containerRef} data-testid="price-chart" className="relative h-full w-full" aria-label="평단가 그래프">
      <div ref={chartHostRef} className="h-full w-full" />
      {currentPriceY !== null && (
        <div
          data-testid="current-price-marker"
          className="absolute right-4 z-10 -translate-y-1/2"
          style={{ top: `${currentPriceY}px` }}
        >
          <div
            className={`h-4 w-4 rounded-full ${currentPriceToneClasses}`}
          />
          <div
            className={`absolute top-0 h-4 w-4 animate-ping rounded-full ${currentPriceToneClasses}`}
          />
        </div>
      )}
      <PriceHandle
        containerRef={containerRef}
        y={handleY}
        price={targetPrice}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onChangeY={handleChangeY}
        onCommit={onTargetPriceCommit}
        ariaLabel="평단가 위치"
      />
    </div>
  );
}
