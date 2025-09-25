import { cn } from "@/utils/classNames";
import { memo } from "react";
import { Graph } from "../../../public/images";

/** 순수 표시용: 위/아래 영역을 퍼센트로 나눠서 색만 채움 */
function GraphTrackBase({ percent, currentPercent }: { percent: number; currentPercent: number }) {
  const topH = `${percent}%`;
  const bottomH = `${100 - percent}%`;

  return (
    <div className="relative aspect-square h-full">
      <div
        className={cn(
          "absolute top-0 right-0 left-0 overflow-hidden",
          percent < currentPercent
            ? "text-red-500"
            : percent === currentPercent
              ? ""
              : "text-gray-400"
        )}
        style={{ height: bottomH }}
      >
        <div className="absolute top-0 aspect-square w-full">
          <Graph width="100%" />
        </div>
      </div>
      <div
        className={cn(
          "absolute right-0 bottom-0 left-0 overflow-hidden",
          percent > currentPercent
            ? "text-blue-500"
            : percent === currentPercent
              ? ""
              : "text-gray-400"
        )}
        style={{ height: topH }}
      >
        <div className="absolute bottom-0 aspect-square w-full">
          <Graph width="100%" />
        </div>
      </div>
    </div>
  );
}

const GraphTrack = memo(GraphTrackBase);
export default GraphTrack;
