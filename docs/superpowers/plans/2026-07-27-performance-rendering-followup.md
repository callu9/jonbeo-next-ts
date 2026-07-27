# Performance Rendering Follow-up Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 서버에서 전달된 데이터를 즉시 표시하고, 평단가 차트 드래그와 Motion feature bundle의 불필요한 비용을 줄인다.

**Architecture:** 데이터가 존재하는 client wrapper는 로딩 상태와 effect를 두지 않고 즉시 실제 컴포넌트를 렌더링한다. `PriceHandle`은 마지막 pointer Y를 frame마다 한 번만 전달하고 release 시 미처리 값을 먼저 flush한다. Motion provider는 drag/layout 기능이 없는 `domAnimation` feature bundle을 lazy-load한다.

**Tech Stack:** Next.js 15, React 19, TypeScript, Jest 30, Testing Library, Motion 12, lightweight-charts 5.

## Global Constraints

- 데이터가 `undefined` 또는 `null`일 때만 fallback skeleton을 표시한다. 숫자 `0`은 유효한 값이다.
- 키보드 조작, target price commit, current-price marker의 기존 동작을 바꾸지 않는다.
- 새 runtime dependency를 추가하지 않는다.
- 각 작업은 Jest, ESLint를 통과한 독립 커밋으로 끝낸다.
- 전체 완료 전 `npm run build`와 `npm run lighthouse`로 production 경로를 확인한다.

---

## File Structure

- Modify: `src/components/portfolio/PorfolioClient.tsx` — 서버 제공 포트폴리오 데이터를 즉시 렌더링한다.
- Create: `src/components/portfolio/PorfolioClient.test.tsx` — 홈 summary/list의 초기 렌더와 fallback을 검증한다.
- Modify: `src/components/stocks/StockDetailClient.tsx` — 상세 숫자와 차트를 즉시 렌더링하고 `0`을 유효하게 처리한다.
- Create: `src/components/stocks/StockDetailClient.test.tsx` — 상세 초기 렌더와 `0` 경계값을 검증한다.
- Modify: `src/components/stocks/PriceHandle.tsx` — frame-coalesced drag update와 release flush를 구현한다.
- Modify: `src/components/stocks/PriceHandle.test.tsx` — 한 frame의 연속 이동과 release flush를 검증한다.
- Modify: `src/lib/feature.ts` — `domAnimation`만 export한다.
- Create: `src/lib/feature.test.ts` — Motion feature export를 검증한다.
- Modify: `docs/superpowers/specs/2026-07-27-performance-rendering-followup-design.md` — 실제 책임 위치를 `PriceHandle`로 바로잡는다.

계획과 정정된 명세는 구현 시작 전에 별도 문서 커밋으로 고정한다. 이후 작업 커밋에는 production code와 해당 테스트만 포함한다.

### Task 1: Render server-provided data immediately

**Files:**
- Modify: `src/components/portfolio/PorfolioClient.tsx`
- Create: `src/components/portfolio/PorfolioClient.test.tsx`
- Modify: `src/components/stocks/StockDetailClient.tsx`
- Create: `src/components/stocks/StockDetailClient.test.tsx`

**Interfaces:**
- Consumes: `accountSummary?: MyAccountSummary`, `stocks?: PortfolioListItem[]`, and `StockStatusProps` / `StockDetail` props already supplied by server pages.
- Produces: the same component exports, with immediate content for defined props and skeleton fallback only for absent props.

- [ ] **Step 1: Write failing portfolio rendering tests**

Create `src/components/portfolio/PorfolioClient.test.tsx`. Mock `AmountStatus` and `StockListItem` so the test observes wrapper selection rather than unit-store or Motion behavior.

```tsx
jest.mock("@/components/AmountStatus", () => ({
  __esModule: true,
  default: ({ cashBalance }: { cashBalance: number }) => <output>balance:{cashBalance}</output>,
  AmountStatusSkeleton: () => <output>summary-skeleton</output>,
}));

it("renders server-provided summary on the first render", () => {
  render(<AccountSummaryClient accountSummary={{ cashBalance: 0, todayProfitMoney: 0, todayProfitRate: 0 }} />);
  expect(screen.getByText("balance:0")).toBeInTheDocument();
  expect(screen.queryByText("summary-skeleton")).not.toBeInTheDocument();
});
```

Add the equivalent list test for one stock and a separate undefined-prop test that expects the existing skeleton fallback.

- [ ] **Step 2: Run the portfolio tests and verify current behavior fails**

Run: `npx jest src/components/portfolio/PorfolioClient.test.tsx --runInBand`

Expected: the defined-data assertions fail because the component starts with `loading === true` and renders skeletons.

- [ ] **Step 3: Write failing stock-detail rendering tests**

Create `src/components/stocks/StockDetailClient.test.tsx`. Mock `AmountStatus` and `StockDetailGraph`; provide a minimal `StockDetail` fixture whose `currentPrice`, `profitLossMoney`, and `profitLossRate` are all `0`.

