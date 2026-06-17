
---

## 2026-05-21 15:52:04  `session: db140b40-da74-4b1b-8d50-03b75b33410e`

이제 임베드 완료:

### 진실한 상태

**캡처는 했으나 직전엔 임베드 안 했음** — 이번 턴에서 추가 작업:

1. `guide-offline-lms.html` 상단(intro 페이지 안)에 **"현 어드민 화면" 4-카드 그리드** 추가:
   - 오프라인 코스 목록 · 오프라인 코스 빌더 · 오프라인 수강관리 · 콘텐츠 라이브러리
   - 각 이미지는 클릭 시 실제 admin 페이지로 이동

2. `guide-ops-policy.html` 상단에 **"관련 어드민 화면" 4-카드 그리드** 추가:
   - 오프라인 코스 목록 · 오프라인 수강관리 · 온라인 코스 목록(코스v2) · 온라인 수강관리(코스v2)

3. `feature-spec.html`은 SCREEN_URL_MAP 갱신만 됨 — 이건 React 라이브 미리보기 페이지라 별도 이미지 임베드 불필요 (실시간 iframe으로 admin 페이지 띄움)

### 미해결 영역 (정직하게)

- **본문 깊은 detail 캡처**: guide-offline-lms.html 본문 71개 `<img>` 중 `01_list_default.png` `02_status_tabs.png` 같은 detail은 옛 admin 기준. 신규 detail 캡처는 별도 스크립트 작업 필요 (지금은 full.png만)
- **이미지 alt + 캡션**: 현재 alt만 박힘, 사용자 친화 캡션은 추후
- **course-list/00_current.png 등 복사**한 건 fallback 호환용. 실제로는 본문에서 full.png 경로로 새 그리드를 표시

브라우저에서 두 가이드 새로고침하면 상단에 신규 캡처 카드 그리드 노출됨.

---

## 2026-05-21 16:36:29  `session: db140b40-da74-4b1b-8d50-03b75b33410e`

오류 원인 + 수정:

**원인**: 직전 turn에 A1-01에 `status: 'obsolete'`, `phase: 0` 두 새 값을 박았는데 `ST` map과 `PHASE` map에 매핑이 없어 `undefined.bg` 참조에서 TypeError.

**수정**:
- `ST` 맵에 `obsolete` 추가: 라벨 "폐기", rose 톤
- `PHASE` 맵에 `0` 추가: slate 톤 (phase out 표시)

이제 새로고침하면 A1-01 행이 rose 배경의 "폐기" 칩 + slate phase 0 칩으로 정상 노출. 다른 entries는 영향 없음.

---

## 2026-05-21 17:29:06  `session: db140b40-da74-4b1b-8d50-03b75b33410e`

guide-offline-lms.html admin 스크린샷 일괄 갱신:

### 1. 캡처 재실행 (8개 풀스크린 갱신)
`scripts/capture-admin-current.js` 다시 실행 — 모든 admin 페이지(offline-list/builder/view, online-list/builder/view, content-library, blended-builder) full.png 17:28에 최신화. 파일 사이즈 확인.

### 2. 가이드 문서 img src 전부 신규 경로로 교체
**구 경로 → 신 경로**:
| 구 (가이드 안 옛 참조) | 신 (현 캡처) |
|---|---|
| `admin/course-list/*.png` (01_list_default·02_status_tabs·03_expand_row) | `admin/offline-list/full.png` |
| `admin/course-view/*.png` (01_dashboard·02_students·03_attendance·04_qr_live) | `admin/offline-view/full.png` |
| `admin/course-learners/*.png` (01_learners·02_enroll_modal) | `admin/offline-view/full.png` |
| `admin/offline-builder/{01~08, package_type_*}.png` | `admin/offline-builder/full.png` |

본문에 detail 컷이 박혀있던 모든 자리에 최신 풀스크린 적용. 22+개 이미지 ref 교체.

