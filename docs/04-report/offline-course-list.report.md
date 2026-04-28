# Report: offline-course-list
> Feature ID: offline-course-list  
> Report Date: 2026-04-27  
> Status: Phase 1 Complete

---

## Executive Summary

| 관점 | 내용 |
|------|------|
| **Problem** | 오프라인 교육 코스의 다차수·다장소 구조를 단순 목록으로는 표현하기 어렵고, 관리자가 상태별/분류별 탐색과 수강 현황 확인에 많은 시간이 소요됐다. |
| **Solution** | 3패널 레이아웃(글로벌 사이드바 + 분류 사이드바 + 테이블 메인)에 상태 탭 필터·검색·카테고리 트리·인라인 차수 확장을 결합한 운영 허브를 구축했다. |
| **기능 UX 효과** | 상태/분류/검색 3중 필터로 원하는 코스를 즉시 탐색, 행 확장으로 차수별 잔여석을 인라인 확인, 선택 삭제로 다건 코스 정리 가능 — 운영 효율 전반적으로 향상. |
| **Core Value** | "찾기 → 확인 → 진입"을 단일 화면에서 해결하는 오프라인 코스 운영 허브 완성. Phase 1 Match Rate 100% 달성. |

---

## PDCA 여정 요약

| Phase | 활동 | 산출물 | 상태 |
|-------|------|--------|------|
| **Plan** | Feature 범위 정의, 성공 기준 설정, Phase 1/2 구분 | `offline-course-list.plan.md` | 완료 |
| **Design** | 3패널 레이아웃 설계, State 목록, 테이블 컬럼 명세, 핵심 함수 설계 | `offline-course-list.design.md` | 완료 |
| **Do (Retrospective)** | 기존 구현 코드(660줄 → 672줄) 분석, Gap 식별 후 선택 삭제 기능 추가 수정 | `admin/index.html` (+12줄) | 완료 |
| **Check (Analysis)** | v1/v2 Match Rate 산출, 갭 목록 작성, 성공 기준 평가 | `offline-course-list.analysis.md` | 완료 |
| **Act (Report)** | 전체 PDCA 결과 종합, Phase 2 이월 항목 정리 | `offline-course-list.report.md` | 완료 |

---

## Match Rate 추이

| 버전 | Structural | Functional | Contract | **Match Rate** |
|------|-----------|-----------|---------|--------------|
| v1 (수정 전) | 100% | 91.7% | 91.7% | **93.3%** |
| v2 (수정 후) | 100% | 100% | 100% | **100%** |

> 공식: `Structural × 0.2 + Functional × 0.4 + Contract × 0.4`

---

## 구현 완료 기능 표

| ID | 기능 | 구현 위치 | 비고 |
|----|------|----------|------|
| F-01 | 목록 조회 | `COURSES` 상수 + `filtered` useMemo | 6개 더미 데이터 |
| F-02 | 상태 탭 필터 | `statusFilter` state + `STATUS_TABS` | 카운트 뱃지 포함 |
| F-03 | 검색 | `search` state + `.toLowerCase().includes()` | 코스명/강사 |
| F-04 | 카테고리 필터 | `catFilter` state + CATEGORIES 트리 | WORK/공통/IT/DX |
| F-05 | 차수 확장 행 | `expandedIds` state + `animate-fadeIn` | 중첩 테이블 |
| F-06 | 코스등록 링크 | 헤더 `<a href="admin1.html">` | 새 코스 등록 |
| F-07 | 수강관리 링크 | active/closed 조건부 `<a href="admin1-1.html?courseId=X">` | 상태 조건 분기 |
| F-08 | 커버이미지 | `useEffect` → `localStorage.getItem('lms_cover_'+id)` | dataUrl 방식 |
| F-09 | 단건 삭제 | `handleDelete` + `confirm()` | Trash2 아이콘 |
| F-10 | 선택 삭제 | `handleBulkDelete` + `selectedIds.size > 0` 조건부 버튼 | **v2 신규 추가** |
| F-11 | 글로벌 사이드바 확장 | `sideExpanded` Set + `toggleSideMenu` | 현재 페이지 active 표시 |
| F-12 | 분류 트리 확장 | `expandedCats` Set + `toggleCatExpand` | WORK 기본 펼침 |

---

## 수정 내역 (v1 → v2)

### 추가된 코드 (`admin/index.html`)

**1. `handleBulkDelete` 함수 추가** (line 207-212)
```js
const handleBulkDelete = () => {
  if (selectedIds.size === 0) return;
  if (!confirm(`선택한 ${selectedIds.size}개 코스를 삭제하시겠습니까?`)) return;
  setCourses(prev => prev.filter(c => !selectedIds.has(c.id)));
  setSelectedIds(new Set());
};
```

**2. 선택 삭제 버튼 조건부 렌더링 추가** (툴바 우측, 다운로드 버튼 앞)
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

---

## Phase 2 이월 항목

| 항목 | 현황 | 예상 작업 |
|------|------|----------|
| Grid 뷰 토글 | 버튼 존재, 기능 없음 | 카드형 그리드 레이아웃 구현, 뷰 state 추가 |
| 다운로드 버튼 | 버튼 존재, 기능 없음 | CSV 생성 또는 API 연동 |
| 코스 순서 관리 | 버튼 존재, 기능 없음 | Drag-and-drop 인터페이스 (별도 모달 또는 페이지) |
| 필터 추가 플레이스홀더 | 버튼 존재, 기능 없음 | 필터 조건 UX 확정 후 구현 |
| 일괄 처리 확장 | 삭제만 구현 | 상태 변경, 복사 등 추가 일괄 액션 |

---

## 파일 목록

| 파일 | 역할 |
|------|------|
| `J:\claude\newcourse\admin\index.html` | 구현 파일 (660 → 672줄) |
| `J:\claude\newcourse\docs\01-plan\features\offline-course-list.plan.md` | Plan 문서 |
| `J:\claude\newcourse\docs\02-design\features\offline-course-list.design.md` | Design 문서 |
| `J:\claude\newcourse\docs\03-analysis\offline-course-list.analysis.md` | Analysis 문서 |
| `J:\claude\newcourse\docs\04-report\offline-course-list.report.md` | 이 문서 |
