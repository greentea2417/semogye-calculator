# 세모계 블로그 새 글 등록 안내

이 문서는 세모계 블로그의 Markdown 게시물 작성 방법을 설명합니다. 글은 `content/blog/`에 `.md` 파일 하나를 추가하는 방식으로 관리합니다. **실제 기사처럼 보이는 테스트 글이나 출처를 확인하지 않은 내용은 `status: published`로 공개하지 마세요.**

## 1. 새 파일 만들기

프로젝트를 연 뒤 `content/blog/` 폴더에서 새 파일을 만들고, 파일 이름은 영문 소문자와 하이픈으로 정합니다.

```text
content/blog/my-new-post.md
```

`slug`도 파일명과 같게 작성하세요. 파일명은 정리 편의를 위한 것이고, 실제 주소는 `/blog/<slug>`입니다. 게시물 초안은 먼저 `status: "draft"`로 시작합니다.

## 2. 아래 frontmatter 복사해서 채우기

파일 맨 위의 `---` 사이에 글 정보를 적고, 두 번째 `---` 다음부터 Markdown 본문을 작성합니다.

```yaml
---
title: "글 제목"
slug: "my-new-post"
description: "검색 결과와 글 목록에 표시할 짧은 요약입니다."
category: "economy"
contentType: "explainer"
publishedAt: "2026-10-21"
updatedAt: "2026-10-21"
image: null
imageAlt: null
imageCredit: null
sources:
  - label: "자료를 제공한 공식 기관"
    url: "https://example.org/source"
relatedCalculator: null
status: "draft"
---

본문을 여기에 Markdown으로 작성합니다.
```

`example.org`는 형식 예시일 뿐입니다. 게시 전 실제 출처 URL로 바꾸거나 출처가 없는 경우 `sources: []`로 적으세요.

## 3. 항목 설명

| 항목 | 입력 기준 |
| --- | --- |
| `title` | 독자가 이해할 제목. 필수 |
| `slug` | 영문 소문자·숫자·하이픈. 기존 글과 중복 금지 |
| `description` | 검색/목록에 표시할 요약. 필수 |
| `category` | 아래 중 하나: `economy`(경제·금융), `policy`(정부 정책), `life`(사회·생활), `health`(건강·의학), `entertainment`(연예), `sports`(스포츠) |
| `contentType` | 뉴스는 `news`, 해설·생활정보는 `explainer` |
| `publishedAt`, `updatedAt` | `YYYY-MM-DD` 형식의 실제 달력 날짜로 입력합니다. 예: `2026-10-21`. 수정일은 발행일보다 빠를 수 없습니다. |
| `image` | 직접 권한을 확인한 로컬 파일 경로. 예: `/blog/my-image.webp`. 없으면 `null` |
| `imageAlt` | 이미지의 내용을 설명하는 대체 텍스트. 이미지가 있을 때 필수 |
| `imageCredit` | 촬영자·기관·라이선스 등 출처/권리 표시. 이미지가 있을 때 필수 |
| `sources` | `{ label, url }` 목록. 출처가 없으면 `[]`; 출처 URL은 HTTP(S)여야 합니다. |
| `relatedCalculator` | 관련 글에만 계산기 객체를 지정. 없으면 `null`. 허용 계산기 URL만 사용할 수 있습니다. |
| `status` | 검수 중에는 `draft`, 승인 후 공개할 때만 `published` |

이미지 파일은 `public/blog/` 폴더 안에 둡니다. 외부 이미지 URL을 직접 넣지 않고, 권리 확인이 끝난 이미지만 사용하세요. 본문 Markdown 이미지도 `/blog/` 아래의 존재하는 로컬 파일만 허용합니다.

계산기 연결 형식:

```yaml
relatedCalculator:
  href: "/business/loan"
  title: "내 대출 이자는 얼마일까요?"
  description: "대출금과 금리, 기간을 입력하고 예상 상환금을 확인해 보세요."
  cta: "대출 이자 계산하기"
```

현재 허용된 경로는 `/business/loan`, `/business/net-salary`, `/business/vat`, `/business/annual-days`, `/unemployment`입니다. 글 주제와 직접 관련될 때만 사용하세요.

## 4. 본문 Markdown 작성

표준 Markdown의 제목(`##`, `###`), 굵게/기울임, 링크, 순서·비순서 목록, 인용문을 사용할 수 있습니다. 표는 GitHub Flavored Markdown 표 형식으로 작성합니다.

```markdown
## 소제목

핵심 문장은 **굵게** 표시할 수 있습니다. [공식 안내](https://기관의-실제-주소) 링크도 지원합니다.

- 첫 번째 항목
- 두 번째 항목

> 출처가 확인된 인용문만 인용하고, 출처를 함께 표시하세요.

| 구분 | 내용 |
| --- | --- |
| 예시 항목 | 실제 확인한 내용 |

![이미지 설명](/blog/my-image.webp)
```

외부 링크는 새 탭으로 열리고 안전 속성이 적용됩니다. 내부 링크는 사이트 내 이동으로 렌더링됩니다.

## 5. 검수와 공개

1. 초안 작성 시 `status: "draft"`를 유지합니다.
2. 제목·날짜·카테고리·출처·이미지 사용 권리·계산기 URL을 확인합니다.
3. 프로젝트 폴더에서 `npm run build`를 실행합니다. 오류가 나오면 터미널에 표시된 파일명과 항목을 고친 뒤 다시 실행합니다.
4. 글의 사실과 출처를 사람이 검수합니다. 빌드 성공은 문법·필드 검증 통과를 뜻할 뿐, 내용의 사실 확인을 대신하지 않습니다.
5. 검수가 끝난 글만 `status: "published"`로 바꿉니다. 이 상태의 글은 해당 배포에서 방문자에게 공개될 수 있습니다.
6. 공개 글만 목록·상세 페이지·sitemap에 포함됩니다. 공개 글이 하나도 없으면 `/blog`는 `noindex`이며 sitemap에서도 제외됩니다.

초안은 공개 페이지에서 열리지 않으며 sitemap에도 나오지 않습니다. 테스트 초안 `content/blog/markdown-workflow-draft-test.md`는 기능 검증용이므로 계속 `draft`로 두세요.

### Preview 배포 참고

Vercel Preview 환경에서는 사이트 전체에 `noindex, nofollow`가 적용됩니다. `robots.txt`는 크롤러의 접근을 막지 않아 검색로봇이 `noindex` 메타를 읽을 수 있게 하고, sitemap 주소는 제출하지 않습니다. 이는 검색엔진 색인 방지 설정이지 비밀번호 보호가 아닙니다. Preview URL 접근을 제한해야 한다면 Vercel 프로젝트의 Deployment Protection 설정도 별도로 확인하세요. 이 문서와 저장소 파일만으로는 계정의 Deployment Protection 설정 여부를 확인할 수 없습니다.
