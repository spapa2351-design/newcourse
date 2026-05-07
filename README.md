# newcourse — LMS 오프라인 코스 프로토타입

LMS Vision 2026 Phase 1: 오프라인 코스 시스템 설계 및 프로토타입
**v1.2 · 2026-05-07** — 회차 종료 정책 단순화, Phase 4 추가, 일정 재산정 (8명 기준 27주)

## 폴더 구조

```
newcourse/
├── index.html              # 진입점 (관리자/사용자 모드 선택)
├── admin/                  # 관리자 페이지
│   ├── index.html              # 코스 목록 (A1)
│   ├── offline-builder.html    # 오프라인 코스 개설/편집 빌더 (A2)
│   ├── offline-course-view.html # 수강관리 통합 (A3·A4 — 수강생/출석/통계/QR 라이브)
│   ├── online-builder.html     # 온라인 코스 빌더 (Phase 3)
│   ├── feature-spec.html       # 📍 기능 명세서 SSOT (Phase별 분류 + 프로토타입 연동)
│   └── feature-highlight.js    # 기능 클릭 시 프로토타입 위치 하이라이트
├── user/                   # 사용자 페이지 (학습자 앱)
│   ├── home.html
│   ├── category.html
│   ├── course-list.html
│   ├── my.html
│   ├── course-detail.html
│   ├── course-detail-newin.html
│   ├── course-enrolled.html
│   ├── course-completed.html
│   └── web/                # 웹 변형
├── docs/                   # 설계 문서
│   ├── offline-spec.html        # 📍 정책 SSOT — 운영 정책·정의·테스트 매트릭스
│   ├── guide-ops-policy.html    # 📍 운영 가이드 SSOT — 운영팀용
│   ├── guide-offline-lms.html   # 학습자 친화 가이드
│   ├── guide-admin-offline.html # 관리자 가이드
│   ├── guide-ops-policy.html    # 운영 정책 가이드
│   ├── 00-standard/             # 표준 문서
│   │   ├── phase-roadmap.html   # 📍 일정 SSOT — 5단계 Phase 로드맵 (27주)
│   │   └── offline-course-planning-supplement.md  # 기획 보완 문서
│   ├── README.md                # 종합 README (테스트 매트릭스 포함)
│   ├── offline-course-builder.md # 오프라인 코스 시스템 설계
│   ├── vision-2026.md           # LMS Vision 2026 아키텍처 로드맵
│   ├── 01-plan/                 # PDCA Plan (과거 작업 기록)
│   ├── 02-design/               # PDCA Design
│   ├── 03-analysis/             # PDCA Analysis
│   ├── 04-report/               # PDCA Report
│   └── sessions/                # 세션 Q&A 기록
└── assets/
    ├── PureLightTheme.ts   # Tailwind CSS 테마
    └── images/
        ├── cover.png
        └── qr-dummy.png
```

## SSOT (Single Source of Truth) — 4개 문서

| 문서 | 역할 | 위치 |
|------|------|------|
| 📍 정책 SSOT | 운영 정책·정의·테스트 | `docs/offline-spec.html` |
| 📍 기능 라인 SSOT | 110개 기능 매트릭스 + 프로토타입 연동 (41개 위치 하이라이트) | `admin/feature-spec.html` |
| 📍 일정 SSOT | 5단계 Phase 로드맵 | `docs/00-standard/phase-roadmap.html` |
| 📍 운영 가이드 SSOT | 운영팀 매뉴얼 (CS 응대 포함) | `docs/guide-ops-policy.html` |

## 기술 스택

- React 18 (Babel standalone, CDN)
- Tailwind CSS (CDN)
- Lucide React 0.292.0
- 빌드 없는 단일 HTML 파일 구조

## Phase 로드맵 (8명 기준 27주)

| Phase | 기간 | 내용 |
|-------|------|------|
| 🟪 Phase 0 | 2주 | 아키텍처 (데이터 모델·인프라·CI/CD·디자인 시스템) |
| 🟦 **Phase 1 MVP** | **6주 + 베타 1주** | **오프라인 기본 1사이클** — 코스 개설→신청→QR 출석→회차 자동 종료→통계 |
| 🟩 Phase 2 | 5주 (3+2) | 운영 자동화 — 수료 처리·결석 통보·HR 연동·휴강 보강 |
| 🟨 Phase 3 | 8주 | 도메인 확장 — 온라인 코스·모바일 앱·다국어·휴강 상태 |
| 🟧 Phase 4 | 6주 | 데이터 분석 — 예측 모델·AI 추천·ROI 대시보드 (12개월 데이터 후) |

## Phase 1 핵심 정책 (2026-05-06 단순화)

- **회차 종료 = 수업 종료 시각 자동** (별도 마감 버튼 없음)
- 미확인 인원: 운영자가 직접 정리 ("미확인 일괄 처리" 도구)
- 학습자 알림: 즉시성만 (출석 처리됨 / 출석률 표시) · 결석 통보·HR 연동은 Phase 2 이월
- 출석률 계산: 종료된 회차 기준 분모 (Option B)
- 관리자 무제한 정정: 출석 상태 자유 변경

**Phase 2 이월 항목**: 미확인 자동 결석 처리 (+7일) / 시스템 잠금 (+30일) / 운영자 알림 4단계 / 수료 처리 버튼 / 회차선택형 / 정정 사유·audit log

**Phase 3 이월 항목**: 휴강 상태 + 보강 강제 토글 + 자동 재배정 (부수 기능 묶음 공수로 이월 — 2026-05-07)

## 개발 현황

- ✅ Phase 1 오프라인 기본 1사이클 — 정책 단순화 완료
- ✅ admin 프로토타입 4종 (목록·빌더·수강관리·기능명세서) 완성
- ✅ 학습자 앱 프로토타입 (홈·카테고리·코스 목록/상세·MY)
- ✅ 기능 명세서 ↔ 프로토타입 클릭 연동 (data-feature-id 매핑 **41개** — 관리자 25 + 사용자 16)
- ✅ MD 다운로드 버튼 (offline-spec.html 우측 상단)
- 🔜 백엔드 + 프론트 8명 합류 후 27주 견적 시작

## 변경 이력 — 주요 마일스톤

- **2026-05-07**: 휴강 Phase 3 이월 결정 / Phase 4 추가 (5단계로 확장) / 일정 재산정 (52주 → 27주, 8명 기준) / data-feature-id 매핑 41개 / U7 카테고리 화면 추가 (코스 유형 필터 등 3개) / MD 다운로드 버튼
- **2026-05-06**: 마감 개념 제거 → 회차 종료 (시간 자동) / 학습자 알림 즉시성만 Phase 1
- **2026-05-06**: SSOT 4개 정의 (정책·기능·일정·운영가이드)
- **2026-04-28**: 수료 처리 Phase 2 이월 결정 / 코스 목록 + 수강관리 통합 (offline-course-view)
