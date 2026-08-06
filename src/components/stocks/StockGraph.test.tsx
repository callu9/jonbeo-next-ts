import { PriceCandle } from "@/types/common";
import { act, render, screen } from "@testing-library/react";
import StockGraph from "./StockGraph";

jest.mock("next/dynamic", () => ({
  __esModule: true,
  default: () => jest.requireMock("./PriceChart").default,
}));

jest.mock("./PriceChart", () => ({
  __esModule: true,
  default: ({
    targetPrice,
    currentPrice,
    currentPriceTone,
  }: {
    targetPrice: number;
    currentPrice: number;
    currentPriceTone: string;
  }) => (
    <>
      <div data-testid="price-chart">{targetPrice}</div>
      <output data-testid="current-price-marker-props">
        {currentPrice}:{currentPriceTone}
      </output>
    </>
  ),
}));

jest.mock("./PriceModal", () => ({
  __esModule: true,
  default: () => null,
}));

const candles: PriceCandle[] = [
  { time: 1_731_126_800_000, open: 120, high: 122, low: 118, close: 121 },
  { time: 1_731_130_400_000, open: 122, high: 124, low: 120, close: 123 },
];

describe("StockGraph", () => {
  let observerCallback: IntersectionObserverCallback;
  const observer = {
    disconnect: jest.fn(),
    observe: jest.fn(),
    takeRecords: jest.fn(() => []),
    unobserve: jest.fn(),
  } as unknown as IntersectionObserver;

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, "IntersectionObserver", {
      configurable: true,
      value: jest.fn((callback: IntersectionObserverCallback) => {
        observerCallback = callback;
        return observer;
      }),
      writable: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function enterChart() {
    act(() =>
      observerCallback([{ isIntersecting: true } as IntersectionObserverEntry], observer)
    );
  }

  it("renders an empty state when the stock has no price history", () => {
    render(<StockGraph currentPrice={121.26} candles={[]} />);

    expect(screen.getByText("표시할 가격 기록이 없습니다.")).toBeInTheDocument();
  });

  it("does not mount the chart until its graph region enters the viewport", () => {
    render(<StockGraph currentPrice={121.26} profitLossRate={-13.39} candles={candles} />);

    expect(screen.getByTestId("price-chart-loading")).toBeInTheDocument();
    expect(screen.queryByTestId("price-chart")).not.toBeInTheDocument();

    enterChart();

    expect(screen.getByTestId("price-chart")).toHaveTextContent("121.26");
    expect(observer.disconnect).toHaveBeenCalled();
  });

  it("renders the chart when IntersectionObserver is unavailable", () => {
    Object.defineProperty(window, "IntersectionObserver", {
      configurable: true,
      value: undefined,
      writable: true,
    });

    render(<StockGraph currentPrice={121.26} profitLossRate={-13.39} candles={candles} />);

    expect(screen.getByTestId("price-chart")).toHaveTextContent("121.26");
  });

  it("starts the chart at the supplied target average price", () => {
    render(
      <StockGraph
        currentPrice={121.26}
        profitLossRate={-13.39}
        candles={candles}
        initialTargetPrice={122.5}
      />
    );
    enterChart();

    expect(screen.getByTestId("price-chart")).toHaveTextContent("122.5");
  });

  it("passes the current price and negative trend to the chart marker", () => {
    render(<StockGraph currentPrice={121.26} profitLossRate={-13.39} candles={candles} />);
    enterChart();

    expect(screen.getByTestId("current-price-marker-props")).toHaveTextContent("121.26:negative");
  });
});
