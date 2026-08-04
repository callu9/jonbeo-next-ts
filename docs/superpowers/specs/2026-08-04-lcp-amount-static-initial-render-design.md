# LCP Amount Static Initial Render Design

## Goal

초기 LCP 후보인 큰 금액을 서버와 첫 hydration에서 정적으로 표시하고, 통화 단위가 실제로 변경될 때만 기존 Motion 전환을 실행해 render delay를 줄인다.

## Scope

- `AmountTransition`의 첫 표시 경로만 변경한다.
- 원화/달러 전환 시 기존 방향별 진입·exit animation을 유지한다.
- 폰트 서브셋화와 차트 지연 로드는 이 작업에 포함하지 않는다.

## Design

`AmountTransition`은 초기 render에서 `fontStyle`을 적용한 일반 `span`을 반환한다. 이 경로에는 Motion component, transform, opacity transition을 적용하지 않는다.

mount가 완료된 뒤에는 현재 단위와 직전 단위를 비교한다. 단위가 변경된 경우에만 `AnimatePresence` 안의 `motion.span`을 렌더링하고, 기존 `multiplier`와 `durSec`으로 진입·exit 방향을 결정한다. 단위가 바뀌지 않은 일반 부모 재렌더에서는 정적 `span`을 유지한다.

## State Flow

```text
SSR / first hydration -> static span
same unit re-render   -> static span
unit toggle           -> motion span with existing enter / exit transition
```

## Tests

- 서버 markup에 초기 금액이 정적 span으로 존재하고 Motion transform을 포함하지 않는다.
- 단위 변경 전 재렌더는 Motion 전환을 시작하지 않는다.
- 달러→원과 원→달러 모두 기존 multiplier 방향을 사용한다.
- `AmountTransition`의 기존 소비자(`AmountStatus`, `StockListItem`)가 동일한 id, class, 금액 텍스트를 유지한다.

## Measurement

- production Lighthouse로 `/`, `/stocks/AAPL`을 각 3회 측정한다.
- Performance, FCP, LCP, TBT, CLS의 중앙값을 이전 baseline과 비교한다.
- LCP가 유의미하게 개선되지 않으면 Motion이 아닌 Pretendard font 전송량을 다음 가설로 검증한다.

## Non-goals

- UI 카피, 금액 포맷, 단위 store API 변경
- Motion 라이브러리 제거
- Lighthouse assertion threshold 변경
