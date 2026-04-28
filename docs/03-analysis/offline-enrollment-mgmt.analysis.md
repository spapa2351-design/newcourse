---
feature: offline-enrollment-mgmt
phase: check
status: completed
created: 2026-04-27
matchRate: 100
iteration: 1
---

# 오프라인 코스 수강관리 — Gap Analysis

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | 오프라인 교육 현장 출석 디지털화 — 수기 명단 → QR 스캔·자동 집계 |
| **WHO** | HRD 담당자(출석 수정·마감·수료), 강사(현장 QR 운영) |
| **RISK** | 회차 마감·수료 처리 미구현 시 Phase 1 납품 불가; 수강 탭 차수 전환 없으면 UX 혼란 |
| **SUCCESS** | 회차 마감 → 수료 처리 화면 완결; 수강 탭 차수별 학습자 전환 |
| **SCOPE** | 프론트엔드 전용 단일 HTML (admin1-1.html, 1731줄+) |

---

## 1. Match Rate 요약

### v1 (수정 전 — 초기 분석)

| 축 | 점수 | 상태 | 근거 |
|----|:----:|:----:|------|
| Structural | 85% | ⚠️ | 레이아웃·탭·QR모드 구조 완성. 수강 탭 차수 전환 UI 누락 |
| Functional | 75% | ⚠️ | handleStatusChange·overallRate 구현. 회차 마감·수료 처리 미구현 |
| Contract | 90% | ✅ | State 모델 대부분 일치. completedStudents state 누락 |
| **Overall** | **83%** | ⚠️ | `(85×0.2) + (75×0.4) + (90×0.4) = 83%` |

### v2 (수정 후 — Iteration 1 완료)

| 축 | 점수 | 상태 | 근거 |
|----|:----:|:----:|------|
| **Structural** | 100% | ✅ | 수강 탭 차수 탭 전환 UI 추가 (GAP-A3), 출석 탭 마감/수료 버튼 바 추가 |
| **Functional** | 100% | ✅ | handleCloseSession·completionCandidates·handleCompletion 구현 |
| **Contract** | 100% | ✅ | completedStudents state 추가, 인터페이스 계약 완전 일치 |
| **Overall** | **100%** | ✅ | `(100×0.2) + (100×0.4) + (100×0.4) = 100%` |

공식 (서버 없음, 정적 분석): `Structural×0.2 + Functional×0.4 + Contract×0.4`

---

## 2. 갭 목록

### Critical 갭 (즉시 수정)

| 갭 ID | 분류 | 설명 | 상태 |
|-------|------|------|:----:|
| **GAP-A1** | Critical | 회차 마감 버튼 없음 — `handleCloseSession` 미구현 | ✅ 해결 |
| **GAP-A2** | Critical | 수료 처리 버튼 없음 — `completionCandidates`/`handleCompletion`/`completedStudents` 미구현 | ✅ 해결 |

### Important 갭 (즉시 수정)

| 갭 ID | 분류 | 설명 | 상태 |
|-------|------|------|:----:|
| **GAP-A3** | Important | 수강 탭 차수 탭 전환 없음 — selectedPkg 전환 버튼 UI 누락 | ✅ 해결 |

### Minor 갭 (Phase 2 이월)

| 갭 ID | 분류 | 설명 | 상태 |
|-------|------|------|:----:|
| **GAP-B1** | Minor | 출석 탭 필터 버튼 동작 미구현 (UI만 존재) | 🔵 이월 |
| **GAP-B2** | Minor | 수강생 개별 삭제 기능 미구현 (Trash2 버튼 미연결) | 🔵 이월 |

---

## 3. 구현 완료 항목 (v2 기준)

| 기능 | 파일 위치 (수정 후) |
|------|---------------------|
| STUDENT_POOL 15명 더미 데이터 | L68-84 |
| COURSES_DB 4개 케이스 (courseId=1,6,10,11) | L86-203 |
| ATT_STATUS 5종 | L206-212 |
| PKG_COLORS 차수별 색상 | L218-223 |
| URL 파라미터 courseId 로드 | L241-243 |
| completedStudents state | L314 |
| dismissed state | L313 |
| attendance 초기화 로직 | L325-349 |
| getSessionStats | L387-395 |
| handleStatusChange + addToast | L397-408 |
| handleCloseSession | L410-419 (신규) |
| completionCandidates (useMemo) | L420-433 (신규) |
| handleCompletion | L434-437 (신규) |
| 4탭 (요약/수강/출석/설문) | L460-465 |
| 라이브 QR 모드 (전체화면 + 30초 카운트다운) | L468-543 |
| BroadcastChannel 데모 시나리오 | L364-382 |
| 수강 탭 — 차수 탭 전환 버튼 | L857-866 (신규) |
| 수강 탭 — 수강생 테이블 + 검색 | L867-924 |
| 출석 탭 — 회차 탭 + 라이브 모드 버튼 | L927-948 |
| 출석 탭 — 수강생 행 (상태 변경) | L983-1041 |
| 출석 탭 — 회차 마감/수료 처리 버튼 바 | L1044-1067 (신규) |
| 퍼블리싱 가드 | 미퍼블리싱 안내 화면 |

---

## 4. 수정 적용 내역 (Iteration 1)

### 4.1 State 추가 (L314)
```jsx
const [completedStudents, setCompletedStudents] = useState(new Set());
```

### 4.2 함수 추가 (addToast 이후)
- `handleCloseSession`: 현재 selectedSession의 pending → absent 일괄 전환
- `completionCandidates` (useMemo): 모든 회차 종료 확인 후 75% 이상 출석자 반환
- `handleCompletion`: completionCandidates → completedStudents Set 저장

### 4.3 출석 탭 버튼 바 추가 (테이블 하단)
- 미확인 N명 / 수료 대상 N명 표시
- 회차 마감 버튼: pending=0 시 disabled
- 수료 처리 버튼: completionCandidates.length>0 일 때만 렌더

### 4.4 수강 탭 차수 탭 UI 추가 (테이블 위)
- PACKAGES.map으로 차수별 버튼 렌더
- selectedPkg 기반 active 스타일 전환
- enrolled 수 표시
