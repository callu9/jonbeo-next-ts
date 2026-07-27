# Area Price Chart Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Replace the stock-detail static graph with a lazy-loaded, data-driven area chart and a price-accurate draggable target-average line.

**Architecture:** Preserve PriceCandle as the API/mock contract and add deterministic AAPL history. A pure adapter maps epoch-millisecond candles to Lightweight Charts line points. A client-only PriceChart owns the imperative chart instance and exposes price-coordinate callbacks to a focused draggable handle; StockGraph owns target-price state and the existing save modal.

**Tech Stack:** Next.js 15, React 19, TypeScript, lightweight-charts 5.x, Zustand, Jest, Testing Library.

## Global Constraints

- Render recentCandles close values as an AreaSeries; do not add a chart-type toggle.
- Target price defaults to saved targetAveragePrice, otherwise avgBuyPrice.
- Keep price values in dollars and convert mock candle timestamps from milliseconds to UTC seconds only in the chart adapter.
- Dynamically load the chart client component so the portfolio-home route never imports it.
- Preserve keyboard-accessible slider semantics and the existing modal/toast save flow.
- Do not add live market data, polling, indicators, zoom controls, or time-range controls.
- Keep the Lighthouse threshold unchanged and compare /stocks/AAPL to the documented 0.89 local baseline.

---

### Task 1: Add complete mock history and a pure chart-data adapter

**Files:**
- Modify: package.json
- Modify: package-lock.json
- Modify: src/mocks/database/stocks.json
- Create: src/components/stocks/chartData.ts
- Create: src/components/stocks/chartData.test.ts

**Interfaces:**
- Consumes: PriceCandle from src/types/common.ts.
- Produces:

    export type AreaChartPoint = { time: number; value: number };

    export function toAreaChartData(candles: PriceCandle[]): AreaChartPoint[];

    export function getInitialTargetPrice(input: {
      avgBuyPrice: number;
      targetAveragePrice?: number;
    }): number;

- [ ] **Step 1: Write the failing adapter tests**

    import { getInitialTargetPrice, toAreaChartData } from "./chartData";

    it("sorts millisecond candles and converts them to UTC seconds", () => {
      expect(
        toAreaChartData([
          { time: 2_000, open: 12, high: 14, low: 11, close: 13 },
          { time: 1_000, open: 10, high: 12, low: 9, close: 11 },
        ])
      ).toEqual([
        { time: 1, value: 11 },
        { time: 2, value: 13 },
      ]);
    });

    it("prefers a saved target price and otherwise uses the average buy price", () => {
      expect(getInitialTargetPrice({ avgBuyPrice: 140, targetAveragePrice: 118 })).toBe(118);
      expect(getInitialTargetPrice({ avgBuyPrice: 140 })).toBe(140);
    });

- [ ] **Step 2: Run the new tests to verify they fail**

Run: npx jest src/components/stocks/chartData.test.ts --runInBand

Expected: FAIL because chartData does not exist.

- [ ] **Step 3: Install the selected chart package**

Run: npm install lightweight-charts

Expected: package.json and package-lock.json contain the dependency without unrelated changes.

- [ ] **Step 4: Add AAPL candles and the minimal adapter**

    export function toAreaChartData(candles: PriceCandle[]): AreaChartPoint[] {
      return [...candles]
        .sort((left, right) => left.time - right.time)
        .map((candle) => ({ time: candle.time / 1_000, value: candle.close }));
    }

    export function getInitialTargetPrice({ avgBuyPrice, targetAveragePrice }: {
      avgBuyPrice: number;
      targetAveragePrice?: number;
    }): number {
      return targetAveragePrice ?? avgBuyPrice;
    }

Add at least 20 chronological AAPL OHLC candles around the current $121.26 price. Each candle must satisfy low <= open/close <= high. Retain existing FB data.

- [ ] **Step 5: Run focused data tests**

Run: npx jest src/components/stocks/chartData.test.ts src/data/stocks.test.ts --runInBand

Expected: PASS; AAPL remains retrievable and adapter output is ordered second-based close data.

- [ ] **Step 6: Commit the data foundation**

    git add package.json package-lock.json src/mocks/database/stocks.json src/components/stocks/chartData.ts src/components/stocks/chartData.test.ts src/data/stocks.test.ts
    git commit -m "feat: add stock chart history data"

### Task 2: Create a testable client AreaSeries wrapper

**Files:**
- Create: src/components/stocks/PriceChart.tsx
- Create: src/components/stocks/PriceChart.test.tsx

**Interfaces:**
- Consumes: AreaChartPoint and lightweight-charts.
- Produces:

    export type PriceChartProps = {
      data: AreaChartPoint[];
      targetPrice: number;
      onTargetPriceChange: (price: number) => void;
      onTargetPriceCommit: () => void;
    };

- [ ] **Step 1: Write a failing component test with a lightweight-charts mock**

    jest.mock("lightweight-charts", () => ({
      AreaSeries: "AreaSeries",
      LineStyle: { Dotted: 1 },
      createChart: jest.fn(),
    }));

    it("sets area data, updates the target price line, and cleans up the chart", () => {
      const { unmount } = render(
        <PriceChart
          data={[{ time: 1, value: 121.26 }]}
          targetPrice={118}
          onTargetPriceChange={jest.fn()}
          onTargetPriceCommit={jest.fn()}
        />
      );
      expect(series.setData).toHaveBeenCalledWith([{ time: 1, value: 121.26 }]);
      expect(series.createPriceLine).toHaveBeenCalledWith(expect.objectContaining({ price: 118 }));
      unmount();
      expect(chart.remove).toHaveBeenCalled();
    });

