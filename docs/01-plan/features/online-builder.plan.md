---
feature: online-builder
phase: plan
status: in-iteration
created: 2026-04-27
updated: 2026-05-08
approach: Retrospective PDCA (구현·결정 누적 문서화)
---

# 강의 코스 빌더 — 기획 Plan

> **UI 라벨**: "강의 코스 만들기" (코드 상수: `CONTENT`). 파일명은 `admin/online-builder.html` (online- prefix 유지).
> **상위 차터**: 메모리 `project-newcourse-charter` + `project-newcourse-course-system-architecture`. v1 페이지 기반과 별도 패러다임으로 영구 공존.

## Executive Summary

| 관점 | 내용 |
|---|---|
| **Problem** | HRD 담당자가 온라인 코스 개설 시 기본정보·커리큘럼·이수조건·수강기간을 분산된 화면에서 입력. 레거시는 페이지 단위 측정으로 진도율·학습시간 정합성이 깨짐 (메뉴얼에 명시: "학습시간은 페이지 내 동영상 재생 시간과 무관") |
| **Solution** | 단일 화면 4섹션 폼 + 우측 사이드바 (커리큘럼-항목 2계층). 측정 단위는 **에셋(항목)** 단위로 정합성 확보 |
| **기능/UX 효과** | 항목별 인라인 이수조건. 코스 레벨 일괄설정(전체 순서·일괄 N일 간격)로 단순 케이스 부담 최소화. 커리큘럼·항목 카드에 요약 칩(📅 / 🔗) 노출 |
| **Core Value** | "코스 기획부터 퍼블리싱까지 한 화면에서 + 정합성 깨진 레거시 결함 해결" |

## Context Anchor

| 항목 | 내용 |
|---|---|
| **WHY** | 레거시 페이지 모델의 정합성 결함 해소 + 입력 화면 단일화 |
| **WHO** | HRD 담당자, 콘텐츠 관리자, 코스 운영자 |
| **RISK** | 레거시 운영자 학습 곡선 / 의무 교육 코스 옵션 누락 / 자격(L1·L2) 위반 미검증 |
| **SUCCESS** | 단일 화면에서 코스 구성·자격 정의·퍼블리싱. 항목별 이수조건이 정확히 측정. 의무 교육 케이스 옵션 충족 |
| **SCOPE** | 프론트엔드 단일 HTML 프로토타이핑. 백엔드 미연결 |

---

## 한 줄 룰

> **"코스 = 커리큘럼 → 항목(에셋)의 순서 인덱싱이며, 모든 측정·이수·자격은 항목 단위로 정밀하게 한다."**

### 5가지 이유

1. **정합성** — 레거시 페이지 머무르기 부정 학습 차단. 영상은 실제 재생 시간, 시험은 점수 기준.
2. **재사용성** — 항목 단위 기능이 의무 교육·일정 학습·자유학습 모든 케이스를 표현 가능.
3. **운영자 부담 최소화** — 단순 케이스는 코스 레벨 일괄설정 1번 클릭, 복잡 케이스는 항목별 정밀 편집.
4. **확장성** — 블렌디드(오프라인 항목 추가)는 별도 빌더에서, 같은 모델 재사용.
5. **레거시 호환 라벨** — 일반/필수 코스 라벨은 유지 → 운영자 학습 곡선 X.

---

## 1. Phase 범위 (운영팀·기획팀 합의 기준)

### Phase v1 — 현 빌더 범위

