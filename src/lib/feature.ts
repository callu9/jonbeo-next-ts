// src/lib/feature.ts

/**
 * LazyMotion 컴포넌트로 감싸고 필요한 기능 (features) 전달하기 위한 feature 파일
- domAnimation: hover, focus, transition, animate 등 일반적인 애니메이션 기능
- domMax: domAnimation 기능을 포함한 드래그, 레이아웃 등 추가 애니메이션 기능

💡 motion` 컴포넌트는 필요하지 않은 기능도 모두 번들에 포함하기 때문에 더 무겁다.
 */

import { domAnimation } from "motion/react";

export default domAnimation;
