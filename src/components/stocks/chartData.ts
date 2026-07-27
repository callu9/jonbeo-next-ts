import { PriceCandle } from "@/types/common";
import type { UTCTimestamp } from "lightweight-charts";

export type AreaChartPoint = {
  time: UTCTimestamp;
  value: number;
};

export type ChartPriceRange = {
  min: number;
  max: number;
};

/** Converts millisecond candle timestamps into Lightweight Charts-compatible seconds. */
export function toAreaChartData(candles: PriceCandle[]): AreaChartPoint[] {
  return [...candles]
    .sort((left, right) => left.time - right.time)
    .map(({ time, close }) => ({ time: Math.floor(time / 1_000) as UTCTimestamp, value: close }));
}

/** Returns a small visual buffer above and below the candle range for draggable targets. */
export function getChartPriceRange(candles: PriceCandle[]): ChartPriceRange | null {
  if (candles.length === 0) return null;

  const low = Math.min(...candles.map((candle) => candle.low));
  const high = Math.max(...candles.map((candle) => candle.high));
  const padding = Math.max((high - low) * 0.1, 0.01);

  return { min: low - padding, max: high + padding };
}
