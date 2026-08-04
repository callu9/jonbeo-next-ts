# Price Handle Frame Throttle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Coalesce target-price handle pointer moves to one state update per animation frame without losing the final pointer position on release.

**Architecture:** `pendingClientYRef` holds the latest pointer coordinate and `rafRef` owns one scheduled frame. A shared `flushPendingChange` applies the newest coordinate both from the frame callback and synchronously before pointer-up commit.

**Tech Stack:** React 19, TypeScript, Jest 30, Testing Library.

## Global Constraints

- Preserve chart-coordinate math, keyboard movement, slider ARIA, and one `onCommit` per pointer release.
- Do not modify chart, modal, server data, Motion feature bundle, P0/P2 experiments, or Lighthouse thresholds.
- `onChangeY` must receive the latest move value once per scheduled frame.
- Pointer release and unmount must cancel any pending frame; release must flush latest data before commit.
- Base the PR on `dev` and include only this interaction change plus its tests and documentation.

---

### Task 1: Coalesce high-frequency handle moves and flush on release

**Files:**
- Modify: `src/components/stocks/PriceHandle.tsx`
- Modify: `src/components/stocks/PriceHandle.test.tsx`

**Interfaces:**
- Consumes: existing `onChangeY(y: number)` and `onCommit()` callbacks.
- Produces: at most one scheduled animation frame while dragging, with latest pending client Y applied before commit.

- [x] **Step 1: Write failing frame-coalescing tests**

Replace immediate `requestAnimationFrame` mock with a `Map<number, FrameRequestCallback>` queue and add a `runNextFrame()` helper. Add assertions for:

```tsx
fireEvent.pointerDown(handle, { pointerId: 1, clientY: 140 });
fireEvent.pointerMove(handle, { pointerId: 1, clientY: 180 });
fireEvent.pointerMove(handle, { pointerId: 1, clientY: 220 });
fireEvent.pointerMove(handle, { pointerId: 1, clientY: 260 });

expect(onChangeY).toHaveBeenCalledTimes(1);
expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
runNextFrame();
expect(onChangeY).toHaveBeenLastCalledWith(160);
```

Add a release test that performs one pending move, calls pointer up, then asserts latest Y is emitted before the single `onCommit`, and no queued frame remains. Add an unmount test that asserts the pending frame is cancelled.

- [x] **Step 2: Run focused test and confirm RED**

Run: `npx jest src/components/stocks/PriceHandle.test.tsx --runInBand`

Expected: FAIL because the current implementation cancels and re-schedules a frame for every pointer move instead of preserving one pending frame.

- [x] **Step 3: Add latest-coordinate refs and shared flush helper**

In `PriceHandle.tsx` add:

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

Set `pendingClientYRef.current` on move, return immediately if a frame already exists, and call `flushPendingChange` inside the one frame callback. Clear pending state on pointer down and cleanup; call `flushPendingChange` before `onCommit` on pointer up.

- [x] **Step 4: Verify focused and project checks**

Run: `npx jest src/components/stocks/PriceHandle.test.tsx --runInBand && npm run lint && npm test -- --runInBand && npm run build`

Expected: all commands exit 0.

- [x] **Step 5: Commit the isolated change**

```bash
git add src/components/stocks/PriceHandle.tsx src/components/stocks/PriceHandle.test.tsx
git commit -m "perf: throttle chart handle updates"
```
