---
title: 콘텐츠 작업
updated: 2026-10-24
---

# 콘텐츠 작업

블로그·노트 글을 고치거나 미디어를 붙일 때의 절차입니다. 파이프라인 구조는 [architecture.md](architecture.md#콘텐츠-파이프라인)를 참고하세요.

## 원본과 동기화

- 글의 원본은 외부 위키(Google Drive)에 있습니다. **실제 경로는 저장소에 기록하지 않습니다.** 로컬 동기화 스크립트(`sync_gdrive_local.sh`)는 gitignore되어 있습니다.
- 위키의 `blog/`는 `src/app/_shared/content/blog/`로, `zt/literature/`는 `src/app/_shared/content/note/`로 동기화됩니다.
- `src/app/_shared/content/`는 동기화 결과물입니다. 직접 고치면 다음 동기화 때 덮어써지므로 **원본을 고친 뒤 `pnpm sync`** 합니다.
- `pnpm sync`는 `rsync --delete`로 복사하고 `.md`를 `.mdx`로 바꾼 뒤 `git add .`과 백링크 생성까지 실행합니다. 커밋 메시지는 `chore: sync drive content`를 씁니다.
- 원본을 고치기 전에 백업을 남깁니다.

## 초안과 공개

- `draft: "true"`인 글은 프로덕션 빌드에서 빠집니다. 초안은 `pnpm dev`로 확인합니다.
- `draft`를 빼고 푸시하면 배포와 함께 공개됩니다. 푸시 전에 사용자에게 확인합니다.

## 위키 링크

- `[[slug|텍스트]]` 형식입니다. 경로 없는 slug는 **링크를 건 파일의 폴더 기준**으로 해석합니다(블로그 글 안의 `[[vibe-coding]]` → `/blog/vibe-coding`).
- `../zt/literature/slug`는 노트로, `blog:slug`·`note:slug` 접두사는 해당 타입으로 연결됩니다.

## 이미지와 미디어

- 파일은 위키의 `blog/assets/`에 두고 이름은 `YYYY-MM-DD-HH-MM-SS.ext` 형식을 따릅니다.
- 문법은 `![alt | size="200" | caption="설명"](assets/파일)`입니다. 전체 옵션은 블로그의 `components` 글에 있습니다.
- 영상 컴포넌트가 없으므로 영상은 GIF로 변환합니다. 22초 화면 녹화 기준 약 3.5MB입니다.

```bash
ffmpeg -i in.mp4 -vf "fps=10,scale=720:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=4" out.gif
```

- 녹화나 캡처를 구할 수 없으면 자리표시를 남기지 말고 다이어그램으로 대체합니다([writing-guide.md](writing-guide.md#다이어그램)).

## 본문 타이포그래피

- 문단은 양끝 정렬입니다. `word-break: keep-all`은 쓰지 않습니다(남는 공간이 띄어쓰기에 몰려 단어 사이가 벌어짐). `text-justify: inter-character`도 쓰지 않습니다(영문 글자 사이가 벌어짐).
- 대신 `hyphens: auto`와 `rehype-soft-hyphens.mjs`가 camelCase 단어의 대소문자 경계에 soft hyphen을 넣어 긴 영문 식별자도 줄 끝에서 끊기게 합니다.
- 인라인 코드는 `break-all`로 줄바꿈되고, 링크 안의 인라인 코드는 굵기와 색을 링크에 맞춥니다.
