import { StockDetail } from "@/types/stock";
import { cn } from "@/utils/classNames";
import Image from "next/image";
import GraphHandle from "./GraphHandle";

interface StockDetailGraph extends StockDetail {}

export default function StockDetailGraph({
  avgBuyPrice,
  currentPrice,
  profitLossRate,
  todayChangeRate,
}: StockDetailGraph) {
  const dotColor =
    profitLossRate > 0
      ? "bg-red-500"
      : profitLossRate < 0
        ? "bg-blue-500"
        : "bg-gray-400 dark:bg-gray-200";
  return (
    <div className="flex-center relative aspect-square items-center self-stretch">
      <div className="relative mt-10 mr-6 h-full w-full">
        <Image
          className="bg-clip-content bg-blend-soft-light"
          src="/images/line-skeleton.svg"
          alt="주식 차트 스켈레톤 이미지"
          fill
        />
      </div>
      <div className="absolute top-[32%] right-4 md:top-[30%]">
        <div className="relative">
          <div className={cn("h-4 w-4 rounded-full", dotColor)} />
          <div className={cn("absolute top-0 h-4 w-4 animate-ping rounded-full", dotColor)} />
        </div>
      </div>
      <GraphHandle />
    </div>
  );
}

export function StockDetailGraphSkeleton() {
  return (
    <div className="flex-center relative aspect-square items-center self-stretch">
      <div className="relative mt-10 mr-6 h-full w-full animate-pulse">
        <Image
          className="opacity-50"
          src="/images/line-skeleton.svg"
          alt="주식 차트 스켈레톤 이미지"
          fill
        />
      </div>
    </div>
  );
}