### 남은 잔존 (의도적 보존)
- `../screenshots/course-list/01_list_default.png` (admin 없음) — 학습자 앱 코스 목록 화면
- `course-list-page` `course-learners.html` 같은 페이지 ID·텍스트 참조 — 코드 navigation용

이건 admin 영역 밖이라 별도. 학습자 앱 스크린샷도 갱신 필요하면 user/web/ 페이지 따로 캡처 가능.

### 한계
detail 컷(특정 탭/모달 클릭 후 부분 캡처)은 일률 풀스크린으로 통일됨. 페이지 내 같은 자리에 같은 풀스크린이 반복 표시됨. detail 캡처 필요하면 페이지별 탭·모달 trigger 클릭 후 부분 캡처 스크립트가 별도 필요 (예: 빌더의 자율/강제 라디오 토글 후 캡처 등). 알려주면 작업 가능.

---

## 2026-05-21 17:56:20  `session: db140b40-da74-4b1b-8d50-03b75b33410e`

---

**장그래 (대리)** — 팀장님, detail 캡처 스크립트 작성·실행 끝났습니다. **14건 전부 성공**(빌더 9 + 목록 1 + 수강관리 4). 가이드 본문에 새 캡처들 매핑 마쳤고, 회차 일괄 생성·차수 펼침·수강생 탭·출석 탭·QR 라이브 모드 — 모두 정상 화면으로 복구됐습니다.

**이상민** — 검증은?

**장그래** — 캡처 파일들 한번 열어서 본문 캡션이랑 매칭되는지 시각 확인 한번 받고 가는 게 좋습니다. 특히 **08_session_bulk_create**(이번에 마법봉 클릭 후 일괄 생성 폼 펼친 상태로 잡힘)랑 **qr_live**(라이브 출석→QR 출석 시작 2단계 클릭 후 캡처)는 본문 의미랑 맞는지 한번 봐주시면 됩니다. `J:\claude\newcourse\screenshots\admin\offline-builder\08_session_bulk_create.png`, `offline-view\qr_live.png` 확인 부탁드립니다.

---

## 2026-05-21 18:41:28  `session: db140b40-da74-4b1b-8d50-03b75b33410e`

28개 링크 전부 실파일 존재 확인됐습니다.

**바뀐 점**:
- 타이틀 "오프라인코스 프로토타이핑" → "newcourse 프로토타입 — 허브"
- 버전 v1.1·2026-04-28 → v2.0·2026-05-21
- 섹션 3개: **관리자·코스v2 (12)** / **학습자 (9)** / **기획·가이드 문서 (7)**
- 관리자 섹션 sub-title 3분: 코스 만들기 모달 / 목록·빌더·운영 / 콘텐츠·참조
- 컬러: 오프라인=주황, 온라인=하늘, 블렌디드=핑크, 라이브러리=초록, 문서=보라, 가이드=앰버
- 카드 desc는 파일명 직접 표기(어디 가는지 명확)

`file:///J:/claude/newcourse/index.html`에서 확인 부탁드립니다.

---

## 2026-05-21 18:47:33  `session: db140b40-da74-4b1b-8d50-03b75b33410e`

**바뀐 점**:
- 관리자 섹션: **오프라인(좌)·온라인(우) 2열 표** 4행(만들기 / 목록 / 빌더 / 운영)
- 상단 컬럼 헤더: `🟠 오프라인 | 🔵 온라인 [작업중]`
- 온라인 카드 8개 전부 `작업중` 앰버 배지 + 카드 opacity 0.75
- 공통 4종(블렌디드·콘텐츠라이브러리·사이드바mockup·feature-spec)은 별도 sub-section(3열). 블렌디드·콘텐츠라이브러리는 작업중 배지
- 기획 문서도 동일 패턴: 오프라인·온라인 스펙 2열(`online-course.html` 작업중)
- 버전 v2.1·2026-05-21

`file:///J:/claude/newcourse/index.html`에서 확인 부탁드립니다.

---

