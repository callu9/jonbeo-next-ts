import { fireEvent, render, screen } from "@testing-library/react";
import { useRef } from "react";
import PriceHandle from "./PriceHandle";

function HandleFixture({ onChangeY, onCommit }: { onChangeY: (y: number) => void; onCommit: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} data-testid="chart-container">
      <PriceHandle
        containerRef={containerRef}
        y={40}
        price={123.45}
        minPrice={120}
        maxPrice={130}
        onChangeY={onChangeY}
        onCommit={onCommit}
        ariaLabel="평단가 위치"
      />
    </div>
  );
}

describe("PriceHandle", () => {
  beforeEach(() => {
    class MockPointerEvent extends MouseEvent {
      pointerId: number;

      constructor(type: string, properties: PointerEventInit = {}) {
        super(type, properties);
        this.pointerId = properties.pointerId ?? 0;
      }
    }

    Object.defineProperty(window, "PointerEvent", { configurable: true, value: MockPointerEvent });
    Object.defineProperty(window, "requestAnimationFrame", {
      configurable: true,
      value: (callback: FrameRequestCallback) => {
        callback(0);
        return 1;
      },
    });
    Object.defineProperty(window, "cancelAnimationFrame", {
      configurable: true,
      value: jest.fn(),
    });
  });

  it("reports the chart-relative y coordinate as the handle is dragged", () => {
    const onChangeY = jest.fn();
    const onCommit = jest.fn();
    render(<HandleFixture onChangeY={onChangeY} onCommit={onCommit} />);

    const chartContainer = screen.getByTestId("chart-container");
    Object.defineProperty(chartContainer, "getBoundingClientRect", {
      configurable: true,
      value: () => ({ top: 100, bottom: 300, height: 200 }),
    });

    const handle = screen.getByRole("slider", { name: "평단가 위치" });
    fireEvent.pointerDown(handle, { pointerId: 1, clientY: 140 });
    fireEvent.pointerMove(handle, { pointerId: 1, clientY: 260 });
    fireEvent.pointerUp(handle, { pointerId: 1, clientY: 260 });

    expect(onChangeY).toHaveBeenLastCalledWith(160);
    expect(onCommit).toHaveBeenCalledTimes(1);
  });
});
