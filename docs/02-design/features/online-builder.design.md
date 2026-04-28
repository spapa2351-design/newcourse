---
feature: online-builder
phase: design
status: approved
created: 2026-04-27
architecture: 2패널 레이아웃 (좌측 4섹션 폼 + 우측 커리큘럼 사이드바 500px)
stack: React 18 CDN + Tailwind CSS CDN + Lucide React (단일 HTML)
---

# 온라인 코스 등록 빌더 — Design Document

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | 온라인 코스 개설 프로세스 디지털 통합 — 분산된 입력 화면을 단일 빌더로 대체 |
| **WHO** | HRD 담당자(코스 기획·퍼블리싱), 콘텐츠 관리자(라이브러리 등록) |
| **RISK** | 커리큘럼 이수조건 미설정 시 수료 판정 오류. 퍼블리싱 검증 누락 시 불완전 코스 공개 |
| **SUCCESS** | HRD 담당자가 단일 화면에서 코스 구성부터 퍼블리싱까지 완료. 필수 콘텐츠 이수조건 설정 후 체크리스트 통과 |
| **SCOPE** | 프론트엔드 전용 단일 HTML 프로토타이핑 (백엔드 없음) |

---

## 1. 아키텍처

**2패널 레이아웃**: 좌측 메인(flex-1, 800px 고정 폭) + 우측 커리큘럼 사이드바(500px, 다크 헤더)

---

## 2. 화면 구조

### 2.1 전체 레이아웃

```
┌────────────────────────────────────────────────────────────────────────┐
│ HEADER (h-14, white, shadow)                                           │
│  ← 뒤로  |  코스등록 > 🎬 온라인  |  [상태뱃지]  |  [임시저장] [미리보기] [퍼블리싱] │
└────────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────┬─────────────────────────────────┐
│  LEFT MAIN (flex-1, overflow-y-auto) │  RIGHT SIDEBAR (w-[500px])      │
│                                      │                                 │
│  ┌── 퀵 스탯 바 (4 카드) ────────┐   │  [커리큘럼 관리 헤더 - dark]     │
│  │ 코스유형 | 전체항목 | 필수 | 완성도│   │  챕터 {N}  ·  항목 {M}  · 필수 {K}│
│  └─────────────────────────────┘   │                                 │
│                                      │  [챕터 01]                      │
│  ┌── 섹션 1: 코스 기본 정보 ───┐    │   └── 항목 1 (DnD card)          │
│  │ 코스명 | 카테고리 | 난이도   │    │   └── 항목 2                     │
│  │ 강사 | 예상학습시간          │    │  [챕터 02]                      │
│  │ 강사소개 | 코스소개          │    │   └── 항목 3                     │
│  │ 수료증발급 토글             │    │  ...                            │
│  └─────────────────────────────┘   │  [+ 챕터 추가]                  │
│                                      │                                 │
│  ┌── 섹션 2: 수강 신청 설정 ───┐    │  ─────────────────────────────  │
│  │ 신청기간 | 등록방식          │    │  체크리스트 (6개)                │
│  │ 취소정책 (자율수강 시)       │    │  [코스 퍼블리싱] 버튼             │
│  └─────────────────────────────┘   │                                 │
│                                      └─────────────────────────────────┘
│  ┌── 섹션 3: 수강 기간 설정 ───┐
│  │ 고정기간 / 신청후N일 / 무제한│
│  └─────────────────────────────┘
│
│  ┌── 섹션 4: 수료 조건 설정 ───┐
│  │ 필수 콘텐츠 전체 이수 (고정) │
│  │ 선택 콘텐츠 이수기준 (옵션)  │
│  └─────────────────────────────┘
└──────────────────────────────────────
```

### 2.2 항목 추가 모달 (AddItemModal) — 3단계

```
Step 1 유형선택     Step 2 추가방식       Step 3a 라이브러리    Step 3b 업로드
[영상] [시험]       [라이브러리에서]      검색 + 목록          드래그&드롭 영역
[설문] [아티클]     [직접 업로드]
                   [빈 항목으로 추가]
```

---

## 3. 상태 모델 (State)

### App 레벨 State

