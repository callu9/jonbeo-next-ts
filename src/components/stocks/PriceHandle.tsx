"use client";

import { useOverlayStore } from "@/store/overlayStore";
import { cn } from "@/utils/classNames";
import { useCallback, useEffect, useRef, useState } from "react";
import IconButton from "../IconButton";

export type PriceHandleProps = {
  /** 그래프 컨테이너 ref (좌표계 기준) */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** 현재 퍼센트 (0~100) */
  percent: number;
  /** 퍼센트 변경 콜백 */
  onChange: (nextPercent: number) => void;
  /** 접근성 라벨 */
  ariaLabel?: string;
};

/** 포인터/키보드로 퍼센트를 변경하는 핸들 컴포넌트 */
export default function PriceHandle({
  containerRef,
  percent,
  onChange,
  ariaLabel = "핸들",
}: PriceHandleProps) {
  if (!containerRef) return;

  const { openModal } = useOverlayStore();
  const [dragging, setDragging] = useState(false);
  const rectRef = useRef<DOMRect | null>(null);
  const rafRef = useRef<number | null>(null);

  const clamp = (v: number) => Math.max(0, Math.min(100, v));

  const yToPercent = useCallback(
    (clientY: number) => {
      const rect = rectRef.current ?? containerRef.current?.getBoundingClientRect();
      if (!rect) return percent;

      // 컨테이너 내부로 좌표 클램핑
      const y = Math.min(Math.max(clientY, rect.top), rect.bottom);
      // 상단 100% / 하단 0% 로 변환
      const ratio = 1 - (y - rect.top) / Math.max(1, rect.height);
      return clamp(Math.round(ratio * 100));
    },
    [containerRef, percent]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault(); // 모바일에서 브라우저 제스처 방지
      rectRef.current = containerRef.current?.getBoundingClientRect() ?? null;
      (e.currentTarget as HTMLDivElement).setPointerCapture?.(e.pointerId);
      setDragging(true);
      onChange(yToPercent(e.clientY));
    },
    [containerRef, onChange, yToPercent]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragging) return;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const clientY = e.clientY;
      rafRef.current = requestAnimationFrame(() => {
        onChange(yToPercent(clientY));
      });
    },
    [dragging, onChange, yToPercent]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // 캡처 해제
      (e.currentTarget as HTMLDivElement).releasePointerCapture?.(e.pointerId);
      // 기존 로직
      openModal();
      setDragging(false);
    },
    [openModal]
  );

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleTop = `${100 - percent}%`;

  return (
    <div
      className={cn(
        "absolute left-0 z-10 mt-2 w-full touch-none overscroll-contain select-none",
        dragging ? "cursor-grabbing" : "cursor-grab"
      )}
      style={{ top: handleTop }}
      role="slider"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div className="flex-center relative">
        <hr className="w-full border-[1px] border-dashed" />
        <div
          className={cn(
            "absolute right-6 h-10 w-10",
            "drop-shadow-[0_4px_6px_rgba(0,0,0,0.08)] dark:drop-shadow-[0_4px_6px_rgba(100,100,100,0.2)]"
          )}
        >
          <IconButton iconNm="adjust" />
        </div>
      </div>
    </div>
  );
}
