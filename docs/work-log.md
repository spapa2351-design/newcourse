
---

## 2026-05-21 12:02:33  `session: db140b40-da74-4b1b-8d50-03b75b33410e`

등록 진행도 미니맵 아이콘 정리:

- **넘버링(`01`/`05`) 제거** — String(i+1).padStart(2,'0') 호출 삭제
- **3-상태 아이콘만 남김**:
  - ✅ `ok` (완료) → emerald 채움 + ✓ 체크
  - ⚪ `warn` (필수·미완료) → 흰색 배경 + rose 외곽선 (빈 동그라미 + [필수] 칩)
  - ⚪ `optional` (선택·미완료) → 흰색 배경 + slate 외곽선 (빈 동그라미)

이제 "안한거 = 빈 동그라미, 한거 = 초록 체크" 단일 아이콘 시스템. 필수/선택 구분은 외곽선 색(rose vs slate)과 옆 [필수] 칩으로만.

---

## 2026-05-21 12:07:29  `session: db140b40-da74-4b1b-8d50-03b75b33410e`

이전 메모리 발견·반영:

**근거 메모리**: `project_newcourse_operating_period_rebuttal` (2026-05-18 결정)
> "운영기간은 시스템 필수가 아니라 개발 구현 단순화 목적. 사용자 정책을 강제할 만큼의 필수성은 없고, 백엔드 조건 조합 로직으로 동일 효과 가능."

**대안 패키지** (그 시점 결정):
- 학습자 단위 자동 archive (수강기간 종료 + grace 90일)
- 코스 자동 휴면 (신청기간 종료 + 모든 학습자 수강기간 종료 + 6개월 무활동)
- "종료하기" 4단계: 휴면/정상 종료/긴급 차단/archive(자동)
- 비유: 코스=건물, 학습자=입주자, 수강기간=임대 계약

**팀 합의** (이번 사이클):
- 카리나 차장·태서 과장: 운영기간 없어도 수강기간 3종으로 통제 가능, "종료하기"가 진짜 통제권
- 구교환 차장: UI 비노출 + state 보존 (백엔드 기본값 365 유지)
- 고윤정 과장: 사이드 미니맵의 step-policy도 같이 숨김 (정합)

### 적용 변경 (online-builder.html)

| 영역 | 동작 |
|---|---|
| **섹션 0 "코스 정책"** | 주석 처리로 숨김. 메모리 결정 근거 + 폐기 사유 인라인 명시 |
| **사이드 미니맵 step-policy** | stepValidation 배열에서 제거. 진행도 4 step만 노출 (코스 기본 정보·수강 신청·수강 기간·커리큘럼) |
| **maxRunDays state** | `useState(365)` 유지 (백엔드 default 보존, UI 미노출) |

### 남은 관련 기능 (1차 미적용, Phase 2 후속)
- 학습자 단위 자동 archive 로직 (grace 90일)
- 코스 자동 휴면 로직 (6개월 무활동)
- "종료하기" 4단계 액션 — 운영자 통제권의 진짜 장치
- 위 기능들은 백엔드 작업이라 UI 영역 밖. Phase 2에서 정식 도입 시 다시 검토

브라우저 새로고침하면 섹션 0 사라지고 진행도 미니맵도 "코스 기본 정보"부터 4 step. 

---

## 2026-05-21 14:10:50  `session: db140b40-da74-4b1b-8d50-03b75b33410e`

docs/ HTML 기획문서 현황:

### newcourse 상위 기획 (v2 newcourse 시스템)

| 파일 | 크기 | 정체 | 상태 |
|---|---|---|---|
| **`newcourse-spec-v2.html`** | 51KB | 기획설계서 v2 (8 섹션: Summary·Value·Terminology·Structure·Asset·Operations·Workspaces·Coexistence·Roadmap·Appendix) | **현재 메인 정본** ✓ |
| `newcourse-spec.html` | 45KB | 통합 기획설계서 v0.2 (이전 버전) | 노후 — v2가 대체 |
| `newcourse-overview.html` | 20KB | 팀 공유용 한눈 요약 | 짧은 요약본, 별도 가치 |
| `00-standard/phase-roadmap.html` | - | Phase 로드맵 일정 관리 | 별도 도구 |

### 오프라인 코스 (기정착 영역)

| 파일 | 크기 | 정체 |
|---|---|---|
| `offline-spec.html` | 147KB | 오프라인 코스 기획설계서 v1.0 |
| `guide-admin-offline.html` | 83KB | 오프라인 LMS 관리자 가이드 |
| `guide-offline-lms.html` | 151KB | 오프라인 LMS 전체 가이드 |

