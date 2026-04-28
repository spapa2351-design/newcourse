# 오프라인 코스 기획 — 프로토타입 GAP 분석 리포트 v4
> **분석일**: 2026-04-28 (갱신)  
> **이전 버전**: v3 (2026-04-28, Match Rate 85%)  
> **갱신 사유**: 기획설계서 개선(앵커·타이틀·hero 축소), 운영팀 정책 가이드 신규 작성, 운영 케이스 추가, 검색 기능, 고객사 담당자 용어 통일  
> **비교 기준**: docs/01-plan/features/*.plan.md (11개), docs/02-design/features/*.design.md (6개), admin/feature-spec.html  
> **비교 대상**: admin/*.html (6개) + user/*.html + docs/guide-*.html  
> **전체 Match Rate: ~85%** (유지 — 문서 품질 개선 작업, 기능 갭 미변동)

---

## 0. 한눈에 보는 요약

| 영역 | 일치율 | 핵심 이슈 |
|------|:---:|---|
| 코스 목록 (admin/index.html) | **95%** | 수강관리 진입 경로 충돌 잔존 |
| 오프라인 빌더 (admin/offline-builder.html) | **80%** | 재수강 토글·75% 수료 기준 잔존 |
| 코스 운영 (admin/offline-course-view.html) | **70%** ↑ | 회차 마감·수료 처리·BroadcastChannel 미구현 |
| ~~수강관리 구버전 (course-learners.html)~~ | — | **2026-04-28 삭제 확정** |
| 온라인 빌더 (admin/online-builder.html) | **85%** | Phase 2 이월 항목만 잔존 |
| 사용자단 7개 화면 (user/*.html) | **84%** | 다중조합 요약카드·BroadcastChannel 미연결 |
| **전체 평균** | **85%** | — |

---

## 1. 최근 변경사항 검증 (2026-04-28)

### R-1: 코스 삭제 확인 모달 — ✅ 구현 완료

| 검증 항목 | 위치 | 결과 |
|---|---|---|
| `deleteModal` state 도입 | index.html:239 | ✅ `useState(null)`, `{type:'single'\|'bulk'}` |
| `window.confirm()` 제거 | 전체 grep | ✅ 0건 |
| 오버레이 모달 + 슬라이드 애니메이션 | index.html:~896 | ✅ `bg-black/40 animate-fadeIn` + `animate-slideUp` |
| "삭제" 텍스트 입력 확인 | index.html:~944 | ✅ `canConfirm = deleteInput === '삭제'`, Enter 키 지원 |
| 수강생 수 경고 | index.html:~919 | ✅ `totalEnrolled > 0` 시 amber 배지 노출 |
| 일괄 삭제 지원 | index.html:~889 | ✅ bulk 모드 — 코스 수 + 수강생 합산 표시 |

**Plan 정합성**: `course-delete-policy.plan.md` F-01~F-05 Success Criteria 전원 충족 ✅  
**문서 GAP**: `course-delete-policy.design.md` 미작성 — Plan은 있고 구현도 완료, Design 문서만 누락

### R-2: 지각기준 글로벌 설정 이동 — ✅ 구현 완료

| 검증 항목 | 위치 | 결과 |
|---|---|---|
| `lateMinutes` App-level state | offline-builder.html:525 | ✅ `useState(10)` (기본 10분) |
| Section 3(수료 조건) 내 배치 | offline-builder.html:~1353 | ✅ "출석 정책" 블록 |
| 차수 카드 내 lateMinutes 필드 제거 | grep 검증 | ✅ per-차수 입력 0건 |
| 0~60분 범위 검증 | offline-builder.html:~1391 | ✅ `Math.min(60, Math.max(0, ...))` |

### R-3: 출석 명단 모달 구현 — ✅ 구현 완료 (2026-04-28)

출석 관리 탭의 인라인 chip 3열 패널을 **숫자 요약 + 명단 모달** 구조로 전환.

| 검증 항목 | 결과 |
|---|---|
| 회차 행 [명단] 버튼 1클릭 → 모달 오픈 | ✅ |
| 모달 헤더: 회차명·차수명·총 인원·시간 | ✅ |
| 상태 필터 탭 (전체/출석·지각/결석/미확인) + 각 건수 표시 | ✅ |
| 이름 검색 (실시간 필터) | ✅ |
| 테이블: 이름·상태 배지·QR 스캔 시간·관리자 인정 시간·변경 버튼 | ✅ |
| 변경 드롭다운 (출석/지각/조퇴/결석/미확인) 모달 내 인라인 처리 | ✅ |
| 바깥 클릭 시 모달 닫힘 | ✅ |

**GAP 해소**: C-3 (개인별 출석 상태 변경), C-4 (조퇴 early_leave) — 모달 드롭다운으로 구현 완료  
**UX 근거**: 100명 이상 수강생 시 칩 목록이 화면을 초과해 가독성 불가 → 모달 테이블로 전환

### R-4: 드롭다운 버그 수정 — ✅ 완료 (2026-04-28)

| 버그 | 원인 | 수정 |
|---|---|---|
| `fixed inset-0 z-[199]` backdrop이 버튼 위를 덮어 클릭 불가 | backdrop이 토글 버튼보다 높은 z-index | `useEffect` document-level click listener로 교체, backdrop 제거 |
| 드롭다운 위치 뷰포트 밖으로 이탈 | `rect.left` 그대로 사용 시 우측 오버플로우 | `rect.right - 130`으로 우측 정렬 + `window.innerWidth` 클램핑 |

### R-5: 차수 카드 클릭 네비게이션 — ✅ 구현 완료 (2026-04-28)

대시보드 차수 진행 현황 카드 클릭 시 상태에 따라 적절한 탭으로 이동.

| 차수 상태 | 이동 탭 | 동작 |
|---|---|---|
| 진행중 (오늘 날짜 포함) | 출석 관리 탭 | 해당 차수 필터 자동 적용 |
| 완료 / 마감완료 | 수강생 현황 탭 | 해당 차수 필터 자동 적용 |
| 예정 | 수강생 현황 탭 | 해당 차수 필터 자동 적용 |

카드에 `cursor-pointer` + `hover:shadow-md` 추가.

### R-6: 탭 툴팁 추가 — ✅ 완료 (2026-04-28)

4개 탭 hover 시 설명 툴팁 표시.

| 탭 | 툴팁 문구 |
|---|---|
| 대시보드 | 차수 현황·출석률·조치 필요 항목을 한눈에 확인 |
| 출석 관리 | 교육 당일 회차별 출석·지각·결석 처리 및 회차 마감 |
| 수강생 현황 | 수강생 전체 출결 이력 확인 및 수료 처리 |
| 통계 | 차수·부서별 출석률·수료율 집계 |

### R-7: 더미 데이터 정합성 수정 — ✅ 완료 (2026-04-28)

enrolled/capacity/session att 숫자와 실제 LEARNERS_RAW 수의 불일치 해소.

| 기수 | 이전 (enrolled/learners) | 수정 후 |
|---|---|---|
| p1 1기 | enrolled:30 / 6명 | enrolled:10, capacity:15 / 10명 |
| p2 2기 | enrolled:30 / 6명 | enrolled:10, capacity:15 / 10명 |
| p3 3기 | enrolled:30 / 4명 | enrolled:10, capacity:15 / 10명 |
| p4 4기 | enrolled:20 / 4명 | enrolled:10, capacity:15 / 10명 |
| p5 5기 | enrolled:10 / 0명 | enrolled:5, capacity:15 / 5명 |

session att 숫자도 실제 learner 수 기준으로 재산정. 총 학습자 45명 추가.

---

## 2. 어드민 영역 GAP

### 2.1 코스 목록 — `admin/index.html` (95%)

| # | 항목 | 심각도 | 상태 |
|---|------|:---:|:---:|
| A1-1 | 공개예약 탭(5탭) — 설계서는 4탭 | 낮음 | 설계서 갱신 필요 |
| A1-2 | 추가 필터 빌더 — Phase 2였으나 구현됨 | 낮음 | 설계서 갱신 필요 |
| A1-3 | 수강관리 진입 경로 충돌 (행→view, 헤더→learners) | **높음** | 미결 |
| A1-4 | Grid 뷰/다운로드 placeholder | 낮음 | Phase 2 의도적 이월 |
| ~~A1-5~~ | ~~삭제 기능 단순 confirm~~ | — | **✅ 2026-04-28 모달 교체 완료** |

### 2.2 오프라인 빌더 — `admin/offline-builder.html` (80%)

| # | 항목 | 심각도 | 상태 |
|---|------|:---:|:---:|
| ~~B-1~~ | ~~지각 기준 설정 누락~~ | — | **✅ 2026-04-28 Section 3 글로벌 구현 완료** |
| B-2 | 재수강 허용 토글 미구현 (plan.md GAP-06) | **높음** | 미구현 |
| B-3 | 수료 조건 75% 비율 기준 누락 (출석 비율 슬라이더) | **높음** | 미구현 |
| B-4 | secOpen 키(s1~s4 4개) vs UI 섹션(1·2·3 3개) 불일치 | 중간 | 잠재 버그 |
| B-5 | 차수 상태 4종(+scheduled) — 설계서는 3종 | 낮음 | 설계서 갱신 필요 |
| B-6 | 그룹별 인원 limit(쿼터) 추가 구현 — design.md 미반영 | 중간 | 설계서 갱신 필요 |
| B-7 | offline-builder.design.md 지각기준 위치 stale | 중간 | §4.2 L201 갱신 필요 |

### 2.3 코스 운영 — `admin/offline-course-view.html` (70% ↑)

| # | 항목 | 심각도 | 상태 |
|---|------|:---:|:---:|
| C-1 | 회차 마감 버튼 미구현 | **Critical** | 미구현 |
| C-2 | 차수 수료 처리 버튼 미구현 | **Critical** | 미구현 |
| ~~C-3~~ | ~~개인별 출석 상태 변경 미구현~~ | — | **✅ 2026-04-28 명단 모달 인라인 변경으로 완료** |
| ~~C-4~~ | ~~조퇴(early_leave) 상태 미구현~~ | — | **✅ 2026-04-28 모달 드롭다운에 포함** |
| C-5 | BroadcastChannel 송신 미구현 | **Critical** | 미구현 — 데모 시연 블로커 |
| C-6 | 탭 명칭 불일치 (요약/수강/출석/설문 vs 명세서 기준) | 중간 | 툴팁으로 보완, 명칭 정합 추가 필요 |
| C-7 | "차수 변경" 버튼 활성(Phase 2 미지원) | 중간 | 미결 |
| C-8 | "조치 필요" 패널 명세 부재 | 중간 | 구현됨, design.md 반영 필요 |

### 2.4 ~~수강관리 구버전 — `admin/course-learners.html`~~ (삭제 완료 2026-04-28)

`offline-course-view.html` 단일 정식 화면으로 확정. 파일 삭제 및 모든 참조 제거 완료.

### 2.5 온라인 빌더 — `admin/online-builder.html` (85%)

Phase 2 이월 항목(다중 공동강사, SEO, 영상 일괄 정렬)만 미구현. 현황 양호.

---

## 3. 사용자단 GAP (84%)

| # | 화면 | 항목 | 심각도 | 상태 |
|---|------|------|:---:|:---:|
| U1 | course-detail.html | 다중조합 "선택하신 반" 요약 카드 미구현 | **높음** | 미구현 |
| U2 | course-enrolled.html | 75% 졸업 기준선 | — | ✅ 완료 |
| U3 | course-completed.html | 수료 판정 이유 4건 | — | ✅ 완료 |
| U4 | my.html | QR 결과 5종 문구 (하드코딩) | 낮음 | qrMessages 중앙화 권장 |
| U5 | 전체 7개 | navigateToOfflineCourse() 통합 라우팅 미구현 | 중간 | 미구현 |
| U7 | course-detail.html | sessionSelect 바텀시트 | — | ✅ 완료 |
| U10 | my.html ↔ admin 신규 화면 | BroadcastChannel 송신 미연결 | **높음** | 미구현 |
| U11 | 전체 | "차수"/"반"/"기수" 용어 불일치 | 중간 | 카피 정리 필요 |

---

## 4. 문서 ↔ 문서 GAP

| # | 항목 | 심각도 | 상태 |
|---|------|:---:|:---:|
| F-1 | offline-attendance vs offline-enrollment-mgmt design 통합 필요 | 중간 | 미결 |
| F-2 | plan §2 vs design §3 vs 구현 3계층 4번째 탭 불일치 | 중간 | 미결 |
| ~~F-3~~ | ~~plan ↔ supplement 지각기준 불일치~~ | — | **✅ plan.md L73 갱신 완료** |
| F-4 | feature-spec.html status 'todo' 표기 오류 (실제 동작) | 낮음 | 수동 갱신 필요 |
| F-5 | course-delete-policy.design.md 미작성 | **높음** | 미결 |
| F-6 | offline-builder.design.md 지각기준 위치 stale (§4.2 L201, L330) | **높음** | 미결 |

---

## 5. 심각도별 액션 아이템

### 🔴 Critical (오픈 전 필수)

| 항목 | 파일 | 액션 |
|---|---|---|
| ~~수강관리 정식 화면 결정~~ | — | **✅ offline-course-view.html 확정** |
| ~~C-3 개인 출석 변경~~ | — | **✅ 명단 모달로 구현 완료** |
| ~~C-4 조퇴 상태~~ | — | **✅ 모달 드롭다운 포함** |
| C-1 회차 마감 버튼 | offline-course-view.html | 미구현 |
| C-2 수료 처리 버튼 | offline-course-view.html | 미구현 |
| C-5 / U10 BroadcastChannel | offline-course-view.html | 데모 시연 블로커 |
| B-2 재수강 허용 토글 | offline-builder.html | §3.3 수강신청 섹션 추가 |
| B-3 수료 조건 비율 기준 | offline-builder.html | Section 3 슬라이더 추가 |
| U1 다중조합 요약카드 | course-detail.html | UI 추가 |

### 🟡 High (문서 갱신)

| 항목 | 대상 파일 | 액션 |
|---|---|---|
| F-5 design.md 신규 작성 | course-delete-policy.design.md | `/pdca design course-delete-policy` |
| F-6 design.md 지각기준 갱신 | offline-builder.design.md §4.2 L201, §8 L330 | 차수 필드 표 제거 → Section 3 글로벌로 기술 |
| 설계서 추가 구현 반영 | offline-course-list.design.md, offline-builder.design.md | 5탭·필터빌더·차수4상태·그룹 limit 반영 |
| C-8 조치 필요 패널 design.md 반영 | offline-course-view.design.md | 구현 내용 명세 추가 필요 |

### 🟢 Medium

- B-4 (secOpen 키 일치), C-6·C-7 (뷰 화면 명세), U5 (라우팅 통합), U11 (카피 정리), F-1·F-2 (design 통합)

### ⚪ Low

- 온라인 빌더 Phase 2 이월, U4 qrMessages 중앙화, feature-spec 상태 표기

---

## 6. 데모 시연 주의사항

> **중요**: 학습자 앱(`my.html`) BroadcastChannel 연결이 `offline-course-view.html`에 미구현 상태 (C-5)  
> 라이브 QR 모드 시연 전 C-5 구현 필요 — **현재 데모 시연 블로커**

---

## 7. 변경 이력

| 버전 | 날짜 | Match Rate | 주요 변경 |
|---|---|:---:|---|
| v1 | 2026-04-27 | 78% | 초기 분석 |
| v2 | 2026-04-28 | 81% | 삭제 확인 모달, 지각기준 글로벌화 |
| v3 | 2026-04-28 | 85% | 출석 명단 모달(C-3·C-4 해소), 드롭다운 버그 수정, 차수 카드 네비게이션, 탭 툴팁, 더미 데이터 정합성 |
| v4 | 2026-04-28 | 85% | offline-spec.html 앵커링, 운영팀 정책 가이드(guide-ops-policy.html) 신규, 운영 케이스 6종, 검색 기능, 고객사 담당자 용어 통일 |
