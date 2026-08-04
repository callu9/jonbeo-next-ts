# Server Data Immediate Render Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render server-provided portfolio and stock-detail data immediately instead of holding it behind client-only skeleton timing.

**Architecture:** The four client boundary components use prop presence as their only fallback decision. Component tests exercise server markup so an accidental reintroduction of mount-time loading cannot pass unnoticed; missing and null data retain the existing skeletons.

**Tech Stack:** Next.js 15, React 19, Jest 30, Testing Library.

## Global Constraints

- Do not modify server data fetching, API schema, skeleton design, chart implementation, Motion feature bundle, or Lighthouse thresholds.
- Remove `useMinLoading` only from `AccountSummaryClient`, `StockListClient`, `StockStatusClient`, and `StockDetailGraphClient`.
- Treat `0` and negative numeric values as present data; only `null` and `undefined` trigger detail-status skeletons.
- Base the PR on `dev` and include no P0/P2 experiment commits.

---

### Task 1: Render supplied server data without client loading delay

**Files:**
- Modify: `src/components/portfolio/PorfolioClient.tsx`
- Modify: `src/components/stocks/StockDetailClient.tsx`
- Create: `src/components/portfolio/PorfolioClient.test.tsx`
- Create: `src/components/stocks/StockDetailClient.test.tsx`

**Interfaces:**
- Consumes: optional `accountSummary`, `stocks`, and `StockDetail` props already provided by server pages.
- Produces: first-render real content for present props, existing skeleton markup for absent props.

- [x] **Step 1: Write failing first-markup regression tests**

Create the two test files with these assertions:

```tsx
expect(renderToStaticMarkup(
  <AccountSummaryClient accountSummary={{ cashBalance: 0, todayProfitMoney: 0, todayProfitRate: 0 }} />
)).toContain("balance:0");
expect(renderToStaticMarkup(<StockListClient stocks={[stock]} />)).toContain("stock:AAPL");
expect(renderToStaticMarkup(
  <StockStatusClient name="Zero" currentPrice={0} profitLossMoney={0} profitLossRate={0} />
)).toContain("status:0:0:0");
expect(renderToStaticMarkup(<StockDetailGraphClient {...stockDetail} />)).toContain("stock-graph");
```

Mock `AmountStatus`, `StockListItem`, and `StockDetailGraph` to expose the supplied values. Also assert absent `AccountSummaryClient`, `StockListClient`, and `StockStatusClient` props render their current skeleton fallbacks; assert `null` detail status values render `status-skeleton`.

- [x] **Step 2: Run tests and confirm RED**

Run: `npx jest src/components/portfolio/PorfolioClient.test.tsx src/components/stocks/StockDetailClient.test.tsx --runInBand`

Expected: FAIL because the current components always start in their `useMinLoading` skeleton state.

- [x] **Step 3: Replace mount-time loading with presence checks**

In `PorfolioClient.tsx`, remove `useMinLoading`, `useEffect`, and `useState`. Render summary directly when `accountSummary` is truthy. Render the mapped list when `stocks` is truthy; otherwise render exactly eight `StockListItemSkeleton` elements.

In `StockDetailClient.tsx`, remove the same hook and local state. Define:

```tsx
const hasStockStatus =
  props.currentPrice !== undefined &&
  props.currentPrice !== null &&
  props.profitLossMoney !== undefined &&
  props.profitLossMoney !== null &&
  props.profitLossRate !== undefined &&
  props.profitLossRate !== null;
```

Render `AmountStatus` only when `hasStockStatus`; otherwise `AmountStatusSkeleton`. Render `StockDetailGraph` whenever the supplied `props` object exists; otherwise `StockDetailGraphSkeleton`.

- [x] **Step 4: Verify focused and full checks**

Run: `npx jest src/components/portfolio/PorfolioClient.test.tsx src/components/stocks/StockDetailClient.test.tsx --runInBand && npm run lint && npm test -- --runInBand && npm run build`

Expected: all commands exit 0.

- [x] **Step 5: Commit the isolated change**

```bash
git add src/components/portfolio/PorfolioClient.tsx src/components/portfolio/PorfolioClient.test.tsx src/components/stocks/StockDetailClient.tsx src/components/stocks/StockDetailClient.test.tsx
git commit -m "perf: render server data without client delay"
```
