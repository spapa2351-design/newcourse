---
feature: offline-user-app
phase: design
status: approved
created: 2026-04-28
architecture: C — 인라인 공유 패턴 (Pragmatic)
---

# 오프라인 LMS 학습자 앱 — Design Document

---

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | 관리자단 Phase1 완성. 학습자 앱 프로토타입 7개 화면의 공식 명세화 + 갭 9개 수정 |
| **WHO** | 학습자(수강생) — 코스 조회·신청·QR 출석·수료 확인 |
| **RISK** | 화면 간 암묵적 상태 전이 누락, QR 문구 현장 혼란, 기존 파일 수정 시 regression |
| **SUCCESS** | 7개 화면 상태 분기 완전 명세, GAP-U01~U05 P0 수정 완료, 관리자단 연동 포인트 반영 |
| **SCOPE** | Phase1: 7개 기존 HTML 파일 수정만. 신규 JS 파일 없음. 알림/지도/PDF는 Phase2 |

---

## 1. 아키텍처 결정: Option C — 인라인 공유 패턴

### 선택 이유
- 빌드 도구 없음 (CDN 직접 실행 환경)
- 기존 proto-sidebar 패턴과 일관성 유지
- 새 파일 추가 없이 갭만 수정 → regression 최소화

### 핵심 패턴: `OFFLINE_CONFIG` 블록

각 HTML 파일 `<script>` 최상단에 동일 구조의 설정 블록 삽입:

```javascript
const OFFLINE_CONFIG = {
  // 라우팅 규칙 (course-detail, my.html에서 참조)
  routing: {
    getDetailScreen: (enrollStatus, courseStatus) => { /* §4 규칙 반환 */ },
    getMyCardTarget: (courseStatus) => { /* enrolled or completed */ }
  },
  // QR 결과 5종 (my.html에서만 사용)
  qrMessages: {
    'qr-success': { icon: '✓', color: '#22C55E', title: '출석 완료!', sub: '오늘도 화이팅이에요', autoDismiss: 3000 },
    'qr-late':    { icon: '⏰', color: '#F97316', title: '지각 처리됐어요', sub: '다음엔 일찍 와요!', autoDismiss: 3000 },
    'qr-expired': { icon: '✗', color: '#6B7280', title: '체크인 시간이 지났어요', sub: '강사에게 문의해주세요', autoDismiss: null },
    'qr-notarget':{ icon: '⚠', color: '#6B7280', title: '수강 대상이 아니에요', sub: '현재 회차 수강생이 아닙니다', autoDismiss: null },
    'qr-notyet':  { icon: '🕐', color: '#5569FF', title: '아직 시작 전이에요', sub: '수업 시작 후 다시 스캔해주세요', autoDismiss: null }
  },
  // 졸업 기준
  graduationThreshold: 0.75,
  // 수강신청 모드
  enrollModes: ['single', 'multi', 'assigned', 'sessionSelect']
};
```

---

## 2. 화면별 컴포넌트 구조

### 2.1 home.html

| 영역 | 컴포넌트 | 상태 |
|------|----------|------|
| 헤더 | 아바타 + 이름 + 역할 | 정적 |
| 최근 수강 섹션 | 가로 스크롤 카드 (온라인+오프라인 혼합) | 정적 mockData |
| 오프라인 코스 섹션 | Netflix형 카드 (커버이미지 + 그라데이션 + 뱃지 + 출석 바) | 정적 mockData |
| 하단 탭바 | 홈/카테고리/숏클/더보기/MY | 링크 |

**카드 상태 뱃지 규칙**:

| 코스 상태 | 뱃지 텍스트 | 뱃지 색상 |
|-----------|-----------|---------|
| `enrollable` | 수강신청가능 | `#5569FF` |
| `not-started` | 시작전 | `#6B7280` |
| `in-progress` | 수강중 | `#22C55E` |
| `scheduled` | 수강예정 | `#F97316` |
| `ended` | 수강종료 | `#6B7280` |
| `completed` | 수료완료 | `#8B5CF6` |

**카드 탭 라우팅** (신규 명세):
```javascript
function handleOfflineCourseCardClick(course, userEnrollStatus) {
  if (userEnrollStatus === 'enrolled' && ['not-started', 'in-progress'].includes(course.status)) {
    location.href = 'course-enrolled.html?id=' + course.id;
  } else if (userEnrollStatus === 'enrolled' && ['ended', 'completed'].includes(course.status)) {
    location.href = 'course-completed.html?id=' + course.id;
  } else {
    location.href = 'course-detail.html?id=' + course.id;
  }
}
```

