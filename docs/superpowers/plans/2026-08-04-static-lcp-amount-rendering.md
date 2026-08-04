# Static LCP Amount Rendering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render initial large monetary amounts as ordinary static spans while preserving the existing Motion transition when the user changes currency units.

**Architecture:** `AmountTransition` will keep a hydration-ready flag and compare the current Zustand currency value with its previous value. Until hydration completes, and whenever the currency is unchanged, it will use a normal `span`; after a genuine unit change, it will mount the current keyed Motion span with the existing vertical enter/exit values. This keeps the server and first-paint LCP candidate free of Motion transform work without changing formatting or consumer APIs.

**Tech Stack:** Next.js 15, React 19, TypeScript, Zustand 5, Motion 12, Jest 30, React Testing Library, Lighthouse CI.

## Global Constraints

- Modify only `AmountTransition` behavior; do not change the unit-store API, currency formatting, UI copy, or Lighthouse assertion thresholds.
- Keep `id`, `fontStyle`, `multiplier`, `durSec`, and child text behavior compatible with `AmountStatus` and `StockListItem`.
- Preserve `AnimatePresence` enter and exit directions: enter `50 * multiplier`, exit `-50 * multiplier`, and duration `durSec / 1000`.
- Run production Lighthouse for `/` and `/stocks/AAPL` three times each and compare medians against the 2026-07-27 baseline: home LCP 2166ms, detail LCP 2186ms, Performance 0.89, TBT 0ms, CLS 0.
- Treat the change as meaningful only when both route medians improve by at least 100ms (about 5%), Performance does not drop below 0.89, and TBT/CLS do not regress. Create a remote branch and PR only if all conditions are met.

---

## File Structure

- Modify: `src/components/AmountTransition.tsx` — selects the static first-paint path or the existing keyed Motion transition path.
- Create: `src/components/AmountTransition.test.tsx` — proves the static path and both unit-transition directions without relying on Motion's runtime animation engine.
- Modify: `docs/performance-refactoring.md` — records the production measurement method, route medians, and the conditional PR decision.

### Task 1: Lock Down the Static and Animated Rendering Contract

**Files:**
- Create: `src/components/AmountTransition.test.tsx`
- Test: `src/components/AmountTransition.test.tsx`

**Interfaces:**
- Consumes: `AmountTransition({ id, multiplier, fontStyle, children, durSec })` and `useUnitStore.setState({ isWon })`.
- Produces: regression coverage for first markup, unchanged-unit rerenders, and unit-toggle animation props.

- [x] **Step 1: Write the failing test and focused Motion mocks**

```tsx
import { act, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import AmountTransition from "./AmountTransition";
import { useUnitStore } from "@/store/unitStore";

jest.mock("motion/react", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("motion/react-m", () => ({
  span: ({ children, initial, exit, transition, ...props }: React.ComponentProps<"span"> & {
    initial?: { y: number } | false;
    exit?: { y: number };
    transition?: { duration: number };
  }) => (
    <span
      {...props}
      data-motion="true"
      data-initial-y={typeof initial === "object" ? initial.y : "none"}
      data-exit-y={exit?.y ?? "none"}
      data-duration={transition?.duration ?? "none"}
    >
      {children}
    </span>
  ),
}));

describe("AmountTransition", () => {
  beforeEach(() => useUnitStore.setState({ isWon: false }));

  it("renders the server amount as a plain span", () => {
    const markup = renderToStaticMarkup(
      <AmountTransition id="total" fontStyle="text-4xl">$1,234</AmountTransition>,
    );

    expect(markup).toContain('<span class="inline-block text-4xl">$1,234</span>');
    expect(markup).not.toContain("data-motion");
  });

  it("keeps a same-unit rerender static after hydration", () => {
    const { rerender } = render(<AmountTransition id="total">$1,234</AmountTransition>);
    rerender(<AmountTransition id="total">$1,235</AmountTransition>);

    expect(screen.getByText("$1,235")).not.toHaveAttribute("data-motion");
  });

  it.each([
    [false, true, 1, 50, -50],
    [true, false, -1, -50, 50],
  ])("animates unit change from %s to %s using multiplier %i", (from, to, multiplier, initialY, exitY) => {
    useUnitStore.setState({ isWon: from });
    render(<AmountTransition id="total" multiplier={multiplier}>amount</AmountTransition>);

    act(() => useUnitStore.setState({ isWon: to }));

    const amount = screen.getByText("amount");
    expect(amount).toHaveAttribute("data-motion", "true");
    expect(amount).toHaveAttribute("data-initial-y", String(initialY));
    expect(amount).toHaveAttribute("data-exit-y", String(exitY));
  });
});
```

- [x] **Step 2: Run the focused test to verify it fails**

Run: `npx jest src/components/AmountTransition.test.tsx --runInBand`

Expected: FAIL because the existing component always renders the mocked Motion span for server markup and unchanged-unit renders.

- [x] **Step 3: Commit the failing test**

```bash
git add src/components/AmountTransition.test.tsx
git commit -m "test: cover static initial amount rendering"
```

### Task 2: Implement the Static First-Paint Path

**Files:**
- Modify: `src/components/AmountTransition.tsx`
- Test: `src/components/AmountTransition.test.tsx`

**Interfaces:**
- Consumes: the test contract from Task 1 and `useUnitStore().isWon`.
- Produces: unchanged `AmountTransition` props with a static SSR/first-hydration path and a Motion-only currency-toggle path.