## 2026-05-21 18:52:08  `session: db140b40-da74-4b1b-8d50-03b75b33410e`

**바뀐 점**:
- **헤더 아래 hero card**: newcourse 종합 — 그라디언트 보라/인디고 배경, 큰 사이즈, 화살표 우측. 기획·가이드 섹션 안의 "종합" 한 줄 카드는 제거 (중복 제거)
- **공통·참조 → 콘텐츠**: 블렌디드 빌더 / 사이드바 mockup / 기능 명세서 3개 제거, **콘텐츠 라이브러리만 남김**
- 관리자 카드 수 12 → 9 (만들기2 + 목록2 + 빌더2 + 운영2 + 라이브러리1)
- 버전 v2.3·2026-05-21

`file:///J:/claude/newcourse/index.html`에서 확인 부탁드립니다.

---

## 2026-05-21 18:55:24  `session: db140b40-da74-4b1b-8d50-03b75b33410e`

**바뀐 점**:
- **순서**: Hero → 01 관리자 → **02 기획·가이드 문서** → 03 학습자 (가이드 2번째로)
- **보라색 전부 제거**: `s-doc/c-doc/c-blended/c-library/c-guide/c-user` 컬러 다 흑백·회색계열로. 보라 그라디언트 hero → **검정 단색** + 흰 글씨 + 반투명 pill (newcourse.html cover 패턴)
- **newcourse.html 디자인 토큰 차용**:
  - 폰트: Pretendard Variable
  - 색상: `--black/#000`, `--chip-gray/#efefef`, `--body-gray/#4b4b4b`, `--muted-gray/#afafaf`, `--body-bg/#f5f5f5`
  - 섹션: 흰 카드 + chip-gray 1px 테두리 + 20px radius + 미세 shadow
  - 섹션 번호 배지: 검정 배경 + 흰 글씨 + uppercase (01/02/03)
  - 헤더 라벨: muted-gray + uppercase + letter-spacing
- 카드 hover: 보라 → **검정 테두리**로
- 식별 컬러는 유지: 오프라인=주황 / 온라인=하늘 (컬럼 헤더 + 좌·우 메인 카드 아이콘만)
- 학습자·가이드 본문 카드 아이콘은 흑백 chip-gray로 통일
- 카드 desc는 monospace로 (파일명 표기 가독성)
- 버전 v3.0·2026-05-21

`file:///J:/claude/newcourse/index.html`에서 확인 부탁드립니다.

---

## 2026-05-21 19:09:29  `session: db140b40-da74-4b1b-8d50-03b75b33410e`

코스 상세 가이드 카드 삭제, 가이드 섹션 카운트 6→5, 버전 v3.2. 확인 부탁드립니다.

---

## 2026-05-21 21:52:21  `session: db140b40-da74-4b1b-8d50-03b75b33410e`

**저장 상태**:
- **디스크 파일 저장**: ✓ 완료 (`index.html`, 20.8KB, 19:09 수정)
- **git 커밋·푸시**: 아직 안 됨. 워킹 트리에 변경분 다수 쌓여 있음 (이번 세션 작업 + 이전 세션)

변경분 요약(git status):
- 수정: index.html, admin/feature-spec, offline-builder, online-builder, docs/guide-* 4종, plan·design·analysis·report 5종, 스크린샷 다수
- 삭제: admin/index.html, admin/offline-course-view.html, docs/offline-spec.html
- 신규: capture-admin-details.js 등

커밋·푸시 진행할까요? 한 번에 묶으면 메시지 무거우니 분할(guide / index / capture script 등)이 깔끔합니다.

---

## 2026-05-21 21:54:37  `session: db140b40-da74-4b1b-8d50-03b75b33410e`

**메모리 저장 상태**:

이번 세션에서 박힌 메모리 **2건**:
1. **`feedback_screenshot_replacement.md`** — 가이드 풀스크린 일괄 교체 금지 (이미 박혀 있었음)
2. **`project_newcourse_hub_design.md`** — newcourse 허브 index.html 디자인 (방금 추가)

