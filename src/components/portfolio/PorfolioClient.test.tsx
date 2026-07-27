import { render, screen } from "@testing-library/react";
import { AccountSummaryClient, StockListClient } from "./PorfolioClient";

jest.mock("../AmountStatus", () => ({
  __esModule: true,
  default: ({ cashBalance }: { cashBalance: number }) => <output>balance:{cashBalance}</output>,
  AmountStatusSkeleton: () => <output>summary-skeleton</output>,
}));

jest.mock("./StockListItem", () => ({
  __esModule: true,
  default: ({ code }: { code: string }) => <output>stock:{code}</output>,
  StockListItemSkeleton: () => <output>stock-skeleton</output>,
}));

describe("PorfolioClient", () => {
  const stock = {
    code: "AAPL",
    name: "Apple",
    shares: 1,
    avgBuyPrice: 100,
    currentPrice: 120,
    profitLossMoney: 20,
    profitLossRate: 20,
  };

  it("renders server-provided summary on the first render", () => {
    render(
      <AccountSummaryClient
        accountSummary={{ cashBalance: 0, todayProfitMoney: 0, todayProfitRate: 0 }}
      />
    );

    expect(screen.getByText("balance:0")).toBeInTheDocument();
    expect(screen.queryByText("summary-skeleton")).not.toBeInTheDocument();
  });

  it("renders server-provided stock list on the first render", () => {
    render(<StockListClient stocks={[stock]} />);

    expect(screen.getByText("stock:AAPL")).toBeInTheDocument();
    expect(screen.queryByText("stock-skeleton")).not.toBeInTheDocument();
  });

  it("keeps summary and list skeleton fallbacks for absent data", () => {
    const { rerender } = render(<AccountSummaryClient />);
    expect(screen.getByText("summary-skeleton")).toBeInTheDocument();

    rerender(<StockListClient />);
    expect(screen.getAllByText("stock-skeleton")).toHaveLength(8);
  });
});
