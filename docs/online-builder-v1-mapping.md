# online-builder-v1.html ↔ newcourse-spec 매핑 분석

> 대상 파일: `J:\claude\newcourse\admin\online-builder-v1.html`
> 최초 분석: 2026-05-18 오전
> 최근 갱신: 2026-05-18 저녁 (정론 정렬: 차수 제거 · 코스 유형 3종 · EnrollmentPolicy)
> 참조 스펙: `newcourse-spec-v2.html` (읽기 쉬운 정리본)

---

## 0. v1 변경 이력

### 2026-05-18 저녁 — 정론 정렬
- **코스 유형 selector 제거**: 빌더 진입 시점에 온라인/오프라인/블렌디드가 이미 확정되므로 빌더 내부 selector는 중복. 섹션 0 카드 그리드 삭제, `courseType` state·`COURSE_TYPES`·`courseTypeMeta` 모두 삭제
- **헤더 칩 정리**: 동적 코스 유형 칩 → `Monitor` 아이콘 고정
- **섹션 0 단순화**: "코스 유형 & 정책" → "코스 정책" (maxRunDays만 유지)
- **Link2 import 추가**: `external_link` 슬롯 아이콘이 Lucide destructuring에서 빠져있어 런타임 에러 → 수정

### 2026-05-18 오후 — surgical 추가
- `external_link` 슬롯 타입 정의 추가
- `maxRunDays` 정책 필드 신설 (기본 365 + 90/180/365/730 프리셋)
- 커리큘럼 버전 뱃지 (draft/published) 헤더 표시
- 코스 유형 6종 selector 일시 도입 → 같은 날 저녁 3종으로 축소 → 그 후 제거

---

## 1. 정론 한 줄 결론

> **v1 빌더는 newcourse 정론 모델(차수 없음 + EnrollmentPolicy + 등록 채널 3종)과 구조적으로 정합. 잔여는 (a) 슬롯 타입 명명 통일 (b) 커리큘럼 버전 발행 로직 (c) 등록 채널 모델 명시화 (d) Curriculum 독립 객체화 등.**

> **용어 구분**
> - **빌더(Builder)** = 코스·커리큘럼 구성 도구 (메타·시퀀스 배치)
> - **에디터(Editor)** = 콘텐츠 본문 작성 도구 (article·quiz·survey 등)
> - **관리(Management)** = 수강생 등록·진도 모니터링 화면

---

## 2. 매핑 매트릭스 (2026-05-18 저녁 기준)

### 2.1 객체 매핑 (정론 모델)

| spec 객체 | v1 빌더 구현 | 갭 |
|---|---|---|
| **Course** (메타·정책) | `courseInfo` state + `maxRunDays` state | ✅ 대응 |
| **Curriculum** (슬롯 시퀀스) | `chapters` state | ⚠ Course에서 독립 객체화 안 됨 (백엔드 영역) |
| **Slot** (= 에셋 + 수료 조건) | `chapter.items` | ✅ 대응 |
| **EnrollmentPolicy** | `regPeriod` · `isSelfEnroll` 등 흩어진 옵션 | ⚠ 채널 3종(A/B/C) 모델로 재구조화 필요 |
| **Enrollment** | (빌더 범위 밖) | — 별도 "수강생 관리" 화면 |
| ~~**Cohort**~~ | ~~없음~~ | ✅ **정론상 Phase 1엔 없음** (제거 결정) |

### 2.2 슬롯 타입 매핑

| spec 타입 | v1 타입 | 비고 |
|---|---|---|
| `video` | `video` | ✅ 일치. v1 `cond: {watchRate: 90}` |
| `quiz` | **`exam`** | 명명 다름. v1 `cond: {passScore: 60, totalQ: 20}` |
| `survey` | `survey` | ✅ 일치 |
| `page` | **`article`** | 명명 다름. v1은 노션 스타일 에디터로 본문 작성 |
| `external_link` | `external_link` | ✅ 정의 추가됨 (Link2 아이콘 import 포함). 슬롯 추가 모달 탭은 follow-up |
| `offline_attendance` | **`offline`** | 명명 짧음. v1 `cond: {attendanceRate: 100}` |
| (없음) | **`pdf`** | v1에는 있고 spec엔 없음 — page sub-format으로 통합 검토중 |

