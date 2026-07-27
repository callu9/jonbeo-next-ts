# Area Price Chart Design

## Goal

Replace the static stock graph image with a data-driven area chart on the stock detail page. The chart must render mock OHLC history, keep the existing target-average-price interaction, and avoid adding chart code to the portfolio home bundle.

## Chosen approach

Use `lightweight-charts` with an `AreaSeries`.

- The series renders `recentCandles[].close` as a trend-focused area chart.
- The target average price is rendered as the library's horizontal price line.
- A React overlay keeps the existing draggable handle and save modal behavior.
- The chart is a client-only, lazy-loaded detail-page dependency.

Recharts was rejected because the price-coordinate conversion needed by the draggable target line would need custom scale plumbing. A custom SVG chart was rejected because it would recreate scaling, resizing, and financial-chart interaction behavior already provided by the selected library.

## Data model

`PriceCandle` remains the canonical mock shape.

```ts
interface PriceCandle {
  time: number; // epoch milliseconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}
```

Each mock `StockDetail` used by the detail page will contain a non-empty `recentCandles` array. AAPL receives deterministic sample candles in addition to the existing FB candles. The chart adapter converts `time` from milliseconds to the UTC seconds expected by the chart library and uses `close` for the area series.

## Component boundaries

### `StockGraph`

Owns target-price state rather than an artificial percentage.

- Inputs: `currentPrice`, `avgBuyPrice`, `targetAveragePrice`, and `recentCandles`.
- Initial target: saved `targetAveragePrice`, otherwise `avgBuyPrice`.
- Emits the selected target price through the existing save path.

### `PriceChart`

New client component that owns the imperative chart instance.

- Creates an `AreaSeries` and sets normalized close-price data.
- Updates the horizontal target price line when the target changes.
- Converts a drag Y coordinate to a price and a price to the handle Y coordinate through the series API.
- Resizes with the chart container and removes the chart during cleanup.

### `PriceHandle`

Retains pointer capture, request-animation-frame throttling, keyboard semantics, and modal trigger. Its API changes from percentage-based coordinates to chart Y coordinates and actual price bounds. It does not calculate its own artificial price range.

## Interaction and visual behavior

1. The detail page renders a skeleton until its stock detail is available.
2. The client chart loads only on the stock detail route and renders the close-price area.
3. The target line appears as a dotted horizontal line with a formatted price label.
4. Dragging the handle calls the chart coordinate converter and moves the line continuously.
5. Releasing the handle opens the existing confirmation modal; successful save continues to use the existing overlay/store flow.

If a detail has no candles, the component renders a concise empty-chart state rather than a fabricated chart. The scoped mock fixtures will prevent this state for available detail routes.

## Performance and accessibility

- The chart package is isolated to the stock detail client component; the home route does not import it.
- `ResizeObserver`/automatic sizing is used rather than window-only layout assumptions.
- The handle remains a keyboard-focusable slider with real price-valued ARIA attributes.
- Motion behavior is unchanged; the chart itself does not introduce entry animation.

## Tests and verification

Write tests before implementation for:

- candle normalization: chronological ordering and milliseconds-to-seconds conversion;
- target defaulting: saved target price, then average buy price;
- chart adapter behavior with a mocked `lightweight-charts` API: series data, price line update, and cleanup;
- empty candle state.

Run `npm run lint`, `npx jest --runInBand`, `npm run build`, and `npm run lighthouse`. Compare the `/stocks/AAPL` Lighthouse result with the documented 0.89 local baseline; do not raise the performance threshold in this change.

## Scope exclusions

- Live market-data API or polling
- Candlestick/area chart mode toggle
- Technical indicators, zoom UI, and time-range controls
- Changes to portfolio-home layout or provider architecture
