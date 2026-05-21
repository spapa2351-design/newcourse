---
feature: offline-builder
phase: design
status: approved
created: 2026-04-27
architecture: Option C — 2패널 개선방식
stack: React 18 CDN + Tailwind CSS CDN + Lucide React (단일 HTML)
---

# 오프라인 코스 등록 빌더 — Design Document

## Context Anchor (Plan → Design 연결)

| 항목 | 내용 |
|------|------|
| **WHY** | 고객사의 엑셀+수동 오프라인 교육 운영을 시스템으로 대체 |
| **WHO** | HRD 담당자(주), 강사, 상위 관리자 |
| **RISK** | GAP-03(알림), GAP-06(재수강) 미결 — Phase 1 오픈 전 확정 필요 |
| **SUCCESS** | HRD 담당자가 코스 개설~수료처리를 엑셀 없이 완료 가능 |
| **SCOPE** | 프론트엔드 전용 단일 HTML 프로토타이핑 (백엔드 없음) |

---

## 1. 아키텍처 선택 결과

**Option C — 2패널 개선방식** 선택.

기존 `offline-builder.html` 유지, 신규 `offline-builder-v2.html` 으로 별도 제작.

### 선택 이유
- 전체 그림(기본정보·신청설정·수료조건)을 보면서 차수/회차를 빠르게 편집 가능
- 좌측 아코디언으로 정보 밀도 조절, 우측은 핵심 작업 영역에 집중
- 기존 UX의 "차수(패키지)와 회차가 분리된 혼란" 해소

---

## 2. 화면 구조 (Screen Architecture)

### 2.1 전체 레이아웃

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER (고정)                                                │
│  ← 목록  |  코스명 (인라인 편집)  |  [초안] [임시저장] [퍼블리싱] │
└─────────────────────────────────────────────────────────────┘
┌──────────────────────┬──────────────────────────────────────┐
│  LEFT PANEL (380px)  │  RIGHT PANEL (flex-1)                │
│                      │                                      │
│  ① 코스 기본정보 ▼✓  │  [+ 차수 추가]  [🪄 일괄 생성]        │
│  ─────────────────   │  ─────────────────────────────────── │
│  코스명              │  ┌──────────────────────────────┐    │
│  카테고리            │  │ ≡  1차수  2026-11-01(목)      │    │
│  강사명·소개         │  │    정원 30   지각기준 10분     │    │
│  코스소개            │  │    강사: 김민준               │    │
│  장소·주소·교통      │  │    ────────────────────────   │    │
│                      │  │    1회차  09:00~18:00  서울HQ │    │
│  ② 신청 설정 ▼✓     │  │    [+ 회차 추가]              │    │
│  ─────────────────   │  └──────────────────────────────┘    │
│  신청기간             │                                      │
│  자율 / 강제 할당    │  ┌──────────────────────────────┐    │
│  취소·변경 정책      │  │ ≡  2차수  2026-11-02(금)      │    │
│                      │  │    ...                        │    │
│  ③ 수료 조건 ▼       │  └──────────────────────────────┘    │
│  ─────────────────   │                                      │
│  스코어카드           │  ──────────────────────────────────  │
│  [수료 예상 인원]     │  SCORE CARD (하단 고정)             │
│                      │  예상 수료 인원: 60명 / 60명 100%    │
└──────────────────────┴──────────────────────────────────────┘

[우측 하단 FAB: 📱 미리보기]
```

### 2.2 상태바 (헤더 내)

| 상태 | 색상 | 뱃지 |
|------|------|------|
| 초안 (draft) | slate | 초안 |
| 임시저장 (saved) | amber | 임시저장 |
| 퍼블리싱됨 (published) | emerald | 퍼블리싱됨 |

---

## 3. 좌측 패널 — 섹션 상세 설계

### 3.1 섹션 완료 상태 표시 (Completion Status)

각 섹션 헤더에 상태 아이콘 표시:
- `✓` (초록) — 필수 항목 모두 입력됨
- `⚠` (황색) — 필수 항목 미입력 있음
- `-` (회색) — 아직 미입력 (옵션 섹션)

```
① 코스 기본정보  ✓     ← 모두 입력됨
② 신청 설정     ⚠     ← 신청기간 미입력
③ 수료 조건      -     ← (자동 설정됨)
```

### 3.2 섹션 1: 코스 기본정보

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| 코스명 | text | ✅ | 인라인 편집 (헤더에도 동기화) |
| 상단 표지 | radio + 이미지업로드 | - | 기본표지 / 이미지 업로드 |
| 카테고리 | select | ✅ | 분류 트리에서 선택 |
| 강사명 | text | ✅ | |
| 강사 소개 | textarea | - | |
| 코스 소개 | textarea | - | |
| 장소명 | text | ✅ | |
| 주소 | text | - | |
| 교통 안내 | textarea | - | |

### 3.3 섹션 2: 신청 설정

#### 신청 기간 (항상 표시)
- 오픈 일시 (datetime-local) ✅
- 마감 일시 (datetime-local) ✅

#### 수강 등록 방식
```
  ○ 자율 수강   ● 관리자 강제 할당
