# Performance Rendering Follow-up Design

## Goal

서버에서 이미 전달된 포트폴리오·종목 상세 데이터를 즉시 표시하고, 차트 드래그와 Motion feature bundle의 불필요한 비용을 줄여 초기 렌더와 상호작용 성능을 개선한다.

## Scope

이번 작업은 다음 세 가지 독립적인 개선만 포함한다.

1. 서버 데이터가 있는 화면에서 클라이언트 스켈레톤을 표시하지 않는다.
2. 목표 평단가 핸들을 드래그할 때 차트 업데이트를 animation frame 단위로 제한한다.
3. Motion feature bundle을 `domMax`에서 `domAnimation`으로 낮춘다.

차트 지연 로드, 종목 상세 정적 생성, Lighthouse assertion 확장, MSW·레거시 그래프 삭제는 이 변경의 Lighthouse 결과를 확인한 뒤 별도 작업으로 분리한다.

## Architecture

### 즉시 렌더링

`PortfolioPage`와 `StockDetailPage`는 서버에서 fixture 기반 데이터를 완성한 뒤 client component로 전달한다. 따라서 `AccountSummaryClient`, `StockListClient`, `StockStatusClient`, `StockDetailGraphClient`는 처음부터 전달된 데이터를 렌더링한다. 데이터가 누락된 경우에만 skeleton을 fallback으로 사용한다.

`0`은 유효한 금액·수익률이므로 truthy 검사로 skeleton을 결정하지 않는다. `undefined`와 `null`만 데이터 없음으로 취급한다.

### 차트 드래그

`PriceHandle`은 pointer move가 여러 번 발생해도 한 animation frame에 한 번만 부모의 목표 가격 변경을 요청한다. 가장 최근 chart Y 좌표를 ref에 보관하고 `requestAnimationFrame` callback에서 `PriceChart`가 `coordinateToPrice`, 범위 제한, 소수 둘째 자리 반올림을 수행한다.

pointer up과 component unmount 시 예약된 frame은 취소한다. pointer up은 마지막 좌표를 한 번 반영한 뒤 기존 `onTargetPriceCommit`을 호출해 모달 흐름을 유지한다.

### Motion feature bundle

현재 컴포넌트는 hover, tap, opacity, translate, AnimatePresence만 사용한다. Motion의 drag 또는 layout 기능을 사용하지 않으므로 `src/lib/feature.ts`에서 `domAnimation`을 export한다. `LazyMotion`의 strict 모드는 유지해 무거운 `motion` import가 다시 들어오는 것을 막는다.

## Data Flow

```text
Server data -> client component props -> visible content immediately

pointer move -> latest Y ref -> requestAnimationFrame -> price clamp/round
             -> targetPrice state -> price line + accessible handle
pointer up   -> flush latest Y -> open existing save modal
```

## Error Handling and Compatibility

- 데이터가 없는 경우 기존 skeleton 또는 빈 차트 안내를 유지한다.
- `requestAnimationFrame`을 Jest 환경에서 제어할 수 있게 test double을 사용한다.
- `requestAnimationFrame`이 없는 비브라우저 환경에서는 기존과 같은 동기 처리 fallback을 제공한다.
- 핸들 키보드 조작, target price commit, current-price marker의 동작은 변경하지 않는다.

## Verification

- 렌더 테스트: 데이터가 있는 초기 render에서 실제 금액·목록·상세 그래프가 즉시 표시된다.
- 경계 테스트: `0` 금액/수익률도 정상 콘텐츠로 표시된다.
- 차트 테스트: 같은 frame의 연속 pointer move가 최신 가격 한 번으로 반영되고, pointer up 시 예약 변경이 반영된 뒤 commit된다.
- 회귀 테스트: 기존 핸들 키보드/드래그와 current-price marker 테스트를 유지한다.
- 전체 검증: `npm run test -- --runInBand`, `npm run lint`, `npm run build`, `npm run lighthouse`.

## Commit Boundaries

1. `perf: render server-provided data immediately`
2. `perf: throttle chart target-price updates`
3. `perf: use Motion domAnimation feature bundle`

각 커밋은 테스트와 린트를 통과한 독립적인 되돌림 단위로 유지한다. 전체 작업 종료 시 production build와 Lighthouse를 실행해 baseline 대비 성능 회귀가 없는지 확인한다.
