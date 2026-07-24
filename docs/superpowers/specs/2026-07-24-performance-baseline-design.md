# Performance Baseline Design

## Goal

Make Lighthouse measurements reproducible in a production-like environment and remove development-only mock initialization from the application's first render path.

## Scope

- Replace the browser/server MSW dependency used by page data fetches with Next.js Route Handlers backed by the existing mock datasets.
- Replace hard-coded `localhost:4000` and `localhost:4001` fetch clients with a server data layer shared by pages and Route Handlers.
- Remove the root-level MSW render gate so server-rendered page content is never replaced with `null` while a client worker starts.
- Provide one production Lighthouse command and CI workflow that build the app, wait for readiness, run both routes three times, and clean up the server.
- Keep Lighthouse output ignored and retain one concise project guide rather than multiple overlapping setup documents.

## Non-goals

- Do not redesign the portfolio or stock screens.
- Do not add a real external API or database.
- Do not change Motion behavior in this iteration; Motion bundle work will be measured after the baseline is trustworthy.

## Architecture

`src/data/portfolio.ts` and `src/data/stocks.ts` will provide typed access to the existing JSON mock data. The server pages and `src/app/api/portfolio/route.ts` / `src/app/api/stocks/[code]/route.ts` Route Handlers will share that data layer, avoiding server-to-self HTTP calls. This lets `next start` serve both pages and API responses without MSW or json-server.

The root layout will no longer initialize MSW, and `Providers` will no longer block children on MSW readiness. Existing development-only MSW files may remain unused for now and be removed only in a dedicated cleanup change.

Lighthouse will run only after `next build` and `next start`; it will visit `/` and `/stocks/AAPL`. The GitHub Actions workflow will invoke the same script/command so local and CI results are comparable.

## Error Handling

- Route handlers return `404` for an unknown stock code.
- API clients throw a descriptive error for non-success responses; the stock page continues to map a missing stock to `notFound()`.
- Lighthouse startup polling fails clearly if the production server does not become ready.

## Verification

- Unit-test the shared data lookup and Route Handler responses.
- Run the focused tests, lint, and production build.
- Run Lighthouse against the production server and record the median report as the new baseline.
- Confirm the root render has no MSW readiness gate and no hard-coded ports `4000`/`4001` in application API clients.

## Commit Boundaries

1. `refactor: serve mock data through Next route handlers`
2. `chore: run Lighthouse against production build`
3. `docs: document production performance checks`