```tsx
it("renders zero-valued stock status instead of a skeleton", () => {
  render(<StockStatusClient name="Zero" currentPrice={0} profitLossMoney={0} profitLossRate={0} />);
  expect(screen.getByText("status:0:0:0")).toBeInTheDocument();
  expect(screen.queryByText("status-skeleton")).not.toBeInTheDocument();
});

it("renders the provided stock graph on the first render", () => {
  render(<StockDetailGraphClient {...stockDetailFixture} />);
  expect(screen.getByText("stock-graph")).toBeInTheDocument();
});
```

- [ ] **Step 4: Run the stock-detail tests and verify current behavior fails**

Run: `npx jest src/components/stocks/StockDetailClient.test.tsx --runInBand`

Expected: both defined-data assertions fail because the wrappers initially render skeletons; the zero-value assertion also exposes truthy checks.

- [ ] **Step 5: Implement the minimal immediate-render wrappers**

In `PorfolioClient.tsx`, remove `useMinLoading`, `useEffect`, and `useState`. Preserve fallback markup and select it directly from prop presence.

```tsx
export function AccountSummaryClient({ accountSummary }: { accountSummary?: MyAccountSummary }) {
  return accountSummary ? <AmountStatus {...accountSummary} /> : <AmountStatusSkeleton />;
}

export function StockListClient({ stocks }: { stocks?: PortfolioListItem[] }) {
  return (
    <div className="divide-y divide-gray-300 dark:divide-gray-700">
      {stocks
        ? stocks.map((stock) => <StockListItem key={stock.code} {...stock} />)
        : Array.from({ length: 8 }, (_, index) => <StockListItemSkeleton key={index} />)}
    </div>
  );
}
```

In `StockDetailClient.tsx`, remove loading hooks and effects. Use an explicit `hasStockStatus` condition so `0` is accepted.

```tsx
const hasStockStatus =
  props.currentPrice !== undefined &&
  props.profitLossMoney !== undefined &&
  props.profitLossRate !== undefined;

return hasStockStatus ? (
  <AmountStatus
    name={props.name}
    cashBalance={props.currentPrice}
    todayProfitMoney={props.profitLossMoney}
    todayProfitRate={props.profitLossRate}
  />
) : (
  <AmountStatusSkeleton isNameNeeded />
);
```

Render `StockDetailGraph` directly because `StockDetailGraphClient` receives a required `StockDetail` prop.

- [ ] **Step 6: Run focused tests, lint, and commit**

Run:

```bash
npx jest src/components/portfolio/PorfolioClient.test.tsx src/components/stocks/StockDetailClient.test.tsx --runInBand
npm run lint
```

Expected: both new suites pass and ESLint reports no errors.

Commit:

```bash
git add src/components/portfolio/PorfolioClient.tsx src/components/portfolio/PorfolioClient.test.tsx src/components/stocks/StockDetailClient.tsx src/components/stocks/StockDetailClient.test.tsx
git commit -m "perf: render server-provided data immediately"
```

### Task 2: Throttle target-price updates during chart dragging

**Files:**
- Modify: `src/components/stocks/PriceHandle.tsx`
- Modify: `src/components/stocks/PriceHandle.test.tsx`

**Interfaces:**
- Consumes: existing `PriceHandleProps.onChangeY(y: number)` and `onCommit(): void`.
- Produces: at most one `onChangeY` call per scheduled frame, with the latest chart-relative Y; release flushes the latest Y before `onCommit`.

- [ ] **Step 1: Replace immediate RAF mocks with a controllable frame queue**

In `PriceHandle.test.tsx`, store callbacks by numeric ID rather than invoking them immediately.

```tsx
const frameCallbacks = new Map<number, FrameRequestCallback>();
let nextFrameId = 1;

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
```

- [ ] **Step 2: Write failing coalescing and release-flush tests**

After pointer down, dispatch three pointer moves before executing the queued callback. Assert no move update occurred before the frame, execute the one queued callback, and assert the last client Y is reported once. Add a second test that calls pointer up before flushing and asserts the latest Y is reported before `onCommit`.

```tsx
fireEvent.pointerMove(handle, { pointerId: 1, clientY: 180 });
fireEvent.pointerMove(handle, { pointerId: 1, clientY: 220 });
fireEvent.pointerMove(handle, { pointerId: 1, clientY: 260 });
expect(onChangeY).toHaveBeenCalledTimes(1); // pointer down only

frameCallbacks.values().next().value(0);
expect(onChangeY).toHaveBeenLastCalledWith(160);
```

- [ ] **Step 3: Run the PriceHandle tests and verify they fail**

Run: `npx jest src/components/stocks/PriceHandle.test.tsx --runInBand`

