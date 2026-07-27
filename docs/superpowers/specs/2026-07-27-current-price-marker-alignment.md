# Current Price Marker Alignment

## Goal

Keep the current-price marker visually aligned with the area chart for every chart size and price range.

## Design

- `StockDetailGraph` stops rendering a fixed-position dot.
- `StockGraph` passes `currentPrice` and the profit/loss direction to `PriceChart`.
- `PriceChart` asks its area-series API for `priceToCoordinate(currentPrice)` and renders the marker in its own absolute chart layer.
- The marker uses the existing red/blue/gray semantics and retains the ping animation.
- When the chart cannot calculate a coordinate, the marker is hidden rather than rendered at a misleading fallback position.

## Data Flow

`StockDetail.currentPrice` and `profitLossRate` flow from `StockDetailGraph` to `StockGraph`, then to `PriceChart`. `PriceChart` recalculates the marker coordinate whenever chart data or the current price changes.

## Verification

- A `PriceChart` test mocks `priceToCoordinate` and verifies that the marker uses its returned pixel Y-coordinate.
- The existing price-line, handle-movement, and chart cleanup tests remain green.
- Lint, complete Jest suite, and production build pass.

## Scope

This change only corrects the current-price marker position. It does not change target-price handle behavior, chart data, or modal saving behavior.
