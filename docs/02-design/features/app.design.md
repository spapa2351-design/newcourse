---
feature: app
phase: design
status: approved
created: 2026-04-30
architecture: B — Responsive 확장 (기존 오프라인 앱 + 데스크톱 레이아웃)
stack: 바닐라 JS + Tailwind CDN + Pretendard (기존 스택 유지)
---

# 온라인/오프라인 통합 user 앱 — Design Document

---

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | 오프라인 앱(모바일 390px) 7개 화면에 온라인 웹(데스크톱) 레이아웃을 추가 — 하나의 HTML 파일이 모바일·데스크톱 모두 담당 |
| **WHO** | 수강생(학습자) — 모바일: 오프라인 코스 위주, 데스크톱: 온라인 코스 + 카테고리 탐색 |
| **RISK** | 기존 390px 모바일 스타일 regression. 미디어쿼리 충돌. 하단 탭바 ↔ 사이드바 전환 중 레이아웃 깨짐 |
| **SUCCESS** | 768px 이상에서 사이드바+헤더 레이아웃 정상 렌더링. 모바일(390px) 기존 동작 100% 유지 |
| **SCOPE** | 기존 7개 HTML 파일에 @media 블록 추가만. 신규 파일 없음. JS 로직 변경 최소 |

---

## 1. 아키텍처 결정: Option B — Responsive 확장

### 선택 이유
- 기존 `user/` 7개 파일을 그대로 활용 → 재작업 없음
- `user/web/` 4개 파일(카테고리, 상세, MY)은 참조 레퍼런스로만 사용
- 하나의 파일 = 모바일 + 데스크톱 → 중복 유지 비용 제로

### 핵심 패턴

```css
/* 기존 모바일 스타일 (390px, 변경 없음) */
.app { max-width: 390px; margin: 0 auto; ... }
.tab-bar { display: flex; }
.sidebar { display: none; }
.topbar { display: none; }

/* 데스크톱 추가 (@media min-width: 768px) */
@media (min-width: 768px) {
  body { background: #f2f5f9; display: flex; align-items: stretch; }
  .app { max-width: 100%; width: 100%; height: 100vh; display: flex; flex-direction: column; border-radius: 0; box-shadow: none; }
  .tab-bar { display: none !important; }
  .sidebar { display: flex; }
  .topbar { display: flex; }
  .main-content { margin-left: 160px; padding-top: 56px; }
}
```

---

## 2. 오프라인 앱 ↔ 온라인 웹 대조 분석

### 2.1 전체 화면 매핑

| 오프라인 앱 (`user/`) | 온라인 웹 (`user/web/`) | 대응 방식 |
|----------------------|----------------------|---------|
| `home.html` | — | 홈에 데스크톱 대시보드 레이아웃 추가 |
| `category.html` | `카테고리.html` | 동일 콘텐츠. 데스크톱: 5컬럼 그리드 |
| `course-list.html` | `카테고리-상세.html` | 동일 콘텐츠. 데스크톱: 좌측 분류 패널 + 4컬럼 카드 |
| `course-detail.html` | `코스-상세.html` | 동일 콘텐츠. 데스크톱: 2컬럼(썸네일+정보) |
| `course-enrolled.html` | — | 수강중 상세. 데스크톱: 2컬럼(카드+출석목록) |
| `course-completed.html` | — | 수료 상세. 데스크톱: 2컬럼(결과+통계) |
| `my.html` | `MY.html` | 동일 콘텐츠. 데스크톱: 탭바+필터사이드+5컬럼 |

### 2.2 디자인 토큰 대조

| 항목 | 오프라인 앱 | 온라인 웹 (현재) | 통합 후 (Option B) |
|------|-----------|----------------|------------------|
| Primary | `#5569ff` | `#1a74f0` | **`#5569ff`** (기존 유지) |
| 폰트 | Pretendard | Noto Sans KR | **Pretendard** (기존 유지) |
| Body BG | `#f2f5f9` | `#f2f5f9` | `#f2f5f9` (동일) |
| 카드 BG | `#ffffff` | `#ffffff` | `#ffffff` (동일) |
| 최대폭 | 390px (모바일) | 100% (데스크톱) | 390px ↔ 100% (반응형) |
| 네비 | 하단 탭바 | 좌측 사이드바 160px | 탭바(모바일) ↔ 사이드바(데스크톱) |
| 헤더 | 인라인 아바타+이름 | 상단 고정 서치바 | 모바일 인라인 ↔ 데스크톱 topbar |

