# 2026-05-19 에셋별 의견 기능 + 학습 뷰어 신규

배경: 디디쌤·기존 에디터에 있던 "에셋별 의견 기능"을 newcourse 빌더에 도입. 학습 뷰어도 신규 생성.

## 빌더 변경 (`admin/online-builder-v1.html`)

### 데이터 모델
- 항목(slot)에 `community: { enabled: bool, allowAnonymous: bool }` 필드 추가
- 기본값: `{ enabled: false, allowAnonymous: false }` (안전 우선)

### SlotSettingModal 확장
- 명칭: "이수 조건 설정" → "학습 요소 상세 설정"
- 구조: 헤더 / 대상 항목 / 이수 조건 그룹 / **커뮤니티 기능 그룹** / 푸터
- 커뮤니티 기능 그룹:
  - 의견 기능 사용 (Toggle)
  - 익명 의견 허용 (Toggle, 의견 기능 ON일 때만 활성)
- 저장 시 `onSave({ cond, community })` 로 변경 → `updateItem` 사용

### 항목 카드 인라인 메타
- 이수 조건 줄에 의견 칩 추가
- 표시: `💬 의견` (익명 허용 시 `💬 의견 · 익명`)

### 일괄설정 함수 추가 (UI는 호출부 미적용)
- `applyAllCommunityOn` — 모든 항목 의견 기능 ON
- `applyAllCommunityOff` — 모든 항목 의견 기능 OFF
- 호출 UI는 사용자가 매크로 영역을 정리한 상태라 보류

## 학습 뷰어 신규 (`user/course-viewer.html`)

### 베이스
- `plan-main/5.html` 패턴 기반 + newcourse 데이터 모델 매핑

### 본문 뷰 4종
- 영상 (video)
- PDF (pdf)
- 시험 (exam)
- 설문 (survey)

### 사이드바
- 탭: 커리큘럼 / 의견
- 의견 탭 = **항목 단위로 분리** (현재 선택된 항목의 의견만 표시)
- 커리큘럼 리스트에 항목별 의견 카운트 인라인 표시 (의견 기능 ON인 항목만)

### 의견 탭 상태별 표시
- 의견 ON + 의견 있음 → 입력창 + 의견 목록
- 의견 ON + 의견 없음 → "첫 의견을 남겨보세요" 빈 상태
- 의견 OFF → "이 항목은 의견 기능이 꺼져 있습니다" 안내
- 익명 허용 ON → "익명으로 의견 남기기" 체크박스 노출

### 반응형
- 데스크탑 / 모바일 토글 (5.html 패턴 유지)

### 영상 재생
- 실제 `<video controls playsinline>` 태그 사용
- 기본 fallback 소스: `../assets/test-video.mp4`
- 항목 데이터에 `videoUrl` 필드 있으면 우선, 없으면 fallback
- selectItem 시 src 동적 변경 + player.load() 호출

## 기획 결정 (운영팀 반영)

- 의견 기능 기본값 = **OFF** (안전 우선, 의무 교육 코스에서 부작용 차단)
- 익명 허용 기본값 = **OFF** (운영팀 거의 안 씀)
- 코스 유형별 자동 기본값 분기는 Phase 2 안건 (현재는 일괄 매크로로 대체)

## 미적용 (별도 안건)

- 일괄 매크로 UI 영역 — 매크로 호출 버튼 없음. 함수만 정의. 매크로 영역 재구성 후 추가.
- 답글 기능 — 의견에 답글 달기 인터랙션 (현재 버튼만 있음)
- 의견 신고·삭제 권한 — 운영자/작성자 분리
- 코스 유형별 의견 기본값 자동 적용