MEMORY.md 인덱스에 둘 다 등록 완료. 다른 변경(섹션 순서·만들기 모달 삭제·콘텐츠라이브러리만 남기기·코스 상세 가이드 삭제 등)은 모두 하위 디테일이라 hub_design 문서 한 곳에 통합·반영했습니다.

---

## 2026-06-05 10:14:04  `session: f5c1f812-48ba-4ab6-8cf6-26a79e8be817`

`/pdca design` 마쳤습니다. 선택하신 **A(최소 변경)** 기준으로 설계 확정했고, A의 유일한 리스크는 판정식을 못박아 막았습니다.

### [Plan ✅] → [Design ✅] → [Do ⏳]

**작성물**
- `docs/02-design/features/offline-session-instructor.design.md` (v0.1.0)
- 세션 기록·메모리 갱신

**핵심 설계 (A)**

| 항목 | 결정 |
|------|------|
| 데이터 | `courseInfo.sessionInstructorMode`(bool, false) + `session.instructor`(string, '') · 차수 레벨 없음 |
| 상속 | 표시 시점에만 계산, 데이터에 안 굽음 · 토글 OFF여도 입력값 보존 |
| 입력 위치 | 회차 카드 내 **강사 행**(장소 행 바로 뒤, 토글 ON시만) · placeholder=대표강사명 |
| "상이" 판정 | 상속까지 채운 표시용 강사로 비교 → 실제 다를 때만 칩 |
| 불변 | 출석·수료 로직 안 건드림 |

**A 리스크 방어** — 3파일이 동일 표현을 쓰도록 못박은 판정식 2개:
```js
effInstructor(sess)  = (sess.instructor && sess.instructor.trim()) || courseInfo.instructor || '';
isMixedInstructor()  = 모든 회차 effInstructor의 distinct(빈값 제외) > 1
```

**구현 분할**: 세션1 = 빌더 입력측(`module-data` + `module-builder-ui`) → 세션2 = 노출측(`course-detail` + `offline-view`)

다음은 `/pdca do offline-session-instructor`로 실제 구현 들어갑니다. 세션1(빌더)부터 시작할까요? 시작 전 구현 범위 승인(Checkpoint)을 한 번 더 받고 코드 들어가겠습니다.

---

## 2026-06-08 16:35:35  `session: 7fa8f6f4-bd6e-4d74-a837-850cf03d84d4`

강사 화면 스샷 재캡처 + 가이드 swap 완료했습니다.

## 한 일
`offline-builder.html?courseId=10`(토글 ON·5차수·차수강사 박서준·회차강사 이응급/박현장)을 Playwright로 열어, **강사가 보이는 상태**로 3장을 같은 파일명으로 덮어썼습니다(가이드 HTML은 동일 파일 참조라 수정 불요):

| 파일 | 내용 | 검증 |
|---|---|---|
| `02_basic_info.png` | 강사 묶음 카드 — 담당강사 강태훈 + **"차수·회차별 강사 다름" 토글 ON**(chip 없음) | ✅ |
| `06_package_sidebar.png` | 1기 + **차수 강사 strip**(강태훈 대표 상속) + **회차 강사**(1회차 상속/2회차 이응급) | ✅ |
| `full.png` | 빌더 전체 — 좌 강사 카드(토글 ON) / 우 차수·회차 강사 사이드바 | ✅ |

- 캡처 방식: 기존 `capture-admin-details.js`와 동일 셀렉터(`#step-info` 요소 / `<aside>` 차수·회차 관리)로 element 캡처해 프레이밍 유지, 데이터만 course 10으로.
- 임시 캡처 스크립트·프리뷰 삭제 완료.
- `guide-offline-lms.html`은 이미 **v1.7 · 2026-06-08**(직전 강사 콜아웃 반영분)이라 같은 날·같은 작업이라 버전 그대로 둡니다.

