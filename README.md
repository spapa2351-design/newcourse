# newcourse — LMS 오프라인 코스 프로토타입

LMS Vision 2026 Phase 1: 오프라인 코스 시스템 설계 및 프로토타입

## 폴더 구조

```
newcourse/
├── index.html              # 진입점 (관리자/사용자 모드 선택)
├── admin/                  # 관리자 페이지
│   ├── index.html          # 코스 목록
│   ├── offline-builder.html    # 오프라인 코스 개설/편집 빌더
│   ├── offline-attendance.html # 수강관리 (출석/수강생)
│   ├── online-builder.html     # 온라인 코스 빌더
│   └── dashboard.html          # 대시보드
├── user/                   # 사용자 페이지
│   ├── home.html           # 홈
│   ├── category.html       # 카테고리 선택
│   ├── course-list.html    # 코스 목록
│   ├── my.html             # MY 페이지
│   ├── course-detail.html      # 코스 상세 (미신청)
│   ├── course-enrolled.html    # 코스 상세 (수강 중)
│   ├── course-completed.html   # 코스 상세 (완료)
│   └── learner-flow.html       # 학습자 플로우
├── reference/              # 기획/참고 페이지
│   ├── plan.html           # 대정책
│   ├── ia-map.html         # 정보 아키텍처 맵
│   ├── cases.html          # 운영 케이스 6종
│   ├── lms-policy.html     # LMS 정책 포털
│   ├── lms-policy-v2.html  # LMS 정책 포털 v2
│   ├── doc.html            # 문서
│   └── demo.html           # 데모
├── docs/                   # 설계 문서
│   ├── vision-2026.md              # LMS Vision 2026 아키텍처 로드맵
│   ├── offline-course-builder.md   # 오프라인 코스 시스템 설계
│   ├── system-analysis.md          # 시스템 구조 분석서
│   ├── gap-report.md               # 기획 갭 리포트 (12개)
│   └── sessions/                   # 세션 기록
│       ├── 2026-04-09-user-pages.md
│       ├── 2026-04-12-blended-cases.md
│       ├── 2026-04-23-online-builder.md
│       └── 2026-04-24-online-builder.md
└── assets/
    ├── PureLightTheme.ts   # Tailwind CSS 테마
    └── images/
        ├── cover.png
        └── qr-dummy.png
```

## 기술 스택

- React 18 (Babel standalone, CDN)
- Tailwind CSS (CDN)
- Lucide React 0.292.0
- 빌드 없는 단일 HTML 파일 구조

## 개발 현황

- Phase 1 오프라인 코스 시스템 설계 완료
- 관리자/사용자 프로토타입 완성
- 온라인 코스 빌더 개발 중
- Phase 3 블렌디드 예정
