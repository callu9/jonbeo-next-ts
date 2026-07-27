import type { StockDetail } from "@/types/stock";
import { render, screen } from "@testing-library/react";
import { StockDetailGraphClient, StockStatusClient } from "./StockDetailClient";

jest.mock("../AmountStatus", () => ({
  __esModule: true,
  default: ({
    cashBalance,
    todayProfitMoney,
    todayProfitRate,
  }: {
    cashBalance: number;
    todayProfitMoney: number;
    todayProfitRate: number;
  }) => <output>status:{cashBalance}:{todayProfitMoney}:{todayProfitRate}</output>,
  AmountStatusSkeleton: () => <output>status-skeleton</output>,
}));

jest.mock("./StockDetailGraph", () => ({
  __esModule: true,
  default: () => <output>stock-graph</output>,
  StockDetailGraphSkeleton: () => <output>graph-skeleton</output>,
}));

describe("StockDetailClient", () => {
  const stockDetail: StockDetail = {
    code: "ZERO",
    name: "Zero",
    shares: 0,
    avgBuyPrice: 0,
    currentPrice: 0,
    profitLossMoney: 0,
    profitLossRate: 0,
    recentCandles: [],
    updatedAt: 0,
  };

  it("renders zero-valued stock status instead of a skeleton", () => {
    render(<StockStatusClient name="Zero" currentPrice={0} profitLossMoney={0} profitLossRate={0} />);

    expect(screen.getByText("status:0:0:0")).toBeInTheDocument();
    expect(screen.queryByText("status-skeleton")).not.toBeInTheDocument();
  });

  it("renders the provided stock graph on the first render", () => {
    render(<StockDetailGraphClient {...stockDetail} />);

    expect(screen.getByText("stock-graph")).toBeInTheDocument();
    expect(screen.queryByText("graph-skeleton")).not.toBeInTheDocument();
  });

  it("keeps the stock-status skeleton fallback for absent data", () => {
    render(<StockStatusClient />);

    expect(screen.getByText("status-skeleton")).toBeInTheDocument();
  });
});
