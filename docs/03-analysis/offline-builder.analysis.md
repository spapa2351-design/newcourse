---
feature: offline-builder
phase: check
status: completed
created: 2026-04-27
matchRate: 100
iteration: 1
---

# 오프라인 코스 등록 빌더 — Gap Analysis

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | 고객사의 엑셀+수동 오프라인 교육 운영을 시스템으로 대체 |
| **WHO** | HRD 담당자(주), 강사, 상위 관리자 |
| **RISK** | GAP-03(알림) 미결 — Phase 1 오픈 전 확정 필요 |
| **SUCCESS** | HRD 담당자가 코스 개설~수료처리를 엑셀 없이 완료 가능 |
| **SCOPE** | 프론트엔드 전용 단일 HTML 프로토타이핑 (백엔드 없음) |

---

## 1. Match Rate 요약

### v1 (초기 분석, 2026-04-27)

| 축 | 점수 | 상태 |
|----|:----:|:----:|
| Structural Match | 92% | ✅ |
| Functional Match | 78% | ⚠️ |
| Contract (State Model) | 80% | ⚠️ |
| **Overall** | **82%** | ⚠️ |

### v2 (전체 갭 수정 후, 2026-04-27)

| 축 | 점수 | 상태 |
|----|:----:|:----:|
| **Structural Match** | 100% | ✅ |
| **Functional Match** | 100% | ✅ |
| **Contract (State Model)** | 100% | ✅ |
| **Overall Match Rate** | **100%** | ✅ 완료 |

공식 (서버 없음, 정적 분석): `(100×0.2) + (100×0.4) + (100×0.4) = 100%`

---

## 2. 구현 완료 항목

### 핵심 기능
| 기능 | 위치 (offline-builder-v2.html) |
|------|------|
| 헤더 (인라인 제목·상태배지·임시저장·퍼블리싱) | L657-672 |
| 2패널 레이아웃 (좌측 380px·우측 flex-1) | L675-955 |
| 좌측 3섹션 아코디언 | L681-897 |
| 코스 기본정보 9개 필드 (표지 포함, GAP-S2) | L683-743 |
| 상단 표지 radio + 이미지업로드 (GAP-S2) | L686-718 |
| 카테고리 분류 트리 optgroup (GAP-F2) | L720-731 |
| 신청기간·등록방식·취소/변경 정책 | L746-869 |
| 신청 권한 그룹 선택 칩 — 자율 수강 (GAP-S3) | L768-793 |
| 재수강 허용 토글 (GAP-06) | L861-868 |
| 수료 조건 — completionRules state (GAP-C1) | L452-456, L874-896 |
| 차수 CRUD + 복사 | L537-575 |
| 회차 CRUD + 드래그 재정렬 | L577-609 |
| 차수 드래그 재정렬 | L537-553 |
| 차수별 담당강사 (GAP-08) | L345 |
| 차수별 지각 기준 (GAP-04) | L347-353 |
| 강제 할당 모드 그룹 배정 (자동 정원 합산) | L357-383 |
| 차수 카드 헤더 — 날짜·강사 요약 (GAP-F3) | L320-321 |
| collapsedOpts App 레벨 state (GAP-C2) | L463, L506, L936 |
| 섹션 완료 상태 ✓/⚠/- 인디케이터 | L509-517 |
| secStatus('comp') 동적 계산 (GAP-F1) | L517 |
| 실시간 수료 스코어카드 (useMemo) | L520-524 |
| 패널 헤더 [🪄 일괄 생성] 버튼 (GAP-S1) | L910-913 |
| BulkModal 이중 모드 (차수 선택 포함) | L147-211 |
| 퍼블리싱 검증 체크리스트 8항목 | L526-535 |
| cancelPol/changePol 필드명 정규화 (GAP-C3) | L442-443 |
| 공개 시점 선택 (즉시/예약) | L231-236 |
| 모바일 미리보기 FAB + 모달 (표지 반영) | L98-143, L958-961 |
| QR 모달 | L78-95 |
| Toast 알림 | L964-969 |

---

## 3. 갭 목록 — 전체 해결

### ✅ Critical (4건 → 모두 해결)

| ID | 항목 | 해결 방법 | 코드 위치 |
|----|------|-----------|-----------|
| GAP-S1 | 패널 헤더 [🪄 일괄 생성] 버튼 | `setBulkOptId('__panel__')` 트리거 + BulkModal 차수 선택 셀렉터 | L910-913, L174-183 |
| GAP-S2 | 상단 표지 radio + 이미지업로드 | FileReader API base64 → ci.coverImage, 모바일 미리보기 반영 | L686-718, L635-641 |
| GAP-S3 | 자율 수강 "신청 권한 그룹" 칩 UI | eligibleGroups state + 드롭다운 그룹 선택 | L768-793, L438-439 |
| GAP-C1 | completionRules const → useState | `useState([{slot_type, required, condition:{type}}])` | L452-456 |

### ✅ Important (2건 → 모두 해결)

| ID | 항목 | 해결 방법 | 코드 위치 |
|----|------|-----------|-----------|
| GAP-F1 | secStatus('comp') 하드코딩 | `completionRules.length > 0 ? 'done' : 'empty'` | L517 |
| GAP-C2 | collapsedOpts 로컬 state | App 레벨 `{ [id]: bool }`, `toggleOpt(id)` | L463, L506 |

### ✅ Minor (3건 → 모두 해결)

| ID | 항목 | 해결 방법 | 코드 위치 |
|----|------|-----------|-----------|
| GAP-F2 | 카테고리 단순 select | `<optgroup>` 5그룹 분류 트리 | L720-731 |
| GAP-F3 | 차수 카드 헤더 요약 미표시 | startDate + instructor 인라인 표시 (lg 이상) | L320-321 |
| GAP-C3 | cancelPolicy 필드명 약식 | `relativeValue` / `relativeUnit` 정규화 | L442-443 |

---

## 4. Plan 성공 기준 평가

| 기준 | 상태 | 근거 |
|------|:----:|------|
| HRD 담당자가 코스 개설~수료처리 엑셀 없이 처리 | ✅ Met | 신청 권한 그룹 설정(GAP-S3) 포함 전체 플로우 구현 |
| 고객사 납품 가능한 수준 | ✅ Met | 표지 업로드·신청 권한·카테고리 트리 모두 구현 |
| 차수별 출석률·수료율 데이터 자동 집계 | ✅ Met | ScoreCard 실시간 집계 구현 |

---

## 5. 미결 기획 갭 (코드 범위 외)

| 갭 | 항목 | 상태 |
|----|------|------|
| GAP-03 | 알림 채널 (이메일/앱푸시) | Phase 1 오픈 전 반드시 확정 필요 |
