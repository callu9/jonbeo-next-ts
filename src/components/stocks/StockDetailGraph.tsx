import { StockDetail } from "@/types/stock";
import { Graph } from "../../../public/images";
import StockGraph from "./StockGraph";

type StockDetailGraphProps = StockDetail;

export default function StockDetailGraph({
  currentPrice,
  profitLossRate,
  recentCandles,
  targetAveragePrice,
}: StockDetailGraphProps) {
  return (
    <div className="flex-center relative aspect-square items-center self-stretch">
      <StockGraph
        currentPrice={currentPrice}
        profitLossRate={profitLossRate}
        candles={recentCandles ?? []}
        initialTargetPrice={targetAveragePrice}
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
