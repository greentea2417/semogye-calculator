---
title: "Markdown 게시 흐름 테스트용 초안 — 공개 금지"
slug: "markdown-workflow-draft-test"
description: "콘텐츠 시스템 검증을 위한 내부 테스트 문서입니다. 실제 기사나 정보 콘텐츠가 아닙니다."
category: "life"
contentType: "explainer"
publishedAt: "2026-01-01"
updatedAt: "2026-01-01"
image: "/blog/markdown-draft-test.svg"
imageAlt: "세모계 Markdown draft 렌더링 테스트용 그래픽"
imageCredit: "세모계 자체 제작 테스트 그래픽 — 공개 게시물 아님"
sources: []
relatedCalculator:
  href: "/business/loan"
  title: "Markdown 렌더링 확인용 계산기 카드"
  description: "이 문서는 draft이므로 실제 공개 페이지에 노출되지 않습니다."
  cta: "대출 이자 계산기 확인"
status: "draft"
---

> 내부 검증 전용 초안입니다. 실제 기사·정책·생활정보로 인용하거나 공개하지 마세요.

## 제목과 문단 테스트
이 문서는 **굵은 글씨**, *기울임*, 일반 링크와 문단 구성을 검사합니다. [대출 계산기](/business/loan)는 실제 존재하는 세모계 계산기 경로입니다.

### 목록 렌더링 테스트
- 초안은 공개 목록에서 제외
- 초안 URL은 sitemap에서 제외
- 발행 전 출처와 사실 확인 필요

1. frontmatter 검증
2. Markdown 렌더링
3. 공개 상태 필터링

### 표 렌더링 테스트
| 항목 | 예상 결과 |
| --- | --- |
| 제목 | 표시 |
| 표 | GFM 표로 렌더링 |
| 공개 여부 | draft라 비공개 |

### 인용문 렌더링 테스트
> 이 문구는 기사 인용문이 아니라 Markdown 렌더링 테스트 문장입니다.

### 이미지 렌더링 테스트
![테스트용 세모계 그래픽](/blog/markdown-draft-test.svg)
