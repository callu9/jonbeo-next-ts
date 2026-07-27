"use client";

import AmountStatus, { AmountStatusSkeleton } from "@/components/AmountStatus";
import StockDetailGraph, { StockDetailGraphSkeleton } from "@/components/stocks/StockDetailGraph";
import { StockDetail } from "@/types/stock";

type StockStatusProps = Partial<
  Pick<StockDetail, "name" | "currentPrice" | "profitLossMoney" | "profitLossRate">
>;

export function StockStatusClient(props: StockStatusProps) {
  const hasStockStatus =
    props.currentPrice !== undefined &&
    props.profitLossMoney !== undefined &&
    props.profitLossRate !== undefined;

  return hasStockStatus ? (
    <AmountStatus
      name={props.name}
      cashBalance={props.currentPrice}
      todayProfitMoney={props.profitLossMoney}
      todayProfitRate={props.profitLossRate}
    />
  ) : (
    <AmountStatusSkeleton isNameNeeded={true} />
  );
}

export function StockDetailGraphClient(props: StockDetail) {
  return props ? <StockDetailGraph {...props} /> : <StockDetailGraphSkeleton />;
}