```

**자율 수강 모드:**
- 신청 권한 그룹 선택 (멀티셀렉트 칩)
- 옵션 선택 규칙: 단일 선택 / 다중 선택(최대 N개)

**강제 할당 모드:**
- 취소·변경 정책 섹션 숨김 (관리자가 직접 처리)
- 우측 차수 카드에 "그룹 배정" 섹션 노출

#### 취소·변경 정책 (자율 수강 전용)
- 수강 취소 정책 토글 + 세부 설정
- 일정 변경 제한 토글 + 세부 설정

#### 재수강 허용 (GAP-06 처리)
```
  재수강 허용  [ 토글 ]
  ON: 동일 코스 재신청 가능 (법정의무교육 등)
  OFF: 이미 수강한 학습자 재신청 차단
```
> 같은 코스 내 여러 차수 동시 신청은 항상 차단 (별도 설정 불필요)

### 3.4 섹션 3: 수료 조건 (스코어카드 연동)

```
┌────────────────────────────────────────┐
│  수료 조건                             │
│  ─────────────────────────────────    │
│  ☑ 오프라인 출석  [필수 · 해제불가]   │
│    └ 완료 기준: 회차 마감 시 출석/지각 │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │  📊 수료 스코어카드               │ │
│  │  총 수강생   60명                 │ │
│  │  회차 완료 시 예상 수료  60명      │ │
│  │  예상 수료율             100%     │ │
│  └──────────────────────────────────┘ │
└────────────────────────────────────────┘
```

---

## 4. 우측 패널 — 차수 & 회차 관리

### 4.1 패널 헤더

```
차수 및 회차 관리                [+ 차수 추가]  [🪄 일괄 생성]
────────────────────────────────────────────────────────────
```

### 4.2 차수 카드 (Session Card)

```
┌──────────────────────────────────────────────────────┐
│ ≡  1차수                                   [복사] [삭제] │
│                                                      │
│  차수명  [11월 01일 교육 신청_______________]         │
│                                                      │
│  날짜    [2026-11-01] ~ [2026-11-01]                 │
│  정원    [30_] 명  (그룹 배정 시 자동계산)            │
│  장소    [_______________] (비워두면 기본장소 사용)   │
│  담당강사 [김민준___________] ← GAP-08 경량 구현     │
│  지각기준 [10] 분 이내 지각 인정 ← GAP-04 구현       │
│                                                      │
│  ─────────────── 회차 목록 ──────────────────────   │
│  ≡ 1회차  [2026-11-01] [09:00] ~ [18:00] [장소] [✕] │
│  [+ 회차 추가]                                       │
└──────────────────────────────────────────────────────┘
```

#### 차수 카드 필드 정의

| 필드 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| 차수명 | text | "N월 DD일 교육 신청" | 인라인 수정 |
| 시작일~종료일 | date range | - | 회차 일정 범위 자동 계산 |
| 정원 | number | 30 | 그룹 배정 시 합산으로 자동계산 |
| 장소 | text | "" | 비우면 기본 장소 사용 |
| 담당강사 | text | courseInfo.instructor | 차수별 재지정 가능 |
| 지각기준 | number (분) | 10 | 0 = 지각 기준 없음 |

#### 강제 할당 모드 차수 카드 (추가 UI)

```
│  그룹 배정  [+ 그룹 추가 ▼]                          │
│  [개발팀 12명 ✕] [디자인팀 8명 ✕]                   │
│  자동 합산 정원: 20명                                │
```

### 4.3 회차 아이템 (Session Item)

```
≡ [1회차___] [2026-11-01] [09:00] ~ [18:00] [장소___] [QR] [✕]
```

- GripVertical 핸들로 드래그 재정렬
- 회차 삭제 버튼 (✕)
- QR 버튼 → QR 출석부 모달

### 4.4 일괄 생성 모달 (🪄 Magic Wand)

```
┌──────────────────────────────────────────────┐
│  🪄  회차 일괄 생성                           │
│  ─────────────────────────────────────────  │
│  기간     [2026-11-01] ~ [2026-11-28]        │
│  요일     [✓ 월] [ 화] [ 수] [✓ 목] [ 금]   │
│  시작시간  [09:00]   종료시간  [18:00]        │
│  장소      [___________________________]     │
│                                              │
│  → 총 4회차 자동 생성 예정                    │
│                                              │
│                  [취소]  [회차 생성]          │
└──────────────────────────────────────────────┘
```

---

## 5. 하단 수료 스코어카드 (Completion Score Card)

우측 패널 하단 고정 영역. 차수/회차/정원 변경 시 실시간 업데이트.

```
┌──────────────────────────────────────────────────────┐
│  📊 수료 예상                                         │
│  총 차수 2개  ·  총 회차 2회  ·  총 정원 60명         │
│  회차 마감 시 전원 출석 가정 → 예상 수료 60명 (100%)  │
└──────────────────────────────────────────────────────┘
```

---

## 6. 모바일 미리보기 (FAB 버튼)

우측 하단 FAB 버튼 → 학습자 앱 미리보기 모달.

```
┌──────────────────┐
│ 📱 미리보기       │
│ ────────────────  │
│ 2026 직무교육     │
│ 11/01(목) ~ 11/02│
│ 서울 HQ           │
│ 강사: 김민준      │
│ ─────────────    │
│ 1차수 11/01(목)  │
│ 정원 30명 · 잔여 0│
│ [마감]            │
│                   │
│ 2차수 11/02(금)  │
│ 정원 30명 · 잔여 5│
│ [신청하기]        │
└──────────────────┘
```

---

## 7. 퍼블리싱 플로우

### 퍼블리싱 버튼 클릭 시 검증 체크리스트 모달

```
┌──────────────────────────────────────────────────┐
│  코스 퍼블리싱 — 등록 요건 확인                   │
│  ─────────────────────────────────────────────  │
│  ✓ 코스명 입력                                  │
│  ✓ 담당 강사 지정                               │
│  ✓ 교육 장소 설정                               │
│  ⚠ 신청 기간 설정  ← 미입력                     │
│  ✓ 최소 1개 차수 생성                           │
│  ✓ 모든 차수에 회차 존재                        │
│  ✓ 모든 회차 날짜/시간 설정                     │
│  ✓ 수료 조건 최소 1개 설정                      │
│  ─────────────────────────────────────────────  │
│  공개 시점   ● 즉시 공개  ○ 예약 공개            │
│                                                  │
│         [취소]  [임시저장만]  [퍼블리싱 확정 →]   │
│                              (요건 미충족 시 비활성) │
└──────────────────────────────────────────────────┘
```

---

## 8. 상태 데이터 모델 (Frontend State)

```js
// 코스 기본정보
courseInfo: {
  title, category, instructor, instructorDesc,
  intro, location, address, traffic
}

