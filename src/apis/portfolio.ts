import { getPortfolioData } from "@/data/portfolio";
import { PortfolioListResponse } from "@/types/portfolio";

export async function getPortfolio(): Promise<PortfolioListResponse> {
  return getPortfolioData();
}
