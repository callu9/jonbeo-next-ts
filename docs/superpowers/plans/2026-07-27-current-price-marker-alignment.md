# Current Price Marker Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Attach the current-price dot to the same Lightweight Charts coordinate system as the area series.

**Architecture:** `StockDetailGraph` supplies the current price and profit/loss direction through `StockGraph` to `PriceChart`. `PriceChart` owns the marker layer and calculates its vertical position using the area series' `priceToCoordinate` API, so its position updates together with chart data and price changes.

**Tech Stack:** Next.js 15, React 19, TypeScript, Lightweight Charts 5, Jest, Testing Library.

## Global Constraints

- Preserve the existing target-price handle, dotted price line, modal behavior, and price data mapping.
- Use the existing red/blue/gray profit/loss color semantics and ping animation for the current-price marker.
- Hide the marker when `priceToCoordinate` returns `null`.
- Add the corrected detail-screen capture to `src/screenshots/stock-detail/` and record it in `src/screenshots/README.md`.

---

### Task 1: Render the current-price marker in the chart coordinate system

**Files:**
- Modify: `src/components/stocks/PriceChart.tsx`
- Modify: `src/components/stocks/PriceChart.test.tsx`

**Interfaces:**
- Consumes: `AreaChartPoint[]`, target-price props, and `ISeriesApi<"Area", Time>.priceToCoordinate(price)` from Lightweight Charts.
- Produces: `PriceChartProps` with `currentPrice: number` and `currentPriceTone: "positive" | "negative" | "neutral"`; an element with `data-testid="current-price-marker"` positioned at the returned chart Y-coordinate.

- [ ] **Step 1: Write the failing chart-coordinate test**

Update the fixture to provide a current price and tone, then add this test. Keep the existing chart mock's `priceToCoordinate` result at `40`.

```tsx
it("positions the current-price marker at the area series coordinate", () => {
  render(<PriceChartFixture onCommit={jest.fn()} />);

  expect(screen.getByTestId("current-price-marker")).toHaveStyle({ top: "40px" });
  expect(mockPriceToCoordinate).toHaveBeenCalledWith(121.26);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx jest src/components/stocks/PriceChart.test.tsx --runInBand`

Expected: FAIL because `current-price-marker` is not rendered.

- [ ] **Step 3: Add the minimal chart-owned marker implementation**

Extend `PriceChartProps`, store a `currentPriceY` state value, and calculate it in the existing price-coordinate effect.

```tsx
export type CurrentPriceTone = "positive" | "negative" | "neutral";

export type PriceChartProps = {
  data: AreaChartPoint[];
  targetPrice: number;
  minPrice: number;
  maxPrice: number;
  onTargetPriceChange: (price: number) => void;
  onTargetPriceCommit: () => void;
  currentPrice: number;
  currentPriceTone: CurrentPriceTone;
};

const [currentPriceY, setCurrentPriceY] = useState<number | null>(null);

useEffect(() => {
  const series = seriesRef.current;
  if (!series) return;

  if (priceLineRef.current) series.removePriceLine(priceLineRef.current);
  priceLineRef.current = series.createPriceLine(priceLineOptions(targetPrice));
  setHandleY(series.priceToCoordinate(targetPrice));
  setCurrentPriceY(series.priceToCoordinate(currentPrice));
}, [currentPrice, data, targetPrice]);
```

Render the marker inside the `data-testid="price-chart"` wrapper, with `style={{ top: `${currentPriceY}px` }}`, `right-4`, a vertical centering transform, and the tone-specific dot/ping classes. Render nothing when `currentPriceY === null`.

- [ ] **Step 4: Run the chart test to verify it passes**

Run: `npx jest src/components/stocks/PriceChart.test.tsx --runInBand`

Expected: PASS with the existing price-line, handle-movement, cleanup, and new marker-coordinate tests.

- [ ] **Step 5: Commit the chart-owned marker implementation**

```bash
git add src/components/stocks/PriceChart.tsx src/components/stocks/PriceChart.test.tsx
git commit -m "fix: align current price marker with chart"
```

