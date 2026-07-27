import { getPortfolioData } from "@/data/portfolio";

test("returns the portfolio fixture with its account and stocks", () => {
  const portfolio = getPortfolioData();

  expect(portfolio.account.cashBalance).toBe(22829.13);
  expect(portfolio.stocks).toHaveLength(7);
});
