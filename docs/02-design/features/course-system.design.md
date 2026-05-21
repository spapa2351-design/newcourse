---
feature: course-system
phase: design
status: current
created: 2026-05-20
architecture: v1·v2 영구 공존 — 사이드바 코스(legacy) 그룹 직후 코스v2 그룹 분리
---

# 코스 시스템 — Design Document

## Context Anchor

| 항목 | 내용 |
|---|---|
| **WHY** | v1·v2 본질이 다른 시스템. 사이드바·라벨·데이터에서 혼동되면 운영자 부담. |
| **WHO** | HRD 담당자, 코스 운영자, 콘텐츠 관리자, 학습자 |
| **RISK** | UI 라벨 동일("온라인 코스")이라 위치 시그널 약화 가능 / 운영자 선택 가이드 부재 / 학습자 진도율 표시 불일치 |
| **SUCCESS** | 사이드바에서 코스(legacy) ↔ 코스v2 그룹이 구분선으로 분명히 분리. "+ 코스 만들기" CTA로 v2 진입 명확. 학습자 카드는 통일 % 표시. |
| **SCOPE** | 사이드바 구조 / 코스 만들기 모달 / 라벨 매핑 / 학습자 추상화 layer |

---

## 1. 사이드바 구조

### 1.1 트리

```
회원
코스 (그룹)             ← v1 (legacy)
  ├ 코스
  └ PLUS 코스

─── 구분선 ───

코스v2 [N]              ← v2 그룹 (NEW_MENUS)
  ├ + 코스 만들기       ← CTA, 모달
  ├ 온라인 코스         ← v2 CONTENT
  └ 오프라인 코스       ← v2 OFFLINE

콘텐츠 / T튜브 / AI 퀴메이커 / Translation / 문제 은행 …
콘텐츠 라이브러리
```

### 1.2 데이터 구조 (SIDEBAR_MENUS + NEW_MENUS)

```js
// 레거시 — 기존 As-Is. 오프라인/온라인 코스는 SIDEBAR에서 제거되어 NEW_MENUS의 코스v2 children으로 이동
const SIDEBAR_MENUS = [
  { id: 'member', label: '회원', icon: Users, hasChildren: true },
  { id: 'course', label: '코스', icon: BookOpen, hasChildren: true, children: [
    { id: 'course-main', label: '코스' },
    { id: 'course-plus', label: 'PLUS 코스' },
  ]},
  { id: 'content', label: '콘텐츠', icon: Copy, hasChildren: true },
  // ... T튜브, AI 퀴메이커, Translation, 문제 은행, 의견, 게이미피케이션, 라이브, 터치투게더, 출석, AI 챗봇, 통계, 공지, 팝업
];

// v2 그룹 — 코스(legacy) 그룹 바로 아래에 렌더
const NEW_MENUS = [
  { id: 'course-v2', label: '코스v2', icon: BarChart2, isHighlight: true, badge: 'N', hasChildren: true, children: [
    { id: 'online-course',  label: '온라인 코스',  icon: Monitor, href: 'online-list.html',  tooltip: '영상 중심, 진도율 정확히 추적.' },
    { id: 'offline-course', label: '오프라인 코스', icon: MapPin,  href: 'offline-list.html', tooltip: '오프라인 일정·출석 기반 코스.' },
  ]},
];
```

### 1.3 렌더 규칙

- 사이드바를 SIDEBAR_MENUS.map으로 그리다가 `menu.id === 'course'`에 도달하면 그 직후에 **구분선 + NEW_MENUS 그룹** 삽입
- 코스v2 그룹은 펼침 디폴트 (`sideExpanded.has('course-v2')`)
- children 최상단에 "+ 코스 만들기" 버튼 (모달 트리거)
- active 자식은 emerald-50 배경 + emerald-700 글자
- 블렌디드 코스 children: 사이드바·모달 양쪽에서 숨김 (Phase 2)

### 1.4 시각 톤

| 영역 | 톤 |
|---|---|
| 코스 그룹 (legacy) | slate (기본) |
| 코스v2 그룹 헤더 | emerald-50/60 배경 + emerald-600 아이콘 + 빨간 N 배지 |
| 코스v2 active 자식 | emerald-50 배경 + emerald-700 글자 |
| "+ 코스 만들기" CTA | hover emerald-50, Plus 아이콘 emerald-600 |

---

## 2. 코스 만들기 모달

