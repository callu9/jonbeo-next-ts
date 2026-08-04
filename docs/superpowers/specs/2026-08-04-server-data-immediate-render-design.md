# Server Data Immediate Render Design

## Goal

서버 페이지가 이미 전달한 portfolio와 stock detail 데이터를 클라이언트에서 임의의 최소 로딩 시간만큼 skeleton으로 가리지 않고 즉시 표시한다.

## Scope

- `AccountSummaryClient`, `StockListClient`, `StockStatusClient`, `StockDetailGraphClient`에서 `useMinLoading`·로컬 loading state·mount effect를 제거한다.
- 값이 전달되면 첫 렌더부터 실제 `AmountStatus`, 종목 목록, 상세 그래프를 렌더한다.
- 데이터가 없을 때만 기존 skeleton을 렌더한다.
- `0`, 음수 금액·수익률은 유효한 데이터로 취급한다.
- component tests로 즉시 실제 콘텐츠를 표시하고 null/undefined일 때 skeleton을 유지하는 것을 검증한다.

## Non-goals

- 서버 data fetching, API schema, skeleton 디자인, 차트 구현 변경
- LCP 수치가 개선된다는 주장 또는 Lighthouse threshold 변경
- chart drag throttling, Motion feature bundle, 초기 금액/차트 lazy-load 실험 포함

## Architecture

각 client boundary는 props의 존재 여부만 판단한다. `AccountSummaryClient`와 `StockListClient`는 각각 object/array가 있으면 실제 콘텐츠를 즉시 렌더하고, 없을 때만 현재 skeleton fallback을 사용한다. `StockStatusClient`는 `undefined`와 `null`만 결측으로 간주해 0과 음수 값을 보존한다. `StockDetailGraphClient`도 props가 있으면 즉시 graph를 렌더한다.

이 변경은 별도의 페이지 상태나 지연 타이머를 추가하지 않는다. `useMinLoading`은 다른 소비자가 있으면 그대로 남고, 이 네 client boundary에서만 의존성을 제거한다.

## Verification

- `PorfolioClient.test.tsx`는 제공된 account summary와 stock list가 skeleton 없이 첫 렌더에 표시되는지, 누락 시 skeleton count가 유지되는지 검증한다.
- `StockDetailClient.test.tsx`는 0·음수 상세 값이 실제 상태 UI로 전달되는지, 필수 값이 없을 때 skeleton을 표시하는지, detail graph가 props와 함께 즉시 표시되는지 검증한다.
- `npm run lint`, `npm test -- --runInBand`, `npm run build`가 모두 통과해야 한다.
- PR은 `dev`를 base로 하며 P1 폰트 서브셋과 본 변경만 포함한다.