**잔여 갭**: 슬롯 타입 명명 통일(exam→quiz / article→page / offline→offline_attendance).

### 2.3 코스 유형 매핑

| spec 코스 유형 | v1 처리 |
|---|---|
| 콘텐츠 코스 (`content`) | ✅ **본 빌더가 담당** (`online-builder-v1.html`) |
| 오프라인 코스 (`offline`) | 별도 빌더 (`offline-builder.html`) |
| 블렌디드 코스 (`blended`) | 별도 빌더 (`blended-builder.html`) |
| 단독 에셋(시험·설문·영상 1개) | 콘텐츠 코스 하위 케이스로 본 빌더에서 처리 |

**결정**: 빌더 진입 시점에 유형 확정. 빌더 내부 selector 없음.

### 2.4 진도율 / 정합성

| spec 정책 | v1 구현 | 갭 |
|---|---|---|
| 진도율 단위 = 슬롯 | `chapter.items` 단위로 카운트 가능 | ✅ 구조 일치 |
| 슬롯 내부 콘텐츠 편집 자유 | (구현 안 됨, 빌더 단계라 무관) | — 백엔드 영역 |
| 커리큘럼 버전 표시 | `curriculumVersion` state + 헤더 뱃지 | ⚠ **표시만 — 발행/동결 로직 없음** |
| 발행 버전 스냅샷 (차수 없이) | ❌ 없음 | ⚠ 등록자 단위 스냅샷 보존 매커니즘 필요 |
| Evidence Store / Fulfillment Layer | ❌ 없음 | ❌ Phase 4 (백엔드) |
| 결정적 정합성 (편차 0) | — 미검증 | — QA 영역 |

### 2.5 수강 등록 정책 매핑 (정론 채널 3종)

| spec 채널 | v1 구현 | 갭 |
|---|---|---|
| **채널 A — 관리자 수동 등록** | `regPeriod` + 별도 화면(수강생 관리) | ⚠ 빌더는 정책만, 실제 등록은 외부 화면 |
| **채널 B — 학습자 자율 신청** | `isSelfEnroll` 토글 | ⚠ 신청 권한 그룹 지정 매커니즘 추가 필요 |
| **채널 C — 가입 시 자동 등록** | ❌ 없음 | ❌ **신규 모델** — 그룹↔코스 자동 매핑 |
| **수강 기간** | `studyPeriod`: fixed / days / unlimited | ✅ 대응 |
| **시간대 제한** | `timeRestriction` (요일·시간) | ✅ Phase 2 의무 교육 |
| **유휴 모니터링** | `idleMonitor` | ✅ Phase 2 |
| **서약서** | `signDocs` | ✅ Phase 2 |
| **수강 취소·변경 정책** | `cancelPolicy`, `changePolicy` | ✅ 대응 |
| **페이지 순서대로 수강** | `pageSequenceLock` | ⚠ 의미 검토 필요 |
| ~~**정원**~~ | ~~없음~~ | — 차수 제거로 우선순위 ↓ (그룹 단위 등록 한도는 별건) |

### 2.6 v1에는 있는데 spec에 없는 것 ★

| v1 기능 | 의미 | spec 반영 권장 |
|---|---|---|
| **`prerequisiteIds`** | 슬롯 진입 조건(선수조건) | ✅ spec v2에 흡수됨 (Phase 2) |
| **`releaseAfter`** | 단계별 공개 (N일 후 공개) | ✅ spec v2에 흡수됨 (Phase 2) |
| **`dripLearning.baseDate`** | 등록일 vs 학습시작일 기준 | ✅ spec v2에 흡수됨 (Phase 2) |
| **일괄설정**: 일괄 prerequisite 설정 | UX 편의 | UX 영역 |
| **일괄설정**: N일 간격 자동 채우기 | UX 편의 | UX 영역 |
| **의무 교육 옵션 묶음** | 시간 제한·유휴·서약서 | ✅ spec v2 Phase 2 흡수 |

