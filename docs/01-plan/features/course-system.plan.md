---
feature: course-system
phase: plan
status: current
created: 2026-05-20
approach: v1 페이지 기반 + v2 newcourse 전통 LMS 영구 공존. 사이드바 "코스v2" 그룹을 코스(legacy) 그룹 바로 아래 분리
---

# 코스 시스템 — 상위 기획 Plan

> 본 문서는 newcourse 프로젝트의 **상위 아키텍처**. 개별 빌더(`online-builder`·`offline-builder`)와 목록(`online-list`·`offline-list`)·라이브러리(`content-library`)는 이 시스템 안에서 작동한다.

## Executive Summary

| 관점 | 내용 |
|---|---|
| **Problem** | newcourse(v2 전통 LMS) 도입 시 레거시(v1 페이지 기반)와 사이드바·라벨·데이터에서 충돌 우려. |
| **Solution** | v1·v2 영구 공존. 사이드바 **레거시 As-Is** + 구분선 + **코스v2** 그룹(온라인 코스·오프라인 코스). 마이그레이션 불가. |
| **기능/UX 효과** | 운영자가 매번 v1·v2 선택. 학습자는 차이 인지 X (추상화 layer). |
| **Core Value** | "두 패러다임은 다른 시스템. 사이드바 위치로 구분, UI 라벨은 동일." |

## Context Anchor

| 항목 | 내용 |
|---|---|
| **WHY** | v2 newcourse는 영상 위주·진도율 정합 강점, v1은 페이지 안 혼합 콘텐츠 유연성 강점. 호환 불가라 공존 필요. |
| **WHO** | HRD 담당자, 코스 운영자, 콘텐츠 관리자, 학습자 |
| **RISK** | 라벨 동일("온라인 코스")이라 위치 시그널 부족 가능 / 운영자 v1·v2 선택 가이드 필요 / 학습자 진도율 표시 일관성 |
| **SUCCESS** | 사이드바에서 코스 그룹과 코스v2 그룹 명확히 분리. 운영자가 메뉴 hover로 패러다임 가이드 받음. |
| **SCOPE** | 사이드바 구조 / "코스 만들기" CTA 모달 / 라벨 정책 / 학습자 추상화 layer 원칙 |

---

## 한 줄 룰

> **"v1 페이지 기반 코스와 v2 newcourse 전통 LMS는 별도 시스템으로 영구 공존. 사이드바 위치로 구분, UI 라벨은 동일."**

### 5가지 이유

1. **본질 차이** — v1은 페이지 단위 진도율(유연), v2는 슬롯 단위 진도율(정합).
2. **타깃 차이** — v1은 콘텐츠 유연성 우선 고객사, v2는 의무 교육·진도율 정합 필수 고객사.
3. **마이그레이션 불가** — 데이터 구조 갭 + 운영중 코스 보호 + v1 의존 기능 다수.
4. **라벨 단순화** — v1·v2 모두 "온라인 코스" 라벨 동일. 위치(코스 그룹 vs 코스v2 그룹)로만 구분.
5. **학습자 단일 경험** — 차이는 운영자 어드민 안에만, 학습자에겐 추상화 layer로 통일.

---

## 사이드바 정책

```
회원
코스 (그룹)             ← v1 (legacy)
  ├ 코스
  └ PLUS 코스

─── 구분선 ───

코스v2 [N]              ← v2 newcourse 그룹
  ├ + 코스 만들기       ← CTA, 모달 트리거 (유형 선택)
  ├ 온라인 코스         ← v2 CONTENT → online-list.html
  └ 오프라인 코스       ← v2 OFFLINE → offline-list.html

콘텐츠 / T튜브 / AI 퀴메이커 / Translation / 문제 은행 …
콘텐츠 라이브러리       ← 신규 빌더 공용 콘텐츠 풀 (별도 메뉴, Phase 1 후속 위치 확정)
```

**위치 룰**:
- 코스v2 그룹은 코스(legacy) 그룹 **바로 아래**에 배치 (구분선 1줄로 패러다임 분리)
- 그룹 라벨 "코스v2" + 빨간 `N` 배지 (단순)
- children 최상단 "+ 코스 만들기" CTA — 클릭 시 유형 선택 모달
- 블렌디드 코스는 **사이드바 미노출** (Phase 2). 모달에서도 숨김
- v1의 "온라인 코스"(legacy)는 코스 그룹 안에 남기지 않고 SIDEBAR_MENUS에서 제거됨 (v2의 "온라인 코스"와 라벨 충돌 회피)

