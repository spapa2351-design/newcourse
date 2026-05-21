# 세션: 2026-03 원본 문제의식 문서 리뷰 + newcourse-spec 갭 분석

> 날짜: 2026-05-18
> 참석: 이팀장, 구차장(기획), 고과장(기획), 카리나차장(운영), 태서과장(운영)
> 원본 위치: `J:\claude\fig\d0e6abbf-...\터치클래스 코스 구조 변경 계획 안 (2026 03)\`
> 원본 문서: 9개 + 개념도 HTML 2개

---

## 1. 원본 문서 구성

| 문서 | 성격 | 핵심 내용 |
|---|---|---|
| 문제 정의 - 서술형 | 발견 | 현재 시스템 한계 + 핵심 우려 3가지 |
| 문제 정의 - 정리 | 정리 | 4가지 구조 문제 (콘텐츠/뷰어/추적/정합성) + 11장 합의 문장 |
| 해결 방안 1 - Activity | 이상론 | Activity 기반 LMS + Event Normalization Layer |
| 해결 방안 2 - Fulfillment Layer | 이상론+ | Learning Node + 3-layer 분리 + Learning Graph + Evidence Store |
| 해결 방안 3 - 현실적 대안 | 현실론 | `curriculum_item` 상위 래퍼 + 최소 수정 |
| 해결 방안 4 - 최종 제안 | 최종 | 방안 3 정제. 공식 제안서 형태 |
| 실행 계획 - 비개발자 | 커뮤니케이션 | 상자→선반 비유, 6원칙 |
| 기타 아이디어 | 브레인스토밍 | Learning OS, Event Sourcing, Activity Graph |
| 개념도 / 개념도 - 심플 | 시각화 | HTML 다이어그램 2종 |

---

## 2. 원본의 4대 구조 문제 (문제 정의 - 정리 §6)

1. **콘텐츠 모델 문제** — 서로 다른 학습 자원을 어떤 공통 모델로 담을 것인가
2. **뷰어 모델 문제** — LMS가 각 콘텐츠를 어떤 방식으로 열고 연결할 것인가
3. **학습 추적 모델 문제** — 표준 학습 추적 추상화 계층 필요
4. **운영 정합성 문제** — 운영 중 학습 구조의 불변성과 버전 정합성

원본 합의 문장:
> "터치클래스의 다음 단계 구조 개편은 새 저작도구 추가가 아니라, 다양한 학습 아이템을 LMS가 통합 오케스트레이션하는 구조로의 전환이다."

---

## 3. 4개 해결 방안의 진화 흐름

```
방안 1 (Activity)        — 이상적, 풀스택 재설계
   ↓
방안 2 (Fulfillment)     — 한 단계 추상화 더, 3-layer 분리·Learning Graph
   ↓
방안 3 (현실적 대안)      — 레거시 최소 수정, curriculum_item 도입
   ↓