이제 오프라인 코스 가이드를 열면 기본정보·차수 사이드바·전체 화면 스샷이 모두 강사 3단이 보이는 최신 화면으로 나옵니다.

---

## 2026-06-08 16:42:10  `session: 7fa8f6f4-bd6e-4d74-a837-850cf03d84d4`

네, 대표강사는 1명이 맞습니다.

- 코스당 **대표강사 1명(필수)** — 코스의 "얼굴"이자 목록·상세 상단·대외 표시 기준.
- 여러 명이 가르치면 그건 **차수강사·회차강사**로 내려가고, 대표는 그대로 1명 유지(상속의 최상위 기본값).

즉 3단(대표 1 → 차수 N → 회차 N) 구조에서 **맨 위 대표만 단수(1명)**, 아래 두 레벨이 복수입니다.

---

## 2026-06-08 16:52:37  `session: 7fa8f6f4-bd6e-4d74-a837-850cf03d84d4`

학습자 코스 상세 스샷을 강사 보이게 다시 찍어 swap 완료했습니다.

## 원인
가이드의 학습자 상세 스샷(`course-detail/01·05·08·13`)이 **6/1 캡처**라 강사 3단(6/8) 이전이었습니다. 게다가 `.app`이 390×860 폰 프레임이라, 강사가 나오는 **커리큘럼이 내부 스크롤 아래**에 묻혀 있었습니다.

## 한 일
`course-detail.html`을 현재 코드로 재캡처(viewport 1440×1000·scale2 = 780×1720, 기존과 동일 규격):
- **13_session_expand.png** (회차 펼침) — `s1` 펼친 뒤 **커리큘럼으로 스크롤**해서 캡처. 결과:
  - **차수 강사**: A반 `강사 김민준` / B반 `강사 박서준` / C반 `강사 김민준` (차수마다 다름)
  - **회차별 강사**: A반 펼침 → 1회차 김민준 / 2회차 **이서연** + `회차별 강사 상이` 칩
  - → **차수·회차 강사가 한 화면에 다 보입니다**
- 01/05/08도 현재 코드로 갱신(상단 강사 카드 "회차별 강사 상이" 칩 반영)

## 검증·정리
- 13 헤드리스 확인 완료(위 내용 다 노출).
- 같은 파일명 덮어쓰기라 `guide-offline-lms.html` 수정 불요 — 가이드 열면 자동 반영.
- 임시 캡처 스크립트·프리뷰 삭제, 메모리에 "13은 .scroll-area 스크롤 필수" 노트 기록.
- 가이드는 이미 v1.7·2026-06-08(같은 날 작업)이라 버전 유지.

빌더(02/06/full) + 학습자 상세(13 등)까지 가이드 스샷 전부 강사 3단이 보이는 최신 화면으로 맞췄습니다.

---

## 2026-06-15 11:45:36  `session: be1b51d4-e92c-4c35-b0fa-878356b2520c`

`design/touchclass_design.md`를 newcourse **단일·최종 디자인 가이드**로 확정했습니다.

## 정리 내용
- **구 Toss 가이드 폐기**: `design/newinDESIGN.md`·`user/newinDESIGN.md` 두 복사본(각 29KB) → **폐기 스텁**(900바이트, touchclass로 리다이렉트)으로 전환. 본문은 git 히스토리에 보존되니 되돌릴 수 있고, 기존 인바운드 링크(work-log·세션로그)도 안 깨집니다.
- **HTML 주석 갱신**: `course-detail-newin.html`의 토큰 주석 `Toss Design Tokens (newinDESIGN.md)` → `TouchClass Design Tokens (design/touchclass_design.md — 단일 최종 가이드)`.
- **기록**: 세션로그(`2026-06-15-user-pages-touchclass.md`)와 메모리에 "단일화 확정" 반영, `offline_user_uber_redesign` 메모리에도 touchclass 대체 포인터 추가.

## 이후 기준
모든 user 페이지는 `design/touchclass_design.md`(원칙·토큰) + `user/_touchclass-convert.md`(구현 규격), 이 둘만 따릅니다.

