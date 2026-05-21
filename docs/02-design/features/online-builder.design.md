---
feature: online-builder
phase: design
status: in-iteration
created: 2026-04-27
updated: 2026-05-08
architecture: 2패널 레이아웃 (좌측 4섹션 폼 + 우측 커리큘럼 사이드바 500px) + 자체 스크롤
stack: React 18 CDN + Tailwind CSS CDN + Lucide React (단일 HTML)
---

# 강의 코스 빌더 — Design Document

> **UI 라벨**: "강의 코스 만들기" (코드 상수: `CONTENT`). 파일명: `admin/online-builder.html` (online- prefix 유지).
> **상위 차터**: 메모리 `project-newcourse-charter` + `project-newcourse-course-system-architecture`. v1 페이지 기반과 별도 패러다임으로 영구 공존.

## Context Anchor

| 항목 | 내용 |
|---|---|
| **WHY** | 레거시 페이지 모델 정합성 결함 해소 + 코스 개설 단일 화면 통합 |
| **WHO** | HRD 담당자, 콘텐츠 관리자, 코스 운영자 (자율 신청 + 강제 배정) |
| **RISK** | 항목별 이수조건 미설정 / 자격(L1) 위반 / 의무 교육 옵션 누락 / 커리큘럼 순서 vs 일정 충돌 |
| **SUCCESS** | 단일 화면에서 코스 구성·자격 정의·일괄설정 적용·퍼블리싱. 항목 단위 정합성 측정 |
| **SCOPE** | 단일 HTML 프로토타이핑 (백엔드 미연결). 블렌디드는 별도 빌더 |

---

## 1. 아키텍처

**2패널 레이아웃**: 좌측 메인(flex-1, 800px 고정 폭) + 우측 커리큘럼 사이드바(500px, 다크 헤더)

---

## 2. 화면 구조

### 2.1 전체 레이아웃 (오프라인 빌더 동일 셸)

```
┌────────────────────────────────────────────────────────────────────────┐
│ GLOBAL TOP NAV (52px) — 즐겨찾기·관리자 가이드·프로필                    │
└────────────────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────────────────┐
│ PAGE SUB-HEADER (오프라인 빌더 동일)                                     │
│  ← 뒤로  [📺] 온라인 코스 개설  [🎬 온라인]  [상태칩]                       │
│                              [임시저장] [미리보기] [퍼블리싱]            │
└────────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────┬─────────────────────────────────┐
│  LEFT MAIN (flex-1, 800px 정렬)      │  RIGHT SIDEBAR (500px)          │
│  자체 overflow-y-auto                 │  자체 overflow-y-auto h-full     │
│                                      │                                 │
│  섹션 1: 코스 기본 정보               │  [커리큘럼 관리]  [⚙ 일괄설정]   │
│   코스명 / 커버이미지(720x1200)       │   커리큘럼 N · 항목 M · 필수 K   │
│   카테고리(optgroup) / 강사(default 없음) │                              │
│   강사 소개 / 코스 소개               │  [01 커리큘럼]  📅 N일  count    │
│   코스 상세 상단 (코스 표지 / 이미지)   │   ├── 항목 1  [필수] 🔗 prereq  │
│                                      │   │  이수: 시청률 90% 이상        │
│  섹션 2: 수강 신청 설정               │   ├── 항목 2  [선택]            │
│   신청 기간 (datetime-local)          │  [02 커리큘럼]                   │
│   등록 방식 (자율/강제 라디오)         │   ├── 항목 3                     │
│   L1 코스 등록 자격 (그룹 픽커)        │  [+ 커리큘럼 추가]               │
│   강제 모드 안내 (분기)               │                                 │
│                                      │  ─────────────────────          │
│  섹션 3: 수강 기간 설정               │  [코스 퍼블리싱] 하단 sticky     │
│   시작~종료 / 등록후 N일 / 무제한      │                                 │
│                                      │                                 │
│  섹션 4: 학습 진행 룰 (정책만)         │                                 │
│   ① 수강 시간 제한 [v2]              │                                 │
│   ② 비움 모니터링 [v2]               │                                 │
│   ③ 단계별 공개 토글·기준일·미리보기[v1.1]│                                │
│   ⑤ 서명 문서 첨부 [v2]              │                                 │
│   (일괄설정은 우측 모달로 이전)         │                                 │
└──────────────────────────────────────┴─────────────────────────────────┘
```

### 2.2 항목 추가 모달 (AddItemModal) — 3단계

```
Step 1 유형선택     Step 2 추가방식       Step 3a 라이브러리    Step 3b 업로드
[영상] [시험]       [라이브러리에서]      검색 + 목록          드래그&드롭 영역
[설문] [PDF]        [직접 업로드]
                   [빈 항목으로 추가]
※ article은 1차 제외

※ OFFLINE 유형은 차단 (블렌디드 빌더에서만 활성)
```

