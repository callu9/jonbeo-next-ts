import type { StockDetail } from "@/types/stock";
import { render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
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

  it("renders zero-valued stock status in the initial server markup", () => {
    const markup = renderToStaticMarkup(
      <StockStatusClient name="Zero" currentPrice={0} profitLossMoney={0} profitLossRate={0} />
    );

    expect(markup).toContain("status:0:0:0");
    expect(markup).not.toContain("status-skeleton");
  });

  it("renders the provided stock graph in the initial server markup", () => {
    const markup = renderToStaticMarkup(<StockDetailGraphClient {...stockDetail} />);

    expect(markup).toContain("stock-graph");
    expect(markup).not.toContain("graph-skeleton");
  });

  it("keeps the stock-status skeleton fallback for absent data", () => {
    render(<StockStatusClient />);

    expect(screen.getByText("status-skeleton")).toBeInTheDocument();
  });

  it("keeps the stock-status skeleton fallback for null data", () => {
    render(
      <StockStatusClient
        currentPrice={null as unknown as number}
        profitLossMoney={null as unknown as number}
        profitLossRate={null as unknown as number}
      />
    );

    expect(screen.getByText("status-skeleton")).toBeInTheDocument();
  });
});
