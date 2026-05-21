# Analysis: offline-course-list
> Feature ID: offline-course-list  
> Analysis Date: 2026-04-27  
> Analyst: PDCA Retrospective (Claude Code)

---

## Match Rate 공식

```
Match Rate = Structural × 0.2 + Functional × 0.4 + Contract × 0.4
```

---

## Gap Analysis: Design vs 구현

### Structural (레이아웃/컴포넌트 존재 여부)

| ID | 항목 | 설계 | 구현 | 결과 |
|----|------|------|------|------|
| S-01 | 3패널 레이아웃 (글로벌 사이드바 200px) | O | O | PASS |
| S-02 | 분류 사이드바 (180px) | O | O | PASS |
| S-03 | 헤더 (sticky, 코스 등록/수강생 등록 버튼) | O | O | PASS |
| S-04 | 상태 탭 필터 바 | O | O | PASS |
| S-05 | 카운트 + 검색 툴바 | O | O | PASS |
| S-06 | 테이블 (13컬럼) | O | O | PASS |
| S-07 | 확장 행 (차수 상세 중첩 테이블) | O | O | PASS |
| S-08 | Empty State (검색 결과 없음) | O | O | PASS |

**Structural Score: 8/8 = 100%**

---

### Functional (핵심 기능 동작)

| ID | 기능 | 설계 | v1 구현 | v2 구현 | 비고 |
|----|------|------|---------|---------|------|
| F-01 | 목록 조회 (COURSES 렌더링) | O | O | O | |
| F-02 | 상태 탭 필터 (카운트 포함) | O | O | O | |
| F-03 | 검색 (코스명/강사) | O | O | O | |
| F-04 | 카테고리 필터 (사이드바 트리) | O | O | O | |
| F-05 | 차수 확장 행 (패키지 상세) | O | O | O | |
| F-06 | 코스등록 링크 (admin1.html) | O | O | O | |
| F-07 | 수강관리 링크 (admin1-1.html) | O | O | O | active/closed 조건 |
| F-08 | 커버이미지 localStorage | O | O | O | |
| F-09 | 단건 삭제 (confirm) | O | O | O | |
| **F-10** | **선택 삭제 (일괄 삭제)** | **O** | **X** | **O** | **Important 갭 → 수정 완료** |
| F-11 | 글로벌 사이드바 메뉴 확장 | O | O | O | |
| F-12 | 분류 카테고리 트리 확장 | O | O | O | |

**Functional Score v1: 11/12 = 91.7%**  
**Functional Score v2: 12/12 = 100%**

---

### Contract (State 모델 완성도)

| ID | State | 설계 | 구현 | 결과 |
|----|-------|------|------|------|
| C-01 | courses: Course[] | O | O | PASS |
| C-02 | coverImages: Record<id, {dataUrl}> | O | O | PASS |
| C-03 | statusFilter: 'all'\|'active'\|'draft'\|'closed' | O | O | PASS |
| C-04 | search: string | O | O | PASS |
| C-05 | expandedIds: Set<number> | O | O | PASS |
| C-06 | selectedIds: Set<number> | O | O | PASS |
| C-07 | catFilter: string | O | O | PASS |
| C-08 | expandedCats: Set<string> | O | O | PASS |
| C-09 | sideExpanded: Set<string> | O | O | PASS |
| C-10 | handleBulkDelete 구현 | O | X → O | v2 수정 완료 |
| C-11 | STATUS_CFG (active/published/draft/saved/closed) | O | O | PASS |
| C-12 | useMemo 필터 파이프라인 | O | O | PASS |

**Contract Score v1: 11/12 = 91.7%**  
**Contract Score v2: 12/12 = 100%**

---

## Match Rate 계산

### v1 (수정 전)

| 차원 | Score | 가중치 | 기여 |
|------|-------|--------|------|
| Structural | 100% | × 0.2 | 20.0 |
| Functional | 91.7% | × 0.4 | 36.7 |
| Contract | 91.7% | × 0.4 | 36.7 |
| **합계** | | | **93.3%** |

### v2 (수정 후)

| 차원 | Score | 가중치 | 기여 |
|------|-------|--------|------|
| Structural | 100% | × 0.2 | 20.0 |
| Functional | 100% | × 0.4 | 40.0 |
| Contract | 100% | × 0.4 | 40.0 |
| **합계** | | | **100%** |

---

## 갭 목록

| ID | 심각도 | 항목 | 처리 결과 |
|----|--------|------|----------|
| GAP-01 | **Important** | selectedIds > 0 시 선택 삭제 버튼 미표시 / handleBulkDelete 미구현 | 수정 완료 (v2) |
| GAP-02 | Minor | Grid 뷰 토글 기능 없음 (버튼만 존재) | Phase 2 이월 |
| GAP-03 | Minor | 다운로드 버튼 기능 없음 | Phase 2 이월 |
| GAP-04 | Minor | 코스 순서 관리 버튼 기능 없음 | Phase 2 이월 |
| GAP-05 | Minor | 필터 추가 버튼 플레이스홀더 | Phase 2 이월 |

**Important 갭: 1개 → 전부 해소**  
**Minor 갭: 4개 → Phase 2 이월 (계획적 미구현)**

---

## Plan 성공 기준 평가

| 성공 기준 | 결과 |
|----------|------|
| 상태 탭 필터 정확하게 동작 | PASS |
| 코스명/강사명 검색 실시간 반영 | PASS |
| 분류 사이드바 카테고리 클릭 시 필터링 | PASS |
| 행 확장 클릭 시 차수 상세 표시 | PASS |
| selectedIds > 0 시 선택 삭제 버튼 노출 및 동작 | PASS (v2 수정) |
| 커버 이미지 localStorage 연동 | PASS |

**전체 성공 기준 달성: 6/6 (100%)**