### 2.3 컴포넌트 갭 분석

| 컴포넌트 | 오프라인 앱 | 온라인 웹 | 갭 |
|----------|-----------|---------|-----|
| 사이드바 | 없음 | 160px 좌측 고정 | **추가 필요** |
| 탑바 (검색+아이콘) | 없음 | 56px 상단 고정 | **추가 필요** |
| 카테고리 그리드 | 2컬럼 모바일 | 5컬럼 데스크톱 | 미디어쿼리로 전환 |
| 코스 카드 그리드 | 2컬럼 세로 | 4-5컬럼 가로 | 미디어쿼리로 전환 |
| 분류 사이드패널 | 없음 (탭 필터) | 200px 좌측 패널 | **추가 필요** |
| 바텀시트 | 존재 | 없음 (인라인 섹션) | 데스크톱에서 숨김 |
| QR 버튼 | 존재 | 없음 | 데스크톱에서 숨김 |

---

## 3. 파일별 데스크톱 레이아웃 명세

### 공통 인젝션 블록 (7개 파일 모두 동일 삽입)

모든 HTML 파일의 `<body>` 직후, `.app` div 이전에 추가:

```html
<!-- DESKTOP SIDEBAR (display:none on mobile, flex on ≥768px) -->
<aside class="dt-sidebar">
  <div class="dt-logo">
    <span class="logo-dot" style="background:#5569ff"></span>
    <span class="logo-dot" style="background:#f59e0b"></span>
    <span class="logo-dot" style="background:#22c55e"></span>
    <span class="dt-logo-text">TOUCHCLASS</span>
  </div>
  <div class="dt-user">
    <div class="dt-avatar"></div>
    <div class="dt-name">조찬현</div>
    <div class="dt-status">너무 더워너무 더워</div>
  </div>
  <nav class="dt-nav">
    <a href="home.html" class="dt-nav-item" data-page="home">홈</a>
    <a href="category.html" class="dt-nav-item" data-page="category">카테고리</a>
    <a href="course-list.html" class="dt-nav-item" data-page="course-list">코스 목록</a>
    <a href="my.html" class="dt-nav-item" data-page="my">MY</a>
  </nav>
  <button class="dt-logout">로그아웃</button>
</aside>

<!-- DESKTOP TOPBAR -->
<header class="dt-topbar">
  <div class="dt-search">
    <input type="text" placeholder="어떤 코스를 찾으세요?">
  </div>
  <div class="dt-topbar-right">
    <button class="dt-icon-btn">🔔</button>
    <button class="dt-icon-btn">💬</button>
    <div class="dt-top-avatar"></div>
  </div>
</header>
```

공통 CSS (@media 블록, 각 파일 `<style>` 최하단에 추가):

