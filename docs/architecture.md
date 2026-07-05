---
title: 아키텍처
updated: 2026-06-21
---

# 아키텍처

개인 노트/블로그 사이트입니다. 마크다운 콘텐츠를 외부에서 작성해 저장소로 동기화한 뒤 정적 페이지로 렌더링합니다.

## 스택

- **Next.js 16** (App Router, Turbopack)
- **React 19**
- **Tailwind v4** (`@theme`로 테마 정의, `tailwind.config` 없음)
- **MDX** (`@next/mdx`) — 콘텐츠
- **TypeScript** (strict, `typedRoutes` 활성)
- **pnpm**

## 디렉터리 구조

```
src/
  mdx-components.tsx          MDX 요소 레지스트리 (Next.js 관례 — src 루트에 유지)
  app/
    _shared/                 모든 비라우트 코드의 단일 거처 (언더스코어 = 서브트리 전체 private)
      components/
        mdx/                 마크다운 요소 렌더러 (code, callout, image, ...)
        post-layout.tsx      여러 라우트가 공유하는 페이지 셸
        mdx-layout.tsx
      lib/                   cn, date, get-posts, highlight-code, image
      styles/                markdown-*.css, vague.css
      content/               blog/*.mdx, note/*.mdx  (동기화 타깃)

    (home)/                  route group → URL "/"
      page.tsx               서버 컴포넌트
      menu.ts                메뉴 데이터
      _components/           home 전용 UI (banner, menu, status-line, ...)
    @breadcrumbs/            parallel route slot
      _components/arrow-left.tsx
    about/  sitemap/         단일 라우트
    blog/  blog/[slug]/      목록 + 글
    note/  note/[slug]/
    layout.tsx  globals.css  루트 엔트리
```

## 라우팅 모델

App Router는 `app/` 폴더 트리에서 라우트를 해석합니다. 폴더 종류는 마커로 구분합니다:

| 마커 | 의미 | 예시 |
| --- | --- | --- |
| 일반 폴더 | 라우트 세그먼트 | `about/`, `blog/` |
| `(name)` | route group — URL 세그먼트 없이 파일을 묶음 | `(home)/` → `/` |
| `@name` | parallel route slot | `@breadcrumbs/` |
| `_name` | private 폴더 — 라우팅에서 제외 (서브트리 전체 적용) | `_shared/`, `_components/` |

`(home)`은 홈 페이지와 그 구성 요소를 묶으면서 URL은 `/`로 유지합니다. `@breadcrumbs` parallel slot과도 충돌 없이 공존합니다(빌드로 검증).

## 공용 코드 vs 콜로케이션

- **여러 라우트가 공유** → `src/app/_shared/` (`@/shared/*` 별칭으로 import).
- **단일 라우트 전용** → 해당 라우트의 `_components/` (예: `(home)/_components`, `@breadcrumbs/_components`).

`_shared`의 언더스코어를 통해 그 하위 폴더(`components`, `lib`, `styles`, `content`)는 개별 prefix 없이 이름을 유지합니다.

## 콘텐츠 파이프라인

1. 마크다운은 외부 wiki에서 작성하고, `pnpm sync`(로컬 Google Drive 마운트) 또는 `pnpm drive:sync`(Google Drive API)로 `src/app/_shared/content/{blog,note}/`에 동기화합니다.
2. `_shared/lib/get-posts.ts`가 그 폴더를 읽습니다(경로가 하드코딩되어 있으니 동기화 스크립트와 함께 맞춰야 합니다).
3. `blog/[slug]`와 `note/[slug]`가 `.mdx`를 동적 import 해서 `PostLayout` + `MdxLayout`으로 감쌉니다.
4. `src/mdx-components.tsx`가 마크다운 요소를(그리고 `Callout`, `Blockquote`, `ImageGrid`, `Fonts`를) `_shared/components/mdx/`의 렌더러에 매핑합니다.

> 콘텐츠 `.mdx`는 외부 소스에서 동기화됩니다. 콘텐츠 안에 박힌 앱 경로(예: 컴포넌트 import)는 **소스 원본도 함께 고쳐야** 하며, 그렇지 않으면 다음 동기화 때 되살아납니다.

## 테마

테마는 향후 변경될 가능성이 높지만 우선 아래 내용을 참고합니다.

"vague" 팔레트는 `_shared/styles/vague.css`에 Tailwind `@theme` 블록으로, `--color-vague-*` 네임스페이스에 정의됩니다. 여기서 `bg-vague-bg` / `text-vague-accent` 같은 유틸리티가 생성됩니다. `globals.css`가 이를 import 합니다. UI는 어둡고 모노스페이스인 TUI 지향 미감입니다.

## 별칭 & 타입드 라우트

- `@/shared/*` → `src/app/_shared/*` (공용 코드)
- `@/*` → `src/*` (그 외 전부)
- `typedRoutes: true` — `href` 값이 실제 라우트에 대해 타입 체크됩니다. 캐스팅하지 말고 링크 전에 페이지를 먼저 추가하세요.
