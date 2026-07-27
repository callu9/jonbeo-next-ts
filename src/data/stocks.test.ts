import { getStockData } from "@/data/stocks";

test("finds a stock code without case sensitivity", () => {
  expect(getStockData("aapl")?.name).toBe("애플");
});

test("returns undefined for an unknown stock code", () => {
  expect(getStockData("UNKNOWN")).toBeUndefined();
});

test("provides enough chronological candle data to draw the Apple price chart", () => {
  const candles = getStockData("AAPL")?.recentCandles;

  expect(candles).toHaveLength(20);
  expect(candles?.every(({ low, open, close, high }) => low <= open && open <= high && low <= close && close <= high)).toBe(true);
  expect(candles?.every((candle, index, list) => index === 0 || list[index - 1].time < candle.time)).toBe(true);
});
