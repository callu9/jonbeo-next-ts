import { StockDetail } from "@/types/stock";
import { cn } from "@/utils/classNames";
import { Graph } from "../../../public/images";
import StockGraph from "./StockGraph";

interface StockDetailGraph extends StockDetail {}

export default function StockDetailGraph({
  currentPrice,
  profitLossRate,
  targetAveragePrice,
}: StockDetailGraph) {
  const dotColor =
    profitLossRate > 0
      ? "bg-red-500"
      : profitLossRate < 0
        ? "bg-blue-500"
        : "bg-gray-400 dark:bg-gray-200";
  return (
    <div className="flex-center relative aspect-square items-center self-stretch">
      <div className="absolute top-[32%] right-4 z-1 md:top-[30%]">
        <div className="relative">
          <div className={cn("h-4 w-4 rounded-full", dotColor)} />
          <div className={cn("absolute top-0 h-4 w-4 animate-ping rounded-full", dotColor)} />
        </div>
      </div>
      <StockGraph
        currentPrice={currentPrice}
        initialPercent={targetAveragePrice ? (targetAveragePrice / currentPrice) * 100 : undefined}
      />
    </div>
  );
}

export function StockDetailGraphSkeleton() {
  return (
    <div className="aspect-square">
      <div className="flex-center relative aspect-square items-center self-stretch pt-10 pr-6">
        <div className="relative w-full animate-pulse">
          <Graph className="text-gray-400" alt="주식 차트 스켈레톤 이미지" />
        </div>
      </div>
    </div>
  );
}