| 영역 | 기능 |
|---|---|
| **헤더** | 오프라인 빌더 동일 스타일 (icon + title + 상태칩 + 임시저장·미리보기·퍼블리싱) |
| **타입** | `online` 고정. 블렌디드는 별도 빌더(`blended-builder.html`). OFFLINE 유형 차단 |
| **섹션 1 코스 기본 정보** | 코스명, 커버 이미지(720×1200, 5MB), 카테고리(optgroup), 담당 강사(default 강사 없음 ON), 강사 소개, 코스 소개, 코스 상세 상단(코스 표지/이미지 최대 5장) |
| **섹션 2 수강 신청 설정** | 신청 기간, 등록 방식(자율/강제 라디오 — 동시 ON X), L1 코스 등록 자격(그룹 픽커) |
| **섹션 3 수강 기간 설정** | 시작일~종료일 / 등록 후 N일 / 무제한 |
| **섹션 4 학습 진행 룰** | 5개 옵션 (아래 표 참조) |
| **우측 사이드바 커리큘럼 관리** | 커리큘럼 → 항목(에셋) 2계층, DnD, 라이브러리 가져오기·업로드, 항목 카드 요약 칩(📅 releaseAfter / 🔗 prereq) |
| **퍼블리싱** | 모달, 임시저장 토스트 |

### 섹션 4 학습 진행 룰 — 단계별 분류

| 옵션 | 단계 | 카테고리 | 동작 |
|---|---|---|---|
| 수강 시간 제한 | v2 | 의무 교육 | 요일별 시간 윈도우 |
| 비움 모니터링 | v2 | 의무 교육 | N분 inactive → 학습시간 미적립 |
| 커리큘럼별 공개일 (단계별 공개) | v1.1 | 일정 학습 | 커리큘럼별 releaseAfter + **일괄 N일 간격 일괄설정** |
| 전체 순서대로 수강 (일괄설정) | v1 | 의무 교육 | 항목별 prerequisiteIds 일괄설정 |
| 서명 문서 첨부 | v2 | 의무 교육 | + 문서 추가 버튼 |

### Phase 후속 (별도 작업)

- 항목 톱니바퀴 모달에 prereq selector 추가
- 커리큘럼 톱니바퀴 모달 (releaseAfter 직접 편집)
- 커리큘럼 레벨 sequence override (코스 일괄설정 위로 추가 정밀 제어)
- 자산 라이브러리 분리 모델 (v3+) — 데이터 쌓이면 추출 검토

---

## 2. 데이터 모델

### Course

```
Course {
  id, title, category, instructor, instructorDesc,
  intro, coverImage, detailTopType ('cover'|'images'),

  // 등록·자격
  enrollMode: 'self' | 'forced',
  regPeriod: { start, end },
  courseEligibility: groupId[],  // L1

  // 학습 기간
  studyPeriod: {
    type: 'fixed' | 'days' | 'unlimited',
    fixedStart, fixedEnd, days
  },

  // v2 의무 교육 옵션
  timeRestriction: { enabled, days: { mon..sun: { active, start, end } } },
  idleMonitor: { enabled, minutes },
  signDocs: { enabled, docs: [] },

  // v1.1 단계별 공개
  dripLearning: { enabled, baseDate: 'enrollment'|'studyStart', preview },

  // 코스 분류 (검토 중)
  classification: 'normal' | 'mandatory'  // 일반 / 필수
}
```

### Chapter (=커리큘럼)

```
Chapter {
  id, title,
  releaseAfter: number,    // 단계별 공개 일수
  items: Item[]
}
```

### Item (=에셋)

```
Item {
  id, type: 'video' | 'exam' | 'survey' | 'pdf',  // 1차 스코프 (article은 제외)
  title, isRequired,
  cond: { /* type별 다름 */ },
  source: 'library' | 'upload' | 'empty',
  libRef,
  prerequisiteIds: itemId[]   // 진입 조건
}
```

### Item 타입별 cond

| 타입 | cond 필드 | 기본값 |
|---|---|---|
| video | watchRate (시청률 %) | 90 |
| exam | passScore, totalQ | 60점 / 20문항 |
| survey | (없음 — 제출 기준) | — |
| pdf | (없음 — 열람 기준) | — |
| ~~article~~ | ~~없음~~ | **1차 제외** (UI·라이브러리·기본 데이터 모두 빠짐) |

