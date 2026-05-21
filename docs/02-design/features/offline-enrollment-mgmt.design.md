---
feature: offline-enrollment-mgmt
phase: design
status: implemented
created: 2026-04-27
updated: 2026-04-28
file: admin/offline-view.html
architecture: 3패널 레이아웃 (좌측 사이드바 230px + 메인 탭 flex-1 + 캘린더 패널 340px 토글)
stack: React 18 CDN + Tailwind CSS CDN + Lucide React 0.292.0 (단일 HTML)
---

# 오프라인 코스 수강관리 — Design Document (offline-view.html)

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | 오프라인 교육 현장 출석 디지털화 — 수기 명단 → QR 스캔·자동 집계 |
| **WHO** | HRD 담당자(출석 수정·마감·수료), 강사(현장 QR 운영) |
| **RISK** | 회차 마감·수료 처리 미구현 시 Phase 1 납품 불가; 수강 탭 차수 전환 없으면 UX 혼란 |
| **SUCCESS** | 회차 마감 → 수료 처리 화면 완결; 수강 탭 차수별 학습자 전환 |
| **SCOPE** | 프론트엔드 전용 단일 HTML 프로토타이핑 (백엔드 없음) |

---

## 1. 아키텍처

**3패널 레이아웃**: 좌측 사이드바(230px) + 메인 콘텐츠(flex-1) + 캘린더 패널(340px, 헤더 "일정" 버튼 토글)

라이브 모드는 전체화면 early-return 패턴 (사이드바·탭 숨김, flex-[7]/flex-[3] 분할).

---

## 2. 화면 구조

### 2.1 전체 레이아웃 (일반 모드)