// 신청 설정
regPeriod: { start, end }
isSelfEnroll: boolean
selectionRule: 'single' | 'multi'
maxSelect: number
allowReEnroll: boolean  // GAP-06 신규

// 취소/변경 정책
cancelPolicy: { enabled, mode, relativeValue, relativeUnit }
changePolicy: { enabled, relativeValue, relativeUnit }

// 차수 (옵션) 배열
options: [{
  id, name, capacity, enrolled,
  startDate, endDate, place,
  instructor: string,      // GAP-08 경량: 차수별 강사명
  lateMinutes: number,     // GAP-04: 지각기준 (분)
  groups: [{ id, name, count }],
  sessions: [{
    id, name, date, startTime, endTime, place
  }]
}]

// 수료 조건
completionRules: [{
  slot_type: 'attendance',
  required: true,
  condition: { type: 'any_status' }
}]

// UI 상태
courseStatus: 'draft' | 'saved' | 'published'
isPreviewOpen: boolean
showPublishModal: boolean
collapsedSections: { courseInfo, regSettings, completionRules }
collapsedOpts: { [optId]: boolean }
```

---

## 9. 컴포넌트 구조

```
App
├── Header (고정)
│   ├── BackButton
│   ├── CourseTitle (인라인 편집)
│   ├── StatusBadge
│   └── ActionButtons (임시저장, 퍼블리싱)
├── MainLayout (2패널)
│   ├── LeftPanel (width: 380px)
│   │   ├── SectionAccordion: CourseInfo
│   │   │   └── CourseInfoFields
│   │   ├── SectionAccordion: RegSettings
│   │   │   ├── RegPeriod
│   │   │   ├── EnrollmentMode (자율/강제 라디오)
│   │   │   ├── GroupSelector (강제 모드 전용)
│   │   │   ├── CancelPolicy (자율 모드 전용)
│   │   │   └── ReEnrollToggle (GAP-06)
│   │   └── SectionAccordion: CompletionRules
│   │       ├── RuleList
│   │       └── ScoreCard (내부 미니 버전)
│   └── RightPanel (flex-1)
│       ├── PanelHeader [+ 차수 추가] [🪄 일괄 생성]
│       ├── OptionList (드래그 가능)
│       │   └── OptionCard (차수 카드)
│       │       ├── OptionHeader (차수명, 복사, 삭제)
│       │       ├── OptionFields (날짜, 정원, 장소, 강사, 지각기준)
│       │       ├── GroupAssigner (강제 모드 전용)
│       │       └── SessionList (회차 목록)
│       │           └── SessionItem (드래그 가능)
│       └── ScoreCard (하단 고정)
├── BulkCreateModal (🪄 일괄 생성)
├── QrModal (회차 QR 출석부)
├── MobilePreviewModal (📱 미리보기)
├── PublishModal (퍼블리싱 확인)
└── Toast (저장 알림)
```

---

## 10. 신규 UX 기능 상세

### 10.1 섹션 완료 상태 (Completion Status)

```js
const getSectionStatus = (section) => {
  if (section === 'courseInfo') {
    const required = ['title', 'instructor', 'location'];
    const filled = required.filter(k => courseInfo[k].trim());
    if (filled.length === required.length) return 'done';    // ✓ 초록
    if (filled.length > 0) return 'partial';                 // ⚠ 황색
    return 'empty';                                          // - 회색
  }
  // ... 다른 섹션도 동일 패턴
};
```

### 10.2 실시간 수료 스코어카드

```js
const scoreCard = useMemo(() => {
  const totalCapacity = options.reduce((s, o) => s + o.capacity, 0);
  const totalSessions = options.reduce((s, o) => s + o.sessions.length, 0);
  return {
    sessions: totalSessions,
    options: options.length,
    capacity: totalCapacity,
    estimatedCompletion: totalCapacity, // Phase 1: 전원 출석 가정
    rate: totalCapacity > 0 ? 100 : 0
  };
}, [options]);
```

### 10.3 Magic Wand 일괄 생성

```js
const generateSessions = ({ startDate, endDate, weekdays, startTime, endTime, place }) => {
  const sessions = [];
  let current = new Date(startDate);
  const end = new Date(endDate);
  let idx = 1;
  while (current <= end) {
    if (weekdays.includes(current.getDay())) {
      sessions.push({
        id: Date.now() + idx,
        name: `${idx}회차`,
        date: current.toISOString().slice(0, 10),
        startTime, endTime, place
      });
      idx++;
    }
    current.setDate(current.getDate() + 1);
  }
  return sessions;
};
```

---

## 11. 구현 가이드

### 11.1 파일 정보

| 파일 | 역할 |
|------|------|
| `newcourse/admin/offline-builder.html` | 기존 프로토타입 — 유지 (건드리지 않음) |
| `newcourse/admin/offline-builder-v2.html` | 신규 개선 빌더 — 이번 구현 대상 |

### 11.2 구현 순서

1. **기본 레이아웃** — 헤더 + 2패널 (좌측 380px 고정, 우측 flex)
2. **좌측 아코디언** — 3개 섹션 (기본정보, 신청설정, 수료조건)
3. **우측 차수 카드** — 차수명/날짜/정원/강사/지각기준 필드
4. **우측 회차 아이템** — 드래그 재정렬, QR 버튼
5. **완료 상태 표시** — 섹션 헤더에 ✓/⚠ 동기화
6. **Magic Wand 모달** — 기간+요일+시간 → 회차 자동 생성
7. **수료 스코어카드** — 하단 고정, 실시간 업데이트
8. **모바일 미리보기** — FAB 버튼 + 프리뷰 모달
9. **퍼블리싱 플로우** — 검증 체크리스트 + 공개 시점 선택
10. **재수강 토글** — GAP-06 처리

### 11.3 Session Guide (Multi-Session 구현 플랜)

| 모듈 | 예상 작업량 | 내용 |
|------|------------|------|
| M1: 레이아웃 + 아코디언 | ~150 lines | 헤더, 2패널, 좌측 3섹션 뼈대 |
| M2: 차수 카드 + 회차 | ~250 lines | 우측 패널 전체 (GAP-04, GAP-08 포함) |
| M3: UX 기능 4종 | ~200 lines | 완료상태, Magic Wand, 스코어카드, 미리보기 |
| M4: 퍼블리싱 플로우 | ~100 lines | 검증 모달, 상태 전환, Toast |

---

## 12. 기술 스택 확인

```html
<!-- 기존과 동일한 CDN -->
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script type="text/babel" data-type="module">
  import React, { useState, useRef, useEffect, useMemo } from 'https://esm.sh/react@18.2.0';
  import { createRoot } from 'https://esm.sh/react-dom@18.2.0/client';
  import * as Lucide from 'https://esm.sh/lucide-react@0.292.0?deps=react@18.2.0';
</script>
```

색상 시스템: 기존 indigo 팔레트 유지 (`#5569FF` 계열)