### 2.3 항목 카드 요약 칩

| 칩 | 표시 조건 | 색상 |
|---|---|---|
| 📅 N일 | `chapter.releaseAfter > 0` | violet |
| 🔗 prereq | `item.prerequisiteIds.length > 0` | amber |
| 이수: ... | `item.isRequired && condText` | slate |
| [필수] / [선택] | 항상 | indigo / slate |

---

## 3. 상태 모델 (State)

### App 레벨 State (현재 구현 기준)

| state | 타입 | 설명 |
|---|---|---|
| `courseInfo` | object | title, category, instructor, instructorDesc, intro, **noInstructor: default true**, certificate |
| `coverImage` | object \| null | { dataUrl, fileName } |
| `detailTop` | string | 'cover' \| 'images' (코스 상세 상단) |
| `regPeriod` | object | start, end (datetime-local) |
| `isSelfEnroll` | boolean | 자율수강(true) vs 강제할당(false) — **라디오 택 1** |
| `cancelPolicy` | object | (제거됨 — 온라인엔 의미 X) |
| `studyPeriod` | object | type('fixed'\|'days'\|'unlimited'), fixedStart, fixedEnd, days |
| `courseEligibility` | string[] | **L1 코스 등록 자격 그룹** |
| `chapters` | array | [{id, title, **releaseAfter**, items:[{id,type,title,isRequired,cond,source,libRef,**prerequisiteIds**}]}] |
| **`pageSequenceLock`** | boolean | (deprecated — 일괄설정로 대체) |
| **`timeRestriction`** | object | enabled, days{mon..sun: {active, start, end}} (v2) |
| **`idleMonitor`** | object | enabled, minutes (v2) |
| **`dripLearning`** | object | enabled, baseDate('enrollment'\|'studyStart'), preview (v1.1) |
| **`signDocs`** | object | enabled, docs[] (v2) |
| **`intervalDays`** | number | 단계별 공개 일괄설정용 (default 7) |
| `courseStatus` | string | 'draft' \| 'saved' \| 'published' |
| `addItemModal` | number \| null | 항목 추가 모달 대상 커리큘럼 ID |
| `settingSlot` | object \| null | 이수조건 설정 모달 대상 {chId, item} |

### 슬롯 유형 (SLOT_TYPES)

| 유형 | 키 | 기본 이수조건 | 비고 |
|---|---|---|---|
| 영상 | video | watchRate: 90 | (v2 추가 옵션: 스킵 방지·동영상 학습 조건) |
| 시험 | exam | passScore: 60, totalQ: 20 | (재응시 옵션 검토) |
| 설문 | survey | {} | 제출 기준 |
| ~~아티클~~ | ~~article~~ | ~~{}~~ | **1차 제외** (UI·라이브러리·기본 데이터 모두 빠짐) |
| ~~오프라인~~ | ~~offline~~ | ~~attendance: 100~~ | **온라인 빌더 차단** (블렌디드 빌더에서만 활성) |

### 일괄설정 함수

| 함수 | 동작 |
|---|---|
| `applySequenceMacro()` | 모든 항목 prerequisiteIds = [직전 항목] 자동 설정. confirm 후 적용. |
| `clearSequenceMacro()` | 모든 항목 prerequisiteIds = [] 일괄 해제. |
| `applyIntervalMacro()` | 모든 커리큘럼 releaseAfter = idx × intervalDays 자동 설정. confirm 후 적용. |
| `applyAllRequired()` | 모든 에셋 isRequired = true. confirm 후 적용. |
| `applyAllOptional()` | 모든 에셋 isRequired = false. confirm 후 적용. |
| `applyVideoOnlyRequired()` | type==='video'면 isRequired=true, 그 외 false. confirm 후 적용. |

---

## 4. 컴포넌트 목록

| 컴포넌트 | 역할 |
|----------|------|
| `Toggle` | 공통 토글 스위치 (active, onClick) |
| `AddItemModal` | 항목 추가 4단계 모달 (type→source→library/upload) |
| `SlotSettingModal` | 이수조건 설정 모달 (영상/시험은 편집+저장/취소, 설문/PDF는 안내+확인 단일 버튼) |
| `BatchSettingModal` | 일괄설정 모달 — 3섹션(필수/선택 · 순차 학습 · 공개일). 우측 사이드바 [⚙ 일괄설정] 버튼이 트리거. 액션 선택 시 하단 amber 확인 패널로 적용/취소 |
| `App` | 최상위, 전체 State 관리 + 렌더 |

---

## 5. 핵심 함수 설계

