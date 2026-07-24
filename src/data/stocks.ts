import stocks from "@/mocks/database/stocks.json";
import { StockDetail } from "@/types/stock";

export function getStockData(code: string): StockDetail | undefined {
  const normalizedCode = code.toUpperCase();

  return stocks.list.find((stock) => stock.code === normalizedCode);
}
