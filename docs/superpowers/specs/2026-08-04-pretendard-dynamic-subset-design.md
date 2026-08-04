# Pretendard Dynamic Subset Design

## Goal

전역으로 preload되는 2.06MB `PretendardVariable.woff2` 단일 파일을 로컬 가변 다이나믹 서브셋으로 교체해, 초기 화면에 실제로 사용된 문자 범위의 작은 WOFF2 파일만 요청하도록 한다.

## Scope

- `theme.ts`의 `next/font/local` 단일 가변 폰트 설정을 제거한다.
- `src/app/globals.css`에서 Pretendard 패키지가 제공하는 로컬 `pretendardvariable-dynamic-subset.css`를 포함한다.
- `src/app/layout.tsx`의 `pretendard.className`을 제거하고, 전역 CSS `body`에 `"Pretendard Variable"`과 시스템 fallback stack을 적용한다.
- production Lighthouse로 `/`와 `/stocks/AAPL`을 3회씩 측정하고, 이전 P0 측정과 폰트 전송량·LCP 중앙값을 비교한다.
- 결과와 미달/통과 여부를 #1 관련 Draft PR 본문에 수치로 기록한다.

## Non-goals

- 외부 CDN 폰트 사용
- 폰트 패밀리 또는 타이포그래피 디자인 변경
- `AmountTransition`, chart, data-fetching 동작 변경
- Lighthouse assertion threshold 변경

## Architecture

Pretendard 패키지의 `dist/web/variable/pretendardvariable-dynamic-subset.css`는 `unicode-range`가 붙은 `@font-face` 규칙과 `PretendardVariable.subset.*.woff2` 파일을 제공한다. 브라우저는 현재 페이지 텍스트에 필요한 문자 범위만 요청하므로, 모든 문자를 담은 단일 2.06MB variable font를 preload하지 않는다.

`body`는 기존과 같은 가변 weight 범위를 쓰되 `font-family: "Pretendard Variable", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`를 사용한다. `font-display: swap`은 upstream stylesheet가 유지하므로 fallback text는 즉시 표시되고, subset이 준비된 문자만 개별적으로 교체된다.

## Verification

- build output에 2MB 단일 Pretendard font 요청이 없고, Lighthouse network requests에서 필요한 subset 파일만 전송되는지 확인한다.
- `/`와 `/stocks/AAPL` production Lighthouse 3회 중앙값에서 Performance, FCP, LCP, TBT, CLS를 기록한다.
- 비교 기준은 P0 후속 측정: 홈 Performance 0.89, FCP 331ms, LCP 2169ms, TBT 0ms, CLS 0; 상세 Performance 0.89, FCP 418ms, LCP 2185ms, TBT 0ms, CLS 0이다.
- `npm run lint`, `npm test -- --runInBand`, `npm run build`를 모두 통과한다.

## Branch and PR Structure

```text
main
└─ dev
   ├─ refactor/performance-baseline  (Draft PR #2 → dev)
   └─ refactor/issue-1-font-subset  (Issue #1 P1 Draft PR → dev)
```

P1 PR은 `Closes #1`을 사용하지 않는다. 이슈의 P2 차트 지연 로드가 별도 작업으로 남아 있기 때문이다.