```css
/* ── DESKTOP LAYOUT (≥768px) ─────────────────── */
.dt-sidebar, .dt-topbar { display: none; }

@media (min-width: 768px) {
  body {
    background: #f2f5f9;
    display: block;
    padding: 0;
    align-items: unset;
    justify-content: unset;
    min-height: 100vh;
  }
  /* 기존 .app 모바일 박스 해제 */
  .app {
    max-width: 100%; width: 100%;
    margin-left: 160px;
    border-radius: 0;
    box-shadow: none;
    min-height: 100vh;
    padding-top: 56px;
    overflow-y: auto;
  }
  /* 모바일 전용 요소 숨김 */
  .tab-bar { display: none !important; }
  /* 모바일 헤더 숨김 (파일별로 클래스 지정) */
  .home-header, .top-header { display: none !important; }

  /* 사이드바 */
  .dt-sidebar {
    display: flex; flex-direction: column;
    position: fixed; left: 0; top: 0; bottom: 0;
    width: 160px; background: #fff;
    border-right: 1px solid #e8eaed; z-index: 100;
    padding: 0;
  }
  .dt-logo {
    padding: 16px 14px 10px;
    display: flex; align-items: center; gap: 3px;
  }
  .logo-dot { width: 8px; height: 8px; border-radius: 50%; }
  .dt-logo-text {
    font-size: 10px; font-weight: 800; letter-spacing: 0.5px;
    color: #223354; margin-left: 4px;
  }
  .dt-user {
    display: flex; flex-direction: column; align-items: center;
    padding: 8px 14px 14px; border-bottom: 1px solid #f0f2f5;
  }
  .dt-avatar {
    width: 52px; height: 52px; border-radius: 50%;
    background: linear-gradient(135deg, #5569ff, #7B8BFF);
    margin-bottom: 8px;
  }
  .dt-name { font-size: 13px; font-weight: 700; color: #223354; }
  .dt-status { font-size: 11px; color: #9ca3af; margin-top: 2px; text-align: center; }
  .dt-nav { flex: 1; padding: 8px 0; overflow-y: auto; }
  .dt-nav-item {
    display: flex; align-items: center; padding: 9px 16px;
    font-size: 13px; color: #555; text-decoration: none;
    transition: background 0.15s;
  }
  .dt-nav-item:hover, .dt-nav-item.active {
    background: #f0f4ff; color: #5569ff; font-weight: 600;
  }
  .dt-logout {
    margin: 12px 14px; padding: 8px;
    border: 1px solid #e0e2e5; border-radius: 6px;
    background: #fff; font-size: 12px; color: #555; cursor: pointer;
  }

  /* 탑바 */
  .dt-topbar {
    display: flex; align-items: center; gap: 16px;
    position: fixed; top: 0; left: 160px; right: 0; height: 56px;
    background: #fff; border-bottom: 1px solid #e8eaed;
    padding: 0 24px; z-index: 50;
  }
  .dt-search { flex: 1; max-width: 480px; margin: 0 auto; position: relative; }
  .dt-search input {
    width: 100%; padding: 8px 16px; border: 1px solid #e0e2e5;
    border-radius: 20px; background: #f5f7fa; font-size: 13px; outline: none;
    font-family: 'Pretendard', sans-serif;
  }
  .dt-topbar-right { display: flex; align-items: center; gap: 10px; margin-left: auto; }
  .dt-icon-btn {
    width: 32px; height: 32px; border: none; background: none;
    cursor: pointer; border-radius: 50%; font-size: 16px;
  }
  .dt-icon-btn:hover { background: #f5f7fa; }
  .dt-top-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    background: linear-gradient(135deg, #5569ff, #7B8BFF); cursor: pointer;
  }
}
```

---

### 3.1 home.html 데스크톱 레이아웃

```css
@media (min-width: 768px) {
  /* 콘텐츠 영역 */
  .recent-section, .offline-section { padding: 20px 32px; }
  /* 코스 카드 가로 스크롤 → 4컬럼 그리드로 전환 */
  .scroll-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; overflow-x: visible; }
  /* Netflix 세로 카드 → 가로 카드로 */
  .netflix-card { aspect-ratio: 3/2; }
}
```

---

### 3.2 category.html 데스크톱 레이아웃

```css
@media (min-width: 768px) {
  .category-grid { grid-template-columns: repeat(5, 1fr); gap: 8px; }
  /* 모바일 2컬럼 → 데스크톱 5컬럼 */
}
```

**온라인 웹 `카테고리.html` 대비 갭**:
- 기존: 2컬럼 모바일 그리드
- 추가: 5컬럼 데스크톱 그리드
- `카테고리.html` 버튼 스타일(border + 화살표 아이콘) 차용 가능

---

### 3.3 course-list.html 데스크톱 레이아웃

```css
@media (min-width: 768px) {
  /* 2컬럼 레이아웃: 분류 패널 + 코스 그리드 */
  .list-layout { display: grid; grid-template-columns: 200px 1fr; gap: 0; }
  .filter-panel { display: block; background: #fff; border-right: 1px solid #e8eaed; padding: 16px; }
  .course-grid { grid-template-columns: repeat(4, 1fr); }
  /* 모바일 탭 필터 숨김 */
  .subcategory-tabs { display: none; }
}
```

