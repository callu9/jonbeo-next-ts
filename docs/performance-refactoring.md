# Performance Refactoring Report

## 목적

초기 화면 렌더를 막던 개발용 MSW 의존성을 제거하고, 로컬 mock 데이터를 Next.js 앱 내부에서 제공하도록 변경해 성능 측정과 개발 환경을 단순화한다.

## 적용 내용

### 1. MSW 초기 렌더 게이트 제거

기존에는 `MSWComponent`가 브라우저 worker 초기화가 끝날 때까지 전체 앱을 렌더링하지 않았다.

```tsx
if (!mswReady) return null;
```

이 구조는 초기 콘텐츠가 비어 보이는 시간을 만들고 LCP 측정에도 영향을 줄 수 있다.

변경 후 `Providers`는 MSW 준비 상태에 의존하지 않고 즉시 children을 렌더링한다.

- `src/app/layout.tsx`에서 `initMocks()` 제거
- `src/providers/providers.tsx`에서 `MSWComponent` 제거
- 테스트 bootstrap에서 MSW server lifecycle 제거

### 2. 포트 기반 mock API 제거

기존 서버 컴포넌트는 다음 외부 개발 서버에 의존했다.

- `http://localhost:4000/portfolio`
- `http://localhost:4001/stocks/:code`

이제 `src/data`의 공유 데이터 계층이 기존 JSON fixture를 직접 읽는다.

- `src/data/portfolio.ts`
- `src/data/stocks.ts`

페이지 데이터 접근과 Next Route Handler가 같은 데이터 계층을 사용한다.

- `GET /api/portfolio`
- `GET /api/stocks/:code`

따라서 `next start`만으로 화면과 mock API를 함께 제공할 수 있다.

### 3. Route Handler 추가

| Endpoint | 동작 |
| --- | --- |
| `/api/portfolio` | 계좌 요약과 보유 종목 목록 반환 |
| `/api/stocks/AAPL` | 종목 상세 반환 |
| `/api/stocks/UNKNOWN` | 404와 `{ "error": "Stock not found" }` 반환 |

## 검증

Jest 회귀 테스트를 추가했다.

- 포트폴리오 fixture 반환
- 종목 코드 대소문자 무관 조회
- 존재하지 않는 종목 처리
- 포트폴리오 Route Handler 응답
- 종목 Route Handler 200/404 응답
- MSW worker 대기 없이 콘텐츠 렌더링

후속 정리 후 현재 결과:

```text
Test Suites: 6 passed, 6 total
Tests:       8 passed, 8 total
```

```bash
npm run lint
npx jest --runInBand
npm run build
```

위 검증은 모두 통과했다. 추가로 Next.js 15가 요구하는 비동기 `params` 타입으로 종목 상세 페이지를 맞춰 production build의 타입 검사도 통과시켰다.

## Production Lighthouse

### 실행 구성

`npm run lighthouse`는 다음 순서로 동작한다.

1. `next build`로 production bundle을 생성한다.
2. `next start`를 백그라운드에서 기동한다.
3. `/api/portfolio` 헬스체크가 성공하면 Lighthouse CI를 실행한다.
4. 종료 시 서버 프로세스를 정리한다.

`lighthouserc.json`의 측정 조건은 다음과 같다.

| 항목 | 설정 |
| --- | --- |
| URL | `/`, `/stocks/AAPL` |
| 반복 횟수 | URL별 3회 |
| 환경 | desktop preset |
| 회귀 기준 | performance 0.70 미만은 warn |
| 결과 저장 | `.lighthouseci/` (Git ignore) |

GitHub Actions는 pull request와 `main` 브랜치 push에서 같은 `npm run lighthouse` 명령을 실행한다. 따라서 PR 단계에서 production bundle 기준의 성능 회귀를 확인할 수 있다.

### 2026-07-24 로컬 baseline

production build와 `next start` 환경에서 총 6회 측정을 완료했다.

| Route | Runs | Performance |
| --- | ---: | ---: |
| `/` | 3 | 0.89 |
| `/stocks/AAPL` | 3 | 0.89 |

설정된 performance assertion은 모두 통과했다. 이 값은 동일한 로컬 환경에서의 비교 기준이며, 배포 환경의 절대 점수로 해석하지 않는다. CI 머신, 네트워크, Chrome 버전 차이로 개별 run은 달라질 수 있으므로 이후 변경도 같은 URL·반복 횟수·preset으로 비교한다.

### 2026-08-04 Pretendard dynamic subset experiment

단일 `PretendardVariable.woff2` preload를 local unicode-range dynamic subset으로 교체한 뒤 production Lighthouse를 route별 3회 실행했다. 이전 단일 font 요청은 2,057,992 bytes였고, P1은 각 route에 필요한 subset만 요청했다.

| Route | Performance median | FCP median | LCP median | TBT median | CLS median | Font transfer median | P0 LCP | LCP delta |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 0.99 | 577ms | 813ms | 0ms | 0.00012 | 230,832B | 2169ms | -1356ms |
| `/stocks/AAPL` | 1.00 | 489ms | 653ms | 0ms | 0.00001 | 158,260B | 2185ms | -1532ms |

LCP 후보는 동일한 큰 금액 텍스트였고, font transfer는 홈에서 약 89%, 상세에서 약 92% 줄었다. 이 측정은 기존 2MB font를 제공하던 포트 3000 서버를 종료한 뒤 P1 production build로 재실행한 결과다.

## 커밋

- `c47f9bb` docs: add performance baseline plan
- `694ca4b` test: remove obsolete MSW bootstrap
- `48ccd38` refactor: share mock data through server layer
- `d68ac41` feat: expose mock portfolio API routes
- `76f9ac6` perf: remove MSW render gate
- `5b22944` chore: add production Lighthouse checks
- `73bf8ac` fix: resolve lint and build issues

## 다음 최적화 후보

- Motion feature bundle이 `domMax`를 사용한다. drag·layout 기능이 불필요하다고 확인되면 `domAnimation` 전환을 측정한다. 자세한 판단 기준은 [Framer Motion and Performance](./framer-motion-performance.md)를 따른다.
- Lighthouse report의 LCP, Total Blocking Time, unused JavaScript를 함께 확인해 bundle 분리·클라이언트 컴포넌트 축소 전후를 비교한다.
- CI baseline이 안정화되면 performance 기준을 0.70에서 단계적으로 상향한다. 변동성 검토 없이 즉시 error 기준을 높이지 않는다.
