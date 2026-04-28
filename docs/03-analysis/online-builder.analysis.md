---
feature: online-builder
phase: check
status: completed
created: 2026-04-27
matchRate: 100
iteration: 1
---

# 온라인 코스 등록 빌더 — Gap Analysis

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | 온라인 코스 개설 프로세스 디지털 통합 — 분산된 입력 화면을 단일 빌더로 대체 |
| **WHO** | HRD 담당자(코스 기획·퍼블리싱), 콘텐츠 관리자(라이브러리 등록) |
| **RISK** | 커리큘럼 이수조건 미설정 시 수료 판정 오류. 퍼블리싱 검증 누락 시 불완전 코스 공개 |
| **SUCCESS** | HRD 담당자가 단일 화면에서 코스 구성부터 퍼블리싱까지 완료. 필수 콘텐츠 이수조건 설정 후 체크리스트 통과 |
| **SCOPE** | 프론트엔드 전용 단일 HTML 프로토타이핑 (백엔드 없음) |

---

## 1. Match Rate 요약

### v1 (초기 분석)
| 축 | 점수 | 상태 |
|----|:----:|:----:|
| Structural | 100% | ✅ |
| Functional | 73% | ⚠️ |
| Contract | 88% | ⚠️ |
| **Overall** | **84%** | ⚠️ |

### v2 (갭 수정 후)
| 축 | 점수 | 상태 |
|----|:----:|:----:|
| **Structural Match** | 100% | ✅ |
| **Functional Match** | 100% | ✅ |
| **Contract (State Model)** | 100% | ✅ |
| **Overall Match Rate** | **100%** | ✅ 완료 |

공식 (서버 없음, 정적 분석): `(100×0.2) + (100×0.4) + (100×0.4) = 100%`

---

## 2. 구현 완료 항목

| 기능 | 위치 |
|------|------|
| Toggle 공통 컴포넌트 | L54-58 |
| SLOT_TYPES 4종 + condText | L61-75 |
| LIBRARY_ITEMS 목업 8개 | L78-87 |
| AddItemModal (4단계) | L90-259 |
| SlotSettingModal (영상/시험/설문/아티클) | L262-319 |
| App state — courseInfo 9필드 | L324-329 |
| App state — regPeriod, isSelfEnroll, selRule, maxSelect | L332-335 |
| App state — cancelPolicy, changePolicy | L336-337 |
| App state — studyPeriod | L340 |
| App state — chapters (챕터→항목 2계층) | L344-356 |
| App state — completionRules, hasOptionalThreshold, optionalMinCount | L421-425 |
| App state — courseStatus, lastSavedAt, toast, addItemModal, settingSlot | L428-432 |
| App state — dragging, dragOver | L385-386 |
| 챕터 CRUD (addChapter/removeChapter/updateChapterTitle) | L362-366 |
| 항목 CRUD (addItem/removeItem/updateItem/updateItemCond) | L368-381 |
| 드래그앤드롭 (챕터 간 이동 포함) | L383-412 |
| validation 6개 + canPublish | L446-454 |
| handleSaveDraft (2종 토스트) | L437-443 |
| handlePublish | L456 |
| 헤더 (뒤로가기/상태뱃지/임시저장/미리보기/퍼블리싱) | L463-490 |
| 퀵 스탯 바 (4 카드: 코스유형/전체항목/필수콘텐츠/완성도) | L499-514 |
| 섹션 1: 코스 기본 정보 | L517-622 |
| 섹션 2: 수강 신청 설정 | L625-700 |
| 섹션 3: 수강 기간 설정 (3모드) | L703-761 |
| 섹션 4: 수료 조건 설정 | L764-827 |
| 우측 커리큘럼 사이드바 (챕터→항목 DnD) | L832-984 |
| 퍼블리싱 모달 (체크리스트+확인) | L1011-1048 |
| 토스트 (임시저장 2종) | L988-1009 |

---

## 3. 갭 목록

### ✅ Important (1건 → 해결)

| ID | 항목 | 해결 방법 | 위치 |
|----|------|-----------|------|
| GAP-O1 | selRule(단일/다중) + maxSelect UI 미노출 | 수강 신청 설정 섹션에 코스 선택 규칙 UI 추가 (isSelfEnroll 조건부) | 섹션 2 |

### ✅ Minor (2건 → 해결)

| ID | 항목 | 해결 방법 | 위치 |
|----|------|-----------|------|
| GAP-O2 | changePolicy UI 미노출 | 수강 변경 정책 Toggle + 기한 설정 UI 추가 | 섹션 2 |
| GAP-O3 | 강제할당 모드 시 안내 부재 | `!isSelfEnroll` 시 파란색 안내 박스 추가 | 섹션 2 |

---

## 4. Plan 성공 기준 평가

| 기준 | 상태 | 근거 |
|------|:----:|------|
| HRD 담당자가 단일 화면에서 코스 기획부터 퍼블리싱까지 완료 | ✅ Met | 4섹션 폼 + 커리큘럼 사이드바 + 퍼블리싱 모달 |
| 라이브러리에서 콘텐츠 검색 후 이수조건 즉시 설정 | ✅ Met | AddItemModal 라이브러리 탭 + SlotSettingModal |
| 퍼블리싱 전 6개 체크리스트 자동 검증 | ✅ Met | validation 배열 + canPublish + 체크리스트 UI |

**성공 기준 달성률: 3/3 (100%)**
