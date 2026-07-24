# Production Performance Baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Serve the existing mock portfolio data from the Next application, remove the MSW first-render gate, and make Lighthouse measure the production build locally and in CI.

**Architecture:** A small server-only data layer reads the existing JSON fixtures. Server pages and Next Route Handlers share this layer, so `next start` needs no browser worker or separate `json-server` process. Lighthouse uses one script that owns build, startup polling, measurement, and cleanup; GitHub Actions invokes that same command.

**Tech Stack:** Next.js 15 App Router, TypeScript, Jest, Lighthouse CI, GitHub Actions.

## Global Constraints

- Keep the existing portfolio and stock response shapes unchanged.
- Use no new runtime dependency.
- Do not change Motion behavior in this iteration.
- Run Lighthouse only against `next build` + `next start`, never `next dev`.
- Keep `.lighthouseci/` untracked.

---

### Task 1: Decouple the Jest bootstrap from MSW

**Files:**
- Modify: `jest.setup.ts:1-21`

**Interfaces:**
- Produces: a Jest setup file that only registers Testing Library matchers.

- [ ] **Step 1: Remove obsolete MSW lifecycle setup**

This is test configuration, not production code. Remove `import { server } from "./src/mocks/index";` and the `beforeAll`, `afterEach`, and `afterAll` blocks from `jest.setup.ts`; leave `import "@testing-library/jest-dom";` intact.

- [ ] **Step 2: Verify Jest can discover tests without loading MSW**

Run: `npx jest --listTests`

Expected: exit code 0 and no error that `./src/mocks/index` lacks a `server` export.

- [ ] **Step 3: Commit the test bootstrap repair**

```bash
git add jest.setup.ts
git commit -m "test: remove obsolete MSW bootstrap"
```

### Task 2: Share mock data between server pages and API routes

**Files:**
- Create: `src/data/portfolio.ts`
- Create: `src/data/stocks.ts`
- Create: `src/data/portfolio.test.ts`
- Create: `src/data/stocks.test.ts`
- Modify: `src/apis/portfolio.ts:1-20`
- Modify: `src/apis/stocks.ts:1-20`

**Interfaces:**
- Produces: `getPortfolioData(): PortfolioListResponse`
- Produces: `getStockData(code: string): StockDetail | undefined`
- Consumes: `src/mocks/database/portfolio.json`, `src/mocks/database/stocks.json`

- [ ] **Step 1: Write the failing data-access tests**

```ts
// src/data/portfolio.test.ts
import { getPortfolioData } from "@/data/portfolio";

test("returns the portfolio fixture with its account and stocks", () => {
  const portfolio = getPortfolioData();
  expect(portfolio.account.cashBalance).toBe(22829.13);
  expect(portfolio.stocks).toHaveLength(7);
});

// src/data/stocks.test.ts
import { getStockData } from "@/data/stocks";

test("finds a stock code without case sensitivity", () => {
  expect(getStockData("aapl")?.name).toBe("애플");
});

test("returns undefined for an unknown stock code", () => {
  expect(getStockData("UNKNOWN")).toBeUndefined();
});
```

- [ ] **Step 2: Run the tests and verify they fail because the modules do not exist**

Run: `npx jest src/data/portfolio.test.ts src/data/stocks.test.ts --runInBand`

Expected: FAIL with module-resolution errors for `@/data/portfolio` and `@/data/stocks`.

- [ ] **Step 3: Implement the minimal typed data layer**

```ts
// src/data/portfolio.ts
import portfolio from "@/mocks/database/portfolio.json";
import { PortfolioListResponse } from "@/types/portfolio";

export function getPortfolioData(): PortfolioListResponse {
  return portfolio;
}

// src/data/stocks.ts
import stocks from "@/mocks/database/stocks.json";
import { StockDetail } from "@/types/stock";

export function getStockData(code: string): StockDetail | undefined {
  const normalizedCode = code.toUpperCase();
  return stocks.list.find((stock) => stock.code === normalizedCode);
}
```

Replace the `fetch` implementations in `src/apis/portfolio.ts` and `src/apis/stocks.ts` with wrappers that return `getPortfolioData()` and `getStockData(code)` respectively. Preserve their exported function names so page imports do not change.

- [ ] **Step 4: Re-run the focused tests**

Run: `npx jest src/data/portfolio.test.ts src/data/stocks.test.ts --runInBand`

Expected: PASS, 3 tests.

- [ ] **Step 5: Commit the data layer**

```bash
git add src/data src/apis/portfolio.ts src/apis/stocks.ts
git commit -m "refactor: share mock data through server layer"
```

