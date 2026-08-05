# Pretendard Dynamic Subset Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the globally preloaded 2.06MB Pretendard variable font with local unicode-range dynamic subsets while preserving the existing font family and variable-weight appearance.

**Architecture:** The global stylesheet imports Pretendard's locally installed variable dynamic-subset stylesheet. RootLayout no longer injects a `next/font/local` class; instead `body` declares the same `Pretendard Variable` family with system fallbacks. The browser chooses only subset WOFF2 resources containing the glyphs used by each route.

**Tech Stack:** Next.js 15, React 19, Tailwind CSS 4, Pretendard 1.3.9, Jest 30, Lighthouse CI.

## Global Constraints

- Use only local files from the installed `pretendard` package; do not add an external CDN request.
- Preserve the `Pretendard Variable` family, variable weight range `45 920`, `font-display: swap`, and the existing `font-medium` body weight.
- Do not change `AmountTransition`, chart, data-fetching behavior, UI copy, or Lighthouse assertion thresholds.
- Compare each production route's three-run median against P0: `/` Performance 0.89, FCP 331ms, LCP 2169ms, TBT 0ms, CLS 0; `/stocks/AAPL` Performance 0.89, FCP 418ms, LCP 2185ms, TBT 0ms, CLS 0.
- The P1 branch is `refactor/issue-1-font-subset`, targets `dev`, and references Issue #1 without closing it.

---

## File Structure

- Modify: `src/app/globals.css` — imports the local dynamic-subset face rules and declares the global fallback stack.
- Modify: `src/app/layout.tsx` — removes `next/font/local` class injection while retaining `font-medium`.
- Delete: `theme.ts` — removes the obsolete single-file font loader.
- Modify: `docs/performance-refactoring.md` — records P1 transfer sizes and Lighthouse medians.

### Task 1: Replace Single-File Font Loading with Local Dynamic Subsets

**Files:**
- Modify: `src/app/globals.css:1-2, body`
- Modify: `src/app/layout.tsx:1-15`
- Delete: `theme.ts`

**Interfaces:**
- Consumes: `pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css`, which defines `font-family: 'Pretendard Variable'`, `font-weight: 45 920`, `font-display: swap`, and unicode-range subset WOFF2 sources.
- Produces: a RootLayout that preserves `font-medium` and a globally applied `Pretendard Variable` system fallback stack without a `next/font/local` class.

- [ ] **Step 1: Confirm the current single-file font is emitted by a production build**

Run: `npm run build && find .next/static/media -type f -name '*.woff2' -exec wc -c {} +`

Expected: the build emits one `PretendardVariable` asset near 2,057,688 bytes, proving the pre-change single-file loading path.

- [ ] **Step 2: Replace the global font loader with the dynamic-subset stylesheet**

```css
@import "tailwindcss";
@import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
@import "../styles/layout.css";

body {
	font-family: "Pretendard Variable", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
	background: var(--background);
	color: var(--foreground);
}
```

```tsx
import Providers from "@/providers/providers";
import "./globals.css";

<body className="font-medium">
```

Delete `theme.ts`, because no code consumes `pretendard` after the RootLayout import is removed.

- [ ] **Step 3: Build and inspect the new emitted font assets**

Run: `npm run build && find .next/static/media -type f -name '*.woff2' -exec wc -c {} + | sort -n | tail -20`

Expected: no 2MB `PretendardVariable.woff2` output; emitted WOFF2 files are the unicode-range subset assets required by the CSS import.

- [ ] **Step 4: Run full code verification**

Run: `npm run lint && npm test -- --runInBand && npm run build`

Expected: ESLint exits 0, Jest exits with all suites passing, and Next.js production build completes.

- [ ] **Step 5: Commit the focused font-loading change**

```bash
git add src/app/globals.css src/app/layout.tsx theme.ts
git commit -m "perf: load Pretendard dynamic subsets locally"
```

### Task 2: Measure P1 and Create the Issue #1 Draft PR

**Files:**
- Modify: `docs/performance-refactoring.md`

**Interfaces:**
- Consumes: six current Lighthouse reports produced by `npm run lighthouse` and their `network-requests` audit items.
- Produces: recorded P1 route medians, font transfer totals, a pushed `refactor/issue-1-font-subset` branch, and a Draft PR targeting `dev` with the exact result values.

- [ ] **Step 1: Run the six-run production Lighthouse suite**

Run: `npm run lighthouse`

Expected: three reports for `/` and three reports for `/stocks/AAPL`; all performance assertions remain non-failing.

- [ ] **Step 2: Calculate route medians and used font transfer totals**

Run:

```bash
node -e 'const fs=require("fs"),d=".lighthouseci",rs=fs.readdirSync(d).filter(f=>f.startsWith("lhr-")&&f.endsWith(".json")).sort().slice(-6).map(f=>JSON.parse(fs.readFileSync(`${d}/${f}`,"utf8"))); const med=a=>[...a].sort((x,y)=>x-y)[1]; for(const path of ["/","/stocks/AAPL"]){const r=rs.filter(x=>new URL(x.finalUrl).pathname===path); const a=r.map(x=>x.audits); const fontBytes=med(a.map(x=>(x["network-requests"].details.items.filter(i=>i.resourceType==="Font").reduce((sum,i)=>sum+i.transferSize,0)))); console.log(path,JSON.stringify({performance:med(r.map(x=>x.categories.performance.score)),fcp:med(a.map(x=>x["first-contentful-paint"].numericValue)),lcp:med(a.map(x=>x["largest-contentful-paint"].numericValue)),tbt:med(a.map(x=>x["total-blocking-time"].numericValue)),cls:med(a.map(x=>x["cumulative-layout-shift"].numericValue)),fontBytes})); }'
```

Expected: an exact median row for each route, including the transferred font bytes used by that route. Compare them with the P0 global 2,057,992-byte font request and LCP baselines in Global Constraints.

- [ ] **Step 3: Record the exact P1 comparison in the performance report**

Add a `2026-08-04 Pretendard dynamic subset experiment` section containing one row each for `/` and `/stocks/AAPL`, with the exact values printed by Step 2 and a stated conclusion about whether LCP improved. State the P0 font request was 2,057,992 bytes and give the measured P1 median font-transfer total for both routes.

- [ ] **Step 4: Commit the measured report**

```bash
git add docs/performance-refactoring.md
git commit -m "docs: record Pretendard subset measurement"
```

- [ ] **Step 5: Push and open the P1 Draft PR against dev**

Run:

```bash
git push -u origin refactor/issue-1-font-subset
gh pr create --draft --base dev --head refactor/issue-1-font-subset --title "perf: load Pretendard dynamic subsets" --body "## Issue\nRelated to #1. P2 chart loading remains a separate follow-up.\n\n## Change\n- replace the 2.06MB single Pretendard variable font with local unicode-range dynamic subsets\n- preserve Pretendard Variable, variable weights, font-display swap, and font-medium\n\n## Validation\n- npm run lint\n- npm test -- --runInBand\n- npm run build\n- npm run lighthouse (three runs for each route)\n\n## Performance\nThe exact P0 and P1 median Lighthouse values and font-transfer totals are documented in docs/performance-refactoring.md."
```

Expected: a Draft PR targeting `dev`, with the Issue #1 relationship and measured performance-result location made explicit.
