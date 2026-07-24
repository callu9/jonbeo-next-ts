import { getStockData } from "@/data/stocks";
import { StockDetail } from "@/types/stock";

export async function getStockDetail(code: string): Promise<StockDetail | undefined> {
  return getStockData(code);
}