### Task 3: Expose the shared data through Next Route Handlers

**Files:**
- Create: `src/app/api/portfolio/route.ts`
- Create: `src/app/api/portfolio/route.test.ts`
- Create: `src/app/api/stocks/[code]/route.ts`
- Create: `src/app/api/stocks/[code]/route.test.ts`

**Interfaces:**
- Consumes: `getPortfolioData(): PortfolioListResponse`
- Consumes: `getStockData(code: string): StockDetail | undefined`
- Produces: `GET(): NextResponse<PortfolioListResponse>`
- Produces: `GET(request, { params }): NextResponse<StockDetail | { error: string }>`

- [ ] **Step 1: Write the failing Route Handler tests**

```ts
// src/app/api/portfolio/route.test.ts
import { GET } from "@/app/api/portfolio/route";

test("returns the portfolio response", async () => {
  const response = await GET();
  await expect(response.json()).resolves.toMatchObject({
    account: { cashBalance: 22829.13 },
    stocks: expect.any(Array),
  });
});

// src/app/api/stocks/[code]/route.test.ts
import { GET } from "@/app/api/stocks/[code]/route";

test("returns a requested stock", async () => {
  const response = await GET(new Request("http://localhost/api/stocks/AAPL"), {
    params: Promise.resolve({ code: "AAPL" }),
  });
  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toMatchObject({ code: "AAPL" });
});

test("returns 404 for an unknown stock", async () => {
  const response = await GET(new Request("http://localhost/api/stocks/UNKNOWN"), {
    params: Promise.resolve({ code: "UNKNOWN" }),
  });
  expect(response.status).toBe(404);
  await expect(response.json()).resolves.toEqual({ error: "Stock not found" });
});
```

- [ ] **Step 2: Run the Route Handler tests and verify they fail because the route modules do not exist**

Run: `npx jest src/app/api/portfolio/route.test.ts 'src/app/api/stocks/[code]/route.test.ts' --runInBand`

Expected: FAIL with module-resolution errors for both Route Handler modules.

- [ ] **Step 3: Implement the Route Handlers**

```ts
// src/app/api/portfolio/route.ts
import { getPortfolioData } from "@/data/portfolio";
import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(getPortfolioData());
}

// src/app/api/stocks/[code]/route.ts
import { getStockData } from "@/data/stocks";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const stock = getStockData(code);

  if (!stock) {
    return NextResponse.json({ error: "Stock not found" }, { status: 404 });
  }

  return NextResponse.json(stock);
}
```

- [ ] **Step 4: Re-run all data and route tests**

Run: `npx jest src/data/portfolio.test.ts src/data/stocks.test.ts src/app/api/portfolio/route.test.ts 'src/app/api/stocks/[code]/route.test.ts' --runInBand`

Expected: PASS, 6 tests.

- [ ] **Step 5: Commit the Route Handlers**

```bash
git add src/app/api
git commit -m "feat: expose mock portfolio API routes"
```

### Task 4: Remove the MSW render gate

**Files:**
- Modify: `src/app/layout.tsx:1-24`
- Modify: `src/providers/providers.tsx:1-16`
- Create: `src/app/layout.test.tsx`

**Interfaces:**
- Consumes: `Providers({ children }: { children: React.ReactNode }): JSX.Element`
- Produces: root layout markup without an `initMocks()` invocation or `MSWComponent` wrapper.

- [ ] **Step 1: Write the failing root-layout regression test**

```tsx
import RootLayout from "@/app/layout";
import { render, screen } from "@testing-library/react";

jest.mock("@vercel/analytics/react", () => ({ Analytics: () => null }));

test("renders page content without waiting for a mock worker", () => {
  render(
    <RootLayout>
      <main>portfolio content</main>
    </RootLayout>
  );
  expect(screen.getByText("portfolio content")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test and verify it fails because the layout still calls MSW initialization or is blocked by the MSW provider**

Run: `npx jest src/app/layout.test.tsx --runInBand`

Expected: FAIL due to the existing MSW setup/import path.

- [ ] **Step 3: Remove first-render MSW behavior**

Remove `initMocks` from `src/app/layout.tsx` and remove `MSWComponent` from `src/providers/providers.tsx`. Keep `LazyMotionProvider`, `SuccessToastProvider`, and `WebVitalsProvider` unchanged.

- [ ] **Step 4: Run the full Jest suite**

Run: `npx jest --runInBand`

Expected: PASS with the data, Route Handler, and layout tests; no MSW import error.

- [ ] **Step 5: Commit the initial-render fix**

```bash
git add src/app/layout.tsx src/providers/providers.tsx src/app/layout.test.tsx
git commit -m "perf: remove MSW render gate"
```

### Task 5: Run Lighthouse only against the production application

**Files:**
- Modify: `package.json:5-19`
- Modify: `lighthouse-run.sh:1-31`
- Modify: `lighthouserc.json:1-63`
- Modify: `.github/workflows/lighthouse.yml:1-93`
- Modify: `.gitignore:39-44`

**Interfaces:**
- Produces: `npm run lighthouse` which builds, starts, polls, measures, and always stops the production server.
- Consumes: `http://127.0.0.1:3000/` and `http://127.0.0.1:3000/stocks/AAPL`.

