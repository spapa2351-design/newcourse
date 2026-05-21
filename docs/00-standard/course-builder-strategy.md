# 코스 빌더 전략 — Online / Offline / Blended

> **상태**: in-iteration (2026-05-08 기준)
>
> **의도**: 3개 빌더 분리 운영의 근거·매핑·결정 사항 통합 노트.
>
> **연계 문서**:
> - `01-plan/features/online-builder.plan.md`
> - `01-plan/features/offline-builder.plan.md`
> - `00-standard/legacy-course-manual.md`

---

## 한 줄 룰

> **"3종 빌더(online · offline · blended)는 진입점부터 명시적으로 분리. 코스 타입은 처음 결정하고, 빌더 안에서 자동 변환 X."**

### 5가지 이유

1. **운영 명확성** — 코스 타입은 운영·수강관리·수료 룰에 결정적 영향. 모르는 사이 변경되면 위험.
2. **개발 단순성** — 빌더별로 컴포넌트·State·검증 로직 분리. 한 빌더 변경이 다른 빌더 깨지지 않음.
3. **운영자 인지 부담 X** — "이 빌더는 온라인", "저 빌더는 블렌디드"가 헤더부터 명확.
4. **수강관리 화면 일관성** — 빌더와 수강관리 화면이 코스 타입별로 1:1 대응.
5. **블렌디드는 온라인 베이스** — 블렌디드 = 온라인 + 오프라인 자산 추가. 별도 빌더지만 모델 90% 공유.

---

## 1. 3종 빌더 비교

| 영역 | online-builder | offline-builder | blended-builder |
|---|---|---|---|
| **진입** | 코스 목록 → 새 코스 → 온라인 | 코스 목록 → 새 코스 → 오프라인 | 코스 목록 → 새 코스 → 블렌디드 |
| **헤더 아이콘** | Monitor (📺) | MapPin (📍) | GitBranch (🔀) |
| **항목 타입** | video / exam / survey / article | (회차·차수 모델) | 위 4개 + offline (자산 라이브러리) |
| **차수·회차** | X | 핵심 (정원·일정·장소·그룹) | 코스 단위 단일 차수 + 발행 후 운영 페이지에서 추가 |
| **장소·주소·교통** | X | O | O (오프라인 자산만) |
| **L2 자산 자격** | X | (그룹 배정 별도) | O (오프라인 항목별) |
| **수료 측정 단위** | 항목(에셋) | 출석·회차 | 항목 + 출석 혼합 |
| **드립 학습** | v1.1 (챕터별 releaseAfter) | X | v1.1 (영상 항목만) |
| **컴플라이언스 옵션** | 5개 풀스펙 (v1·v1.1·v2 단계) | 별도 (출석 정책) | 온라인 옵션 + 오프라인 출석 |
| **상태** | in-iteration | 개발 중 (원본 유지) | 별도 mockup |

---

## 2. 핵심 결정 사항

### 2.1 빌더 간 자동 변환 X

| 케이스 | 현재 결정 | 사유 |
|---|---|---|
| 온라인에서 OFFLINE 항목 추가 시 | **차단** (모달에서 OFFLINE 메뉴 비표시) | 운영자가 "왜 갑자기 블렌디드?" 의문 방지 |
| 모든 OFFLINE 제거 시 online 자동 복귀 | **불필요** (애초에 OFFLINE 추가 X) | — |
| 빌더 전환 | **별도 진입** | 코스 타입 결정 = 진입 시 명시적 |

### 2.2 자격 모델 (L1 + L2)

| 층 | 의미 | online | offline | blended |
|---|---|---|---|---|
| **L1 코스 등록 자격** | 누가 코스에 등록 가능 | O (그룹 픽커) | O (수강 신청 권한) | O (그룹 픽커) |
| **L2 자산 참여 자격** | 오프라인 항목별 자격 | X | (그룹 배정으로 처리) | O (오프라인 항목 인라인) |

- **자산 자격 ⊆ 코스 자격** 강제. 위반 시 퍼블리싱 차단.
- 영상·시험 등 비-오프라인 자산은 L2 없음 (코스 등록자 전원).

### 2.3 자율 / 강제 등록

- **라디오 택 1** (동시 ON X). 운영팀 합의.
- 레거시는 두 모드 동시 ON 가능했으나 운영 부담으로 단순화.
- 의무 코스 + 자율 신청 운영 케이스는 **별도 코스로 분리**.

### 2.4 일반 / 필수 코스 라벨

- 레거시 라벨 유지 (운영자 학습 곡선 X).
- 코스 레벨 분류 — 학습자 앱에서 [필수] 빨간 배지.
- 코스 분류 ⊥ 항목 isRequired ⊥ 강제 배정 (직교 3개념).

### 2.5 수료 조건 — 항목 단위 인라인

- 레거시는 코스 단위 (진도율·학습시간·시험·설문·동영상별 재생률).
- NEW는 항목별 인라인:
  - video: 시청률 N% (실제 재생 기준)
  - exam: 통과 점수
  - survey: 제출
  - article: 열람 완료
  - offline: 출석 (블렌디드만)

### 2.6 매크로 패턴