### 공통·레거시 가이드

| 파일 | 크기 | 정체 |
|---|---|---|
| `guide-course-detail.html` | 15KB | 코스 상세 화면 가이드 |
| `guide-ops-policy.html` | 194KB | 운영팀 정책 가이드 (legacy) |

### Session 로그 (HTML 변환본)

```
sessions/2026-04-30-offline-arch-qa.html
sessions/2026-05-06-attendance-rate-policy.html
sessions/2026-05-06-capacity-policy.html
```

---

### 중복·노후 이슈

| 이슈 | 영향 |
|---|---|
| `newcourse-spec.html` (v0.2) vs `newcourse-spec-v2.html` (v2) | v0.2는 v2로 대체됨. **버전 충돌** — 어느 게 정본인지 운영자 혼란 가능 |
| 오프라인 가이드 2종 (`guide-admin-offline` · `guide-offline-lms`) | 내용 중복 가능성 (둘 다 오프라인 LMS) |

### 정리 제안

1. **`newcourse-spec.html` (v0.2) 처리** 
   - 옵션 A: 삭제 (v2가 정본)
   - 옵션 B: 파일명 `newcourse-spec-v0.2-archive.html`로 rename + cover에 "ARCHIVED · v2 참조" 배너
   - 옵션 C: 그대로 유지 (히스토리 비교용)

2. **오프라인 가이드 2종 통합 여부** (선택)

3. **session HTML들** — 히스토리 기록, 그대로

원하면 정리 진행. 어떻게 갈까?

---

## 2026-05-21 14:32:06  `session: db140b40-da74-4b1b-8d50-03b75b33410e`

docs/ HTML 3개 구조로 재구성 완료:

### 최종 docs/ HTML 구성

| 파일 | 크기 | 정체 |
|---|---|---|
| **`newcourse.html`** | 56KB | newcourse 종합 (전체 + 개요 + 쉽고 쉽게) |
| **`online-course.html`** | 27KB | 온라인 코스 기획설계서 (CONTENT) |
| **`offline-course.html`** | 147KB | 오프라인 코스 기획설계서 |
| guide-admin-offline.html | 83KB | 오프라인 관리자 가이드 (admin UI 수정 후 재작업 예정) |
| guide-offline-lms.html | 151KB | 오프라인 LMS 가이드 (재작업 대상) |
| guide-course-detail.html | 15KB | 코스 상세 가이드 (legacy 참고) |
| guide-ops-policy.html | 194KB | 운영팀 정책 가이드 (legacy 참고) |

### 처리 내역

**삭제**:
- `newcourse-spec.html` (v0.2 — newcourse.html로 흡수)
- `newcourse-spec-v2.html` (rename됨)
- `newcourse-overview.html` ("쉽고 쉽게" 섹션으로 흡수)
- `offline-spec.html` (rename됨)

**neweourse.html 변경**:
- "v2" 표기 일괄 제거 (title·cover label·pill·footer)
- cover lede 갱신 (영구 공존 명시)
- **신규 ★ / Easy "쉽고 쉽게" 섹션** 추가 (TOC 최상단) — 한 줄로 / 왜 / 기존 코스 / 어드민 구조 / 학습자 시각 / 3종 유형 카드 / 운영자 선택 가이드

**online-course.html 신규 작성**:
- 8 섹션 — ★ Easy / 00 Summary / 01 Builder / 02 List / 03 Library / 04 Model / 05 Flow / 06 Roadmap / 07 Appendix
- newcourse.html 동일 디자인 시스템 (CSS 일관)
- 빌더 4섹션 폼·일괄설정 모달·퍼블리싱 체크리스트
- 목록 11컬럼·페이지네이션 10/20/50/100
- 라이브러리 영상 video player + PDF iframe
- 데이터 모델 (Course/Curriculum/Slot) + 슬롯 타입별 수료조건
- Phase 1/2/3 로드맵

**offline-course.html 정리**:
- title v1.0 → 표기 제거
- 푸터 v1.2 표기 제거
- 본문은 기존 정착 내용 그대로

### Cross-link
- newcourse.html, online-course.html, offline-course.html 서로 참조 (footer + appendix)

브라우저에서 3개 파일 모두 동일한 비주얼 톤(검정 cover + 좌측 TOC + 본문 카드). 운영자 가이드 2종(`guide-admin-offline.html`, `guide-offline-lms.html`)은 admin UI 수정 완료 후 재작업 예정.

---

## 2026-05-21 14:38:30  `session: db140b40-da74-4b1b-8d50-03b75b33410e`

섹션 박스화 처리 (newcourse.html · online-course.html):

