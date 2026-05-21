# 세션: v1 surgical 추가 + 4영역 와이어 보존 결정

> 날짜: 2026-05-18 (저녁)
> 참석: 이팀장, 구차장(기획), 고과장(기획), 카리나차장(운영), 태서과장(운영), 조차장(디자인), 장그래대리(QA), 개발팀
> 산출물: online-builder-v1.html 직접 수정 / online-builder-v3.html (보류) / 4영역 와이어 5종 (참고용 보존)

---

## 1. 결정 사항

| # | 결정 | 비고 |
|---|---|---|
| 1 | **v1 UI는 완성. 4영역 분리하지 않는다.** | 단일 화면 빌더 유지 |
| 2 | spec에서 빠진 항목만 v1에 surgical 추가 | "없던 부분만 추가" |
| 3 | 4영역 분리는 데이터 모델 차원에서만 진행 | UI는 v1 그대로 |
| 4 | v3 / 4영역 와이어는 참고용으로 보존 | 미래 옵션 |

---

## 2. v1에 추가된 것 (저녁 surgical 작업)

### 2.1 슬롯 타입 정의
- `SLOT_TYPES`에 `external_link` 추가 (Link2 아이콘, 슬레이트 톤)
- `TYPE_LABEL`에 `external_link: 'EXTERNAL'` 추가
- `condText` 함수에 외부 링크 조건 케이스 추가

### 2.2 코스 유형 6종 selector (신규 섹션 0)
- `courseType` state로 변경 (기존 `'online'` 하드코딩 → state)
- `COURSE_TYPES` 사전: content / offline / blended / quiz_only / survey_only / video_only
- 카드 그리드 UI (3×2)

### 2.3 maxRunDays 정책 필드 (신규 섹션 0)
- `maxRunDays` state (기본 365)
- 입력 필드 + 90/180/365/730 빠른 프리셋
- 데이터 폐기 정책 앵커 설명 텍스트

### 2.4 커리큘럼 버전 뱃지 (헤더)
- `curriculumVersion` state (기본 'draft')
- 헤더에 뱃지 표시 (draft = amber / published = emerald)
- ⚠ 표시만, 실제 발행·동결 로직은 미구현

### 2.5 코스 유형 칩 동적 표시 (헤더)
- 기존 emoji 조건(🔀/🎬) 제거
- 선택된 `courseTypeMeta.Icon` + label 표시

---

## 3. v1에 추가하지 않은 것 (refactor 회피)

| 항목 | 이유 |
|---|---|
| 슬롯 타입 명명 통일 (exam→quiz 등) | refactor 범주. "추가만" 룰에 부합 안 함 |
| 4영역 UI 분리 | 사용자 결정 — v1 UI 완성으로 간주 |
| 회차(Cohort) 객체화 | 큰 작업. 백엔드 모델 결정 후 |
| EnrollmentPlan | 회차 객체 도입 전엔 의미 없음 |

---

## 4. 산출물 위치

| 분류 | 파일 |
|---|---|
| **현행 빌더 (확정)** | `newcourse/admin/online-builder-v1.html` (surgical 추가 반영) |
| 데모 4영역 React | `newcourse/admin/online-builder-v3.html` (보류, 참고용) |
| 4영역 와이어 5종 (정적) | `newcourse/admin/newcourse-hub.html` + `newcourse-course-builder.html` + `newcourse-curriculum-builder.html` + `newcourse-content-editor.html` + `newcourse-cohort-management.html` |
| 매핑 분석 (갱신) | `newcourse/docs/online-builder-v1-mapping.md` |
| spec | `newcourse/docs/newcourse-spec.md` / `.html` (v0.2) |
| 쉬운 버전 | `newcourse/docs/newcourse-overview.md` / `.html` |

---

## 5. 사상 흐름 — 오늘 하루 정리

```
[오전] 원본 2026-03 문제의식 문서 리뷰
       → newcourse-spec v0.1 작성 (5객체·4영역 분리·진도율 정합성 등)
       
[오후 초반] spec v0.2 — 포지셔닝 결정
       → 레거시 + newcourse 동등 옵션
       → 두 시스템 데이터 공존 없음
       → 마이그레이션 미지원
       → 보수적 고객 타깃 가설

[오후 중반] 쉬운 버전 newcourse-overview + v1 매핑 분석
       → 갭 분석 결과 v1은 spec의 80% 구현 중

[오후 후반] 용어 정리 (에디터 4분할 → 4영역 분리)
       → 빌더·에디터·관리 구분 명확화

[저녁 초반] UI 와이어 5종 + online-builder-v3.html (4영역 React)
       → 사용자 결정: v1으로 UI 완성. 4영역 분리 X.

[저녁 후반] v1.html surgical 추가
       → spec의 빠진 항목 4가지만 추가
       → external_link / 코스 유형 6종 / maxRunDays / 버전 뱃지

[저녁 마지막] doc 갱신
       → online-builder-v1-mapping.md 최신화
       → 본 세션 노트 작성
```

---

## 6. 다음 작업 안건

| # | 안건 | 담당 | 우선순위 |
|---|---|---|---|
| 1 | spec v0.3 — 선수조건·드립 학습·컴플라이언스 흡수 | 이팀장 + 기획팀 | P0 |
| 2 | external_link 슬롯 추가 UI 탭 (현재는 정의만 있음) | 개발팀 + 조차장 | P1 |
| 3 | 슬롯 타입 명명 통일 (exam→quiz 등) refactor 의사결정 | 개발팀 + 기획팀 | P1 |
| 4 | 커리큘럼 버전 발행 로직 (백엔드 협조) | 개발팀 | P1 |
| 5 | 회차 객체화 — 데이터 모델 차원만 | 개발팀 | P2 |
| 6 | QA 회귀 시나리오 (슬롯·버전·EnrollmentPlan) | 장그래대리 | P1 |
| 7 | 기존 고객 이전 요청 답변 스크립트 | 카리나차장 | P2 |
| 8 | "페이지 순서대로 수강" 옵션 의미 명확화 | 카리나차장·태서과장 | P2 |

---

## 7. 한 줄 보고

> **v1 빌더는 단일 화면 UI를 유지하면서 spec v0.2의 빠진 항목 4가지(external_link / 코스 유형 6종 / maxRunDays / 버전 뱃지)가 surgical 추가되어 spec 매칭률이 80% → 85%로 상승했다. 4영역 분리는 보류, 객체 분리(Cohort·EnrollmentPlan·버전 발행 로직)는 다음 작업.**