| state | 타입 | 설명 |
|-------|------|------|
| `courseInfo` | object | title, category, instructor, instructorDesc, intro, level, estimatedHours, certificate, noInstructor |
| `regPeriod` | object | start, end (datetime-local) |
| `isSelfEnroll` | boolean | 자율수강(true) vs 강제할당(false) |
| `selRule` | string | 'single' \| 'multi' (선택 규칙) |
| `maxSelect` | number | 다중선택 최대 선택 수 |
| `cancelPolicy` | object | enabled, mode('allowed'\|'blocked'), relativeValue, relativeUnit |
| `changePolicy` | object | enabled, relativeValue, relativeUnit |
| `studyPeriod` | object | type('fixed'\|'days'\|'unlimited'), fixedStart, fixedEnd, days |
| `chapters` | array | [{id, title, items:[{id,type,title,isRequired,cond,source,libRef}]}] |
| `completionRules` | array | [{id, label, fixed, condition}] |
| `hasOptionalThreshold` | boolean | 선택 콘텐츠 이수 기준 활성화 여부 |
| `optionalMinCount` | number | 선택 콘텐츠 최소 이수 개수 |
| `courseStatus` | string | 'draft' \| 'saved' \| 'published' |
| `lastSavedAt` | Date \| null | 마지막 저장 시각 |
| `showPublishModal` | boolean | 퍼블리싱 확인 모달 표시 여부 |
| `toast` | object \| null | 토스트 메시지 (type, dismissing) |
| `addItemModal` | number \| null | 항목 추가 모달 대상 챕터 ID |
| `settingSlot` | object \| null | 이수조건 설정 모달 대상 {chId, item} |
| `dragging` | object \| null | DnD 드래그 중 항목 {chId, itemId} |
| `dragOver` | object \| null | DnD 드롭 대상 {chId, itemId} |

### 슬롯 유형 (SLOT_TYPES)

| 유형 | 키 | 기본 이수조건 |
|------|-----|-------------|
| 영상 | video | watchRate: 90 |
| 시험 | exam | passScore: 60, totalQ: 20 |
| 설문 | survey | {} (고정) |
| 아티클 | article | {} (고정) |

---

## 4. 컴포넌트 목록

| 컴포넌트 | 역할 |
|----------|------|
| `Toggle` | 공통 토글 스위치 (active, onClick) |
| `AddItemModal` | 항목 추가 4단계 모달 (type→source→library/upload) |
| `SlotSettingModal` | 이수조건 설정 모달 (영상/시험은 편집, 설문/아티클은 고정) |
| `App` | 최상위, 전체 State 관리 + 렌더 |

---

## 5. 핵심 함수 설계

| 함수 | 역할 |
|------|------|
| `updInfo(k, v)` | courseInfo 단일 필드 업데이트 |
| `updPeriod(k, v)` | studyPeriod 단일 필드 업데이트 |
| `addChapter()` | 새 챕터 추가 |
| `removeChapter(chId)` | 챕터 삭제 |
| `updateChapterTitle(chId, title)` | 챕터 제목 인라인 편집 |
| `addItem(chId, type, title, libItem)` | 챕터에 항목 추가 |
| `removeItem(chId, itemId)` | 항목 삭제 |
| `updateItem(chId, itemId, changes)` | 항목 속성 업데이트 (title, isRequired 등) |
| `updateItemCond(chId, itemId, cond)` | 항목 이수조건 업데이트 |
| `onItemDragStart/DragOver/Drop/DragEnd` | 챕터 간 항목 드래그앤드롭 |
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
// 커리큘럼 챕터 구조
chapters = [
  {
    id: number,
    title: string,
    items: [
      {
        id: number,
        type: 'video' | 'exam' | 'survey' | 'article',
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

type: [영상][시험][설문][아티클] 선택
source: [라이브러리에서] [직접 업로드] + [빈 항목으로 추가 (빠른 추가)]
library: 검색 + 목록 → 선택 → [가져오기]
upload: 드래그&드롭 영역 + 클릭 업로드
```

### SlotSettingModal
- 영상: 시청률 슬라이더 (50~100%, step 5)
- 시험: 합격점수 number input + 총 문항수 number input
- 설문/아티클: 고정 텍스트 표시 (편집 불가)

---

## 10. 테스트 시나리오

| 시나리오 | 검증 항목 |
|----------|-----------|
| 코스명 미입력 퍼블리싱 시도 | 체크리스트 빨간 표시, 버튼 disabled |
| 챕터 추가 → 항목 추가 → 필수 설정 | 퀵스탯 바 수치 갱신 |
| 라이브러리에서 항목 추가 | 선택 후 [가져오기] → 챕터에 항목 추가 |
| DnD 순서 변경 | 챕터 간 항목 이동 |
| 수강 기간 유형 전환 | 고정기간 → 날짜 입력 노출, 신청후N일 → 숫자 입력 |
| 임시저장 → 퍼블리싱 | draft → saved → published 상태 전환 |
| 이수조건 설정 (영상/시험) | SlotSettingModal 저장 → condText 갱신 |