---

### 2.2 category.html

| 영역 | 컴포넌트 | 비고 |
|------|----------|------|
| 검색바 | 텍스트 입력 | 기존 구현 |
| 필터 탭 | 전체 / 온라인만 / 오프라인만 | `?filter=offline` 자동 적용 |
| 코스 그리드 | 2컬럼 카드 | 오프라인 = 인디고 강조 |

수정 없음. 현행 유지.

---

### 2.3 course-list.html

| 영역 | 컴포넌트 | 비고 |
|------|----------|------|
| 서브카테고리 탭 | 전체/프로젝트관리/데이터분석/커뮤니케이션/문제해결 | 기존 |
| 검색 + 필터 체크박스 | 수강신청가능 / 수강중 + 필수 토글 | 기존 |
| 3컬럼 그리드 | 코스 카드 + 상태 뱃지 | 기존 |

수정 없음. 현행 유지.

---

### 2.4 course-detail.html — 핵심 화면

#### 스크린 구조

```
course-detail.html
  ├── screen-detail   (코스 상세 정보)
  ├── screen-confirm  (신청 확인) ← GAP-U01 수정
  ├── screen-my       (신청 완료 후)
  └── screen-cancelled (취소 완료)
```

#### 수강신청 모드별 UI 분기

```javascript
function renderEnrollButton(enrollMode) {
  switch(enrollMode) {
    case 'single':
      // [수강신청] 버튼 → 바텀시트(차수 목록)
      break;
    case 'multi':
      // [수강신청] 버튼 → ucal 바텀시트(커리큘럼별)
      break;
    case 'assigned':
      // 버튼 없음. "관리자에 의해 배정된 코스입니다" 문구
      break;
    case 'sessionSelect':
      // [수강신청] 버튼 → 바텀시트(회차 목록) ← GAP-U07
      break;
  }
}
```

#### GAP-U01: 다중조합 선택 요약 카드 (screen-confirm)

**현재**: screen-confirm에 단순 텍스트 1줄
**변경**: 커리큘럼별 선택 차수를 카드 형태로 렌더링

```html
<!-- screen-confirm 내 추가할 요약 카드 -->
<div class="selected-summary-card">
  <p class="summary-label">선택하신 반</p>
  <div id="summary-list">
    <!-- renderSelectedSummary()로 동적 생성 -->
    <!-- [커리큘럼명] 기수 — 기간 (요일) -->
  </div>
</div>
```

```javascript
function renderSelectedSummary(selections) {
  return selections.map(sel => `
    <div class="summary-item">
      <span class="curriculum-badge">${sel.curriculumName}</span>
      <span>${sel.slotName} — ${sel.period} (${sel.dayOfWeek})</span>
    </div>
  `).join('');
}
```

#### GAP-U07: sessionSelect 회차 선택 바텀시트

```html
<!-- sessionSelect 전용 바텀시트 -->
<div id="sheet-session-select" class="bottom-sheet">
  <div class="sheet-header">
    <h3>회차 선택</h3>
    <p class="sheet-sub">원하는 날짜의 회차를 선택해주세요</p>
  </div>
  <div id="session-list">
    <!-- renderSessionList()로 생성 -->
    <!-- 날짜 / 시간 / 장소 / 잔여석 -->
  </div>
</div>
```

#### proto-bar 시뮬레이션 상태 (현행 유지)

| 시뮬레이션 | 파라미터 |
|-----------|---------|
| 수강신청 모드 | single / multi / assigned |
| 내 신청 상태 | none / enrolled / completed |
| 신청 기간 | open / before / closed |
| 변경/취소 기한 | inDeadline / changeExpired / allExpired |

---

### 2.5 course-enrolled.html — 수강중 상세

#### 컴포넌트 구조