| 함수 | 역할 |
|------|------|
| `updInfo(k, v)` | courseInfo 단일 필드 업데이트 |
| `updPeriod(k, v)` | studyPeriod 단일 필드 업데이트 |
| `addChapter()` | 새 커리큘럼 추가 |
| `removeChapter(chId)` | 커리큘럼 삭제 |
| `updateChapterTitle(chId, title)` | 커리큘럼 제목 인라인 편집 |
| `addItem(chId, type, title, libItem)` | 커리큘럼에 항목 추가 |
| `removeItem(chId, itemId)` | 항목 삭제 |
| `updateItem(chId, itemId, changes)` | 항목 속성 업데이트 (title, isRequired 등) |
| `updateItemCond(chId, itemId, cond)` | 항목 이수조건 업데이트 |
| `onItemDragStart/DragOver/Drop/DragEnd` | 커리큘럼 간 항목 드래그앤드롭 |
| `handleSaveDraft()` | 임시저장 (첫 저장: 상세 토스트, 이후: 간단 토스트) |
| `handlePublish()` | 퍼블리싱 확정 (canPublish 조건 통과 시) |
| `dismissToast()` | 토스트 닫기 (fade-out 애니메이션 후 제거) |

---

## 6. 파생 값 (Derived State)

| 값 | 계산 방법 |
|----|---------|
| `allItems` | chapters.flatMap(ch => ch.items) |
| `totalSlots` | allItems.length |
| `reqSlots` | allItems.filter(s => s.isRequired) |
| `validation` | 6개 체크리스트 배열 (boolean) |
| `canPublish` | validation.every(v => v.ok) |
| `condText(slot)` | 슬롯 유형별 이수조건 텍스트 반환 |

---

## 7. 데이터 구조

```js
// 커리큘럼 구조 (코드명: chapters)
chapters = [
  {
    id: number,
    title: string,
    items: [
      {
        id: number,
        type: 'video' | 'exam' | 'survey' | 'pdf',  // 1차 스코프
        title: string,
        isRequired: boolean,
        cond: { watchRate?:number, passScore?:number, totalQ?:number },
        source: 'library' | 'upload' | 'empty',
        libRef: string | null,
      }
    ]
  }
]

// 라이브러리 목업 데이터
LIBRARY_ITEMS = [{ id, type, title, sub, time }, ...]

// 수료 조건
completionRules = [{ id, label, fixed, condition:{ type:'all_required' } }]
```

---

## 8. 퍼블리싱 검증 로직

```js
const validation = [
  { label: '코스명 입력',         ok: !!courseInfo.title.trim() },
  { label: '담당 강사 지정',       ok: courseInfo.noInstructor || !!courseInfo.instructor.trim() },
  { label: '신청 기간 설정',       ok: !!regPeriod.start && !!regPeriod.end },
  { label: '수강 기간 설정',       ok: studyPeriod.type === 'unlimited' || (studyPeriod.type === 'days' && studyPeriod.days > 0) || (!!studyPeriod.fixedStart && !!studyPeriod.fixedEnd) },
  { label: '커리큘럼 최소 1개',   ok: totalSlots > 0 },
  { label: '필수 콘텐츠 최소 1개', ok: reqSlots.length > 0 },
];
```

---

## 9. 모달 설계

### AddItemModal 플로우
```
step: 'type' → 'source' → 'library' | 'upload'

type: [영상][시험][설문][PDF] 선택 (article 1차 제외)
source: [라이브러리에서] [직접 업로드] + [빈 항목으로 추가 (빠른 추가)]
library: 검색 + 목록 → 선택 → [가져오기]
upload: 드래그&드롭 영역 + 클릭 업로드
```

### SlotSettingModal
- 영상: 시청률 슬라이더 (50~100%, step 5) → 취소/저장 버튼
- 시험: 합격점수 number input + 총 문항수 number input → 취소/저장 버튼
- 설문/PDF: 고정 텍스트 표시 (편집 불가) → **확인 단일 버튼** (입력 없는 안내성 모달은 저장/취소 비제공)

---

## 10. 테스트 시나리오

| 시나리오 | 검증 항목 |
|----------|-----------|
| 코스명 미입력 퍼블리싱 시도 | 체크리스트 빨간 표시, 버튼 disabled |
| 커리큘럼 추가 → 항목 추가 → 필수 설정 | 퀵스탯 바 수치 갱신 |
| 라이브러리에서 항목 추가 | 선택 후 [가져오기] → 커리큘럼에 항목 추가 |
| DnD 순서 변경 | 커리큘럼 간 항목 이동 |
| 수강 기간 유형 전환 | 고정기간 → 날짜 입력 노출, 신청후N일 → 숫자 입력 |
| 임시저장 → 퍼블리싱 | draft → saved → published 상태 전환 |
| 이수조건 설정 (영상/시험) | SlotSettingModal 저장 → condText 갱신 |
| 이수조건 설정 (설문/PDF) | 안내 텍스트 + 확인 버튼만 노출 (저장 액션 없음) |
