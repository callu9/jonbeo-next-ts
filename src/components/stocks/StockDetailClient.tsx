"use client";

import AmountStatus, { AmountStatusSkeleton } from "@/components/AmountStatus";
import StockDetailGraph, { StockDetailGraphSkeleton } from "@/components/stocks/StockDetailGraph";
import { useMinLoading } from "@/hooks/useMinLoading";
import { StockDetail } from "@/types/stock";
import { useEffect, useState } from "react";

const MIN_MS = 1_500;

interface StockStatusProps
  extends Partial<
    Pick<StockDetail, "name" | "currentPrice" | "profitLossMoney" | "profitLossRate">
  > {}

export function StockStatusClient(props: StockStatusProps) {
  const [loading, setLoading] = useState(true);
  const showSkeleton = useMinLoading(loading, MIN_MS);

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

export function StockDetailGraphClient(props: StockDetail) {
  const [loading, setLoading] = useState(true);
  const showSkeleton = useMinLoading(loading, MIN_MS);

  useEffect(() => {
    props && setLoading(false);
  }, [props]);

  return showSkeleton || !props ? <StockDetailGraphSkeleton /> : <StockDetailGraph {...props} />;
}
