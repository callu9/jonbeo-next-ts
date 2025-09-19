import { PortfolioListResponse } from "@/types/portfolio";

const API_BASE = "http://localhost:4000";

export async function getPortfolio(): Promise<PortfolioListResponse | undefined> {
  try {
    const response = await fetch(`${API_BASE}/portfolio`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      throw new Error("포트폴리오 요청 실패");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("로그인 요청 중 오류 발생: " + error);
  }
}