Expected: the current implementation schedules/cancels callbacks but does not guarantee release flush; the new ordering assertion fails.

- [ ] **Step 4: Implement latest-value frame coalescing**

In `PriceHandle.tsx`, add `pendingClientYRef`. Replace per-event callback capture with a scheduler and a flush helper.

```tsx
const pendingClientYRef = useRef<number | null>(null);

const flushPendingChange = useCallback(() => {
  if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
  rafRef.current = null;
  const clientY = pendingClientYRef.current;
  pendingClientYRef.current = null;
  if (clientY !== null) onChangeY(clientYToChartY(clientY));
}, [clientYToChartY, onChangeY]);
```

`handlePointerMove` stores the newest `clientY` and schedules a callback only when `rafRef.current` is null. The callback clears `rafRef.current` then calls `flushPendingChange`. `handlePointerUp` calls `flushPendingChange()` before `onCommit()`. Cleanup cancels a pending frame and clears the pending value without emitting after unmount.

- [ ] **Step 5: Run focused chart tests and commit**

Run:

```bash
npx jest src/components/stocks/PriceHandle.test.tsx src/components/stocks/PriceChart.test.tsx --runInBand
npm run lint
```

Expected: all existing pointer, keyboard, target-price, and marker tests pass.

Commit:

```bash
git add src/components/stocks/PriceHandle.tsx src/components/stocks/PriceHandle.test.tsx
git commit -m "perf: throttle chart target-price updates"
```

### Task 3: Use the smaller Motion feature bundle

**Files:**
- Modify: `src/lib/feature.ts`
- Create: `src/lib/feature.test.ts`

**Interfaces:**
- Consumes: `LazyMotionProvider` dynamic import contract (`default` feature bundle).
- Produces: `domAnimation` as the default export; existing `motion/react-m` consumers remain compatible.

- [ ] **Step 1: Write the failing feature export test**

Create `src/lib/feature.test.ts` and mock the Motion feature module.

```ts
jest.mock("motion/react", () => ({
  domAnimation: { name: "domAnimation" },
  domMax: { name: "domMax" },
}));

it("exports the animation-only Motion feature bundle", async () => {
  const { default: features } = await import("./feature");
  expect(features).toEqual({ name: "domAnimation" });
});
```

- [ ] **Step 2: Run the feature test and verify current behavior fails**

Run: `npx jest src/lib/feature.test.ts --runInBand`

Expected: FAIL because `feature.ts` currently exports the mocked `domMax` value.

- [ ] **Step 3: Implement the minimal Motion bundle change**

Replace the `domMax` import/export in `src/lib/feature.ts`.

```ts
import { domAnimation } from "motion/react";

export default domAnimation;
```

Keep `LazyMotionProvider` unchanged and remove stale comments that imply `domMax` is active.

- [ ] **Step 4: Run focused verification and commit code**

Run:

```bash
npx jest src/lib/feature.test.ts src/components/portfolio/PorfolioClient.test.tsx src/components/stocks/StockDetailClient.test.tsx src/components/stocks/PriceHandle.test.tsx src/components/stocks/PriceChart.test.tsx --runInBand
npm run lint
```

Expected: Motion feature and prior refactor regressions pass with no lint errors.

Commit:

```bash
git add src/lib/feature.ts src/lib/feature.test.ts
git commit -m "perf: use Motion domAnimation feature bundle"
```

### Task 4: Verify the integrated production result

**Files:**
- Modify: none

**Interfaces:**
- Consumes: the three committed refactors and existing `lighthouse-run.sh` / `lighthouserc.json` configuration.
- Produces: fresh test, lint, build, and Lighthouse evidence without changing source code or thresholds.

- [ ] **Step 1: Run the full test suite**

Run: `npm run test -- --runInBand`

Expected: all test suites pass, including new immediate-render, drag coalescing, and Motion feature tests.

- [ ] **Step 2: Run static and production build verification**

Run:

```bash
npm run lint
npm run build
```

Expected: ESLint completes without errors and Next.js production build completes without type errors.

- [ ] **Step 3: Collect production Lighthouse evidence**

Run: `npm run lighthouse`

Expected: each configured route completes three desktop Lighthouse runs, `.lighthouseci/` is generated but remains ignored, and the performance assertion has no warning below 0.70.

## Plan Self-Review

- Spec coverage: Task 1 covers immediate render and valid zero values; Task 2 covers frame-limited updates, release flush, and unmount cancellation; Task 3 covers `domAnimation`; Task 4 covers the required full verification.
- Scope: chart lazy-loading, static generation, Lighthouse assertions, and dependency cleanup are excluded as required by the approved spec.
- Type consistency: Task 2 keeps `PriceHandleProps.onChangeY(y: number)` and `onCommit(): void`; Task 3 preserves the default export consumed by `LazyMotionProvider`.
- Placeholder scan: no unfinished implementation directions are present; all commands, files, and expected results are explicit.