> **OFFLINE 타입 X** — 온라인 빌더에서 차단. 블렌디드 빌더에서만 활성.

---

## 3. 핵심 결정 사항 (이번 사이클 누적)

### 자격 — L1 + L2 분리

| 층 | 의미 | 위치 |
|---|---|---|
| **L1 코스 등록 자격** | 누가 코스에 등록 가능 | 섹션 2 그룹 픽커 |
| **L2 자산 자격** | (블렌디드 한정) 오프라인 항목별 자격 | 블렌디드 빌더 항목 카드 |

- 자산 자격 ⊆ 코스 자격 강제. 위반 시 퍼블리싱 차단.
- 온라인 빌더는 L1만 사용.

### 자율/강제 라디오 (동시 ON 차단)

- 레거시는 두 모드 동시 ON 가능했으나 운영팀 합의로 라디오 택 1.
- 사유: 한 코스 안에 두 룰이 섞이면 명단·취소·수료 처리 폭망.
- 의무인데 신청 운영 케이스 = 별도 코스로 분리.

### 빌더 분리 (online / offline / blended)

| 빌더 | 진입점 | 항목 타입 |
|---|---|---|
| `online-builder.html` | 코스 목록 → 새 코스 → 온라인 | video / exam / survey / pdf (article은 1차 제외) |
| `offline-builder.html` | 코스 목록 → 새 코스 → 오프라인 | (회차·차수 모델, 별도) |
| `blended-builder.html` | 코스 목록 → 새 코스 → 블렌디드 | 위 4개 + offline (자산 라이브러리 참조) |

- 온라인 빌더에서 OFFLINE 메뉴 차단 (자동 승격 X) — 명시적 분리.
- 블렌디드는 온라인 베이스 + OFFLINE 항목 추가 가능.

### 일반 / 필수 코스 라벨

- 레거시 라벨 유지 (운영자 학습 곡선 X).
- 코스 레벨 분류 — 학습자 앱에서 [필수] 빨간 배지 노출.
- 코스 분류와 항목 isRequired는 직교(독립) 개념.
- 강제 배정 모드와도 직교 (의무 라벨 + 자율 신청 = 가능).

### 수료 조건 — 항목 단위 인라인

- 레거시는 코스 단위 수료 조건 (진도율·학습시간·시험·설문·동영상별 재생률).
- NEW는 **항목별 인라인** (영상 시청률·시험 점수·설문 제출·PDF 열람).
- 코스 단위 "진도율 80%"는 자동 계산: 이수한 항목 / 전체 항목.

### 일괄설정 패턴

**위치**: 우측 사이드바 헤더 [⚙ 일괄설정] 버튼 → BatchSettingModal (3섹션 통합).

| 섹션 | 일괄설정 | 동작 |
|---|---|---|
| ① 필수/선택 | 모두 필수 | 모든 에셋 isRequired = true |
| ① 필수/선택 | 모두 선택 | 모든 에셋 isRequired = false |
| ① 필수/선택 | 영상만 필수 | type==='video' → true, else false |
| ② 순차 학습 | 전체 순차 진입 | 모든 항목 prerequisiteIds = [직전 항목] |
| ② 순차 학습 | 모두 해제 | 모든 항목 prerequisiteIds = [] |
| ③ 공개일 (드립) | N일 간격 적용 | 모든 커리큘럼 releaseAfter = idx × N |
| ③ 공개일 (드립) | 개별 편집 | 커리큘럼별 releaseAfter 직접 입력 |

- 액션 클릭 시 모달 하단 amber 확인 패널 노출 → [적용] / [취소] 2단계.
- 섹션 4(학습 진행 룰)에는 정책 토글(단계별 공개 토글·기준일·미리보기 등)만 잔존, 일괄설정·데이터 편집은 우측 모달로 일원화.
- 개별 항목 수동 편집 시 일괄설정 OFF 표시 (Phase 후속).

