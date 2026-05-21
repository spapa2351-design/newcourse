# 2026-05-20 newcourse 수강관리 기획 (브레인스토밍 → 결론)

## 탭 구조 (6개 조건부)

| 탭 | 노출 조건 | 기능 |
|---|---|---|
| 요약 | 항상 | KPI 카드 (총 인원·평균 진도율·평균 학습시간·이수 인원·자료 통계) |
| 수강 | 항상 | 수강생 테이블 + 행 클릭 시 사이드 시트 (개인 상세) |
| 동영상 | video 항목 ≥ 1 | 영상별 재생률 + 학습조건 미충족 인디케이터 |
| 시험 | exam 항목 ≥ 1 | 점수·응시·정답·오답 |
| 설문 | survey 항목 ≥ 1 | 응답·미응답 |
| 의견 | community.enabled 항목 ≥ 1 | 항목별 필터 칩 + 의견 통합 목록 (시험·설문 제외) |

**자료(PDF) 통계는 요약 탭에 흡수** — 수료 무관이라 별도 탭 X ([[project_newcourse_pdf_material_policy]])

## Phase 우선순위

### P0 (1차 mockup)
- 요약 / 수강 / 수강생 등록 모달 (회원·그룹·아이디 3탭, CSV 제외)
- 좌측 메타 패널 (코스 표지·기간·QR·종료하기·하단 액션)

### P1
- 동영상·시험·설문·의견 탭 (조건부 노출)
- 개인 상세 드릴다운 사이드 시트
- 학습조건 미충족 인디케이터
- 의견 탭 항목별 필터 칩

### P2
- CSV 대량 등록 (비동기 잡 큐 필요)
- 그룹별 학습량 통계
- 답안 초기화 / 전체 수강기간 변경 일괄 액션 (권한 분리 필요)
- 수료증 발급
- 학습자 화면 보기 진입점

## 레이아웃 정책

- **chrome-on** (글로벌 nav·탑바 유지) — [[project_newcourse_builder_chrome_off]] 정책 반대: 빌더는 chrome-off, 수강관리는 chrome-on
- 좌측 메타 패널 (floating 카드) + 본문 우측 탭 영역 + 우상단 "수강생 등록" 버튼
- 빌더 톤 일관 (`bg-[#f2f5f9]` + 흰 카드 + Material Symbols Rounded)
- 단일 컬럼 흐름 (빌더처럼 우측 사이드바 없음)

## 운영 흐름

- **운영중·예약·종료 모든 상태에서 수강관리 진입 가능**
- 종료 후 수강생 등록 비활성, 데이터 조회는 가능

## 데이터 모델 (P1 스코프)

```
enrollments
  - id, user_id, course_id, enrolled_at
  - period_start, period_end (개인별 수강 기간)
  - status (active / paused / completed)

item_progress
  - enrollment_id, item_id, progress (0~100)
  - completed_at, last_studied_at, accumulated_time_sec

assessment_results
  - enrollment_id, item_id (exam/survey)
  - score, submitted_at, answers (JSON)
```

## 파일 위치

- `admin/online-course-view.html` (link target 이미 존재, 빈 파일이거나 placeholder)
- 컴포넌트 분리:
  - `LeftMetaPanel` (좌측 코스 메타 카드)
  - `TabBar` (조건부 탭 노출)
  - `EnrollmentModal` (3탭, P2에 CSV 추가)
  - `EnrollmentDetailSheet` (P1, 개인 상세 사이드 시트)

## 결정 사항

- 디자인: 빌더와 동일 톤 (`bg-[#f2f5f9]` + 흰 카드 + Material Symbols + Pretendard)
- 항목 유형별 탭 = `chapters` 데이터 기반 조건부 (`items.some(it => it.type === 'video')` 등)
- 자료(PDF) 항목은 별도 탭 없음, 요약 KPI에만 "자료 N건 평균 N회 조회" 표시

## 후속

1. P0 mockup HTML (요약·수강·등록 모달) — 이 세션
2. P1 mockup (동영상·시험·설문·의견 탭) — 데이터 모델 확정 후
3. PRD 작성 (pm-prd skill 또는 수동) — 디자인 시안 OK 후