코스 레벨에서 항목·챕터 일괄 설정:

| 매크로 | 동작 | 위치 |
|---|---|---|
| 전체 순서대로 | 모든 항목 prerequisiteIds = [직전 항목] | 섹션 4 ④ |
| 일괄 N일 간격 | 모든 챕터 releaseAfter = idx × N | 섹션 4 ③ 드립 학습 |
| 모두 해제 | 모든 항목 prerequisiteIds = [] | 섹션 4 ④ |

- confirm 모달 안전 장치.
- 단순 케이스(컴플라이언스) = 매크로 1번 / 복잡 케이스(부트캠프) = 항목별 정밀 편집.

---

## 3. 데이터 모델 (3종 공통 + 차이)

### 공통

```
Course {
  id, title, category, instructor, instructorDesc, intro,
  coverImage, detailTopType,
  type: 'online' | 'offline' | 'blended',
  classification: 'normal' | 'mandatory',  // 일반 / 필수

  enrollMode: 'self' | 'forced',
  regPeriod: { start, end },
  courseEligibility: groupId[],  // L1
}

Chapter {
  id, title,
  releaseAfter: number,  // 드립 학습 (online·blended만 의미)
  items: Item[]
}

Item {
  id, type, title, isRequired,
  cond: { /* type별 */ },
  prerequisiteIds: itemId[],
}
```

### Online 추가

```
Course.studyPeriod: { type, fixedStart, fixedEnd, days }
Course.timeRestriction (v2)
Course.idleMonitor (v2)
Course.dripLearning (v1.1)
Course.signDocs (v2)
```

### Offline 추가

```
Course.cohorts: [
  { id, name, capacity, startDate, endDate, place, groups[],
    sessionSelect: bool,
    sessions: [{ id, name, date, startTime, endTime, place, capacity, groups }] }
]
Course.attendancePolicy
```

### Blended (Offline 자산만)

```
Item[type=offline] {
  ...,
  assetEligibility: groupId[],  // L2
  // 회차·일정은 발행 후 운영 페이지에서 입력
}
```

---

## 4. 레거시 정합성 결함 → NEW 해결

| 영역 | 레거시 결함 | NEW 해결 |
|---|---|---|
| 학습시간 | 페이지 머무르기 (영상 재생 무관) | 항목별 실제 학습 활동 시간 합산 |
| 진도율 | 페이지 보기만 해도 카운트 | 항목 이수 조건 충족 기준 |
| 측정 단위 | 페이지 (큼) | 에셋(항목) 단위로 분해 |
| 콘텐츠 모델 | 외부 에디터 → 코스에서 참조 | 코스 등록 시 인덱싱 직접 |

---

## 5. 미해결 / 후속 검토

### 5.1 운영팀 추가 확인

- 자율/강제 라디오 vs 토글 동시 ON — 정말 분리 결정으로 굳혀도 OK인가?
- 일반/필수 라벨을 빌더 어디에 둘지 (섹션 1 / 헤더 / 별도 위치)
- PLUS 코스(터치콘텐츠) 영역의 NEW 모델 적용 여부

### 5.2 백엔드 확정 필요

- 챕터·항목 ID 체계 (현재 timestamp, 충돌 가능)
- 발행 후 차수 자동 생성 룰 (블렌디드)
- 자산 자격 위반 검증 시점 (퍼블리싱 vs 저장 시)
- 학습 활동 시간 측정 로직 (영상 재생 이벤트·텍스트 스크롤 등)

### 5.3 별도 화면 작업

- 코스 목록 페이지 — 3종 빌더 진입 메뉴
- 운영 페이지 (수강관리) — 챕터 진행 모드 + 회차 일정 모드
- 학습자 앱 — [필수] 배지·진도율 표시·prereq 안내

### 5.4 미반영 옵션 (v2 풀스펙)

- 비움 모니터링 (학습시간 측정 로직)
- 서명 문서 첨부 (감사 대비)
- 수강 시간 제한 (요일별 윈도우)
- 챕터 레벨 sequence override (코스 매크로 위 정밀 제어)

---

## 6. 빌더 파일 매핑

| 파일 | 상태 | 비고 |
|---|---|---|
| `admin/online-builder.html` | in-iteration | 4섹션 + 우측 사이드바. 본 문서 결정 모두 반영 |
| `admin/offline-builder.html` | 개발 중 (원본 유지) | 사이드바 차수·회차 구조는 손대지 않음 |
| `admin/blended-builder.html` | mockup | 진입점 별도 / 미정 |

---

## 7. 용어 통일 (UI 라벨)

| 코드 변수 | UI 라벨 | 학습자 앱 라벨 |
|---|---|---|
| `chapter` | 커리큘럼 | 커리큘럼 |
| `item` | 항목 (또는 에셋) | 페이지 (TBD) |
| `prerequisite` | 진입 조건 | (자동 안내) |
| `releaseAfter` | 공개일 (N일 후) | 공개일 |
| `sequenceMacro` | 전체 순서대로 (일괄 매크로) | — |

> "챕터 추가" 라벨은 "**커리큘럼 추가**"로 통일 (사용자 요청).
