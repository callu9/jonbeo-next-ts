# Price Handle Frame Throttle Design

## Goal

차트 목표가 핸들을 드래그할 때 같은 animation frame 안의 pointer move를 한 번으로 합쳐 불필요한 React state·차트 업데이트를 줄인다.

## Scope

- `PriceHandle`은 pointer move의 마지막 `clientY`를 ref에 저장한다.
- 예약된 animation frame이 없을 때만 frame callback을 예약한다.
- frame callback은 마지막 좌표를 `onChangeY`로 반영한다.
- pointer up은 예약 frame을 취소하고 저장된 마지막 좌표를 즉시 반영한 뒤 `onCommit`을 한 번 호출한다.
- unmount 시 예약 frame과 pending 좌표를 정리한다.
- test는 여러 pointer move가 한 frame에 하나의 변경만 만들고, pointer up이 마지막 좌표를 잃지 않는 것을 검증한다.

## Non-goals

- chart price calculation, keyboard 이동, slider ARIA, modal 호출, 시각 디자인 변경
- Lighthouse LCP 개선 주장
- 서버 데이터 즉시 렌더, Motion bundle, P0/P2 실험 포함

## Architecture

`pendingClientYRef`가 최신 pointer 좌표를 가진다. `rafRef`가 비어 있을 때만 `requestAnimationFrame`을 예약하고, callback과 pointer up은 같은 `flushPendingChange` helper를 사용한다. 이 helper는 예약을 취소하고 ref를 비운 뒤 최신 좌표를 chart coordinate로 변환해 전달한다.

따라서 드래그 중에는 화면 갱신이 frame rate를 넘지 않고, release 순간에는 아직 frame callback이 실행되지 않았어도 마지막 drag 위치가 commit 전에 반영된다.

## Verification

- 빠른 두 pointer move 뒤 frame callback 하나만 실행해 마지막 좌표가 전달되는지 확인한다.
- 예약된 frame이 남은 상태의 pointer up이 마지막 좌표를 반영하고 `onCommit`을 정확히 한 번 호출하는지 확인한다.
- `npm run lint`, `npm test -- --runInBand`, `npm run build`가 모두 통과해야 한다.
- PR은 `dev`를 base로 하며 P1 폰트 서브셋과 이 상호작용 변경만 포함한다.
