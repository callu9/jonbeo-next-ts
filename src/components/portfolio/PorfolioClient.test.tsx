import { render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
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

  it("renders server-provided summary in the initial server markup", () => {
    const markup = renderToStaticMarkup(
      <AccountSummaryClient
        accountSummary={{ cashBalance: 0, todayProfitMoney: 0, todayProfitRate: 0 }}
      />
    );

    expect(markup).toContain("balance:0");
    expect(markup).not.toContain("summary-skeleton");
  });

  it("renders server-provided stock list in the initial server markup", () => {
    const markup = renderToStaticMarkup(<StockListClient stocks={[stock]} />);

    expect(markup).toContain("stock:AAPL");
    expect(markup).not.toContain("stock-skeleton");
  });

  it("keeps summary and list skeleton fallbacks for absent data", () => {
    const { rerender } = render(<AccountSummaryClient />);
    expect(screen.getByText("summary-skeleton")).toBeInTheDocument();

    rerender(<StockListClient />);
    expect(screen.getAllByText("stock-skeleton")).toHaveLength(8);
  });
});