```
course-enrolled.html
  ├── 수강 카드 (파란 그라데이션)
  │   ├── 수강중 뱃지
  │   ├── 코스명 / 반 / 강사
  │   ├── 출석률 바 + 75% 기준선 ← GAP-U02
  │   └── 다음 수업 D-Day
  ├── 회차별 출석 목록
  │   └── 상태 원형: 출석/지각/조퇴/결석/미확인/현재
  ├── 코스 정보 아코디언
  └── 액션 영역
      ├── 일정변경 버튼 (정책 기반 활성/비활성) ← GAP-U06
      └── 취소 버튼 (정책 기반 활성/비활성) ← GAP-U06
```

#### GAP-U02: 75% 졸업 기준선

**출석률 바** 위에 75% 위치에 기준선 + 라벨 추가:

```html
<div class="attendance-bar-wrapper">
  <div class="attendance-bar">
    <div class="bar-fill" style="width: {{rate}}%"></div>
    <!-- 75% 기준선 -->
    <div class="graduation-line" style="left: 75%">
      <span class="graduation-label">수료기준 75%</span>
    </div>
  </div>
  <span class="rate-text">{{rate}}%</span>
</div>
```

CSS:
```css
.graduation-line {
  position: absolute;
  top: 0; bottom: 0;
  width: 2px;
  background: rgba(255,255,255,0.7);
}
.graduation-label {
  position: absolute;
  top: -18px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  white-space: nowrap;
  color: rgba(255,255,255,0.8);
}
```

#### GAP-U06: 변경기한 경과 이유 문구

```javascript
function renderActionButtons(policy) {
  const changeBtn = document.getElementById('btn-change');
  const cancelBtn = document.getElementById('btn-cancel');
  const changeHint = document.getElementById('hint-change');
  const cancelHint = document.getElementById('hint-cancel');

  if (policy === 'changeExpired') {
    changeBtn.disabled = true;
    changeHint.textContent = '일정 변경 기한이 지났어요';
    changeHint.style.display = 'block';
  } else if (policy === 'allExpired') {
    changeBtn.disabled = true;
    cancelBtn.disabled = true;
    changeHint.textContent = '일정 변경 기한이 지났어요';
    cancelHint.textContent = '취소 기한이 지났어요';
    changeHint.style.display = 'block';
    cancelHint.style.display = 'block';
  }
}
```

---

### 2.6 course-completed.html — 수강완료 상세

#### GAP-U03: 졸업 기준선 + 수료 판정 이유

**수료 판정 배지 아래** 이유 문구 추가:

```html
<!-- 수료 완료 -->
<div class="result-badge pass">수료</div>
<p class="result-reason">출석률 {{rate}}% — 수료 기준(75%) 충족</p>

<!-- 미수료 -->
<div class="result-badge fail">미수료</div>
<p class="result-reason">출석률 {{rate}}% — 수료 기준(75%) 미달</p>
```

**통계 그리드**에 기준선 추가:
```
출석률   출석횟수   결석횟수
 83%       5회       1회
 ──────────────────────
 수료기준 75%
```

---

### 2.7 my.html — MY 오프라인 탭

#### 히어로 카드 상태 분기 로직

```javascript
function resolveHeroState(courses, today) {
  if (!courses || courses.length === 0) return 'empty';

  const todayCourse = courses.find(c => isToday(c.nextDate));
  if (todayCourse) {
    return window.__liveMode ? 'live' : 'today';
  }

  const nearestDays = getDaysUntil(courses[0].nextDate);
  if (nearestDays <= 7) {
    return courses.filter(c => isThisWeek(c.nextDate)).length >= 5
      ? 'busy' : 'near';
  }

  return 'far'; // D-7이상, 히어로 없음
}
```

#### 히어로 뷰 상태별 렌더링

| 상태 | 배경 | 주요 요소 |
|------|------|----------|
| `far` | 없음 | 일반 카드 목록만 |
| `near` | 파란 그라데이션 | D-Day 카운트다운 + 코스명 + QR 버튼 |
| `today` | 파란 그라데이션 | "오늘 수업" + 시간/장소 + QR 버튼 |
| `live` | 빨간 그라데이션 | LIVE 펄스 + 코스명 + QR 버튼 + 지도 버튼 |
| `busy` | 파란 그라데이션 | 메인 히어로 + 컴팩트 리스트 (최대 4개) |
| `empty` | 없음 | 빈 상태 일러스트 + "코스 탐색하기" CTA |

#### GAP-U04: QR 결과 문구 교체

**현재**: 하드코딩 문자열
**변경**: `OFFLINE_CONFIG.qrMessages`에서 읽기

