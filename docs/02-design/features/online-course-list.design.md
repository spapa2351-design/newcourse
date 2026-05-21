---
feature: online-course-list
phase: design
status: draft
created: 2026-05-20
architecture: Option A — 최소 변경 (index.html 복제 후 newcourse 모델로 수정)
stack: React 18 CDN + Tailwind CSS CDN + Lucide React (단일 HTML)
---

# 강의 코스 목록 — Design Document

> **UI 라벨**: "강의 코스" (코드 상수: `CONTENT`). 파일명: `admin/online-list.html`.
> **상위 차터**: 메모리 `project-newcourse-charter` + `project-newcourse-course-system-architecture`.

## Context Anchor

| 항목 | 내용 |
|---|---|
| **WHY** | 빌더만 있고 목록 부재 → 운영자가 코스 관리·신규 등록 진입점 없음. legacy 사용자 마이그레이션을 위해 친숙한 셸 유지 필요. |
| **WHO** | HRD 담당자, 콘텐츠 관리자, 코스 운영자 |
| **RISK** | legacy 사용자가 컬럼 변경(콘텐츠→커리큘럼)에 혼란 / 1000+ 코스 렌더링 성능 / 필터·검색 인덱스 부재 / dead code 잔존으로 향후 유지보수 부담 |
| **SUCCESS** | 운영팀이 legacy처럼 자연스럽게 사용. 신규 등록 → 빌더 진입 흐름 단일 클릭. 1000+ 코스에서도 페이지네이션으로 부드럽게 동작. |
| **SCOPE** | 프론트엔드 단일 HTML 프로토타이핑. 백엔드 미연결, mock 데이터 |

---

## 1. 아키텍처 (Option A — 최소 변경)

### 선택 사유
- 검증된 `admin/offline-list.html` 셸을 그대로 복제하여 위험 최소화
- 운영팀에게 익숙한 컬럼·필터·CTA 구조 100% 유지
- 빠른 구현(예상 1시간) — 차주 사용자 검증 가능

### 트레이드오프 수용
- 차수·OFFLINE 전용 로직(`OFFLINE_FILTER_FIELDS` 등)이 dead code로 잔존
- 향후 블렌디드 목록 추가 시 코드 중복 발생 (그 시점에 컴포넌트 추출 검토)

### 파일 구성

```
admin/
├─ index.html                  ← 레퍼런스 (오프라인 코스 목록, 그대로 유지)
├─ online-list.html         ← 신규 (이번 작업, index.html 기반 복제·수정)
├─ online-builder.html      ← 등록 CTA 목적지
└─ content-library.html        ← 별도 페이지
```

---

## 2. 화면 구조

### 2.1 전체 레이아웃 (index.html 셸 동일)

```
┌─────────────────────────────────────────────────────┐
│ TOP NAV (52px)                                      │
├──────────┬──────────────────────────────────────────┤
│ SIDEBAR  │ 페이지 타이틀: 온라인 코스               │
│ (200px)  │ [코스 순서 관리] [수강생 등록] [+ 등록]  │
│  · 코스  │ ────────────────────────────────────     │
│   ▸ 온라인│ ┌─ 분류 ──┬─ 메인 카드 ────────────┐   │
│     코스 │ │ 전체    │ 상태 탭 + [필터 추가]   │   │
│   ▸ 오프라인│ │ ▸ 분류1 │ 총 N · 검색 · 토글     │   │
│   ▸ 콘텐츠│ │ ▸ 분류2 │ ┌─ 테이블 (10컬럼) ──┐ │   │
│     라이브러리│ │ ...    │ │ ☐ 상태 표지 코스명  │ │   │
│ ...      │ │        │ │   커리큘럼 [수강관리]│ │   │
│          │ │        │ │   분류 수강기간 인원 │ │   │
│          │ │        │ │   등록일 관리        │ │   │
│          │ │        │ └─ 페이지네이션 ─────┘ │   │
│          │ └────────┴───────────────────────┘   │
└──────────┴──────────────────────────────────────────┘
```

