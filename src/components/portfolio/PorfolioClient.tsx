"use client";

import AmountStatus, { AmountStatusSkeleton } from "@/components/AmountStatus";
import StockListItem, { StockListItemSkeleton } from "@/components/portfolio/StockListItem";
import { MyAccountSummary, PortfolioListItem } from "@/types/portfolio";

export function AccountSummaryClient({ accountSummary }: { accountSummary?: MyAccountSummary }) {
  return accountSummary ? <AmountStatus {...accountSummary} /> : <AmountStatusSkeleton />;
}

export function StockListClient({ stocks }: { stocks?: PortfolioListItem[] }) {
  return (
    <div className="divide-y divide-gray-300 dark:divide-gray-700">
      {stocks
        ? stocks.map((stock) => <StockListItem key={stock.code} {...stock} />)
        : Array.from({ length: 8 }, (_, index) => <StockListItemSkeleton key={index} />)}
    </div>
  );
}
