"use client";

import AmountStatus, { AmountStatusSkeleton } from "@/components/AmountStatus";
import StockDetailGraph, { StockDetailGraphSkeleton } from "@/components/stocks/StockDetailGraph";
import { StockDetail } from "@/types/stock";

type StockStatusProps = Partial<
  Pick<StockDetail, "name" | "currentPrice" | "profitLossMoney" | "profitLossRate">
>;

export function StockStatusClient(props: StockStatusProps) {
  if (
    props.currentPrice === undefined ||
    props.currentPrice === null ||
    props.profitLossMoney === undefined ||
    props.profitLossMoney === null ||
    props.profitLossRate === undefined ||
    props.profitLossRate === null
  ) {
    return <AmountStatusSkeleton isNameNeeded={true} />;
  }

  return (
    <AmountStatus
      name={props.name}
      cashBalance={props.currentPrice}
      todayProfitMoney={props.profitLossMoney}
      todayProfitRate={props.profitLossRate}
    />
  );
}

export function StockDetailGraphClient(props: StockDetail) {
  return props ? <StockDetailGraph {...props} /> : <StockDetailGraphSkeleton />;
}
