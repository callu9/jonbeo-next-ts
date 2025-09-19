"use client";

import { cn } from "@/utils/classNames";
import { useCallback, useMemo, useRef, useState } from "react";
import GraphTrack from "./GraphTrack";
import PriceHandle from "./PriceHandle";

export type StockGraphProps = {
  /** 현재가 (KRW) */
  currentPrice: number;
  /** 초기 퍼센트 (0~100) - 기본 45% */
  initialPercent?: number;
  /** 퍼센트/희망 평단가 변경 시 호출 */
  onChange?: (payload: { percent: number; targetAveragePrice: number }) => void;
  className?: string;
};

const [TEMP_MIN, TEMP_MAX] = [150, 300];

export default function StockGraph({
  currentPrice,
  initialPercent = 50,
  onChange,
  className,
}: StockGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [percent, setPercent] = useState<number>(initialPercent);

  // 희망 평단가 = 현재가 * (percent / 100)
  const targetAveragePrice = useMemo(
    () => Math.round(currentPrice * (percent / 100)),
    [currentPrice, percent]
  );

  // 상태 변경과 외부 콜백 통합
  const handlePercentChange = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(100, Math.round(next)));
      setPercent(clamped);
      if (onChange) {
        onChange({
          percent: clamped,
          targetAveragePrice: Math.round(currentPrice * (clamped / 100)),
        });
      }
    },
    [currentPrice, onChange]
  );

  return (
    <div
      ref={containerRef}
      className={cn("absolute inset-0 grid", className)}
      aria-label="평단가 그래프"
    >
      {/* 위/아래 영역 표시만 담당 */}
      <GraphTrack percent={percent} />

      {/* 핸들: 상호작용만 담당 (포인터/키보드) */}
      <PriceHandle
        containerRef={containerRef}
        percent={percent}
        onChange={handlePercentChange}
        ariaLabel="평단가 위치"
      />

      {/* 디버그/표시용 배지 - 필요 시 제거 */}
      <div className="absolute top-2 right-2 rounded bg-black/60 px-2 py-1 text-xs text-white">
        {percent}% · {targetAveragePrice.toLocaleString()}원
      </div>
    </div>
  );
}