**온라인 웹 `카테고리-상세.html` 대비 추가 요소**:
- 분류 트리 사이드패널 (200px) 추가
- 필수 코스만 보기 토글 + 추천순 드롭다운 + 그리드/리스트 토글 추가

```html
<!-- course-list.html 데스크톱 컨트롤 (추가) -->
<div class="dt-controls">
  <span class="count-label">총 <span id="dt-count">12</span></span>
  <div class="dt-controls-right">
    <label class="dt-toggle-label">
      필수 코스만 보기
      <div class="dt-toggle" id="required-toggle"></div>
    </label>
    <select class="dt-sort">
      <option>추천순</option><option>최신순</option><option>이름순</option>
    </select>
    <div class="dt-view-switch">
      <button class="dt-view-btn active" id="view-grid">⊞</button>
      <button class="dt-view-btn" id="view-list">☰</button>
    </div>
  </div>
</div>
```

---

### 3.4 course-detail.html 데스크톱 레이아웃

```css
@media (min-width: 768px) {
  /* 2컬럼 레이아웃: 썸네일 + 정보 */
  .detail-layout { display: grid; grid-template-columns: 280px 1fr; gap: 32px; padding: 32px; }
  /* 바텀시트 → 인라인 섹션으로 변환 */
  .bottom-sheet { position: static !important; transform: none !important; height: auto; border-radius: 10px; margin-top: 16px; }
  .sheet-overlay { display: none !important; }
  /* 수강신청 버튼 영역 */
  .enroll-action { display: flex; gap: 12px; margin-top: 16px; }
  .btn-enroll { flex: 1; height: 44px; background: #223354; color: #fff; border-radius: 8px; }
}
```

**온라인 웹 `코스-상세.html` 대비 갭**:
- floating toast "수강 신청하면 바로 학습 시작! 🎯" → 추가
- 커리큘럼 + 필수 조건 하단 2컬럼 섹션 → 추가
- 신청기간/학습기간 메타 정보 박스 → 오프라인 앱 스타일 유지

---

### 3.5 course-enrolled.html 데스크톱 레이아웃

```css
@media (min-width: 768px) {
  /* 2컬럼: 카드(출석률) + 회차 목록 */
  .enrolled-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; padding: 32px; }
  /* 기존 파란 그라데이션 카드 유지 */
  .enrolled-card { border-radius: 16px; }
}
```

---

### 3.6 course-completed.html 데스크톱 레이아웃

```css
@media (min-width: 768px) {
  /* 2컬럼: 결과 배지 + 통계 그리드 */
  .completed-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; padding: 32px; }
}
```

---

### 3.7 my.html 데스크톱 레이아웃

```css
@media (min-width: 768px) {
  /* MY 탭바 (코스/PLUS코스/찜한코스/수료중/서명) */
  .my-tabs { border-bottom: 2px solid #e8eaed; display: flex; }
  .my-tab { padding: 10px 18px; cursor: pointer; }
  .my-tab.active { border-bottom: 2px solid #5569ff; color: #5569ff; font-weight: 700; }
  /* 분류 사이드 + 코스 그리드 */
  .my-layout { display: grid; grid-template-columns: 200px 1fr; }
  .my-filter-panel { background: #fff; border-right: 1px solid #e8eaed; padding: 16px; }
  /* 5컬럼 코스 그리드 */
  .my-course-grid { grid-template-columns: repeat(5, 1fr) !important; }
  /* 상태 필터 (수강중/수강예정/수강종료) */
  .status-chips { display: flex; gap: 8px; margin-bottom: 14px; }
  .status-chip { padding: 6px 14px; border: 1px solid #e0e2e5; border-radius: 20px; font-size: 13px; }
  .status-chip.active { background: #223354; color: #fff; border-color: #223354; }
}
```

**온라인 웹 `MY.html` 대비 갭**:
- 탭: 코스 / PLUS 코스 / 찜한 코스 / 수료중 / 서명 → 추가
- 분류 패널 트리 내용 → offline-user-app 데이터 재활용
- 5컬럼 그리드 → 기존 2컬럼에 @media 추가

---

## 4. 상태 전이 (오프라인 앱 유지)

