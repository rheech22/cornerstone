---
title: 컨벤션
updated: 2026-06-21
---

# 컨벤션

이 저장소에서 코드를 어떻게 구성하고 작성하는지에 대한 규칙입니다. 배경(왜)은 [architecture.md](architecture.md)를 참고하세요.

## 폴더 & 파일 배치

- **라우트**는 일반 폴더, route group은 `(name)`, parallel slot은 `@name`을 사용합니다.
- **라우트가 아닌 모든 폴더는 `_`를 붙입니다** (Next.js private folder). 마커만 봐도 라우팅에 참여하는지 한눈에 알 수 있습니다.
- **여러 라우트가 공유** → `src/app/_shared/{components,lib,styles,content}`.
- **단일 라우트 전용** → 그 라우트의 `_components/`에 콜로케이션 (`_shared`로 승격하지 않음).
- 서브시스템은 응집도로 묶습니다: MDX 요소 렌더러는 `_shared/components/mdx/`에 함께 둡니다.

## Import

- 공용 모듈은 깊은 상대경로 대신 **`@/shared/*` 별칭**으로 import (`@/shared/lib/cn`, `@/shared/components/mdx/callout`).
- 같은 기능 폴더 안에서는 상대경로 OK (`./_components/menu`, `../menu`).
- import는 자동 정렬됩니다(`simple-import-sort`). 필요하면 `pnpm lint:fix` 실행.

## 컴포넌트

- 네임드 화살표 함수 export: `export const Banner = () => ...`.
- 클래스는 `@/shared/lib/cn`의 `cn()`으로 조합합니다.
- **주석을 달지 않습니다.** 이름으로 의도를 드러내고 간결하게 유지합니다.
- 재사용 가능한 형태(예: 다형적 link/button)는 그 자리에서 추상화하고, 두 번째 라우트가 필요로 할 때 비로소 `_shared`로 추출합니다.

## 클라이언트/서버 경계

- 기본은 서버 컴포넌트입니다. 훅이나 상호작용이 필요한 곳에만 `'use client'`를 붙이고, **leaf로 밀어냅니다** — 예: 상태는 `(home)/_components/menu.tsx`에 두어 `page.tsx`·`banner`·`status-line`은 서버 컴포넌트로 유지합니다.

## 접근성

- **링크와 버튼은 구분하고 절대 중첩하지 않습니다.** 이동 → `<Link>`(`<a>`), 동작 → `<button>`. "링크 버튼"은 버튼처럼 스타일링한 링크(공통 클래스 공유)이지, `<a>`로 `<button>`을 감싸는 게 아닙니다.
- 토글은 disclosure 패턴을 씁니다: `aria-expanded` + `aria-controls`, 닫혔을 때 패널은 `hidden`.

## 테마

- 생성된 **`vague-*` Tailwind 유틸리티**를 사용합니다(`bg-vague-bg`, `text-vague-accent`, ...). 컴포넌트에 hex를 하드코딩하지 않습니다.
- 팔레트는 `_shared/styles/vague.css`(`@theme`)에 중앙 관리됩니다. 색은 거기서 바꿉니다.

## 타입드 라우트

- `href` 값은 타입 체크됩니다. 링크 전에 대상 페이지를 먼저 추가하고, `as Route` 캐스팅을 피합니다.

## 콘텐츠 작성

- MDX 렌더러는 `src/mdx-components.tsx`에 전역 등록되어 있으니, 콘텐츠에서는 `<Callout>`, `<Blockquote>` 등을 **import 없이** 바로 사용하는 것을 권장합니다.
- `.mdx` 안에 앱 경로를 하드코딩하지 않습니다(콘텐츠는 외부 소스에서 동기화되므로, 박힌 경로는 다음 동기화 때 깨집니다).

## 검증

- 변경을 마쳤다고 보기 전에 `pnpm lint`와 `pnpm build`를 실행합니다. 빌드는 타입드 라우트와 MDX 콘텐츠 컴파일까지 검증합니다.