## 한 가지 남긴 것
`design/DESIGN-intercom.md`는 인터컴(도움말 위젯) 등 **다른 surface용**이라 newin↔touchclass 단일화 범위 밖으로 보고 그대로 뒀습니다. 이것도 touchclass로 합치길 원하시면 말씀해 주세요.

`user/web/` 옛 웹 세트(9종, 아직 `#5569ff`+이모지)는 전환 대기 상태입니다 — 진행할까요?

---

## 2026-06-17 09:59:09  `session: a6db6bd0-971a-4281-a782-2c6afa596845`

완료 알림 드렸습니다, 이팀장. B의 ③ 처리 방향만 정해주시면 마저 손보겠습니다.

---

## 2026-06-17 10:09:54  `session: a6db6bd0-971a-4281-a782-2c6afa596845`

## 완료 — `offline-course-cases.html` 실제 폰 목업 갤러리

이팀장, 첨부 이미지(course-detail 학습자 화면) 그대로, **8개 케이스를 실제 폰 화면 목업으로 한 페이지에 다 펼치게** 재작성했습니다.

**각 폰 구성** (이미지와 동일):
상태바 9:41 → X·코스 검색 → 영상 커버 + N·상태배지 → 제목 → 설명 → 정보/커리큘럼 탭 → 강사 카드 → 학습정보 4카드(기간+일수뱃지 / 장소+지도보기 / 신청기간 / 취소·변경 규정) → 카테고리 → 하트+신청 버튼.

**데이터는 `course-detail.html`의 `COURSE_CASES` 8종을 그대로** 가져와 실제 화면과 1:1 일치시켰습니다. 케이스별로 자동 반영된 차이:

| 케이스 | 상태배지 | 강사 | 신청 버튼 |
|---|---|---|---|
| ① 표준 다회차 | 수강 신청 가능 | 김민준 | 수강 신청하기 |
| ② 단일 하루 특강 | 마감 임박 | 한소희 | 마감(비활성) |
| ③ 회차별 강사·장소 상이 | 수강 신청 가능 | 강태훈 +회차별 상이 칩 | 수강 신청하기 |
| ④ 관리자 지정 등록 | 관리자 배정 | 박지훈 | 배정 확인(비활성) |
| ⑤ 법정의무(회차 선택형) | 수강 신청 가능 | 강태훈 +법정의무 라벨 | 수강 신청하기 |
| ⑥ 장기·상시 모집 | 상시 모집 | 최예진 +회차별 상이 칩 | 수강 신청하기 |
| ⑦ 신청 마감·기한 경과 | 신청 마감 | 김도윤 | 마감(비활성) |
| ⑧ 최소 정보·미정 | 오픈 예정 | 대표 강사 +미배정 칩 | 오픈 예정(비활성) |

- 4열 그리드(`auto-fill minmax(392px)`), 가로 오버플로 없음, Playwright 헤드리스 검증 통과(8폰·콘솔 에러 0)
- 케이스 식별용으로 각 폰 위에 `CASE N · 라벨 + 신청방식 칩`을 달았습니다

**참고**: 이전의 **B "배지 종류 범례"는 이번 폰 갤러리 재작성에서 제거**했습니다. 범례가 따로 필요하시면 별도 페이지로 살려두거나 갤러리 하단에 다시 붙일 수 있습니다 — 원하시는 쪽 알려주세요.

---

## 2026-06-17 10:35:04  `session: a6db6bd0-971a-4281-a782-2c6afa596845`

네. **MY 일원화 확정** — 내 수강 디테일(출석부·일정변경·취소·수료증)은 MY에서 관리, 코스 상세는 신청 게이트로.

`course-detail.html`은 **신청 게이트로는 지금 게 최신 맞습니다.** 단 결정대로면 그 안의 `screen-my`(내 수강 내역)·`screen-cancelled`(취소완료)는 MY랑 겹치는 중복이라 **걷어낼 대상**입니다. 정리 들어갈까요?