### Task 2: Supply price and tone from the stock-detail boundary

**Files:**
- Modify: `src/components/stocks/StockGraph.tsx`
- Modify: `src/components/stocks/StockGraph.test.tsx`
- Modify: `src/components/stocks/StockDetailGraph.tsx`

**Interfaces:**
- Consumes: `StockDetail.currentPrice` and `StockDetail.profitLossRate`.
- Produces: `StockGraphProps.profitLossRate: number` and `PriceChart` props `currentPrice` and `currentPriceTone`.

- [ ] **Step 1: Write the failing propagation test**

Extend the `PriceChart` mock to expose the props and add this test.

```tsx
it("passes the current price and negative trend to the chart marker", () => {
  render(<StockGraph currentPrice={121.26} profitLossRate={-13.39} candles={candles} />);

  expect(screen.getByTestId("current-price-marker-props")).toHaveTextContent("121.26:negative");
});
```

The mock should render:

```tsx
<output data-testid="current-price-marker-props">
  {currentPrice}:{currentPriceTone}
</output>
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx jest src/components/stocks/StockGraph.test.tsx --runInBand`

Expected: FAIL because `StockGraph` does not yet expose the current-price marker props.

- [ ] **Step 3: Propagate the chart inputs and remove the fixed-position dot**

In `StockGraph.tsx`, derive the tone exactly once from `profitLossRate`.

```tsx
const currentPriceTone =
  profitLossRate > 0 ? "positive" : profitLossRate < 0 ? "negative" : "neutral";
```

Pass `currentPrice={currentPrice}` and `currentPriceTone={currentPriceTone}` to `PriceChart`. In `StockDetailGraph.tsx`, pass `profitLossRate` to `StockGraph` and delete the standalone absolute dot and its now-unused `cn` import.

- [ ] **Step 4: Run the propagation test to verify it passes**

Run: `npx jest src/components/stocks/StockGraph.test.tsx src/components/stocks/PriceChart.test.tsx --runInBand`

Expected: PASS; the chart marker receives `121.26:negative` and remains positioned from the chart-series API.

- [ ] **Step 5: Commit the data-flow change**

```bash
git add src/components/stocks/StockGraph.tsx src/components/stocks/StockGraph.test.tsx src/components/stocks/StockDetailGraph.tsx
git commit -m "fix: pass current price marker data to chart"
```

### Task 3: Record the corrected screen and verify the feature branch

**Files:**
- Create: `src/screenshots/stock-detail/2026-07-27-after-current-price-marker-alignment.svg`
- Modify: `src/screenshots/README.md`

**Interfaces:**
- Consumes: the local AAPL detail route at `/stocks/AAPL` and the existing screen-record folder convention.
- Produces: a committed after-capture linked from the screen-change record.

- [ ] **Step 1: Capture the corrected AAPL detail screen**

Start the feature-branch development server on an unused local port, open `/stocks/AAPL`, wait for the loading skeleton to be replaced by the chart, and save the capture as `src/screenshots/stock-detail/2026-07-27-after-current-price-marker-alignment.svg`.

- [ ] **Step 2: Add the capture to the screen-change record**

Append this row to `src/screenshots/README.md`.

```markdown
| 2026-07-27 | AAPL 종목 상세 | 현재가 dot를 차트 좌표계로 정렬 | [변경 전](./stock-detail/2026-07-27-after-area-chart.svg) | [정렬 후](./stock-detail/2026-07-27-after-current-price-marker-alignment.svg) |
```

- [ ] **Step 3: Run full verification**

Run:

```bash
npm run lint
npx jest --runInBand
npm run build
git diff --check
```

Expected: lint exits 0, all Jest suites pass, production build succeeds, and diff check prints no whitespace errors.

- [ ] **Step 4: Commit the capture and record**

```bash
git add src/screenshots/README.md src/screenshots/stock-detail/2026-07-27-after-current-price-marker-alignment.svg
git commit -m "docs: record aligned current price marker"
```