```
┌────────────────────────────────────────────────────────────────┐
│ HEADER                                                         │
│  ← 목록  |  코스명 + 운영중 뱃지  강사·장소  | [일정] [엑셀] [코스편집] │
└────────────────────────────────────────────────────────────────┘
┌──────────────┬────────────────────────────────┬───────────────┐
│ LEFT SIDEBAR │  오늘 회차 배너 (조건부)        │ CALENDAR      │
│ (230px)      │  요약 통계 카드 4개            │ (340px, 토글) │
│              │  TAB: [수강생관리|출석·수료|통계]│               │
│  인디고커버  │                                │  월 이동      │
│  코스 정보   │  (탭 콘텐츠 영역)              │  차수 범례    │
│  수강 현황   │                                │  캘린더 그리드│
│  수료 현황   │                                │  세션 목록    │
│  출석률      │                                │               │
│  운영방식뱃지│                                │               │
│  ──────────  │                                │               │
│  [수강생등록]│                                │               │
│  [라이브출석]│                                │               │
│  [운영종료]  │                                │               │
└──────────────┴────────────────────────────────┴───────────────┘
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

### 3.1 수강생 관리 탭 (learners)

```
┌──────────────────────────────────────────────────────────────┐
│  [검색 입력]  [차수 셀렉트]  총 N명  [+ 등록] [엑셀 다운로드] │
├──────────────────────────────────────────────────────────────┤
│  이름(아바타)  소속  차수  수료상태  액션(수료처리·차수변경)  │
│  ...                                                         │
└──────────────────────────────────────────────────────────────┘
```

- 수료 상태 3종: `completed`(emerald) / `in_progress`(indigo) / `not_started`(slate)
- [+ 등록] 버튼 → 수강생 등록 모달 open (`showEnrollModal=true`)
- `수료 처리` 버튼: completion !== 'completed' 인 행에만 노출

### 3.2 출석·수료 탭 (attendance)

```
┌──────────────────────────────────────────────────────────────┐
│  차수별 아코디언 헤더 (ChevronDown/Up 토글)                   │
│  차수명·기간·장소·출석률  [QR 출석 — 오늘 차수만]             │
├──────────────────────────────────────────────────────────────┤
│  회차  날짜  시간  출석  지각  결석  미확인  출석률            │
│  ...                                                         │
└──────────────────────────────────────────────────────────────┘
```

- 오늘 차수: indigo ring 강조 + "오늘" 뱃지
- [QR 출석] 버튼 → `setLiveMode(true)` (라이브 모드 진입)
- 출석률 색상: 90↑emerald / 70↑amber / rose

### 3.3 통계 탭 (stats)

- **차수별 출석률**: 바 차트 (filled gradient indigo-400→indigo-600)
- **수료 현황**: 완료·진행중·미시작 가로 바 + 전체 수료율 카드 (emerald)
- **차수별 신청 현황**: SVG circle 도넛 5개, pct≥90 emerald / else indigo

> ⚠️ 설문 탭은 Phase 2 예정. 현재 미구현.

---

## 4. State 모델 (구현 기준 — 2026-04-28)

| State | 타입 | 초기값 | 역할 |
|-------|------|--------|------|
| `tab` | `'learners' \| 'attendance' \| 'stats'` | `'learners'` | 현재 활성 탭 |
| `pkgFilter` | `string` | `'all'` | 수강생 탭 차수 필터 |
| `search` | `string` | `''` | 수강생 검색어 |
| `openPkgs` | `Set<string>` | `new Set(['p1','p2','p3','p4'])` | 출석탭 아코디언 오픈 상태 |
| `liveMode` | `boolean` | `false` | QR 라이브 모드 전환 |
| `calOpen` | `boolean` | `false` | 캘린더 패널 토글 |
| `calMonth` | `number` | `4` | 캘린더 현재 월 |
| `showEnrollModal` | `boolean` | `false` | 수강생 등록 모달 |
| `enrollSearch` | `string` | `''` | 등록 모달 검색어 |
| `enrollPkg` | `string` | `'p4'` | 등록할 차수 ID |
| `qrCountdown` | `number` | `30` | QR 갱신 카운트다운 (초) |
| `qrTimerRef` | `useRef` | `null` | QR interval ref |

---

## 5. 출석 상태 (ATT_STATUS 5종)

| Key | Label | 배경 | 텍스트 | 아이콘 |
|-----|-------|------|--------|--------|
| `pending` | 미확인 | `bg-slate-100` | `text-slate-500` | `Clock` |
| `attended` | 출석 | `bg-emerald-50` | `text-emerald-600` | `CheckCircle` |
| `late` | 지각 | `bg-amber-50` | `text-amber-600` | `AlertCircle` |
| `early_leave` | 조퇴 | `bg-orange-50` | `text-orange-600` | `ArrowRight` |
| `absent` | 결석 | `bg-rose-50` | `text-rose-600` | `XCircle` |

---

## 6. 핵심 함수 및 유틸

| 함수 | 역할 |
|------|------|
| `calDays(y, m)` | 월별 캘린더 날짜 배열 생성 (월요일 시작, null 패딩) |
| `pkgAttRate(pkg)` | 차수 평균 출석률 계산 (완료 회차 기준) |
| `attRate(session)` | 단일 회차 출석률 |
| `overallRate` | useMemo — 전체 차수 종합 출석률 |
| `calDaysData` | useMemo — 현재 calMonth의 날짜 배열 |
| `sessByDate` | useMemo — 날짜→회차 맵 (캘린더 도트용) |
| `togglePkg(id)` | 아코디언 열기/닫기 (openPkgs Set 토글) |
| `fmtDate(d)` | `2026-04-07` → `26.04.07` |
| `fmtShort(d)` | `2026-04-07` → `04/07` |
| `fmtRange(s, e)` | 날짜 범위 포맷 |

---

## 7. 데이터 상수

| 상수 | 역할 |
|------|------|
| `LEARNERS_RAW` | 수강생 20명 (pkgId 포함) |
| `COMPLETION` | id→완료상태 맵 (`completed/in_progress/not_started`) |
| `COURSE` | 코스 기본정보 + 5개 패키지 + 세션 |
| `STUDENT_POOL` | 등록 모달용 10명 풀 |
| `PKG_COLORS` | 5종 차수 색상 테마 (indigo/emerald/violet/amber/rose) |
| `COMPL_CFG` | 수료상태별 스타일 설정 |
| `TODAY` | `'2026-04-28'` (기준 날짜) |

---

## 8. 컴포넌트 의존

- `React 18.2.0` + `react-dom@18.2.0` (ESM CDN)
- `Tailwind CSS CDN` (커스텀 indigo 팔레트 + boxShadow card)
- `Lucide React 0.292.0` — ArrowLeft, Edit3, Download, QrCode, Users, Calendar, MapPin, CheckCircle, Clock, X, ChevronDown/Up/Left/Right, Search, BarChart2, TrendingUp, Award, RefreshCw, CheckSquare, UserCheck, Zap, Minimize2, Power, Plus
- `@babel/standalone` (JSX 변환)
