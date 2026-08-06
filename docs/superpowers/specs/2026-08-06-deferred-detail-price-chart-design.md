# Deferred Detail Price Chart Design

## Goal

Load the detailed price-chart module only after its graph region enters the viewport, without changing chart interactions or layout.

## Scope

- Change `StockGraph` only.
- Keep the existing chart props, target-price label, modal, drag behavior, and empty state.
- Use the browser-native `IntersectionObserver`; do not add a dependency.

## Design

`StockGraph` starts with its chart module disabled. An `IntersectionObserver` watches the existing graph container. Its first intersecting entry permanently enables the `next/dynamic` `PriceChart` component and disconnects the observer. Until then, the graph container renders a same-sized loading placeholder. If `IntersectionObserver` is unavailable, the chart loads immediately so the graph remains functional.

The dynamic import uses `ssr: false`. Consequently, the chart module is neither server-rendered nor requested before the observer enables it. `PriceChart` retains its existing prop interface and owns all chart behavior after mount.

## Verification

- Before an observer intersection, chart content is absent and the loading placeholder is present.
- After the observer reports an intersection, `PriceChart` receives its existing target price and marker props.
- The no-history empty state remains unchanged.
- Run lint, all Jest tests, production build, and three Lighthouse runs for `/stocks/AAPL`.

## Out of Scope

- Claiming an LCP improvement without the post-change measurement.
- Changing the chart UI, data model, or user interaction.