---

## 2026-06-17 11:12:32  `session: a6db6bd0-971a-4281-a782-2c6afa596845`

## 장그래 QA — MY 일원화 + 허브 정리 최종 보고

### 1. `course-detail.html` — 신청 게이트로 다이어트
- **제거**: 내부 `screen-my`(내 수강 내역)·`screen-cancelled`(취소 완료) 화면, `modal-cancel`, 그리고 죽은 JS(`updateMyCourseUI`/`updateCancelButtonUI`/`openCancelModal`/`confirmCancel`/`openChangeSchedule`/`setTimeSim` + `timeSim` 상태 + proto "취소·변경 기한" 데모)
- **MY 동선**: 수강중·완료 배너 → `my.html`, 수강중 버튼 → `my.html`, 신청 완료 모달 확인 → `my.html`, proto ④칩 → `my.html`
- **유지**: 신청 흐름(시트→확인→완료모달), 8케이스, 상태/신청기간 시뮬

### 2. `index.html` 허브 정리
- 학습자 섹션: **"코스 상세 (신청)" 1개** + `MY 페이지` 하위로 `↳ 내 학습 — 수강 중/완료 상세` 들여쓰기·라벨 정정, 카운트 7
- 스크린샷의 **"코스 상세 (newin)"·`course-detail-newin.html`은 이미 디스크에 없음** — 스크린샷이 캐시된 옛 화면이었습니다(추가 삭제 불필요)

### 3. 헤드리스 검사 결과
| 대상 | 결과 |
|---|---|
| course-detail (일원화) | **17/17 PASS · 콘솔 에러 0** — 제거 화면 부재·신청플로우·MY 이동(실제 `my.html` 네비게이션 포함) 전부 확인 |
| index 허브 | 학습자 링크 **7개 전부 파일 존재**, 깨진 링크·newin 참조·콘솔 에러 **0** |

### 4. 문서·메모리
- `docs/sessions/2026-06-17-my-consolidation.md` (참석자·결정·변경·QA)
- `docs/01-plan/features/user-nav-flow.plan.md` **v1.1 §4** (IA 정정 반영, 수정일 갱신)
- 메모리 `project_newcourse_my_consolidation` 등록

**이상 없음 — 일원화 적용·검증 완료입니다.** 한 가지만 참고로: `user/offline-course-cases.html`(케이스 갤러리)는 허브에 링크가 없는데, 필요하면 허브 학습자 섹션이나 가이드 쪽에 버튼 하나 추가해 드리겠습니다.

---

## 2026-06-17 11:24:49  `session: a6db6bd0-971a-4281-a782-2c6afa596845`

완료했습니다, 이팀장.

## QR 출석 버튼 제거 — 정리 보고

QR 출석은 **백엔드 미구현(프로토 시뮬레이션)**이라 "되는 것처럼 보여 헷갈리는" 문제 → 버튼 제거.

| 파일 | 처리 |
|---|---|
| `course-enrolled.html` | 하단 QR 버튼 + QR 모달 + JS **전부 제거** |
| `my.html` | 가리키신 hero 카드 버튼 포함 **카드 QR 버튼 3개만 제거**. 결정대로 결과 모달 5종·`showQr`/`closeQr`·proto 데모는 **보존**(추후 재사용) |

**검증(헤드리스)**: 두 파일 모두 카드 QR 버튼 0개, 콘솔 에러 0. my.html QR 결과 모달 5종 보존 확인. (라이브 모드의 QR 버튼 하이라이트 코드는 null-guard라 무해)

**기록**: 세션 로그(`2026-06-17-my-consolidation.md`) + 메모리에 반영.

참고로 실제 출석 설계 의도는 *교육장에서 강사가 띄운 QR을 학습자가 스캔* → 백엔드 기록 방식인데, 그 연동이 구현되면 보존해 둔 my.html의 QR 모달/JS를 그대로 재사용할 수 있습니다.
