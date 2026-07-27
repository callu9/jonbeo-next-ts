# Framer Motion and Performance

## 왜 Motion을 선택했나

이 프로젝트는 주식 포트폴리오의 수치 전환, 목록 입력 피드백, 평단가 저장 모달처럼 상태 변화가 화면에 자연스럽게 이어지는 경험을 목표로 한다. Motion은 선언형 `animate`, `whileHover`, `whileTap`, `AnimatePresence`를 제공하므로 전환 상태와 exit 애니메이션을 컴포넌트 가까이에서 관리할 수 있다.

단, 애니메이션 라이브러리는 클라이언트 JavaScript와 실행 비용을 추가한다. 따라서 모든 CSS 효과를 Motion으로 치환하지 않고, 상태 전환이나 입출력 애니메이션처럼 JavaScript 제어가 필요한 상호작용에만 사용한다.

## 적용한 번들 최적화

### LazyMotion과 경량 motion 컴포넌트

`src/providers/LazyMotionProvider.tsx`는 `LazyMotion`으로 기능 로더를 분리하고, 애니메이션 컴포넌트는 `motion/react-m`에서 가져온다. 이렇게 하면 Motion 전체 기능을 초기 번들에 포함하는 대신 필요한 feature bundle을 별도 청크로 불러올 수 있다.

```tsx
const loadFeatures = () => import("@/lib/feature").then((res) => res.default);

<LazyMotion features={loadFeatures} strict>{children}</LazyMotion>
```

현재 feature bundle은 `domMax`를 사용한다. 이는 일반 애니메이션 외에 drag와 layout 기능도 포함한다. 프로젝트에서 drag·layout 기능이 필요 없다고 확인되면 `domAnimation`으로 낮추는 것이 다음 번들 최적화 후보이다.

### 기록된 번들 크기 변화

과거 개발 환경 Network 측정에서는 다음 변화가 기록됐다.

| Route | Before | After |
| --- | ---: | ---: |
| Portfolio | 478 kB | 203 kB |
| Stock detail | 590 kB | 314 kB |

이 값은 적용 방향을 확인하는 참고 자료다. 개발 서버 청크와 production 청크는 다르므로 배포 성능의 기준값으로 사용하지 않는다.

## Motion과 성능 지표의 관계

Motion이 Core Web Vitals를 직접 결정하지는 않는다. 다만 추가 JavaScript는 다음 경로를 통해 영향을 줄 수 있다.

1. 다운로드할 JavaScript가 늘면 느린 네트워크에서 필요한 코드의 도착이 늦어진다.
2. JavaScript 파싱·컴파일·하이드레이션이 길어지면 메인 스레드가 바빠져 입력 처리와 렌더링이 늦어질 수 있다.
3. 초기 화면에 필요하지 않은 모달·그래프·feature bundle을 함께 로드하면 LCP 후보 콘텐츠가 늦게 준비될 수 있다.

따라서 bundle 크기 축소는 FCP, LCP, INP 개선 가능성을 높이지만 개선 폭은 서버 응답, 이미지, 폰트, 렌더링 구조와 함께 production 환경에서 측정해야 한다.

## 측정 원칙

- `next dev` 결과는 개발 컴파일 비용을 포함하므로 production baseline으로 사용하지 않는다.
- `next build`와 `next start`로 실행한 뒤 Lighthouse를 측정한다.
- `/`와 `/stocks/AAPL`을 같은 조건에서 여러 번 실행하고 중앙값을 비교한다.
- 번들 크기, LCP, TBT/INP를 함께 보고 한 지표만으로 결론 내리지 않는다.

현재 production Lighthouse 구성과 초기 렌더 개선 내용은 [Performance refactoring report](./performance-refactoring.md)에서 확인할 수 있다.
