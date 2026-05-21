# Session: Online Builder 개선 — 2026-04-24

## 작업 내용

### 1. 커서 스타일 전체 수정 (App.jsx)
- `<button>` 요소에 Tailwind CSS v4 preflight이 `cursor: default`를 적용해 손가락이 안 나오던 문제
- 아래 버튼 전체에 `cursor-pointer` 추가:
  - 헤더: 뒤로가기, 임시저장, 미리보기, 퍼블리싱
  - 기본정보 섹션: 난이도 선택 버튼 (입문/중급/고급)
  - 수강신청 섹션: 수강 등록 방식 카드 버튼 (자율수강/관리자 강제 할당)
  - 수강기간 섹션: 기간 유형 카드 버튼 (고정 기간/신청 후 N일/무제한)
  - 토스트: X 닫기 버튼
  - 퍼블리싱 모달: 취소/확정 버튼
- 활성/비활성 조건부 className에서 비활성(`cursor-not-allowed`)은 유지, 활성에만 `cursor-pointer` 추가

### 2. 작업 완료 알림 사운드 (Claude → 사용자)
- 웹앱 사운드(저장/퍼블리싱 시 Web Audio API 재생) 추가 후 취소 — 사용자 의도는 Claude 작업 완료 시 알림
- PowerShell `[Console]::Beep` 3음으로 결정:
  ```powershell
  [Console]::Beep(880, 200); Start-Sleep -Milliseconds 100; [Console]::Beep(1100, 200); Start-Sleep -Milliseconds 100; [Console]::Beep(1320, 300)
  ```
- Windows wav 파일 재생(`Media.SoundPlayer`)은 경로 문제로 실패
- `[Console]::Beep` 방식 최종 확정 (사용자 청취 확인)
- Claude auto-memory에 저장: `feedback_done_sound.md`

## 수정 파일

| 파일 | 변경 내용 |
|------|-----------|
| `src/App.jsx` | 버튼 cursor-pointer 추가 (전체), playDoneSound 추가 후 제거 |

### 3. 오프라인 코스 빌더 컴포넌트 신규 생성 (OfflineCurriculumSidebar.jsx)

- 오프라인 코스 개설 UI 레퍼런스 이미지를 바탕으로 우측 사이드바 컴포넌트 신규 작성
- `src/components/OfflineCurriculumSidebar.jsx` 생성 (온라인 빌더에는 미적용 상태, 향후 오프라인 빌더 페이지에서 사용)
- 주요 기능:
  - **CalendarWidget**: 월 단위 캘린더, 차수 등록된 날짜 하이라이트 (선택=dark, 세션있음=indigo)
  - **차수(session) 관리**: 날짜별 차수 카드, 추가/삭제
  - **회차(round) 관리**: 차수 내 회차별 날짜·시간(시작~종료) 입력, 출석QR 버튼
  - **일괄 셋팅**: 버튼 UI 배치 (기능 미구현)
  - **코스 퍼블리싱**: 하단 고정 버튼 (`bg-[#3b4fa8]`)
- 헤더 배경: `bg-[#1e2a4a]` (다크 네이비)

## 수정 파일

| 파일 | 변경 내용 |
|------|-----------|
| `src/App.jsx` | 버튼 cursor-pointer 추가 (전체), playDoneSound 추가 후 제거 |
| `src/components/OfflineCurriculumSidebar.jsx` | 신규 생성 — 오프라인 코스 차수/회차 관리 사이드바 |

## 현재 상태
- dev server: `http://localhost:5176`
- CurriculumSidebar: 커리큘럼 + 아이템 drag-and-drop 모두 동작
- 커서 스타일: 모든 클릭 요소 손가락 커서
- OfflineCurriculumSidebar: 생성 완료, 온라인 빌더에 미적용 (별도 페이지 연결 필요)
