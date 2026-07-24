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

현재 결과:

```text
Test Suites: 5 passed, 5 total
Tests:       7 passed, 7 total
```

## 커밋

- `c47f9bb` docs: add performance baseline plan
- `694ca4b` test: remove obsolete MSW bootstrap
- `48ccd38` refactor: share mock data through server layer
- `d68ac41` feat: expose mock portfolio API routes
- `76f9ac6` perf: remove MSW render gate

## 후속 작업

production Lighthouse 실행 설정은 작성 중이며, 현재 기존 ESLint 오류 때문에 전체 검증이 중단된 상태다.

주요 선행 오류:

- `PriceHandle.tsx`의 조건부 Hook 호출
- `not-found.tsx`의 `<a>` 기반 내부 이동
- 빈 interface 선언
- 기존 mock handler의 `prefer-const` 오류

이 오류들을 정리한 뒤 다음을 실행한다.

```bash
npm run lint
npm run build
npm run lighthouse
```

Lighthouse는 반드시 `next build`와 `next start` 기반으로 측정해 개발 서버 번들·컴파일 비용이 결과에 섞이지 않도록 한다.