---

## 3. 잔여 갭 (정론 정렬 후)

### 갭 1. 4영역 분리 미적용 (UI는 보류 결정)
**현재**: v1은 단일 화면에서 코스 메타 + 커리큘럼 + 슬롯 + 운영 옵션 모두 다룸
**spec v2**: 4영역으로 분리 — ① 코스 빌더 ② 커리큘럼 빌더 ③ 콘텐츠 에디터 ④ 수강생 관리
**결정** (2026-05-18): **데이터 모델 차원에서만 분리**. UI는 v1 단일 화면 유지. 운영자가 한 화면에서 메타·커리큘럼·운영 옵션을 모두 다루는 것이 단순 운영 가설에 부합.
**참고**: 4영역 분리 와이어는 `admin/newcourse-hub.html` + 4개 영역 파일에 별도 보존

### 갭 2. 커리큘럼 버전 발행 로직 부재 ★★
**현재**: v1에 `curriculumVersion` state + 헤더 뱃지(draft/published) 표시만 있음
**spec**: `draft → published → deprecated` 트랜잭션, 발행 후 슬롯 추가/삭제/순서 변경 시 새 버전 자동 생성
**영향**: 운영 중 콘텐츠 편집 정합성의 핵심 메커니즘. 차수 없이도 등록자 단위 발행 버전 스냅샷이 필요
**권장**: 발행 버튼 + 새 버전 자동 생성 트리거 (백엔드 협조 필요)

### 갭 3. EnrollmentPolicy 모델 명시화 ★★
**현재**: `regPeriod` `isSelfEnroll` `cancelPolicy` 등 흩어진 옵션
**spec v2**: 채널 3종(A/B/C) + 수강 기간 + 그룹 매커니즘으로 통합
**영향**: 현재 운영 4개 케이스(관리자 일괄 강제·관리자 그룹별 강제·자율 신청·가입 시 자동) 통합 처리
**권장**:
- 채널 A는 외부 "수강생 관리" 화면에 정리 (빌더에서 "수동 등록 허용" 토글만)
- 채널 B는 `isSelfEnroll` 유지 + 신청 권한 그룹 지정 UI 추가
- 채널 C는 신규 — 그룹↔코스 자동 매핑 UI 추가

### 갭 4. 학습자별 예외 처리 (EnrollmentPlan) 부재 ★
**현재**: 없음 (빌더 범위 밖)
**spec**: 학습자별 면제·대체·예외 동결 (Phase 3)
**권장**: 빌더 외 별도 "수강생 관리" 화면에서 Phase 3에 구현

---

## 4. v1 → spec 정렬 작업 순서

```
Phase A — 저비용 추가 (대부분 완료)
  1. ✅ external_link 슬롯 타입 정의 추가
  2. ✅ Link2 아이콘 import (런타임 에러 fix)
  3. ✅ maxRunDays 정책 필드
  4. ✅ 커리큘럼 버전 뱃지 표시
  5. ✅ 코스 유형 selector 제거 (빌더 진입 시점에 확정)
  6. ⏳ external_link 슬롯 추가 모달 탭 (UI 버튼)
  7. ⏳ 슬롯 타입 명명 통일 (exam → quiz / article → page / offline → offline_attendance)
  8. ⏳ PDF는 page 타입 sub-format으로 흡수

Phase B — 객체 모델 정렬 (백엔드 중심)
  9. Curriculum 분리 (Course에서 독립)
  10. 버전 발행 로직 (draft→published 트랜잭션, 발행 후 수정 차단)
  11. EnrollmentPolicy 모델 명시화 (채널 A/B/C + 그룹 매커니즘)
  12. Enrollment 모델 (등록 채널·등록일·개인 수강 기간 보유)

Phase C — UI는 v1 그대로 유지 (4영역 분리 보류)
  13. 데이터 모델 차원에서만 분리 진행

Phase D — 정합성 인프라
  14. Evidence Store 백엔드
  15. Fulfillment Layer 분리
  16. 멱등성·멀티 디바이스 동기화

Phase E — 옵션 (정식 요구 시)
  17. 차수(회차) 옵션 객체 — 동기 학습·회차별 정원·강사 배정·정기 갱신 케이스 발생 시
```

