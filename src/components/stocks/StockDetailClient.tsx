"use client";

import AmountStatus, { AmountStatusSkeleton } from "@/components/AmountStatus";
import StockDetailGraph, { StockDetailGraphSkeleton } from "@/components/stocks/StockDetailGraph";
import { StockDetail } from "@/types/stock";

type StockStatusProps = Partial<
  Pick<StockDetail, "name" | "currentPrice" | "profitLossMoney" | "profitLossRate">
>;

export function StockStatusClient(props: StockStatusProps) {
  const { currentPrice, profitLossMoney, profitLossRate } = props;
  if (
    currentPrice === undefined ||
    currentPrice === null ||
    profitLossMoney === undefined ||
    profitLossMoney === null ||
    profitLossRate === undefined ||
    profitLossRate === null
  ) {
    return <AmountStatusSkeleton isNameNeeded={true} />;
  }

  return (
    <AmountStatus
      name={props.name}
      cashBalance={currentPrice}
      todayProfitMoney={profitLossMoney}
      todayProfitRate={profitLossRate}
    />
  );
}

export function StockDetailGraphClient(props: StockDetail) {
  return props ? <StockDetailGraph {...props} /> : <StockDetailGraphSkeleton />;
}
