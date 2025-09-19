"use client";

import AmountStatus, { AmountStatusSkeleton } from "@/components/AmountStatus";
import StockListItem, { StockListItemSkeleton } from "@/components/portfolio/StockListItem";
import { useMinLoading } from "@/hooks/useMinLoading";
import { MyAccountSummary, PortfolioListItem } from "@/types/portfolio";
import { useEffect, useState } from "react";

export function AccountSummaryClient({ accountSummary }: { accountSummary?: MyAccountSummary }) {
  const [loading, setLoading] = useState(true);
  const showSkeleton = useMinLoading(loading, 800);

  useEffect(() => {
    accountSummary && setLoading(false);
  }, [accountSummary]);

  return showSkeleton || !accountSummary ? (
    <AmountStatusSkeleton />
  ) : (
    <AmountStatus {...accountSummary} />
  );
}

export function StockListClient({ stocks }: { stocks?: PortfolioListItem[] }) {
  const [loading, setLoading] = useState(true);
  const showSkeleton = useMinLoading(loading, 800);

  useEffect(() => {
    stocks && setLoading(false);
  }, [stocks]);

  return showSkeleton || !stocks ? (
    <div className="divide-y divide-gray-300 dark:divide-gray-700">
      {new Array(8).fill(undefined).map((_, idx) => (
        <StockListItemSkeleton key={idx} />
      ))}
    </div>
  ) : (
    <div className="divide-y divide-gray-300 dark:divide-gray-700">
      {stocks.map((stock) => (
        <StockListItem key={stock.code} {...stock} />
      ))}
    </div>
  );
}