> ✅ = v1에 반영됨, ⏳ = 잔여 작업, ~~취소선~~ = 정론 변경으로 제거

---

## 5. v1의 발견 — spec v2에 반영됨

### 5.1 선수조건 (prerequisiteIds)
v1에 `prerequisiteIds: [id]` 구조로 슬롯 진입 조건 구현됨. → spec v2에서 **Phase 2**로 반영.

### 5.2 단계별 공개 (releaseAfter / dripLearning)
v1에 커리큘럼 단위 `releaseAfter` (N일 후 공개)와 `dripLearning.baseDate` (등록일/학습시작일 기준) 구현됨. → spec v2 **Phase 2** 반영.

### 5.3 의무 교육 옵션 묶음
v1 `timeRestriction` `idleMonitor` `signDocs` 구현됨. → spec v2 **Phase 2 의무 교육** 반영.

### 5.4 페이지 순서대로 수강 (pageSequenceLock)
v1에 있음. → spec v2 미해결 논의 — 운영팀과 의미 명확화 필요.

---

## 6. v1 → spec 다음 액션

| # | 액션 | 담당 | 우선순위 | 진행 |
|---|---|---|---|---|
| 1 | external_link 정의 추가 | 개발팀 | P0 | ✅ |
| 2 | Link2 import 추가 (런타임 에러) | 개발팀 | P0 | ✅ |
| 3 | maxRunDays 필드 | 개발팀 | P0 | ✅ |
| 4 | 커리큘럼 버전 뱃지 | 개발팀 | P1 | ✅ 표시만 |
| 5 | 코스 유형 selector 제거 (빌더 진입 시점 확정) | 개발팀 | P0 | ✅ |
| 6 | external_link 슬롯 추가 UI 탭 | 개발팀 + 디자인팀 | P1 | ⏳ |
| 7 | 슬롯 타입 명명 통일 (exam→quiz 등) | 개발팀 + 기획팀 | P1 | ⏳ |
| 8 | spec v2에 정론 결정 반영 (차수 제거·EnrollmentPolicy) | 이팀장 + 기획팀 | P0 | ✅ |
| 9 | 커리큘럼 버전 발행 로직 | 개발팀(백엔드) | P1 | ⏳ |
| 10 | EnrollmentPolicy 모델 명시화 (채널 A/B/C) | 개발팀 + 기획팀 | P1 | ⏳ |
| 11 | 채널 C(가입 시 자동 등록) 그룹 매핑 UI | 개발팀 + 디자인팀 | P2 | ⏳ |
| 12 | "페이지 순서대로 수강" 옵션 의미 명확화 | 운영팀 | P2 | ⏳ |
| 13 | QA 회귀 시나리오 작성 (슬롯·버전·등록 채널) | QA | P1 | ⏳ |

---

## 7. 한 줄 요약

> **v1 빌더는 newcourse 정론 모델과 구조적으로 정합. 코스 유형 selector 제거·차수 제거·등록 채널 3종 정의가 정론으로 확정되어 1차 정렬 완료. 잔여는 슬롯 명명 통일·커리큘럼 버전 발행 로직·EnrollmentPolicy 명시화·채널 C(가입 시 자동 등록) 신규 매커니즘.**

---

**관련 문서**
- 분석 대상: `newcourse/admin/online-builder-v1.html` (정론 정렬 반영)
- spec 풀: `newcourse/docs/newcourse-spec.md`
- spec 읽기 쉬운 버전: `newcourse/docs/newcourse-spec-v2.html`
- 쉬운 요약: `newcourse/docs/newcourse-overview.md`
- 4영역 분리 와이어 (참고용 보존): `newcourse/admin/newcourse-hub.html` + 4개