- [x] **Step 1: Add hydration and previous-unit tracking**

```tsx
import { useEffect, useRef, useState } from "react";

const [isHydrated, setIsHydrated] = useState(false);
const previousUnitRef = useRef(isWon);
const hasUnitChanged = previousUnitRef.current !== isWon;

useEffect(() => {
  setIsHydrated(true);
}, []);

useEffect(() => {
  previousUnitRef.current = isWon;
}, [isWon]);
```

- [x] **Step 2: Return the static branch before wrapping the existing Motion branch**

```tsx
const amountClassName = cn("inline-block", fontStyle);

if (!isHydrated || !hasUnitChanged) {
  return (
    <div className="relative overflow-hidden">
      <span className={amountClassName}>{children}</span>
    </div>
  );
}

return (
  <div className="relative overflow-hidden">
    <AnimatePresence initial={false} mode="wait">
      <motion.span
        key={`${id}-${Number(isWon)}`}
        className={amountClassName}
        initial={{ y: 50 * multiplier, opacity: 1 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50 * multiplier, opacity: 0 }}
        transition={{ duration: durSec / 1_000 }}
      >
        {children}
      </motion.span>
    </AnimatePresence>
  </div>
);
```

- [x] **Step 3: Run the focused test to verify it passes**

Run: `npx jest src/components/AmountTransition.test.tsx --runInBand`

Expected: PASS with all four assertions proving static initial markup and the two multiplier directions.

- [x] **Step 4: Run related and full verification**

Run: `npm run lint && npm test -- --runInBand && npm run build`

Expected: exit code 0; no lint error, no Jest failure, and a production build that completes.

- [x] **Step 5: Commit the implementation**

```bash
git add src/components/AmountTransition.tsx src/components/AmountTransition.test.tsx
git commit -m "perf: render initial amounts without motion"
```

### Task 3: Measure Production LCP and Conditionally Publish

**Files:**
- Modify: `docs/performance-refactoring.md`
- Test: `.lighthouseci/*.report.json` (generated, gitignored)

**Interfaces:**
- Consumes: the verified static initial-render implementation and `npm run lighthouse`.
- Produces: documented six-run median comparison and, only for a meaningful result, branch `perf/lcp-static-initial-render`, its remote push, and a pull request targeting `main`.

- [x] **Step 1: Run the production Lighthouse suite**

Run: `npm run lighthouse`

Expected: six report JSON files are generated for `/` and `/stocks/AAPL`, three runs per route, and Lighthouse assertions report no failures.

- [x] **Step 2: Calculate route medians from report JSON**

Run:

```bash
node -e 'const fs=require("fs"); const path=".lighthouseci"; const reports=fs.readdirSync(path).filter(f=>f.endsWith(".report.json")).map(f=>JSON.parse(fs.readFileSync(`${path}/${f}`,"utf8"))); for (const route of ["/","/stocks/AAPL"]) { const values=reports.filter(r=>new URL(r.finalUrl).pathname===route).slice(-3).map(r=>r.audits); const median=k=>[...values.map(a=>a[k].numericValue)].sort((a,b)=>a-b)[1]; console.log(route, JSON.stringify({performance:[...values.map(a=>a["categories"]).map(c=>c.performance.score)].sort((a,b)=>a-b)[1],fcp:median("first-contentful-paint"),lcp:median("largest-contentful-paint"),tbt:median("total-blocking-time"),cls:median("cumulative-layout-shift")})); }'
```

Expected: a single median row for each route. Compare LCP to 2166ms (home) and 2186ms (detail), Performance to 0.89, and TBT/CLS to 0ms.

- [x] **Step 3: Record the exact comparison in the performance report**

```markdown
### 2026-08-04 static initial amount experiment

| Route | Runs | Performance median | FCP median | LCP median | TBT median | CLS median | Baseline LCP | Delta |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 3 | value printed for `/` | value printed for `/` | value printed for `/` | value printed for `/` | value printed for `/` | 2166ms | LCP median minus 2166ms |
| `/stocks/AAPL` | 3 | value printed for `/stocks/AAPL` | value printed for `/stocks/AAPL` | value printed for `/stocks/AAPL` | value printed for `/stocks/AAPL` | value printed for `/stocks/AAPL` | 2186ms | LCP median minus 2186ms |

The remote PR criterion passes only when both route LCP deltas are -100ms or lower, Performance is at least 0.89, and TBT and CLS are at or below their baseline. State either `criterion passed` or `criterion not met` beneath the table.
```

- [x] **Step 4: Commit the measurement report**

```bash
git add docs/performance-refactoring.md
git commit -m "docs: record static amount lcp measurement"
```

- [x] **Step 5: Publish only when every meaningful-result criterion passes**

Run:

```bash
git switch -c perf/lcp-static-initial-render
git push -u origin perf/lcp-static-initial-render
gh pr create --base main --head perf/lcp-static-initial-render --title "perf: render initial amounts without motion" --body "## Summary\n- render initial monetary LCP candidates as static spans\n- keep Motion transitions for user currency changes\n- add amount-transition regression coverage\n\n## Validation\n- npm run lint\n- npm test -- --runInBand\n- npm run build\n- npm run lighthouse (three runs per route)\n\nThe exact Lighthouse medians and pass/fail decision are documented in docs/performance-refactoring.md."
```

Expected: a pushed branch and PR URL only after both LCP medians improve by at least 100ms and all non-regression checks pass. If any criterion fails, do not push or create a PR; report the measured deltas and retain the local commits for review.
