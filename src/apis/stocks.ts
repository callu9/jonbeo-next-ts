import { StockDetail } from "@/types/stock";

const API_BASE = "http://localhost:4001";

export async function getStockDetail(code: string): Promise<StockDetail | undefined> {
  try {
    const response = await fetch(`${API_BASE}/stocks/${code}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      throw new Error("종목 상세 요청 실패");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("로그인 요청 중 오류 발생: " + error);
  }
}