### 2.2 컬럼 (10 디폴트)

| # | 컬럼 | 폭 | 변경 사항 vs legacy |
|---|---|---|---|
| 1 | ☐ | 40px | 동일 |
| 2 | 상태 | 80px | 5종 칩 (초안·운영중·수강중·종료·관리자 종료) |
| 3 | 표지 | 52px | 동일 (40×60 portrait) |
| 4 | 코스명 | flex | bold + prefix `[필수]` 칩 (필수 코스만) + 하단 등록 채널 미세 라벨(관리자/자율/자동) |
| 5 | 커리큘럼 | 120px | **legacy "콘텐츠" → "커리큘럼 N · 에셋 M"** |
| 6 | 수강관리 | 90px | [수강관리] 버튼 자체 컬럼 분리 |
| 7 | 분류 | 90px | 동일 |
| 8 | 수강 기간 | 140px | 동일 ("제한 없음" / 날짜 범위) |
| 9 | 수강 인원 | 70px | 동일 |
| 10 | 등록일 | 130px | 동일 |
| 11 | 관리 | 80px | 링크·편집·삭제 3아이콘 |

### 2.3 상태 5종 칩

| 상태 | 색상 | 정의 |
|---|---|---|
| 초안 | slate | draft, 퍼블리시 안 됨 |
| 운영중 | emerald | 신청 기간 진행 중 |
| 수강중 | amber | 신청 기간 끝, 수강만 진행 (학습자 측 라벨: "신청 마감") |
| 종료 | slate dim | 전부 종료 |
| 관리자 종료 | rose | 강제 종료 |

### 2.4 페이지네이션

```
[1~20 / 전체 1,021개]              [이전]  3 / 52  [다음]
```
- 20개/페이지
- 필터·정렬·검색 변경 시 1페이지 리셋
- `content-library.html`과 동일 패턴 차용

---

## 3. 상태 모델 (State)

### App 레벨 State

| state | 타입 | 비고 |
|---|---|---|
| `courses` | array | newcourse Course 객체 배열 (mock seed) |
| `catFilter` | string | 분류 트리 선택 ('all' 또는 분류명) |
| `expandedCats` | Set | 분류 트리 펼침 상태 |
| `statusFilter` | string | 상태 탭 ('all'/'draft'/'running'/...) |
| `activeFilters` | array | 칩으로 표시되는 필터들 (분류·등록채널·등록기간) |
| `filterPopup` | string\|null | 필터 추가 팝업 상태 |
| `filterInput` | string | 필터 입력값 |
| `search` | string | 코스명 검색어 |
| `selectedIds` | Set | 체크박스 다중 선택 |
| `sideExpanded` | Set | 좌측 메뉴 펼침 상태 |
| `page` | number | 현재 페이지 (1-indexed) |

### 상수

```js
const STATUS_TABS = [
  { key: 'all', label: '전체' },
  { key: 'draft', label: '초안' },
  { key: 'running', label: '운영중' },
  { key: 'closed_apply', label: '수강중' },
  { key: 'ended', label: '종료' },
  { key: 'admin_ended', label: '관리자 종료' },
];

const CATEGORIES = [/* legacy 그대로 차용 — 업무 역량, WORK, 직무 역량, 상품 가이드... */];

const FILTER_FIELDS = [
  { key: 'category', label: '분류', options: [/* CATEGORIES 평탄화 */] },
  { key: 'enrollMode', label: '등록 채널', options: [
    { val: 'admin', label: '관리자 수동' },
    { val: 'self', label: '자율 신청' },
    { val: 'auto', label: '자동' },
  ]},
  { key: 'createdAt', label: '등록일' },
];
```

> legacy의 `OFFLINE_FILTER_FIELDS`(수강 방식, 차수 등)는 제거하지 않고 dead 상태로 잔존 (Option A 트레이드오프).

---

## 4. 컴포넌트 (인라인 함수)

