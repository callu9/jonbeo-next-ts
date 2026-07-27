import { PriceCandle } from "@/types/common";
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import PriceChart from "./PriceChart";
import { toAreaChartData } from "./chartData";

const mockRemove = jest.fn();
const mockRemovePriceLine = jest.fn();
const mockCreatePriceLine = jest.fn(() => ({}));
const mockPriceToCoordinate = jest.fn(() => 40);
const mockCoordinateToPrice = jest.fn(() => 118.5);
const mockSetData = jest.fn();
const mockFitContent = jest.fn();
const mockSeries = {
  setData: mockSetData,
  createPriceLine: mockCreatePriceLine,
  removePriceLine: mockRemovePriceLine,
  priceToCoordinate: mockPriceToCoordinate,
  coordinateToPrice: mockCoordinateToPrice,
};
const mockAddSeries = jest.fn(() => mockSeries);
const mockCreateChart = jest.fn(() => ({
  addSeries: mockAddSeries,
  remove: mockRemove,
  timeScale: () => ({ fitContent: mockFitContent }),
}));

jest.mock("lightweight-charts", () => ({
  AreaSeries: "AreaSeries",
  ColorType: { Solid: "solid" },
  LineStyle: { Dotted: 3 },
  createChart: (...args: unknown[]) => mockCreateChart(...args),
}), { virtual: true });

const candles: PriceCandle[] = [
  { time: 1_731_126_800_000, open: 120, high: 122, low: 118, close: 121 },
  { time: 1_731_130_400_000, open: 122, high: 124, low: 120, close: 123 },
];

function PriceChartFixture({ onCommit }: { onCommit: () => void }) {
  const [targetPrice, setTargetPrice] = useState(123);

  return (
    <>
      <output data-testid="target-price">{targetPrice}</output>
      <PriceChart
        data={toAreaChartData(candles)}
        targetPrice={targetPrice}
        minPrice={118}
        maxPrice={124}
        onTargetPriceChange={setTargetPrice}
        onTargetPriceCommit={onCommit}
      />
    </>
  );
}

describe("PriceChart", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  it("draws an area series and replaces its dotted target-price line", () => {
    const { unmount } = render(<PriceChartFixture onCommit={jest.fn()} />);

    expect(mockCreateChart).toHaveBeenCalledTimes(1);
    expect(mockSetData).toHaveBeenCalledWith(toAreaChartData(candles));
    expect(mockFitContent).toHaveBeenCalledTimes(1);
    expect(mockCreatePriceLine).toHaveBeenCalledWith(
      expect.objectContaining({ price: 123, lineStyle: 3 })
    );

    unmount();
    expect(mockRemove).toHaveBeenCalledTimes(1);
  });

  it("updates the displayed target price while the handle moves", () => {
    const onCommit = jest.fn();
    render(<PriceChartFixture onCommit={onCommit} />);

    const chart = screen.getByTestId("price-chart");
    Object.defineProperty(chart, "getBoundingClientRect", {
      configurable: true,
      value: () => ({ top: 100, bottom: 300, height: 200 }),
    });

    const handle = screen.getByRole("slider", { name: "평단가 위치" });
    fireEvent.pointerDown(handle, { pointerId: 1, clientY: 140 });
    fireEvent.pointerMove(handle, { pointerId: 1, clientY: 220 });
    fireEvent.pointerUp(handle, { pointerId: 1, clientY: 220 });

    expect(screen.getByTestId("target-price")).toHaveTextContent("118.5");
    expect(onCommit).toHaveBeenCalledTimes(1);
  });
});