### 항목 카드 요약 칩

| 칩 | 표시 조건 | 색상 |
|---|---|---|
| 📅 N일 | chapter.releaseAfter > 0 | violet |
| 🔗 prereq | item.prerequisiteIds.length > 0 | amber |
| 이수 조건 | item.isRequired && condText 존재 | slate |
| 필수 / 선택 | 항상 | indigo / slate |

세부 입력은 톱니바퀴 모달에서.

---

## 4. 레거시 정합성 결함과 NEW의 해결

| 영역 | 레거시 동작 | 결함 | NEW 해결 |
|---|---|---|---|
| 학습시간 | 페이지 머무르기 (영상 재생 무관) | 영상 안 보고 페이지 열어두기로 100% 충족 | 항목별 실제 학습 활동 시간 합산 |
| 진도율 | 페이지 보기만 해도 카운트 | 실제 학습 안 해도 진도율 카운트 | 이수한 항목 / 전체 항목 (이수 조건 충족 기준) |
| 측정 단위 | 페이지 (영상+텍스트+시험 묶음) | 단위가 너무 큼 | 에셋(항목) 단위로 분해 |

> **레거시 메뉴얼 인용**: "❗학습시간은 페이지 내의 동영상 재생 시간과 무관합니다. (동영상 재생하지 않고, 페이지에 머무르기만 해도 학습시간이 충족됩니다)" — `Touchclass_관리자_매뉴얼_v.15.pdf` 69p

---

## 5. 퍼블리싱 검증 체크리스트

| 항목 | 조건 |
|---|---|
| 코스명 입력 | `title.trim()` |
| 담당 강사 지정 | noInstructor (default true) 또는 instructor 입력 |
| 신청 기간 설정 | start + end |
| 수강 기간 설정 | 유형에 맞는 값 |
| 커리큘럼 최소 1개 | `chapters.length > 0` |
| 필수 콘텐츠 최소 1개 | `reqSlots.length > 0` |

> 위반 시 퍼블리싱 버튼 비활성. 우측 사이드바 하단 안내 문구.

---

## 6. 기술 스택

- React 18 (Babel standalone, ESM CDN)
- Tailwind CSS (CDN)
- Lucide React 0.292.0
- 단일 HTML 파일 (백엔드 미연결)
- 레이아웃: 글로벌 좌측 사이드바(200px) + 메인 + 우측 커리큘럼 사이드바(500px)

---

## 7. 후속 작업 후보

| 작업 | 우선순위 | 비고 |
|---|---|---|
| SlotSettingModal에 prereq selector 추가 | High | 사용자가 직접 prereq 편집 |
| 커리큘럼 톱니바퀴 모달 (releaseAfter 편집) | Medium | 현재 섹션 4에서만 가능 |
| 코스 분류 (일반/필수) 라디오 추가 | Medium | 운영팀 OK 받으면 |
| 학습자 앱 [필수] 배지 노출 | Medium | 학습자 앱 측 작업 |
| 미리보기 모달 | Low | 헤더 버튼 존재만 |
| 커리큘럼 레벨 sequence override | v2 | 코스 일괄설정 위 정밀 제어 |
| ~~자산 라이브러리 분리 모델~~ | **1차로 격상** | `docs/01-plan/features/library.plan.md` 별도 기획 |
| 비움 모니터링 / 서명 문서 / 수강 시간 제한 실 동작 | v2 | UI는 풀스펙 노출, 백엔드 연결 필요 |

---

## 8. 관련 문서

- 레거시 분석: `docs/00-standard/legacy-course-manual.md`
- 디자인: `docs/02-design/features/online-builder.design.md`
- 오프라인 빌더: `docs/01-plan/features/offline-builder.plan.md`
- 블렌디드 빌더: (별도 문서 후속)
- **콘텐츠 라이브러리: `docs/01-plan/features/library.plan.md`** (빌더와 양방향 연동)