| 컴포넌트 | 역할 |
|---|---|
| `App` | 최상위 상태 + 렌더 |
| `CourseRow` | 테이블 1행 (인라인 또는 매핑) |
| `CategoryTree` | 좌측 분류 트리 (legacy 패턴 유지) |
| `StatusTabs` | 상태 탭 (5종) |
| `FilterChipBar` | 활성 필터 칩 + [필터 추가] |
| `Pagination` | 이전/다음 + 페이지 표시 |

> Option A 특성상 모두 App 내부 인라인 JSX. 별도 컴포넌트 추출 X.

---

## 5. 데이터 모델

```js
// mock 시드 (10~50개 적정)
const COURSES = [
  {
    id: 'c1',
    title: '2025 핵심가치 교육',
    coverImage: SAMPLE_COVER_1,
    status: 'running',           // 5종 중 하나
    classification: 'mandatory',  // 'normal' | 'mandatory'
    category: '업무 역량',
    curriculumCount: 4,
    assetCount: 12,
    enrollMode: 'self',           // 'admin' | 'self' | 'auto'
    studyPeriod: { type: 'fixed', start: '2026-01-15', end: '2026-12-31' },
    applyPeriod: { start: '2026-01-01', end: '2026-12-15' },
    enrolledCount: 126,
    createdAt: '2026-01-15T11:22:00',
    createdBy: 'jiyoungkim',
  },
  // ... 9~49개 추가
];
```

---

## 6. 핵심 함수

| 함수 | 동작 |
|---|---|
| `filtered = useMemo(...)` | 분류·상태·필터칩·검색·정렬 통합 결과 |
| `pageItems = filtered.slice((page-1)*20, page*20)` | 현재 페이지 항목 |
| `toggleAll()` | 현재 페이지 전체 선택/해제 |
| `addFilter(field, value)` | 필터 칩 추가 |
| `removeFilter(key)` | 필터 칩 제거 |
| `handleBulkDelete()` | 선택된 항목 일괄 삭제 (운영중·등록자>0 가드) |
| `handleRegister()` | `online-builder.html`로 이동 (window.location 또는 a href) |

---

## 7. 사용자 흐름

```
[온라인 코스] 사이드바 진입
  → 목록 노출 (등록일 desc 디폴트)
  → 분류 트리 클릭 → 해당 카테고리만 필터
  → 상태 탭 클릭 → 해당 상태만 필터
  → [+ 필터 추가] → 분류·등록채널·등록기간 추가
  → 검색 → 코스명 매칭
  → ☐ 다중 선택 → [선택 삭제]
  → [등록] → online-builder.html
  → 코스 행 클릭 또는 [편집] 아이콘 → online-builder.html?id=cX (편집)
  → [수강관리] 버튼 → 학습자 관리 화면 (별도 페이지, 1차 mock)
```

---

## 8. 테스트 시나리오 (1차)

| 시나리오 | 검증 항목 |
|---|---|
| 페이지 진입 | 좌측 [코스 → 온라인 코스] active, 분류 트리 노출, 테이블 첫 페이지 |
| 분류 트리 클릭 | filter 적용, 카운트 갱신, 페이지 1 리셋 |
| 상태 탭 클릭 | 해당 상태만 노출, 카운트 갱신, 페이지 1 리셋 |
| 필터 추가 | 분류·등록 채널·등록기간 칩 추가, 다중 적용 |
| 검색 | 코스명 substring 매칭 |
| 다중 선택 | 헤더 ☐ 전체선택, 개별 ☐ 토글, 카운트 표시 |
| 일괄 삭제 | 운영중·등록자>0 가드 동작 확인 |
| [등록] 버튼 | online-builder.html로 이동 |
| 페이지네이션 | 20개 이상일 때 노출, 이전/다음 |
| 필수 코스 prefix | classification='mandatory' 행에 `[필수]` 칩 |
| 등록 채널 라벨 | 코스명 행 하단에 enrollMode 미세 라벨 |
| 커리큘럼 컬럼 | "커리큘럼 N · 에셋 M" 표시 |

---

## 9. 리스크 & 대응

