# Jonbeo-Next-TS

증권 MTS 서비스 Next.js + TS 프로젝트입니다. <br />
인프런 [[프레이머를 활용하여 쉽고 간단하게 프로토타입 제작하기]](https://www.inflearn.com/course/%ED%94%84%EB%A0%88%EC%9D%B4%EB%A8%B8-%ED%94%84%EB%A1%9C%ED%86%A0%ED%83%80%EC%9E%85?srsltid=AfmBOookQGlafkwMRnh_wKKB7wmmUmOV5Gvb_Ax00QySR1xlO8eF5FCY) 강의를 기반으로
Framer Motion을 사용한 인터렉션 구현을 목표로 합니다.

## Design 🧑‍🎨

- [Framer](https://framer.com/projects/xFiRc8OAux01S6z56OMj-ephJU)
- [Figma](https://www.figma.com/file/YKbkOiYWBVSNfUZXQY6ENP/jonbeo)

## Getting Started 🚀

```bash
npx msw init public --save
npm run server:portfolio
npm run server:stocks
npm run dev
```

## Goals 🥅

- [ ] Framer Motion을 사용한 인터렉션 구현
- [ ] BFF 구현을 통한 mock API 개발
- [ ] MTS 서비스 차트 구현

## Results 📸

## Folder Structure 📁

```
public/
|   +-- icons/
|   +-- fonts/
src/
+-- apis/  (mock API BFF)
|   +-- client.ts
+-- app/
|   +-- globals.css
|   +-- layout.ts
|   +-- page.ts
+-- components/ (reusable UI components)
|   +-- Icon.tsx
|   +-- Button.tsx
|   +-- ...
+-- hooks/
+-- mocks/
+-- providers/
+-- types/
+-- utils/
.
.
.
```

## Convention

### 1) Naming Conventions 📝

- variable, function: camelCase
- constant variable: SCREAMING_SNAKE_CASE
- class, component name: PascalCase
- folder name, route path: nocase
- html tag properties (ex. className, id etc.): skewer-case

#### 📚 참고

[**Airbnb JavaScript Style Guide**](https://github.com/airbnb/javascript)

```
1. Avoid single letter names. Be descriptive with your naming.
  1-1. Also, Avoid Mental Mapping.

2. Use camelCase when naming objects, functions, and instances.

3. Use PascalCase only when naming constructors or classes. (also file name)

...
```

### 2) Commit Messages 💬

| 태그         | 설명                                                                          |
| ------------ | ----------------------------------------------------------------------------- |
| `feat: `     | 기능 추가                                                                     |
| `fix: `      | 버그를 고친 경우 🛠                                                           |
| `docs: `     | 문서를 수정한 경우 📝                                                         |
| `style: `    | CSS 등 사용자 UI 디자인 변경 🎨                                               |
| `refactor: ` | 프로덕션 코드 리팩토링 🧑‍🔧                                                     |
| `test: `     | 테스트 코드 추가 또는 수정 🧪                                                 |
| `chore: `    | 빌드 태스트 업데이트, 패키지 매니저를 설정하는 경우 (프로덕션 코드 변경 X) ⚙️ |
| `rename: `   | 파일 혹은 폴더명을 수정하거나 옮기는 작업만인 경우 ✍️                         |
| `remove: `   | 파일을 삭제하는 작업만 수행한 경우 🗑️                                         |

## Styling Library 🎨

### 1. TailwindCSS

### 2. Framer Motion

#### 2-1. 왜 Framer Motion을 썼을까?

번들사이즈가 큰 편이다
https://bundlephobia.com/package/framer-motion@7.2.0

번들사이즈가 크다는 오해
https://motion.dev/docs/react-reduce-bundle-size

#### 2-2. Framer Motion 최적화