```
[코스 만들기] CTA 클릭
   ↓
유형 선택 모달
  ┌──────────────────────┐
  │ 어떤 코스를 만드시겠어요?     │
  │                              │
  │  📺 온라인 코스               │
  │     영상·시험·설문 중심       │
  │                              │
  │  📍 오프라인 코스             │
  │     집합·출석·일정 중심       │
  └──────────────────────┘
   ↓ (선택)
해당 빌더 진입 (online-builder.html 또는 offline-builder.html)
```

블렌디드 코스는 Phase 2 — 모달에서도 숨김.

---

## 3. 라벨 매핑

| 코드 상수 | UI 라벨 | 위치 | 비고 |
|---|---|---|---|
| `CONTENT` | 온라인 코스 | 코스v2 children | v1 "온라인 코스"와 동일 라벨, 위치로 구분 |
| `OFFLINE` | 오프라인 코스 | 코스v2 children | v1엔 오프라인 코스 없음 |
| `BLENDED` | 블렌디드 코스 | 사이드바 미노출 (Phase 2) | 모달도 숨김 |

코드 상수는 영어 유지, UI 라벨만 한국어 매핑. v1의 "온라인 코스" 메뉴는 SIDEBAR_MENUS에서 제거됨(중복 회피).

---

## 4. 학습자 추상화 layer

### 4.1 진도율 통일

```js
function getProgress(course) {
  if (course.source === 'v1') return v1PageProgress(course);
  if (course.type === 'CONTENT') return assetProgress(course);
  if (course.type === 'OFFLINE') return attendanceProgress(course);
  if (course.type === 'BLENDED') return blendedProgress(course);
}
```

### 4.2 다음 행동 통일

```js
function getNextAction(course) {
  // '영상 보기' / '출석하기' / '시험 응시' / '문서 열람' 등
}
```

학습자 카드·MY 화면에서 패러다임 차이 노출 X. 진입 후 화면은 패러다임별로 다를 수 있음.

---

## 5. 운영자 선택 가이드

| 상황 | 추천 |
|---|---|
| "페이지 안에 영상·PDF·텍스트 자유 구성" | 코스 그룹 → 코스 (v1) |
| "의무 교육·법정 교육, 진도율 100% 정확, 영상 위주" | 코스v2 → 온라인 코스 |
| "오프라인 일정·출석·강의실 관리" | 코스v2 → 오프라인 코스 |
| "온·오프 혼합" | 블렌디드 코스 (Phase 2) |

구현 위치:
- 코스v2 children hover tooltip
- "+ 코스 만들기" 모달 안 유형별 설명

---

## 6. 데이터 모델

```
Course {
  id, title, coverImage,
  source: 'v1' | 'v2',                     // 패러다임 구분 (학습자 노출 X)
  type: 'CONTENT' | 'OFFLINE' | 'BLENDED', // v2일 때만 (v1은 'PAGE')
  classification: 'normal' | 'mandatory',
  category, status,
  enrollMode: 'admin' | 'self' | 'auto',
  studyPeriod: { type, start?, end?, days? },
  applyPeriod: { start?, end? },
  enrolledCount, createdAt, createdBy,
}
```

---

## 7. admin 파일 매핑

| 역할 | 파일 |
|---|---|
| 온라인 코스 빌더 (CONTENT) | `admin/online-builder.html` |
| 온라인 코스 목록 | `admin/online-list.html` |
| 온라인 코스 수강관리 | `admin/online-view.html` |
| 오프라인 코스 목록 | `admin/offline-list.html` |
| 오프라인 코스 빌더 | `admin/offline-builder.html` |
| 오프라인 코스 수강관리 | `admin/offline-view.html` |
| 블렌디드 빌더 (Phase 2) | `admin/blended-builder.html` |
| 콘텐츠 라이브러리 | `admin/content-library.html` |

---

## 8. 컴포넌트 (학습자 앱)

| 컴포넌트 | 역할 |
|---|---|
| `CourseCardOnline` | 영상 진도율·재생 아이콘 |
| `CourseCardOffline` | 다음 출석일·장소·기수 |
| `CourseCardBlended` | 둘 다 마커 |
| `CourseCardPlus` | PLUS 워터마크 + 진도율 |
| `progressAbstraction` | 진도율 통일 layer |
| `nextActionAbstraction` | 다음 행동 통일 layer |

---

## 9. 관련 문서

- Plan: `docs/01-plan/features/course-system.plan.md`
- 종합 스펙: `docs/newcourse-spec-v2.html`
- 차터·정책: 메모리 `project-newcourse-charter` · `project-newcourse-course-system-architecture`
