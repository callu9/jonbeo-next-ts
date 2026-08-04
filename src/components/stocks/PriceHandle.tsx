"use client";

import { cn } from "@/utils/classNames";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import IconButton from "../IconButton";

export type PriceHandleProps = {
  /** The chart coordinate system used to translate pointer positions. */
  containerRef: RefObject<HTMLDivElement | null>;
  /** Distance from the chart top in pixels. */
  y: number | null;
  /** Current target price exposed to assistive technology. */
  price: number;
  minPrice: number;
  maxPrice: number;
  /** Reports a chart-relative Y coordinate while dragging. */
  onChangeY: (y: number) => void;
  /** Opens the save modal after the user releases the handle. */
  onCommit: () => void;
  ariaLabel?: string;
};

const KEYBOARD_STEP = 4;

/** Pointer overlay that delegates price conversion to the chart owning component. */
export default function PriceHandle({
  containerRef,
  y,
  price,
  minPrice,
  maxPrice,
  onChangeY,
  onCommit,
  ariaLabel = "핸들",
}: PriceHandleProps) {
  const [dragging, setDragging] = useState(false);
  const rectRef = useRef<DOMRect | null>(null);
  const rafRef = useRef<number | null>(null);
  const pendingClientYRef = useRef<number | null>(null);

  const clientYToChartY = useCallback(
    (clientY: number) => {
      const rect = rectRef.current ?? containerRef.current?.getBoundingClientRect();
      if (!rect) return y ?? 0;

      return Math.min(Math.max(clientY - rect.top, 0), rect.height);
    },
    [containerRef, y]
  );

  const flushPendingChange = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;

    const clientY = pendingClientYRef.current;
    pendingClientYRef.current = null;
    if (clientY !== null) onChangeY(clientYToChartY(clientY));
  }, [clientYToChartY, onChangeY]);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      rectRef.current = containerRef.current?.getBoundingClientRect() ?? null;
      pendingClientYRef.current = null;
      event.currentTarget.setPointerCapture?.(event.pointerId);
      setDragging(true);
      onChangeY(clientYToChartY(event.clientY));
    },
    [clientYToChartY, containerRef, onChangeY]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!dragging) return;
      pendingClientYRef.current = event.clientY;
      if (rafRef.current !== null) return;

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        flushPendingChange();
      });
    },
    [dragging, flushPendingChange]
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
      flushPendingChange();
      setDragging(false);
      rectRef.current = null;
      onCommit();
    },
    [flushPendingChange, onCommit]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
      event.preventDefault();
      onChangeY(Math.max(0, (y ?? 0) + (event.key === "ArrowUp" ? -KEYBOARD_STEP : KEYBOARD_STEP)));
    },
    [onChangeY, y]
  );

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      pendingClientYRef.current = null;
    };
  }, []);

  return (
    <div
      className={cn(
        "absolute left-0 z-10 w-full touch-none overscroll-contain select-none",
        dragging ? "cursor-grabbing" : "cursor-grab"
      )}
      style={{ top: `${y ?? 0}px` }}
      role="slider"
      aria-label={ariaLabel}
      aria-valuemin={minPrice}
      aria-valuemax={maxPrice}
      aria-valuenow={price}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div className="flex-center relative -translate-y-1/2">
        <hr className="w-full border-[1px] border-dashed" />
        <div
          className={cn(
            "absolute right-6 h-10 w-10",
            "drop-shadow-[0_4px_6px_rgba(0,0,0,0.08)] dark:drop-shadow-[0_4px_6px_rgba(100,100,100,0.2)]"
          )}
        >
          <IconButton iconNm="adjust" aria-label="평단가 위치 조절" />
        </div>
      </div>
    </div>
  );
}
