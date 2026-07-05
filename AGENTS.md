---
title: 에이전트 가이드
updated: 2026-06-21
---

# 에이전트 가이드

저장소 전체에 적용됩니다.

## 먼저 읽기

- **[docs/architecture.md](docs/architecture.md)** — 스택, 디렉터리 구조, 라우팅, 콘텐츠 파이프라인, 테마
- **[docs/conventions.md](docs/conventions.md)** — 코드 배치와 작성 방식

구조·라우팅·공용 코드를 건드리기 전에 먼저 읽으세요.

## 핵심 규칙

- 모든 `className` 값은 `@/shared/lib/cn`의 `cn(...)`으로 감쌉니다.
- 원시 Tailwind 클래스 문자열을 `className`에 직접 넘기지 않습니다. 템플릿 문자열로 클래스를 조합하지 말고 `cn(...)`만 사용합니다.
- 비라우트 폴더는 `_`를 붙입니다. 공용 코드 → `src/app/_shared/`, 단일 라우트 코드 → 그 라우트의 `_components/`에 콜로케이션. 공용 모듈은 `@/shared/*` 별칭으로 import.
- 기본은 서버 컴포넌트, `'use client'`는 leaf로 밀어냅니다.
- 변경은 작게, 인근 파일의 기존 패턴과 일관되게 유지합니다.

## 임시 규칙

- 생성된 `vague-*` Tailwind 유틸리티를 사용합니다(테마 토큰은 `src/app/_shared/styles/vague.css`). hex를 하드코딩하지 않습니다.

## 명령어

- `pnpm dev` — 로컬 개발 서버
- `pnpm build` — 프로덕션 빌드 (타입드 라우트 + MDX 검증 포함)
- `pnpm lint` / `pnpm lint:fix`
- `pnpm test` — vitest
- `pnpm sync`(로컬 Google Drive 마운트) / `pnpm drive:sync`(Drive API) — `src/app/_shared/content` 채우기

## 검증

- 사소하지 않은 변경 후에는 마쳤다고 보기 전에 `pnpm lint`와 `pnpm build`를 실행합니다.
