---
feature: offline-attendance
phase: design
status: approved
created: 2026-04-27
updated: 2026-04-28
architecture: 3패널 레이아웃 (좌측 사이드바 + 메인 탭 + 우측 캘린더)
stack: React 18 CDN + Tailwind CSS CDN + Lucide React (단일 HTML)
implementation_file: admin/offline-course-view.html
---

# 오프라인 코스 출석·수료 관리 — Design Document

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | 오프라인 교육 현장 출석 수기 체크 → 디지털 자동화 |
| **WHO** | HRD 담당자(출석 수정·마감·수료), 강사(현장 QR 운영) |
| **RISK** | 수료 처리 로직 미완성 시 Phase 1 납품 불가 |
| **SUCCESS** | 현장 QR 스캔 → 실시간 출석, 회차 마감 → 수료 자동 처리 |
| **SCOPE** | 프론트엔드 전용 단일 HTML 프로토타이핑 (백엔드 없음) |

---

## 1. 아키텍처

**3패널 레이아웃**: 좌측 사이드바(240px) + 메인 콘텐츠(flex-1) + 요약 탭 내 우측 캘린더(400px)

라이브 모드는 전체화면 전환 (사이드바·탭 숨김).

---

## 2. 화면 구조

### 2.1 전체 레이아웃 (일반 모드)

```
┌────────────────────────────────────────────────────────────┐
│ HEADER                                                     │
│  ← 목록  |  코스명  카테고리·강사·장소  [종료]  |  [코스편집] [수강생등록] │
└────────────────────────────────────────────────────────────┘
┌──────────────┬─────────────────────────────────────────────┐
│ LEFT SIDEBAR │  TAB: [요약] [수강] [출석] [설문]            │
│ (240px)      ├─────────────────────────────────────────────┤
│              │                                             │
│  커버 영역   │  (탭 콘텐츠)                                 │
│  코스정보    │                                             │
│  수강현황    │                                             │
│  출석률      │                                             │
│  운영방식    │                                             │
│  ──────────  │                                             │
│  [수강생등록]│                                             │
│  [라이브출석]│                                             │
│  [종료하기]  │                                             │
└──────────────┴─────────────────────────────────────────────┘
```

### 2.2 라이브 QR 모드 (전체화면)

```
┌───────────────────────────────────┬──────────────────────┐
│  (7/10)  QR 코드 영역              │  (3/10) 실시간 사이드  │
│                                   │                      │
│  차수명                           │  실시간 출석 현황      │
│  회차명  날짜·시간                 │  N / total           │
│                                   │  ██████░░ N%          │
│  ┌─────────────────────┐          │                      │
│  │     [QR 이미지]      │          │  출석 N  지각 N       │
│  │                     │          │  조퇴 N  결석 N       │
│  │    30초 후 갱신      │          │  미확인 N             │
│  └─────────────────────┘          │                      │
│                                   │  [최근 출석 목록]     │
│  학습자 앱에서 QR을 스캔하세요      │                      │
└───────────────────────────────────┴──────────────────────┘
```

---

## 3. 탭별 상세 설계

### 3.1 요약 탭 (summary)

레이아웃: 가운데 대시보드(flex-1) + 우측 캘린더(400px)

**대시보드 구성 요소:**

| 컴포넌트 | 역할 |
|----------|------|
| SummaryTodayBar | 오늘 회차 배너 or 다음 회차 D-day |
| SummaryAlertChip | 마감/잔여석/결석 경고 칩 (해제 가능) |
| KPIStrip | 핵심 지표 (총 수강생, 출석률, 수료 예상) |
| PackageTable | 차수별 출석률 바차트 테이블 |

**캘린더 구성 요소:**

| 컴포넌트 | 역할 |
|----------|------|
| CalendarView | 월별/주별 전환, 회차 dot 표시 |
| 회차 클릭 | 해당 회차 출석 탭으로 이동 |

### 3.2 수강 탭 (students)

- 차수 탭 (PACKAGES를 탭으로 전환)
- 수강생 목록 카드: 이름, 그룹, 회차별 출석 상태 요약
- 학습자 상세 모달 (detailStudent)

### 3.3 출석 탭 (attendance)

```
┌─────────────────────────────────────────────────────────┐
│  [차수 탭 1] [차수 탭 2] ...   |  [회차 셀렉트]  [라이브] │
│  ─────────────────────────────────────────────────────  │
│  검색 [_______________]                                  │
│                                                         │
│  이름     그룹   ←  출석 상태 버튼 (5종)  →   상세       │
│  이승주   비서실    [출석] [지각] [조퇴] [결석] [미확인]  │
│  김하은   개발팀    [출석] ...                           │
│  ...                                                    │
│  ─────────────────────────────────────────────────────  │
│  통계바: 출석N · 지각N · 조퇴N · 결석N · 미확인N         │
│  ─────────────────────────────────────────────────────  │
│  [회차 마감] [수료 처리]                                  │
└─────────────────────────────────────────────────────────┘
```

**핵심 상호작용:**
- 상태 버튼 클릭 → handleStatusChange → Toast
- [라이브 출석] 버튼 → liveMode = true → 전체화면 전환
- [회차 마감] → 미확인(pending) → absent 일괄 전환
- [수료 처리] → 출석률 75% 이상 학습자 수료 확정