- [ ] **Step 1: Write the failing configuration checks**

```ts
import fs from "node:fs";

test("Lighthouse script measures a production server", () => {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const script = fs.readFileSync("lighthouse-run.sh", "utf8");
  expect(packageJson.scripts.lighthouse).toBe("bash ./lighthouse-run.sh");
  expect(script).toContain("npm run build");
  expect(script).toContain("npm run start");
  expect(script).not.toContain("npm run dev");
});
```

Save it as `src/config/lighthouse.test.ts`.

- [ ] **Step 2: Run the test and verify it fails because the package script currently invokes LHCI directly**

Run: `npx jest src/config/lighthouse.test.ts --runInBand`

Expected: FAIL because `scripts.lighthouse` is not `bash ./lighthouse-run.sh`.

- [ ] **Step 3: Implement a single production Lighthouse path**

Set `package.json` scripts to include `"test": "jest"` and `"lighthouse": "bash ./lighthouse-run.sh"`; remove the development Lighthouse script. Make `lighthouse-run.sh` use `set -euo pipefail`, start `npm run start` in the background, install `trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT`, poll `http://127.0.0.1:3000/api/portfolio`, then run `npx lhci autorun --config=lighthouserc.json`.

Change both Lighthouse URLs to `http://127.0.0.1:3000` and `http://127.0.0.1:3000/stocks/AAPL`. In GitHub Actions, use Node 20, run `npm ci`, and invoke `npm run lighthouse`; remove its separately managed build/start/wait steps and the duplicate PR-comment script.

- [ ] **Step 4: Run configuration tests, lint, and production build**

Run: `npx jest src/config/lighthouse.test.ts --runInBand && npm run lint && npm run build`

Expected: all tests and lint pass; Next produces a production build.

- [ ] **Step 5: Run the production Lighthouse baseline**

Run: `npm run lighthouse`

Expected: Lighthouse runs three measurements for `/` and `/stocks/AAPL`, then terminates the started Next server. `.lighthouseci/` remains untracked.

- [ ] **Step 6: Commit the reproducible measurement setup**

```bash
git add package.json package-lock.json lighthouse-run.sh lighthouserc.json .github/workflows/lighthouse.yml .gitignore src/config/lighthouse.test.ts
git commit -m "chore: measure Lighthouse in production mode"
```

### Task 6: Consolidate the maintained performance documentation

**Files:**
- Modify: `README.md:13-21`
- Create: `docs/performance.md`

**Interfaces:**
- Produces: one short guide that documents `npm run lighthouse`, the two measured routes, and where results are written.

- [ ] **Step 1: Write the failing documentation check**

```ts
import fs from "node:fs";

test("performance guide documents the production Lighthouse command", () => {
  const guide = fs.readFileSync("docs/performance.md", "utf8");
  expect(guide).toContain("npm run lighthouse");
  expect(guide).toContain("/stocks/AAPL");
  expect(guide).toContain(".lighthouseci/");
});
```

Save it as `src/config/performance-docs.test.ts`.

- [ ] **Step 2: Run the test and verify it fails because the guide does not exist**

Run: `npx jest src/config/performance-docs.test.ts --runInBand`

Expected: FAIL with `ENOENT` for `docs/performance.md`.

- [ ] **Step 3: Write the maintained guide and link it from README**

Create `docs/performance.md` with the exact command `npm run lighthouse`, the measured routes `/` and `/stocks/AAPL`, and the note that detailed local reports are generated in the ignored `.lighthouseci/` directory. Add one README link named `Performance checks` pointing to `docs/performance.md`.

- [ ] **Step 4: Run the documentation test and complete regression checks**

Run: `npx jest src/config/performance-docs.test.ts --runInBand && npm test -- --runInBand && npm run lint`

Expected: all tests and lint pass.

- [ ] **Step 5: Commit the documentation**

```bash
git add README.md docs/performance.md src/config/performance-docs.test.ts
git commit -m "docs: document production performance checks"
```
