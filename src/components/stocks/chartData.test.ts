import { PriceCandle } from "@/types/common";
import { getChartPriceRange, toAreaChartData } from "./chartData";

const candles: PriceCandle[] = [
  { time: 1_731_130_400_000, open: 122, high: 124, low: 120, close: 123 },
  { time: 1_731_126_800_000, open: 120, high: 122, low: 118, close: 121 },
  { time: 1_731_134_000_000, open: 123, high: 126, low: 122, close: 125 },
];

describe("chartData", () => {
  it("converts candle closing prices into chronologically ordered chart points", () => {
    expect(toAreaChartData(candles)).toEqual([
      { time: 1_731_126_800, value: 121 },
      { time: 1_731_130_400, value: 123 },
      { time: 1_731_134_000, value: 125 },
    ]);
  });

  it("derives a padded price range from candle highs and lows", () => {
    expect(getChartPriceRange(candles)).toEqual({ min: 117.2, max: 126.8 });
  });

  it("returns no range for an empty price history", () => {
    expect(getChartPriceRange([])).toBeNull();
  });
});
