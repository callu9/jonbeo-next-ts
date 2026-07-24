import portfolio from "@/mocks/database/portfolio.json";
import { PortfolioListResponse } from "@/types/portfolio";

export function getPortfolioData(): PortfolioListResponse {
  return portfolio;
}
