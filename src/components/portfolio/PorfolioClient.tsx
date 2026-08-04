"use client";

import AmountStatus, { AmountStatusSkeleton } from "@/components/AmountStatus";
import StockListItem, { StockListItemSkeleton } from "@/components/portfolio/StockListItem";
import { MyAccountSummary, PortfolioListItem } from "@/types/portfolio";

export function AccountSummaryClient({ accountSummary }: { accountSummary?: MyAccountSummary }) {
  return accountSummary ? <AmountStatus {...accountSummary} /> : <AmountStatusSkeleton />;
}

export function StockListClient({ stocks }: { stocks?: PortfolioListItem[] }) {
  return stocks ? (
    <div className="divide-y divide-gray-300 dark:divide-gray-700">
      {stocks.map((stock) => (
        <StockListItem key={stock.code} {...stock} />
      ))}
    </div>
  ) : (
    <div className="divide-y divide-gray-300 dark:divide-gray-700">
      {Array.from({ length: 8 }, (_, idx) => (
        <StockListItemSkeleton key={idx} />
      ))}
    </div>
  );
}
