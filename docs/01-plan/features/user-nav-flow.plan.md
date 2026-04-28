---
feature: user-nav-flow
phase: plan
created: 2026-04-27
status: in-progress
---

## Executive Summary

| 관점 | 내용 |
|------|------|
| **문제** | user/ 프로토타입 7개 파일이 존재하나 href가 구버전 파일명(`user1.html`, `user-my.html` 등)을 참조하거나 아예 비어 있어 클릭 시 404 발생 |
| **솔루션** | 실제 파일명으로 전면 수정 + 미연결 카드·버튼에 링크 추가 |
| **기능/UX 효과** | home → category → course-list → course-detail → (enrolled/completed) → my 전 플로우를 클릭으로 탐색 가능 |
| **핵심 가치** | 고객사 데모 및 내부 검토 시 사용자 흐름 전체를 프로토타입으로 체험 가능 |

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | 프로토타입이 완성되어 있어도 링크가 끊겨 있으면 데모 불가. 고객사 스펙 검토 전에 플로우 연결 필수 |
| **WHO** | 기획팀(데모), 개발팀(구현 참조), 영업팀(고객사 시연) |
| **RISK** | 파일명 일괄 치환 시 의도치 않은 URL 변경 — 파일별 수동 확인 필요 |
| **SUCCESS** | 7개 파일 모두 클릭 시 404 없이 이동, 핵심 플로우(홈→신청→수강→완료) 완전 동작 |
| **SCOPE** | `user/` 폴더 7개 HTML 파일. 서버 API·백엔드 연동 제외 |

## 1. 파일명 불일치 현황

| 잘못된 참조명 | 실제 파일명 | 사용 위치 |
|-------------|-----------|---------|
| `user1.html` | `course-detail.html` | home, category, course-list |
| `user1.html?status=enrolled` | `course-enrolled.html` | home, course-list |
| `user1-enrolled.html` | `course-enrolled.html` | course-detail, my |
| `user1-completed.html` | `course-completed.html` | home, course-list, my |
| `user-my.html` | `my.html` | home, category, course-enrolled |
| `course-list-badges.html` | `course-list.html` | category |

## 2. 미연결 링크 추가 항목

| 파일 | UI 요소 | 연결 대상 |
|------|---------|---------|
| home.html | 추천 코스 카드 3개 | `course-detail.html` |
| home.html | 더보기 버튼 (섹션별) | `course-list.html` or `category.html` |
| category.html | 온라인 카테고리 카드 10개 | `course-list.html` |
| category.html | PLUS 코스 카드 4개 | `course-list.html` |
| course-list.html | 시작전·예정·종료 카드 3개 | `course-detail.html` |
| my.html | "코스 탐색하기" 버튼 | `category.html` |

## 3. 성공 기준

- [ ] 모든 `user1.html` 참조 → `course-detail.html`로 수정
- [ ] 모든 `user1-enrolled.html` 참조 → `course-enrolled.html`로 수정
- [ ] 모든 `user1-completed.html` 참조 → `course-completed.html`로 수정
- [ ] 모든 `user-my.html` 참조 → `my.html`로 수정
- [ ] `course-list-badges.html` 참조 → `course-list.html`로 수정
- [ ] 추천 코스·카테고리 카드 클릭 시 이동 동작
- [ ] 홈→목록→상세→수강중→완료→MY 전체 플로우 클릭 연결