- [ ] **Step 2: Run the component test to verify it fails**

Run: npx jest src/components/stocks/PriceChart.test.tsx --runInBand

Expected: FAIL because PriceChart does not exist.

- [ ] **Step 3: Implement the chart lifecycle**

Create the chart in useEffect. Use a transparent background, hidden axes and grid, autoSize, a blue AreaSeries, and a subtle gradient fill. Call series.setData(data), chart.timeScale().fitContent(), and series.createPriceLine() with a dotted target-price label. Store chart, series, and line handles in refs so prop changes update the existing chart. Remove the chart in the effect cleanup.

Use series.priceToCoordinate(targetPrice) for handle position. Convert drag Y through series.coordinateToPrice(y), round to two decimals, and call onTargetPriceChange only for non-null prices.

- [ ] **Step 4: Run the component test to verify it passes**

Run: npx jest src/components/stocks/PriceChart.test.tsx --runInBand

Expected: PASS; setup, price-line update, and cleanup assertions succeed.

- [ ] **Step 5: Commit the chart wrapper**

    git add src/components/stocks/PriceChart.tsx src/components/stocks/PriceChart.test.tsx
    git commit -m "feat: render stock price area chart"

### Task 3: Replace static graph and percentage interaction

**Files:**
- Modify: src/components/stocks/StockGraph.tsx
- Modify: src/components/stocks/PriceHandle.tsx
- Modify: src/components/stocks/StockDetailGraph.tsx
- Delete: src/components/stocks/GraphTrack.tsx
- Create: src/components/stocks/StockGraph.test.tsx

**Interfaces:**
- Consumes: StockDetail.recentCandles, avgBuyPrice, targetAveragePrice, and the Task 1 adapter.
- Produces: a detail graph that uses actual price values and retains the PriceModal trigger.

- [ ] **Step 1: Write the failing integration test**

    jest.mock("./PriceChart", () => ({
      __esModule: true,
      default: ({ targetPrice }: { targetPrice: number }) => (
        <div data-testid="price-chart">{targetPrice}</div>
      ),
    }));

    it("uses average buy price when no saved target exists", () => {
      render(
        <StockGraph
          currentPrice={121.26}
          avgBuyPrice={140}
          recentCandles={[candle]}
        />
      );
      expect(screen.getByTestId("price-chart")).toHaveTextContent("140");
    });

- [ ] **Step 2: Run the integration test to verify it fails**

Run: npx jest src/components/stocks/StockGraph.test.tsx --runInBand

Expected: FAIL because StockGraph still requires initialPercent and does not render PriceChart.

- [ ] **Step 3: Implement actual-price composition**

Change StockGraph props to receive avgBuyPrice, optional targetAveragePrice, and recentCandles. Initialize state with getInitialTargetPrice, dynamically load the client-only PriceChart with ssr false, and retain PriceModal with the actual target price.

Refactor PriceHandle into the PriceChart overlay. It receives handle Y, actual aria min/max/current prices, onDragY, and onDragEnd. Keep pointer capture, animation-frame throttling, focusability, and the modal trigger. Remove percentage calculations and TEMP_MIN/TEMP_MAX.

Pass avgBuyPrice, targetAveragePrice, and recentCandles from StockDetailGraph. Render a concise empty-chart state if candles are absent. Delete GraphTrack.tsx and its static Graph dependency.

- [ ] **Step 4: Run integration tests to verify they pass**

Run: npx jest src/components/stocks/StockGraph.test.tsx src/components/stocks/PriceChart.test.tsx --runInBand

Expected: PASS; the average-buy fallback reaches the chart wrapper and target price is real-valued.

- [ ] **Step 5: Commit the integration**

    git add src/components/stocks/StockGraph.tsx src/components/stocks/PriceHandle.tsx src/components/stocks/StockDetailGraph.tsx src/components/stocks/PriceChart.tsx src/components/stocks/StockGraph.test.tsx
    git rm src/components/stocks/GraphTrack.tsx
    git commit -m "refactor: use real price chart interaction"

### Task 4: Verify production behavior and capture the changed page

**Files:**
- Modify only files from Tasks 1-3 if a scoped verification failure is found.

**Interfaces:**
- Consumes: completed chart implementation.
- Produces: a verified production build and a user-facing detail-page capture.

- [ ] **Step 1: Run static and unit verification**

    npm run lint
    npx jest --runInBand

Expected: no lint errors or warnings; all existing and chart tests pass.

- [ ] **Step 2: Run the production build**

Run: npm run build

Expected: Next.js type checking and production compilation succeed.

- [ ] **Step 3: Run Lighthouse regression check**

Run: npm run lighthouse

Expected: home and stock detail complete three runs each; record the stock-detail result without changing the configured threshold.

- [ ] **Step 4: Capture the implementation result**

Run npm run dev, visit /stocks/AAPL, and capture the full detail page. Confirm blue area, dotted target-price line, price label, and draggable-handle placement.

- [ ] **Step 5: Confirm the committed implementation is clean**

Run: git status --short

Expected: no implementation files remain modified. If a verification command exposes a defect, return to the owning task, add a focused regression test first, make the scoped fix, and amend that task's commit before repeating this verification task.