**변경 사항**
- **body 배경 #f5f5f5** (연한 회색) — 흰 카드가 떠 보이게
- **각 section을 카드로**: 흰 배경 + slate 외곽선 + 20px 라운드 + 56×48px 패딩 + 미세 그림자
- **section 간격 112px → 32px** — 가까이 묶이되 카드로 명확히 분리
- **h2 .n 섹션 번호**: muted-gray 작은 텍스트 → **검정 배지** (흰 글자 + 8px 라운드 + uppercase). "00 / SUMMARY" 같은 라벨이 칩처럼 두드러짐
- 모바일(720px 이하): 패딩 36×24, 라운드 16px, 간격 24px

**시각 효과**
- 00/01/02 … 07 섹션이 각자 흰 카드로 구분되어 한눈에 구조 파악
- 검정 배지로 섹션 번호가 시각 anchor 역할
- 회색 body 배경이 카드와 명확히 대비

브라우저에서 새로고침하면 newcourse.html 9 섹션(쉽고 쉽게·00~Appendix) · online-course.html 8 섹션 모두 분리된 박스로 노출. 데스크탑·모바일 모두 정합.

---

## 2026-05-21 14:40:35  `session: db140b40-da74-4b1b-8d50-03b75b33410e`

섹션 헤더 2줄 분리 처리 (newcourse.html · online-course.html 모두):

```
[01 / BUILDER]    ← 검정 배지 (좌측 정렬)
코스 빌더          ← 한글 타이틀 (다음 줄, 큰 글씨)
```

**CSS 변경**:
- `h2`를 `display: flex; flex-direction: column` + `align-items: flex-start` + `gap: 14px`로 변경
- 배지(`.n`)와 타이틀 텍스트가 각각 column item이 되어 자동으로 줄바꿈
- 배지 폭은 내용만큼만(`inline-block` 유지)이라 좌측에 깔끔히 정렬

모든 섹션(★ / Easy, 00 / Summary, 01 / Builder, ... 07 / Appendix)에 동일 적용. 모바일·데스크탑 양쪽 정합.

---

## 2026-05-21 17:32:21  `session: db140b40-da74-4b1b-8d50-03b75b33410e`

docs/ HTML 기획문서 7개 + admin 1개 버전·날짜 일괄 갱신 (2026-05-21):

| 파일 | 이전 | 현재 |
|---|---|---|
| `docs/newcourse.html` | (없음) | **v1.0 · 2026-05-21** (cover pill 신규) |
| `docs/online-course.html` | (없음) | **v1.0 · 2026-05-21** (cover pill 신규) |
| `docs/offline-course.html` | v1.2 · 2026-05-07 | **v1.3 · 2026-05-21** |
| `docs/guide-offline-lms.html` | v1.2 · 2026-05-07 | **v1.3 · 2026-05-21** |
| `docs/guide-ops-policy.html` | v1.2 · 2026-05-07 | **v1.3 · 2026-05-21** |
| `docs/guide-admin-offline.html` | v1.0 · 2026-04-28 | **v1.1 · 2026-05-21** |
| `docs/guide-course-detail.html` | 2026-04-28 (버전 없음) | **v1.1 · 2026-05-21** |
| `admin/feature-spec.html` | v1.2 · 2026-05-07 | **v1.3 · 2026-05-21** (이전 turn에서 진행됨) |

newcourse·online-course는 신규 doc이라 v1.0 첫 발행 표기. 기존 가이드들은 마이너 +0.1 또는 +0.x 올림. 모두 동일한 오늘 날짜로 정합.

---

## 2026-05-21 17:46:57  `session: db140b40-da74-4b1b-8d50-03b75b33410e`

---

**장그래 (대리)** — 팀장님, guide-offline-lms.html 11곳 정리 끝났습니다. detail 있는 8곳(빌더 ②자율/강제·③수료·차수사이드바·전체일정/날짜선택·그룹배정·회차일괄·기본정보)은 detail 캡처로 되돌렸고, detail 없는 3곳(차수 펼침·수강생탭·출석탭·QR)은 풀스크린 + "별도 캡처 예정" 안내 박았습니다. 화면 자체가 어긋났던 수강생 등록 페이지는 course-learners detail로 복원했습니다.

**이상민 (팀장)** — 다음은?

**장그래** — detail이 비어 있는 4건(offline-list 차수펼침 / offline-view 수강생탭·출석탭·QR 라이브) 캡처 보강이 남아 있고요, 그건 별도 캡처 스크립트로 잡으면 됩니다. 메모리에 "풀스크린 일괄 교체 금지" 룰도 박아뒀습니다.
