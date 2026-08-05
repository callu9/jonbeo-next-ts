import { fireEvent, render, screen } from "@testing-library/react";
import { useRef } from "react";
import PriceHandle from "./PriceHandle";

let frameCallbacks = new Map<number, FrameRequestCallback>();
let nextFrameId = 1;

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
    frameCallbacks = new Map();
    nextFrameId = 1;
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
      value: jest.fn((callback: FrameRequestCallback) => {
        const frameId = nextFrameId++;
        frameCallbacks.set(frameId, callback);
        return frameId;
      }),
    });
    Object.defineProperty(window, "cancelAnimationFrame", {
      configurable: true,
      value: jest.fn((frameId: number) => frameCallbacks.delete(frameId)),
    });
  });

  function runNextFrame() {
    const entry = frameCallbacks.entries().next().value as [number, FrameRequestCallback] | undefined;
    if (!entry) throw new Error("No animation frame was scheduled");
    const [frameId, callback] = entry;
    frameCallbacks.delete(frameId);
    callback(0);
  }

  it("reports only the latest position once in an animation frame", () => {
    const onChangeY = jest.fn();
    render(<HandleFixture onChangeY={onChangeY} onCommit={jest.fn()} />);
    const chartContainer = screen.getByTestId("chart-container");
    Object.defineProperty(chartContainer, "getBoundingClientRect", { configurable: true, value: () => ({ top: 100, bottom: 300, height: 200 }) });
    const handle = screen.getByRole("slider", { name: "평단가 위치" });

    fireEvent.pointerDown(handle, { pointerId: 1, clientY: 140 });
    fireEvent.pointerMove(handle, { pointerId: 1, clientY: 180 });
    fireEvent.pointerMove(handle, { pointerId: 1, clientY: 220 });
    fireEvent.pointerMove(handle, { pointerId: 1, clientY: 260 });

    expect(onChangeY).toHaveBeenCalledTimes(1);
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
    runNextFrame();
    expect(onChangeY).toHaveBeenLastCalledWith(160);
    expect(onChangeY).toHaveBeenCalledTimes(2);
  });

  it("flushes the latest position before committing on pointer release", () => {
    const onChangeY = jest.fn();
    const onCommit = jest.fn();
    render(<HandleFixture onChangeY={onChangeY} onCommit={onCommit} />);
    const chartContainer = screen.getByTestId("chart-container");
    Object.defineProperty(chartContainer, "getBoundingClientRect", { configurable: true, value: () => ({ top: 100, bottom: 300, height: 200 }) });
    const handle = screen.getByRole("slider", { name: "평단가 위치" });

    fireEvent.pointerDown(handle, { pointerId: 1, clientY: 140 });
    fireEvent.pointerMove(handle, { pointerId: 1, clientY: 260 });
    fireEvent.pointerUp(handle, { pointerId: 1, clientY: 260 });

    expect(onChangeY).toHaveBeenLastCalledWith(160);
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(frameCallbacks.size).toBe(0);
  });

  it("reports the final position before committing on pointer release", () => {
    const calls: string[] = [];
    const onChangeY = jest.fn(() => calls.push("change"));
    const onCommit = jest.fn(() => calls.push("commit"));
    render(<HandleFixture onChangeY={onChangeY} onCommit={onCommit} />);
    const chartContainer = screen.getByTestId("chart-container");
    Object.defineProperty(chartContainer, "getBoundingClientRect", { configurable: true, value: () => ({ top: 100, bottom: 300, height: 200 }) });
    const handle = screen.getByRole("slider", { name: "평단가 위치" });

    fireEvent.pointerDown(handle, { pointerId: 1, clientY: 140 });
    fireEvent.pointerMove(handle, { pointerId: 1, clientY: 260 });
    fireEvent.pointerUp(handle, { pointerId: 1, clientY: 260 });

    expect(calls.slice(-2)).toEqual(["change", "commit"]);
  });

  it("cancels a pending animation frame on unmount", () => {
    const onChangeY = jest.fn();
    const { unmount } = render(<HandleFixture onChangeY={onChangeY} onCommit={jest.fn()} />);
    const chartContainer = screen.getByTestId("chart-container");
    Object.defineProperty(chartContainer, "getBoundingClientRect", { configurable: true, value: () => ({ top: 100, bottom: 300, height: 200 }) });
    const handle = screen.getByRole("slider", { name: "평단가 위치" });

    fireEvent.pointerDown(handle, { pointerId: 1, clientY: 140 });
    fireEvent.pointerMove(handle, { pointerId: 1, clientY: 260 });
    unmount();

    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(1);
    expect(frameCallbacks.size).toBe(0);
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
