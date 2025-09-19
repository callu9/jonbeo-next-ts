import { cn } from "@/utils/classNames";
import { memo } from "react";

/** 순수 표시용: 위/아래 영역을 퍼센트로 나눠서 색만 채움 */
function GraphTrackBase({ percent }: { percent: number }) {
  const topH = `${percent}%`;
  const bottomH = `${100 - percent}%`;

  return (
    <div className="relative h-full">
      <div
        style={{ height: percent > 50 ? topH : bottomH }}
        className={cn(
          "absolute right-0 left-0 w-full",
          percent > 50 ? "bottom-0 bg-blue-500" : "top-0 bg-red-500"
        )}
      />
    </div>
  );
}

const GraphTrack = memo(GraphTrackBase);
export default GraphTrack;