---

## 두 패러다임 핵심 차이

| 구분 | v1 (legacy) | v2 newcourse |
|---|---|---|
| 본질 | wiki-style 페이지 + 페이지 진도율 | 에셋=슬롯=진도율 100% 정합 |
| 강점 | 페이지 안 영상·PDF·텍스트 자유 혼합 | 의무 교육 수료 증빙 깔끔 |
| 약점 | PDF·영상 섞이면 진도율 100% 안 됨 | 페이지 안 혼합 구성 불가 |
| 타깃 | 콘텐츠 유연성 우선 | 영상 위주·진도율 정합 필수 |
| 사이드바 | 코스 그룹 안 (코스 / PLUS 코스) | 코스v2 그룹 안 (온라인 / 오프라인) |

---

## v2 newcourse 종류

| 코드 | UI 라벨 | 사이드바 위치 | 파일 |
|---|---|---|---|
| `CONTENT` | 온라인 코스 | 코스v2 children | `online-list.html` / `online-builder.html` |
| `OFFLINE` | 오프라인 코스 | 코스v2 children | `offline-list.html` / `offline-builder.html` |
| `BLENDED` | 블렌디드 코스 | 사이드바 미노출 (Phase 2) | `blended-builder.html` |

---

## 운영자 선택 가이드 (필수 노출)

| 운영자 상황 | 추천 |
|---|---|
| "페이지 안에 영상·PDF·텍스트 자유 구성" | 코스 그룹 → 코스 (v1) |
| "의무 교육·법정 교육, 진도율 100% 정확, 영상 위주" | 코스v2 → 온라인 코스 (v2) |
| "오프라인 일정·출석·강의실 관리" | 코스v2 → 오프라인 코스 (v2) |
| "온·오프 혼합" | 블렌디드 코스 (Phase 2) |

구현 위치:
- 코스v2 그룹 자식 메뉴 hover tooltip
- "+ 코스 만들기" CTA → 유형 선택 모달 안 설명

---

## 신규 등록 룰

| 시점 | 룰 |
|---|---|
| v1 신규 등록 | 코스 그룹 안에서 등록 (legacy 흐름 그대로) |
| v2 신규 등록 | 코스v2 "+ 코스 만들기" CTA → 유형(온라인/오프라인) 모달 → 해당 빌더 |
| v1 코스 수정·삭제 | 가능 |
| v1 → v2 자동 변환 | **없음.** 데이터 구조 갭 + 운영중 코스 보호 + v1 의존 기능 다수 |

---

## 학습자 화면

- v1·v2 차이 학습자에게 노출 금지
- 진도율 표시·카드 메타정보는 추상화 layer로 통일
- 패러다임 차이는 운영자 어드민 안에서만 존재

---

## PLUS 코스

- v1 코스 그룹 안에 영구 유지
- newcourse 패러다임엔 패키지 layer 없음 (Phase 1 단일 코스 스코프)
- newcourse 묶는 패키지는 Phase 2 별도 안건

---

## admin 파일 매핑

| 역할 | 파일 |
|---|---|
| 온라인 코스 빌더 (CONTENT) | `admin/online-builder.html` |
| 온라인 코스 목록 | `admin/online-list.html` |
| 온라인 코스 수강관리 | `admin/online-view.html` |
| 오프라인 코스 목록 | `admin/offline-list.html` |
| 오프라인 코스 빌더 | `admin/offline-builder.html` |
| 오프라인 코스 수강관리 | `admin/offline-view.html` |
| 블렌디드 빌더 (Phase 2) | `admin/blended-builder.html` |
| 콘텐츠 라이브러리 | `admin/content-library.html` |

---

## 관련 문서

- 디자인: `docs/02-design/features/course-system.design.md`
- 종합 스펙: `docs/newcourse-spec-v2.html`
- 차터·정책 메모리: `project-newcourse-charter` · `project-newcourse-course-system-architecture`
- 온라인 코스 빌더: `docs/01-plan/features/online-builder.plan.md`
- 온라인 코스 목록: `docs/01-plan/features/online-course-list.plan.md`
- 콘텐츠 라이브러리: `docs/01-plan/features/library.plan.md`
