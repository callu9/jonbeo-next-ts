"use client";

import AmountStatus, { AmountStatusSkeleton } from "@/components/AmountStatus";
import { useMinLoading } from "@/hooks/useMinLoading";
import { StockDetail } from "@/types/stock";
import { useEffect, useState } from "react";

interface StockStatusProps
  extends Partial<
    Pick<StockDetail, "name" | "currentPrice" | "profitLossMoney" | "profitLossRate">
  > {}

export function StockStatusClient(props: StockStatusProps) {
  const [loading, setLoading] = useState(true);
  const showSkeleton = useMinLoading(loading, 800);

  useEffect(() => {
    props.currentPrice && setLoading(false);
  }, [props]);

  return showSkeleton || !props.currentPrice || !props.profitLossMoney || !props.profitLossRate ? (
    <AmountStatusSkeleton isNameNeeded={true} />
  ) : (
    <AmountStatus
      name={props.name}
      cashBalance={props.currentPrice}
      todayProfitMoney={props.profitLossMoney}
      todayProfitRate={props.profitLossRate}
    />
  );
}
