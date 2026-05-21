---
feature: offline-readme
phase: plan
created: 2026-04-27
status: completed
---

# Plan: 오프라인 모듈 통합 README

## Executive Summary

| 관점 | 내용 |
|------|------|
| **문제** | 오프라인 LMS 관련 지식이 10개 이상의 MD 파일에 분산되어 있어 신규 팀원이 전체 그림을 파악하는 데 수 시간 소요 |
| **솔루션** | 오프라인 관련 모든 MD를 분석해 `docs/README.md` 하나로 통합 |
| **기능/UX 효과** | 전 팀(기획/개발/QA/운영/영업) 이 파일 하나만 읽으면 오프라인 모듈 전체 파악 가능 |
| **핵심 가치** | 온보딩 시간 단축, 팀 간 지식 불균형 해소, 결정 로그 단일화 |

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | 분산된 문서로 인한 팀 커뮤니케이션 비용 증가. Phase 2 진입 전 지식 정리 필요 |
| **WHO** | 기획·개발·QA·운영·영업 전 팀 |
| **RISK** | 통합 후 원본 문서와 내용 불일치 시 혼란. 원본 파일은 유지하고 README는 "읽기용" 으로 명시 |
| **SUCCESS** | 12개 섹션 모두 포함, 팀원 1명이 README 만 읽고 오프라인 모듈 전체 이해 가능 |
| **SCOPE** | 오프라인 관련 파일 한정 (00-standard, 01-plan, 02-design, 03-analysis, 04-report 내 offline 파일) |

## 1. 요구사항

### 1.1 포함 섹션 (12개)

| # | 섹션 | 소스 문서 |
|---|------|-----------|
| 1 | Executive Summary | phase1-completion.md |
| 2 | 사용자 정의 | offline-course-planning-supplement.md §2, offline-course-builder.md |
| 3 | 서비스 구조 | offline-course-builder.md §파일구성, §기술스택, §계층구조 |
| 4 | 운영 정책 | offline-course-planning-supplement.md §1 |
| 5 | 사용자 흐름 | offline-course-planning-supplement.md §2 |
| 6 | 기능 명세 | offline-course-builder.md §1~3 |
| 7 | 테스트 매트릭스 | offline-course-planning-supplement.md §3 |
| 8 | Phase 로드맵 | phase1-completion.md §Phase2이월, offline-course-planning-supplement.md §4.2 |
| 9 | 비즈니스 맥락 | offline-course-planning-supplement.md §4 |
| 10 | 용어 사전 | offline-course-planning-supplement.md §5 |
| 11 | 결정 로그 | offline-course-builder.md §용어확정·아키텍처, gap-report.md, phase1-completion.md |
| 12 | 핸드오프 | phase1-completion.md §Phase2이월 |

### 1.2 포함 소스 파일

- `docs/00-standard/offline-course-planning-supplement.md`
- `docs/offline-course-builder.md`
- `docs/gap-report.md`
- `docs/04-report/phase1-completion.md`
- `docs/01-plan/features/offline-*.plan.md` (4개)
- `docs/04-report/offline-*.report.md` (4개)

### 1.3 제외 범위

- `online-builder` 관련 파일
- `sessions/` 세션 기록 파일
- `vision-2026.md`, `system-analysis.md` (오프라인 전용 아님)

## 2. 성공 기준

- [ ] 12개 섹션 모두 포함
- [ ] 운영 정책 7개 항목 전부 포함 (출석상태, 지각, 마감, 수료, 수강신청, 데이터정정, 퍼블리싱)
- [ ] 40개 테스트 케이스 (TC-B01~B10, TC-E01~E09, TC-A01~A09, TC-C01~C08, TC-L01~L06) 포함
- [ ] Phase 1 완결 결과 (5파일 100% Match Rate) 반영
- [ ] 12개 기획 갭 (GAP-01~12) 처리 현황 포함
- [ ] 계층 구조 다이어그램 (코스→커리큘럼→슬롯→차수→회차) 포함
- [ ] 팀별 필독 섹션 안내 포함

## 3. 구현 범위

- **생성**: `docs/README.md` (신규)
- **수정**: 없음 (원본 파일 보존)
- **예상 분량**: ~300~400 줄

## 4. 비고

- README.md는 "읽기용 통합 뷰"이며 원본 문서를 대체하지 않음
- 정책 변경 시 원본 문서를 먼저 수정하고, README도 함께 업데이트
- 문서 관리 책임: 기획팀
