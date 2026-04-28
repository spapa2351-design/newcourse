# Design: offline-course-list
> Feature ID: offline-course-list  
> Created: 2026-04-27  
> Updated: 2026-04-28 — 추가 필터 빌더 구현 반영
> Stack: React 18 CDN (ESM) + Tailwind CDN + Lucide React 0.292.0 + Babel Standalone

---

## 1. 3패널 레이아웃

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  HEADER  bg-white border-b  (sticky top-0 z-50)                              │
│  [MapPin] 오프라인 코스    [코스 순서 관리] [수강생 등록] [코스 등록 ■]         │
└──────────────────────────────────────────────────────────────────────────────┘
┌───────────┐ ┌────────────────────────────────────────────────────────────────┐
│  GLOBAL   │ │  FILTER BAR  bg-white border-b                                 │
│  SIDEBAR  │ │  [전체 N] [운영중 N] [임시저장 N] [종료 N] [+ 필터 추가]        │
│  w-[200px]│ ├────────────────────────────────────────────────────────────────┤
│  bg-white │ │  TOOLBAR  px-6 py-3  flex justify-between                      │
│  border-r │ │  총 N  [🔍 코스명/강사 검색]       [↓] [⊞][≡]                 │
│           │ │                                   (선택 시: [선택 삭제 ■])      │
│  🔥 로고  │ ├──────────┬─────────────────────────────────────────────────────┤
│           │ │  CAT     │  TABLE  bg-white rounded-xl shadow-sm               │
│  [메뉴1]  │ │  SIDE    │  ┌──┬──┬────┬────┬──────────┬──────┬────┬──────┐   │
│  [메뉴2▼] │ │  BAR     │  │☐ │▶ │ 표지│ 상태│  코스명  │수강관│차수 │ ... │   │
│  > 서브   │ │  w-[180px│  ├──┼──┼────┼────┼──────────┼──────┼────┼──────┤   │
│  [오프라인│ │  bg-white│  │☐ │▼ │ img│ ●운 │ 코스 제목 │[수강]│[차수]│ ... │   │
│  코스 ●] │ │  border-r│  ├──┴──┴────┴────┴──────────┴──────┴────┴──────┤   │
│  [콘텐츠] │ │          │  │  EXPANDED ROW (차수 상세 테이블, fadeIn)      │   │
│  [T튜브▼] │ │  분류    │  │  차수명 / 기간 / 장소 / 회차 / 정원 / 신청 / 잔여│  │
│  ...      │ │  ─────   │  └──────────────────────────────────────────────┘   │
│           │ │  전체    │                                                      │
│           │ │  WORK ▼  │                                                      │
│           │ │   직무역량│                                                      │
│           │ │   리더십  │                                                      │
│           │ │   영업    │                                                      │
│           │ │  공통/온보│                                                      │
│           │ │  IT      │                                                      │
│           │ │  DX      │                                                      │
└───────────┘ └──────────┴─────────────────────────────────────────────────────┘
```

---

## 2. State 목록

| State | Type | 초기값 | 설명 |
|-------|------|--------|------|
| `courses` | `Course[]` | `COURSES` | 코스 목록 (삭제 시 갱신) |
| `coverImages` | `Record<id, {dataUrl}>` | `{}` | localStorage 로드 커버 이미지 맵 |
| `statusFilter` | `'all' \| 'active' \| 'draft' \| 'closed'` | `'all'` | 상태 탭 필터 현재값 |
| `search` | `string` | `''` | 코스명/강사 검색어 |
| `expandedIds` | `Set<number>` | `new Set()` | 차수 행 확장 중인 코스 ID 집합 |
| `selectedIds` | `Set<number>` | `new Set()` | 체크박스 선택 코스 ID 집합 |
| `catFilter` | `string` | `'all'` | 분류 사이드바 선택값 |
| `expandedCats` | `Set<string>` | `new Set(['work'])` | 분류 사이드바 펼쳐진 카테고리 |
| `sideExpanded` | `Set<string>` | `new Set(['course'])` | 글로벌 사이드바 펼쳐진 메뉴 |
| `activeFilters` | `{key,label,value}[]` | `[]` | 추가 필터 빌더로 적용된 필터 목록 |
| `filterPopup` | `null \| 'select' \| fieldKey` | `null` | 필터 팝업 상태 (null=닫힘, 'select'=항목선택, fieldKey=값입력) |
| `filterInput` | `string` | `''` | 필터 값 입력 중간 상태 |

---

## 3. 테이블 컬럼 명세

| # | 컬럼 | 너비 | 정렬 | 내용 |
|---|------|------|------|------|
| 1 | 체크박스 | w-10 | center | `<input type="checkbox">` — 전체/개별 선택 |
| 2 | 확장 | w-10 | center | `ChevronRight/Down` 버튼 — 차수 행 토글 |
| 3 | 표지 | w-[52px] | center | 커버 이미지(38×53px) 또는 빈 플레이스홀더 |
| 4 | 상태 | w-[80px] | left | STATUS_CFG 뱃지 (dot + label) |
| 5 | 코스명 | flex-1 | left | 코스 제목 + 반 수 뱃지 + 장소 요약 |
| 6 | 수강관리 | w-[90px] | center | active/closed → 링크 버튼; 나머지 → 비활성 |
| 7 | 차수 | w-[110px] | left | 반 수 + 총 회차 (클릭 시 확장 토글) |
| 8 | 분류 | w-[90px] | left | 카테고리 뱃지 |
| 9 | 교육기간 | w-[140px] | left | 최초 시작일 ~ 최후 종료일 요약 |
| 10 | 수강 인원 | w-[70px] | right | 등록수/총정원 (마감 시 "마감" 표기) |
| 11 | 등록일 | w-[130px] | left | registeredAt (yyyy/mm/dd hh:mm) |
| 12 | 생성자 | w-[100px] | left | creator 식별자 |
| 13 | 관리 | w-[80px] | center | Link2 / Edit3(편집 링크) / Trash2(삭제) |

---

## 4. 확장 행 (차수 상세) 설계

확장 행은 `colSpan="12"` 셀 내부에 중첩 테이블로 구성된다.  
애니메이션: `.animate-fadeIn` (translateY 4px → 0, 0.25s ease-out)

### 차수 상세 내부 컬럼

| 컬럼 | 정렬 | 내용 |
|------|------|------|
| 차수명 | left | `pkg.name` (bold) |
| 기간 | left | `fmtRange(startDate, endDate)` |
| 장소 | left | `MapPin` 아이콘 + `pkg.place` |
| 회차 | center | `pkg.sessions`회 |
| 정원 | right | `pkg.capacity`명 |
| 신청 | right | `pkg.enrolled`명 (bold) |
| 잔여 | right | `capacity - enrolled` — 마감(rose)/임박 ≥80%(amber)/여유(emerald) |

### 하단 액션

```
[Edit3 차수 편집 → admin1.html?courseId=X]  [QrCode 수강관리 → admin1-1.html?courseId=X]
```

---

## 5. STATUS_CFG 상태맵

```js
const STATUS_CFG = {
  active:    { label: '운영중',   bg: 'bg-indigo-50',  text: 'text-indigo-600', dot: 'bg-indigo-500' },
  published: { label: '운영중',   bg: 'bg-indigo-50',  text: 'text-indigo-600', dot: 'bg-indigo-500' },
  draft:     { label: '임시저장', bg: 'bg-slate-100',  text: 'text-slate-500',  dot: 'bg-slate-400'  },
  saved:     { label: '임시저장', bg: 'bg-slate-100',  text: 'text-slate-500',  dot: 'bg-slate-400'  },
  closed:    { label: '종료',     bg: 'bg-slate-50',   text: 'text-slate-400',  dot: 'bg-slate-300'  },
};
```

> `active`·`published` → "운영중" 탭, `draft`·`saved` → "임시저장" 탭으로 통합 처리

---

## 6. 핵심 함수 명세

| 함수 | 시그니처 | 동작 |
|------|----------|------|
| `toggleExpand` | `(id: number) => void` | `expandedIds` Set에서 id 토글 |
| `toggleSelect` | `(id: number) => void` | `selectedIds` Set에서 id 토글 |
| `toggleAll` | `() => void` | 필터된 코스 전체 선택/해제 |
| `handleDelete` | `(id: number) => void` | confirm 후 `setCourses` + `selectedIds`에서 제거 |
| `handleBulkDelete` | `() => void` | `selectedIds.size > 0` 검증 → confirm → setCourses + setSelectedIds(new Set()) |
| `getDateRange` | `(course: Course) => string` | packages 최초 start ~ 최후 end 요약 문자열 반환 |
| `getPlaceSummary` | `(course: Course) => string` | 중복 제거 장소 목록 → "장소명 외 N곳" |
| `getTotalSessions` | `(course: Course) => number` | packages.sessions 합산 |

---

## 7. 필터 파이프라인

```
courses (원본)
  └─ statusFilter 적용 → active|published / draft|saved / closed / scheduled
       └─ catFilter 적용 → category === catFilter (all이면 통과)
            └─ search.trim() 적용 → title OR instructor 포함 여부
                 └─ activeFilters 순차 적용 (각 필터 AND 결합)
                      └─ filtered (렌더링 대상)
```

`useMemo` 의존성: `[courses, statusFilter, catFilter, search, activeFilters]`

### 추가 필터 빌더 (2026-04-28 구현)

상태 탭 옆 "+ 필터 추가" 버튼으로 아래 필드를 추가 필터로 적용 가능:

| 필드 key | 레이블 | 입력 방식 | 매칭 로직 |
|----------|--------|-----------|-----------|
| `instructor` | 강사명 | 텍스트 입력 | `c.instructor` 부분 포함 (대소문자 무시) |
| `place` | 장소 | 텍스트 입력 | `c.packages[].place` 중 하나 이상 부분 포함 |
| `enrollMethod` | 수강 방식 | 옵션 선택 (자율 수강 / 강제 할당) | `c.enrollMethod === value` 정확 매칭 |

**UX 플로우**: `+ 필터 추가` 클릭 → 항목 선택 팝업 → 값 입력 팝업 (또는 옵션 선택) → 적용 → 인디고 칩으로 표시 → `×` 개별 제거 / `초기화` 전체 제거

**팝업 z-index 구조**: 버튼 컨테이너 `z-30` > 외부 클릭 오버레이 `z-15` → 팝업이 오버레이 위에서 동작

---

## 8. 선택 삭제 (일괄 삭제) 설계

### 조건부 표시 위치
"카운트 + 검색" 바 우측 그룹 (`flex items-center gap-2`) 내부, 기존 다운로드/뷰 버튼 앞에 조건부 삽입:

```jsx
{selectedIds.size > 0 && (
  <button
    onClick={handleBulkDelete}
    className="px-3 py-1.5 bg-rose-500 text-white rounded-lg text-[13px] font-bold
               hover:bg-rose-600 transition-colors flex items-center gap-1.5 shadow-sm"
  >
    <Trash2 size={13}/> 선택 삭제 ({selectedIds.size})
  </button>
)}
```

### handleBulkDelete 로직
```js
const handleBulkDelete = () => {
  if (selectedIds.size === 0) return;
  if (!confirm(`선택한 ${selectedIds.size}개 코스를 삭제하시겠습니까?`)) return;
  setCourses(prev => prev.filter(c => !selectedIds.has(c.id)));
  setSelectedIds(new Set());
};
```
