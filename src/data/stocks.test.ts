import { getStockData } from "@/data/stocks";

test("finds a stock code without case sensitivity", () => {
  expect(getStockData("aapl")?.name).toBe("애플");
});

test("returns undefined for an unknown stock code", () => {
  expect(getStockData("UNKNOWN")).toBeUndefined();
});