오프라인 앱의 `OFFLINE_CONFIG` 및 `proto-bar` 시뮬레이션은 데스크톱에서도 **그대로 동작**. 변경 없음.

| 기능 | 모바일 | 데스크톱 |
|------|--------|---------|
| proto-bar 시뮬레이터 | 화면 상단 | 화면 상단 (동일) |
| 수강신청 바텀시트 | 하단에서 슬라이딩 | `position: static` 인라인 |
| QR 스캔 버튼 | 히어로 카드에 표시 | `display: none` (데스크톱 숨김) |
| 지도 버튼 | 히어로 카드에 표시 | `display: none` (데스크톱 숨김) |
| BroadcastChannel LIVE | 동작 | 동작 (동일) |

---

## 5. 디자인 토큰 통합

```css
/* 기존 오프라인 앱 :root 유지, 데스크톱 전용 변수 추가 */
:root {
  /* 기존 (변경 없음) */
  --primary: #5569ff;
  --primary-dark: #3a4fd4;
  --body-bg: #f2f5f9;
  --black: #223354;
  --font-family: 'Pretendard', sans-serif;
  --r: 10px; --r-lg: 16px;

  /* 데스크톱 전용 추가 */
  --dt-sidebar-width: 160px;
  --dt-topbar-height: 56px;
  --dt-filter-panel-width: 200px;
  --dt-border: #e8eaed;
  --dt-content-padding: 32px;
}
```

---

## 6. 구현 가이드

### 11.1 파일별 작업 우선순위

```
P0: 공통 사이드바/탑바 블록 (7개 파일 공통 삽입)
P1: category.html   — 5컬럼 그리드 (가장 단순)
P1: my.html         — 탭바 + 분류패널 + 5컬럼 (온라인 웹 MY.html 참조)
P2: course-list.html — 분류패널 + 4컬럼 (카테고리-상세.html 참조)
P2: course-detail.html — 2컬럼 레이아웃 + 바텀시트 인라인화
P3: home.html       — 4컬럼 카드 그리드
P3: course-enrolled.html — 2컬럼 레이아웃
P3: course-completed.html — 2컬럼 레이아웃
```

### 11.2 Regression 방지 규칙

1. `@media (min-width: 768px)` 블록은 반드시 `<style>` 태그 **최하단**에 배치
2. 데스크톱 오버라이드는 `.app` 내부 요소에만 적용 (전역 요소 건드리지 않음)
3. `!important`는 `.tab-bar`, `.home-header` 숨김에만 사용
4. 기존 JS 함수 수정 없음 — CSS만으로 레이아웃 변경

### 11.3 Session Guide

| 모듈 | 대상 파일 | 예상 시간 | 참조 |
|------|----------|---------|------|
| M1 | 공통 사이드바/탑바 CSS 블록 | 30분 | 위 §공통 인젝션 블록 |
| M2 | `category.html` | 20분 | `user/web/카테고리.html` 참조 |
| M3 | `my.html` | 45분 | `user/web/MY.html` 참조 |
| M4 | `course-list.html` | 40분 | `user/web/카테고리-상세.html` 참조 |
| M5 | `course-detail.html` | 50분 | `user/web/코스-상세.html` 참조 |
| M6 | `home.html` | 30분 | — |
| M7 | `enrolled` + `completed` | 40분 | — |

**추천 세션 분할**:
- Session 1: M1 공통 블록 + M2 + M3 (가시적 성과)
- Session 2: M4 + M5 (핵심 화면)
- Session 3: M6 + M7 (나머지)

---

## 7. 참조 파일 인덱스

| 역할 | 경로 |
|------|------|
| 오프라인 앱 소스 (7개) | `J:\claude\newcourse\user\*.html` |
| 온라인 웹 레퍼런스 (4개) | `J:\claude\newcourse\user\web\카테고리.html` 외 3개 |
| 오프라인 앱 공식 설계 | `docs/02-design/features/offline-user-app.design.md` |
| 온라인 빌더 설계 | `docs/02-design/features/online-builder.design.md` |
| 공통 CSS 토큰 | `J:\claude\newcourse\user\web\_files\style.css` |