| 리스크 | 대응 |
|---|---|
| dead code(OFFLINE 전용) 잔존 | 주석으로 `// legacy offline-specific (unused)` 마킹. 다음 사이클에 정리 |
| legacy 사용자 컬럼 변경 혼란 | "콘텐츠" → "커리큘럼" 변경 시 마이그레이션 안내 모달 (1차 후 추가) |
| 1000+ 코스 렌더링 성능 | 페이지네이션 20개로 한정, 가상화 불필요 |
| 검색 인덱스 부재 | mock 단계라 무방. 백엔드 연결 시 서버 검색으로 |
| index.html 로직 복잡도 (필터 팝업 등) | 그대로 복제 + 필요시 분기 추가 |

---

## 10. 구현 순서 & Session Guide

### 11.1 Module Map

| 모듈 | 범위 | 비고 |
|---|---|---|
| M1 | 파일 복제 + 기본 셸 | `admin/online-list.html` 생성, sidebar active, 페이지 타이틀 |
| M2 | 상수 교체 | STATUS_TABS (5종), CATEGORIES (legacy 차용), FILTER_FIELDS 정리 |
| M3 | mock 데이터 (COURSES 10~30개) | newcourse Course 모델 적용 |
| M4 | 컬럼 재구성 | 차수 제거, 커리큘럼 컬럼 신설, 필수 prefix, 등록 채널 라벨 |
| M5 | 페이지네이션 | 20개/페이지, 이전/다음 (content-library.html 패턴) |
| M6 | CTA 연결 | [등록] → online-builder.html, [편집] 아이콘 동작 |

### 11.2 Recommended Session Plan

- **Session 1** (M1+M2): 셸 복제 + 상수 교체 (40분)
- **Session 2** (M3+M4): mock 데이터 + 컬럼 재구성 (60분)
- **Session 3** (M5+M6): 페이지네이션 + CTA (30분)

총 예상: 2시간 ~ 2시간 30분

### 11.3 Session Guide 사용법

```
/pdca do online-course-list --scope M1,M2    # 첫 세션
/pdca do online-course-list --scope M3,M4    # 두 번째
/pdca do online-course-list --scope M5,M6    # 마지막
/pdca do online-course-list                  # 전체 (한 번에)
```

---

## 11. 데이터 구조 상세

```js
// COURSES 시드 예시 (전체는 30개 정도 mock)
const COURSES = [
  { id, title, coverImage, status, classification, category, curriculumCount, assetCount,
    enrollMode, studyPeriod: {type, start?, end?, days?},
    applyPeriod: {start?, end?},
    enrolledCount, createdAt, createdBy }
];

// 표지 placeholder (legacy 색상 그라디언트와 일치)
const COVER_PLACEHOLDERS = [
  'bg-gradient-to-br from-indigo-200 to-purple-200',
  'bg-gradient-to-br from-emerald-200 to-teal-200',
  'bg-gradient-to-br from-rose-200 to-pink-200',
  // ...
];
```

---

## 12. 검증 (퍼블리싱 X, 페이지 동작 검증)

| 항목 | 조건 |
|---|---|
| 첫 페이지 진입 | 좌측 active, 목록 노출 |
| 분류 트리 | 클릭 → 필터링 + 페이지 1 |
| 상태 탭 5종 | mock에 각 상태 1개 이상 |
| 필터 칩 | 분류·등록채널·등록기간 추가 가능 |
| 검색 | 코스명 매칭 |
| ☐ 다중 선택 | 전체 + 개별 동작 |
| 일괄 삭제 | 가드 조건 통과 시만 삭제 |
| [등록] | online-builder.html 이동 |
| 페이지네이션 | 20개 초과 시 노출 |

---

## 13. 관련 문서

- Plan: `docs/01-plan/features/online-course-list.plan.md`
- 레퍼런스: `admin/offline-list.html` (오프라인 코스 목록)
- 빌더: `docs/01-plan/features/online-builder.plan.md`
- 라이브러리: `docs/01-plan/features/library.plan.md`