```javascript
function showQrResult(type) {
  const cfg = OFFLINE_CONFIG.qrMessages[type];
  if (!cfg) return;

  document.getElementById('qr-icon').textContent = cfg.icon;
  document.getElementById('qr-modal').style.backgroundColor = cfg.color;
  document.getElementById('qr-title').textContent = cfg.title;
  document.getElementById('qr-sub').textContent = cfg.sub;

  openModal('modal-qr-result');

  if (cfg.autoDismiss) {
    setTimeout(() => closeModal('modal-qr-result'), cfg.autoDismiss);
  }
}
```

#### BroadcastChannel 수신 로직 (현행 유지 + 명세화)

```javascript
const bc = new BroadcastChannel('offline-demo');
bc.onmessage = (e) => {
  switch(e.data.type) {
    case 'LIVE_MODE_START':
      window.__liveMode = true;
      renderHero('live', currentCourse);
      break;
    case 'LIVE_MODE_END':
      window.__liveMode = false;
      renderHero(resolveHeroState(courses, new Date()), currentCourse);
      break;
    case 'SCENARIO_1':
      loadScenario(e.data.scenario);
      break;
  }
};
```

---

## 3. 라우팅 매트릭스 구현

### GAP-U05: href 점검 기준

7개 화면에서 오프라인 코스 카드 클릭 시 적용할 공통 라우팅 함수:

```javascript
function navigateToOfflineCourse(courseId, courseStatus, userEnrollStatus) {
  // 신청 완료 상태
  if (userEnrollStatus === 'enrolled') {
    if (['not-started', 'in-progress'].includes(courseStatus)) {
      return 'course-enrolled.html';
    }
    if (['ended', 'completed'].includes(courseStatus)) {
      return 'course-completed.html';
    }
  }
  // 미신청 또는 모든 기타 상태 → 상세 화면
  return 'course-detail.html';
}
```

**각 화면 href 교체 체크리스트**:

| 파일 | 수정 위치 | 현재 | 변경 후 |
|------|-----------|------|---------|
| `home.html` | 오프라인 코스 카드 onclick | 하드코딩 href | `navigateToOfflineCourse()` |
| `category.html` | 코스 카드 onclick | 하드코딩 href | `navigateToOfflineCourse()` |
| `course-list.html` | 코스 카드 onclick | 하드코딩 href | `navigateToOfflineCourse()` |
| `my.html` | 히어로 카드, 코스 카드 onclick | 하드코딩 href | `navigateToOfflineCourse()` |

---

## 4. 데이터 모델 (mockData 구조)

### 오프라인 코스 공통 필드

```javascript
const offlineCourse = {
  id: 'course-001',
  title: '프로젝트 관리 기초',
  coverImage: 'img/cover.jpg',
  instructor: '홍길동',
  status: 'in-progress',        // enrollable | not-started | in-progress | scheduled | ended | completed
  enrollMode: 'single',          // single | multi | assigned | sessionSelect
  enrollStatus: 'enrolled',      // none | enrolled
  location: '서울 강남구 역삼로 123',
  attendanceRate: 0.83,
  attendanceCount: 5,
  absentCount: 1,
  nextDate: '2026-05-07',
  nextTime: '10:00',
  totalSessions: 6,
  completedSessions: 5,
  isPassed: true,                // 수료 여부 (attendanceRate >= 0.75)
  // 변경/취소 정책
  policy: {
    changeDeadline: '2026-05-01',  // null이면 변경 불가
    cancelDeadline: '2026-05-03',  // null이면 취소 불가
    isAssigned: false
  },
  // 회차 목록
  sessions: [
    { sessionNo: 1, date: '2026-04-09', status: 'attended' },
    { sessionNo: 2, date: '2026-04-16', status: 'late' },
    { sessionNo: 3, date: '2026-04-23', status: 'absent' },
    { sessionNo: 4, date: '2026-04-30', status: 'pending' },
    { sessionNo: 5, date: '2026-05-07', status: 'current' },
    { sessionNo: 6, date: '2026-05-14', status: 'future' }
  ]
};
```

### 출석 상태 5종 + UI 매핑