### 3.4 설문 탭 (survey)
Phase 2 예정. 현재 플레이스홀더.

---

## 4. 상태 모델 (State)

### App 레벨 State

| state | 타입 | 설명 |
|-------|------|------|
| `activeTab` | string | 'summary' \| 'students' \| 'attendance' \| 'survey' |
| `selectedPkg` | string | 현재 선택된 차수 ID |
| `selectedSession` | string | 현재 선택된 회차 ID |
| `liveMode` | boolean | QR 라이브 모드 여부 |
| `qrCountdown` | number | 30초 카운트다운 |
| `attendance` | object | `{ [sessId]: { [userId]: status } }` |
| `search` | string | 출석 탭 검색어 |
| `toasts` | array | Toast 메시지 목록 |
| `detailStudent` | object \| null | 수강생 상세 모달 데이터 |
| `calView` | string | 'month' \| 'week' |
| `calMonth` | number | 캘린더 현재 월 |
| `dismissed` | array | 해제된 알림 인덱스 |

### 출석 상태 5종 (확정)

| 상태 | 키 | 색상 |
|------|-----|------|
| 미확인 | `pending` | slate |
| 출석 | `attended` | emerald |
| 지각 | `late` | amber |
| 조퇴 | `early_leave` | orange |
| 결석 | `absent` | rose |

---

## 5. 핵심 함수 설계

| 함수 | 역할 |
|------|------|
| `getSessionStats(sessId, pkgId)` | 회차별 출석 통계 (total/counts/rate) |
| `handleStatusChange(userId, sessId, status)` | 출석 상태 변경 + Toast |
| `overallRate` (useMemo) | 전 차수 평균 출석률 |
| QR 자동갱신 (useEffect) | liveMode ON시 30초 interval |
| BroadcastChannel | 데모 시나리오 제어 (SCENARIO_1/2/3) |

---

## 6. 데이터 구조

```js
COURSES_DB[courseId] = {
  title, category, instructor, location,
  status: 'active' | 'closed' | 'draft',
  enrollMethod: 'self' | 'assign',
  selectionRule: 'single' | 'multi',
  packages: [
    {
      id, name, capacity, enrolled, place,
      startDate, endDate,
      sessions: [{ id, name, date, startTime, endTime, place }]
    }
  ],
  studentMap: { [pkgId]: [userId, ...] }
}

attendance: { [sessId]: { [userId]: 'pending'|'attended'|'late'|'early_leave'|'absent' } }
```

---

## 7. 컴포넌트 목록

| 컴포넌트 | 역할 |
|----------|------|
| `App` | 최상위, 전체 State 관리 |
| `SummaryTodayBar` | 오늘/다음 회차 배너 |
| `SummaryAlertChip` | 경고 칩 (해제 버튼 포함) |
| `KPIStrip` | 핵심 수치 스트립 |
| `PackageTable` | 차수별 출석률 테이블 |
| `CalendarView` | 월별/주별 캘린더 |
| `AttendanceRow` | 출석 탭 수강생 행 (5종 버튼) |
| `StudentDetailModal` | 수강생 상세 슬라이드 패널 |
| 라이브 모드 (인라인) | 전체화면 QR + 실시간 사이드바 |

---

## 8. 테스트 시나리오

| 시나리오 | 검증 항목 |
|----------|-----------|
| 라이브 모드 진입 | QR 표시, 30초 카운트다운, 상태 토글 |
| 출석 상태 변경 | 버튼 클릭 → 상태 반영 → Toast |
| 회차 마감 | pending → absent 전환 확인 |
| 캘린더 뷰 전환 | 월별 ↔ 주별, 회차 dot 표시 |
| 미퍼블리싱 가드 | status=draft → 안내 화면 표시 |
| 케이스 3 (5차수) | 차수 탭 전환, 통계 집계 |

---

## 9. 구현 현황 (2026-04-28 기준)

> offline-course-view.html 기준. 설계서 대비 실제 구현 상태.

### 탭 이름 변경 (확정)

| 설계서 | 구현 | 상태 |
|--------|------|------|
| 요약 (summary) | 대시보드 (dashboard) | ✅ |
| 수강 (students) | 수강생 관리 (learners) | ✅ |
| 출석 (attendance) | 출석·수료 (attendance) | ✅ (기능 부분 미구현) |
| 설문 (survey) | 통계 (stats) | ✅ (탭 목적 변경, Phase 2 설문은 이연) |

### 미구현 항목 (P0 — Phase 1 필수)

| 항목 | 비고 |
|------|------|
| 개인별 출석 상태 변경 UI (5종 버튼) | 현재 회차별 요약 통계만 표시 |
| 회차 마감 버튼 | 없음 |
| 차수 레벨 수료 처리 버튼 | 없음 |
| 조퇴(early_leave) 컬럼 | 출석탭 테이블에 4종만 표시 (조퇴 누락) |

### 구현됨 (설계 외 추가)

| 항목 | 비고 |
|------|------|
| 차수 진행 현황 카드 (대시보드) | 설계에 없었으나 추가됨 |
| 소속별 수료 현황 바차트 | 설계에 없었으나 추가됨 |
| 회차 상세 팝오버 (캘린더 클릭) | 설계에 없었으나 추가됨 |