방안 4 (최종 제안)        — 방안 3 정제, 공식 제안서
```

기획팀 평가: 방안 1·2가 이상론, 3·4가 현실론. 둘 다 가치 있음. **장기 비전 = 방안 2, 단기 실행 = 방안 4.**

---

## 4. newcourse-spec v0.1 vs 원본 문서 — 일치 / 갭 / 발전

### 4.1 일치 (6개 핵심)

| 항목 | newcourse-spec | 원본 출처 |
|---|---|---|
| 학습 단위 객체화 | Slot | 방안 1 Activity / 방안 2 Learning Node / 방안 4 curriculum_item |
| 진도 단위 = 객체 단위 | 슬롯 단위 | 방안 1 §3-1 / 방안 4 §7.2 |
| 커리큘럼 버전 동결 | Curriculum.version | 방안 1 §3-1 / 방안 2 §4 |
| 회차에 버전 스냅샷 | Cohort.curriculumVersion | 방안 1 §3-1-5 Enrollment Snapshot |
| 오프라인 = 객체 타입 | `offline_attendance` 슬롯 | 방안 1 §7 / 방안 2 §4 |
| 에디터 책임 분리 | 4분할 | 방안 1 §3-2 / 방안 2 §6 |

### 4.2 갭 — newcourse-spec에 없는 원본 개념

#### 갭 1. Presentation / Evidence / Fulfillment 3-layer 분리 (방안 2 §3)
원본은 시스템 전체를 3계층으로 분리한다.
- **Presentation**: UI/UX 책임만
- **Evidence**: 관측 가능한 사실만 기록 (해석 X)
- **Fulfillment**: 증거를 근거로 이수 조건 충족 판정

newcourse-spec은 슬롯 정의 안에 3개가 혼재. 명시적 계층으로 분리 권장.

#### 갭 2. Evidence Store (방안 2 §7)
원본은 4단계 데이터 파이프라인을 제안:
```
raw event → normalized event → evidence aggregation → fulfillment evaluation
```
"이벤트는 로그, Evidence는 학습 상태의 재료." 우리는 진도 데이터만 있고 evidence 단계가 없다.

**가치**: 진도 재계산 가능, 수료 정책 변경 시 재판정 가능, 통계 파이프라인 단순화.

#### 갭 3. Enrollment Plan (방안 2 §4)
3단계 동결:
```
Course Blueprint → Published Version → Learner Enrollment Plan
```
newcourse-spec은 회차(Cohort) 단위까지만 동결. 학습자별 면제·대체 노드·예외 처리 표현 불가.

**운영팀 확인**: 휴직 복귀자 일부 슬롯 면제, 특정 학습자 대체 노드 부여 등 실제 운영 케이스 자주 발생.

#### 갭 4. Learning Graph (방안 2 §5)
선형 목차가 아니라 노드 그래프. 선수조건·대체 학습 경로·사전 테스트 면제·보충 학습 분기 자연스럽게 표현.

**판단**: Phase 4 미해결 논의로 분류. Phase 1~3는 선형 디폴트 유지.

#### 갭 5. 운영 정책 방어선 (방안 3 §6 / 방안 4 §8)
원본은 정합성 방어를 기술 재설계 + 운영 정책 2층으로 본다:
- **운영 시작 후 항목 삭제 금지** (soft delete만)
- **순서 변경 제한** (신규는 뒤에만 추가)
- **비활성화(active=false)만 허용**

newcourse-spec은 versioning 정책에 집중. 위 운영 정책도 명시 필요.

### 4.3 발전 — newcourse-spec이 원본보다 멀리 간 부분

| 항목 | newcourse-spec | 원본 |
|---|---|---|
| 회차(Cohort) 1급 객체화 | 명시적 + 복제·이월·만료 | "Enrollment Snapshot"으로 흐릿 |
| 만료 정책 | maxRunDays = 365 기본값 | 명시 없음 |
| 운영팀 언어 매핑 | "회차/기수" UI 라벨 | 학사 톤 (어색) |
| 수강생 이월 3옵션 | 전체이월/초기화/일부선택 | 언급만 있음 |

운영팀 평가: 회차 관점은 newcourse-spec이 더 강함. 원본은 기획이 강하고 우리는 운영이 강함.

---

## 5. 후속 작업 (newcourse-spec v0.2 반영안)

| # | 작업 | 위치 |
|---|---|---|
| 1 | 3-layer 분리(P/E/F) 명시 섹션 추가 | S2 또는 S6 옆 |
| 2 | Evidence Store 개념 추가 (S6 진도율 정합성 안) | S6 |
| 3 | Enrollment Plan 객체 추가 (학습자별 면제/대체 표현) | S2 4객체 → 5객체 확장 검토 |
| 4 | Learning Graph는 미해결 논의 8번에 명시 | S14 |
| 5 | 운영 정책 방어선(삭제/순서/비활성화) 명시 | S8 회차 운영 또는 S11 라이프사이클 |
| 6 | 원본 9개 문서 → `newcourse/docs/legacy-refs/` 복사 | 신규 폴더 |
| 7 | 원본 4대 구조 문제와 newcourse-spec 섹션 매핑표 추가 | S1 또는 부록 |

---

## 6. 한 줄 요약

> **원본 2026-03 문서는 우리 newcourse-spec의 사상적 부모다. 우리가 더 멀리 간 부분(회차/만료/운영 언어)도 있지만, 원본의 핵심 4가지(3-layer 분리·Evidence Store·Enrollment Plan·운영 정책 방어선)는 spec v0.2에 흡수해야 한다.**

## 7. 이유 5가지

1. 원본은 **터치클래스 운영 페인의 1차 정리**이며, 우리 spec의 모든 결정의 원천 사상이다.
2. 원본 방안 2의 **3-layer 분리**가 없으면 슬롯 타입 확장 시 진도 로직과 표현 로직이 다시 엉킨다.
3. 원본의 **Evidence Store**는 진도 재계산·수료 정책 변경 가능성을 만든다 — 우리 모델은 현재 재계산 불가.
4. 원본의 **Enrollment Plan**은 운영팀의 실제 면제·대체 케이스를 표현하는 유일한 방법이며, 회차 동결만으로는 부족하다.
5. 원본의 **운영 정책 방어선**(삭제 금지·비활성화·순서 제한)은 기술 versioning 없이도 80% 정합성 사고를 막는다 — 비용 대비 효과 1등 정책.

---

**참조**
- 원본: `J:\claude\fig\d0e6abbf-cb1d-4ad0-a0c3-0939ba527e90_ExportBlock-5eb8699e-533d-47e4-b4fe-42bcd7e211ac\개인 페이지 & 공유된 페이지\터치클래스 코스 구조 변경 계획 안 (2026 03)\`
- 우리 spec: `newcourse/docs/newcourse-spec.html` (v0.1 draft)
- 후속: newcourse-spec v0.2 — 위 7개 작업 반영