| `status` 값 | 표시 | 원형 색상 |
|------------|------|----------|
| `attended` | 출석 | `#5569FF` (primary) |
| `late` | 지각 | `#F97316` (orange) |
| `early-leave` | 조퇴 | `#F97316` (orange) |
| `absent` | 결석 | `#EF4444` (red) |
| `pending` | 미확인 | `#D1D5DB` (gray) |
| `current` | 오늘 | `#5569FF` pulse 애니메이션 |
| `future` | 예정 | `#E5E7EB` (light gray) |

---

## 5. 디자인 토큰 (기존 시스템 유지)

```css
:root {
  --primary: #5569ff;
  --primary-dark: #3a4fd4;
  --success: #22C55E;
  --warning: #F97316;
  --danger: #EF4444;
  --gray-500: #6B7280;
  --font-family: 'Pretendard', sans-serif;
  --max-width: 390px;
}
```

---

## 6. 테스트 계획

### 6.1 라우팅 테스트 (GAP-U05 검증)

| 테스트 케이스 | 입력 | 기대 화면 |
|-------------|------|---------|
| 미신청 + enrollable | none + enrollable | course-detail (신청 화면) |
| 미신청 + in-progress | none + in-progress | course-detail (신청 불가) |
| 신청완료 + in-progress | enrolled + in-progress | course-enrolled |
| 신청완료 + ended | enrolled + ended | course-completed |
| 신청완료 + completed | enrolled + completed | course-completed (수료증 활성) |

### 6.2 QR 결과 테스트 (GAP-U04 검증)

| 타입 | 자동 닫힘 | 제목 확인 |
|------|----------|---------|
| qr-success | 3초 후 | "출석 완료!" |
| qr-late | 3초 후 | "지각 처리됐어요" |
| qr-expired | 수동 닫기 | "체크인 시간이 지났어요" |
| qr-notarget | 수동 닫기 | "수강 대상이 아니에요" |
| qr-notyet | 수동 닫기 | "아직 시작 전이에요" |

### 6.3 출석률 기준선 테스트 (GAP-U02, U03 검증)

| 출석률 | 기준선 위치 | 수료 판정 |
|--------|-----------|---------|
| 83% | 75% 위치에 기준선, 바 채워짐 | "수료" + "출석률 83% — 수료 기준(75%) 충족" |
| 50% | 75% 위치에 기준선, 바 부족 | "미수료" + "출석률 50% — 수료 기준(75%) 미달" |

### 6.4 라이브 모드 테스트 (BroadcastChannel)

1. 관리자단 `offline-attendance.html`에서 "라이브 시작" 버튼 클릭
2. `my.html`에서 히어로가 빨간 그라데이션 + LIVE 펄스로 전환되는지 확인
3. "라이브 종료" 클릭 시 일반 D-Day 히어로로 복귀 확인

---

## 7. 구현 가이드

### 11. Implementation Guide

#### 11.1 갭 수정 순서 (P0 우선)

```
1. my.html        — GAP-U04 (QR 문구 교체)          ← 독립, 빠름
2. course-enrolled.html — GAP-U02 (75% 기준선)       ← 독립
3. course-completed.html — GAP-U03 (판정 이유 문구)   ← 독립
4. course-detail.html — GAP-U01 (선택 요약 카드)      ← 중간 복잡도
5. home.html + category.html + course-list.html + my.html
                  — GAP-U05 (라우팅 href 점검)         ← 전체 파일
```

#### 11.2 각 파일 수정 전 확인사항

- `proto-bar` 시뮬레이션 상태와 충돌하지 않는지 확인
- 기존 `mockData` 구조를 유지하면서 확장
- Tailwind 클래스만 사용 (별도 CSS 최소화)
- Lucide 아이콘 0.292 버전 (기존과 동일)

#### 11.3 Session Guide

| 모듈 | 파일 | 예상 작업량 | 비고 |
|------|------|-----------|------|
| M1 | `my.html` | 소 (30분) | GAP-U04 QR 문구만 |
| M2 | `course-enrolled.html` | 소-중 (45분) | GAP-U02, U06 |
| M3 | `course-completed.html` | 소 (30분) | GAP-U03 |
| M4 | `course-detail.html` | 중 (1시간) | GAP-U01, U07 |
| M5 | 전체 (홈·카테·리스트·MY) | 중 (1시간) | GAP-U05 라우팅 |

**추천 세션 분할**:
- Session 1: M1 + M2 + M3 (독립 갭, 빠른 성과)
- Session 2: M4 + M5 (상호 의존 갭)
