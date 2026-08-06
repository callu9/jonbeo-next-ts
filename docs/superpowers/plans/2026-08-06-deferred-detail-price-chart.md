# Deferred Detail Price Chart Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Request the detail price-chart module only when its graph container enters the viewport.

**Architecture:** `StockGraph` owns one boolean that is enabled by a native `IntersectionObserver`. Once enabled, a `next/dynamic` chart receives the existing props; before then, an in-place skeleton preserves the graph region. The observer disconnects after its first intersecting entry.

**Tech Stack:** Next.js 15, React 19, TypeScript, Jest, Testing Library.

## Global Constraints

- Do not add dependencies.
- Preserve `PriceChartProps`, chart interactions, target-price label, modal, and empty-state behavior.
- Fall back to loading the chart when `IntersectionObserver` is unavailable.
- Write PR titles, bodies, and top-level comments in Korean.
- Record production Lighthouse results in a Korean PR comment after three `/stocks/AAPL` runs.

---

### Task 1: Verify viewport-gated chart rendering

**Files:**
- Modify: `src/components/stocks/StockGraph.test.tsx`
- Modify: `src/components/stocks/StockGraph.tsx`

**Interfaces:**
- Consumes: `StockGraph` props and a mocked `IntersectionObserver` callback.
- Produces: a chart that stays unmounted until the observed graph region intersects.

- [ ] **Step 1: Write the failing viewport test**

```tsx
render(<StockGraph currentPrice={121.26} profitLossRate={-13.39} candles={candles} />);

expect(screen.getByTestId("price-chart-loading")).toBeInTheDocument();
expect(screen.queryByTestId("price-chart")).not.toBeInTheDocument();

observerCallback([{ isIntersecting: true } as IntersectionObserverEntry], observer);

expect(screen.getByTestId("price-chart")).toHaveTextContent("121.26");
expect(observer.disconnect).toHaveBeenCalled();
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npx jest src/components/stocks/StockGraph.test.tsx --runInBand`

Expected: FAIL because `StockGraph` mounts `PriceChart` before viewport entry.

- [ ] **Step 3: Add the minimum viewport gate**

```tsx
const [isChartVisible, setIsChartVisible] = useState(false);

useEffect(() => {
  const container = chartContainerRef.current;
  if (!range || !container) return;
  if (!window.IntersectionObserver) return void setIsChartVisible(true);

  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    setIsChartVisible(true);
    observer.disconnect();
  });
  observer.observe(container);
  return () => observer.disconnect();
}, [range]);
```

Render the existing dynamic `PriceChart` only when `isChartVisible`; otherwise render the in-place loading placeholder.

- [ ] **Step 4: Run the focused test and verify it passes**

Run: `npx jest src/components/stocks/StockGraph.test.tsx --runInBand`

Expected: PASS, including the existing empty-state and marker-prop tests.

- [ ] **Step 5: Commit the implementation**

```bash
git add src/components/stocks/StockGraph.tsx src/components/stocks/StockGraph.test.tsx
git commit -m "perf: defer detail chart until visible"
```

### Task 2: Verify and publish

**Files:**
- Modify: `AGENTS.md`
- Create: `docs/superpowers/specs/2026-08-06-deferred-detail-price-chart-design.md`
- Create: `docs/superpowers/plans/2026-08-06-deferred-detail-price-chart.md`

**Interfaces:**
- Consumes: the viewport-gated chart from Task 1.
- Produces: a Korean draft PR with reproducible measurement evidence.

- [ ] **Step 1: Run repository validation**

Run: `npm run lint && npm test -- --runInBand && npm run build && npm run lighthouse`

Expected: lint, all Jest tests, production build, and three Lighthouse runs for `/stocks/AAPL` succeed.

- [ ] **Step 2: Commit the guidance and implementation record**

```bash
git add AGENTS.md docs/superpowers/specs/2026-08-06-deferred-detail-price-chart-design.md docs/superpowers/plans/2026-08-06-deferred-detail-price-chart.md
git commit -m "docs: define deferred chart loading"
```

- [ ] **Step 3: Push and open a Korean draft PR**

Run: `git push -u origin agent/defer-detail-price-chart`

Use a Korean PR body describing the delayed module request, unchanged chart interactions, validation results, and measured LCP comparison. Add the three-run median table as a Korean top-level PR comment.
