---
feature: content-library
phase: plan
status: draft
created: 2026-05-19
approach: 디디쌤 라이브러리 차용 + 멀티테넌트 v2 분리
---

# 콘텐츠 라이브러리 — 기획 Plan

## Executive Summary

| 관점 | 내용 |
|---|---|
| **Problem** | Touchclass는 콘텐츠 타입별로 라이브러리가 분리(영상/시험/설문) → 운영자가 매번 4번 진입. 빌더에서 만든 콘텐츠가 재사용되지 않아 중복 업로드. |
| **Solution** | 단일 라이브러리 + 2-way 등록(라이브러리 직접 업로드 / 빌더 자동 적재) + 사용처 추적 + 삭제 가드 |
| **Core Value** | "한 번 올린 영상·자료를 모든 코스에서 재사용. 어디서 쓰이는지 한눈에." |

## 한 줄 룰

> **"콘텐츠는 라이브러리에 한 번만 존재하고, 코스는 라이브러리 항목을 참조한다."**

### 5가지 이유

1. **재사용성** — 같은 영상을 N개 코스에서 참조. 저장·운영 1배.
2. **단일 진입** — 운영자가 콘텐츠 관리할 때 한 곳만 들어가면 됨.
3. **추적 가능** — "이 영상 어디서 쓰이나" 라이브러리에서 즉시 확인.
4. **안전한 삭제** — 사용 중 콘텐츠는 자동 차단 → 깨진 코스 방지.
5. **양방향 등록** — 라이브러리 직접 업로드 또는 빌더 안에서 업로드 시 자동 적재.

## 1차 vs v2 분리

### 1차 (단일 tenant)

| 영역 | 내용 |
|---|---|
| 콘텐츠 타입 | 영상·PDF만 (시험·설문은 별도 기능 후속) |
| 등록 흐름 | 라이브러리 직접 업로드 + 빌더 자동 적재 (2-way) |
| 진입 | 관리자 좌측 [콘텐츠 라이브러리] 신설 |
| 검색·필터 | 텍스트 + 타입 칩(영상/PDF) + 정렬(등록일·이름·사용 빈도) |
| 분류 | 없음 (카테고리·태그·폴더 미도입) |
| 사용처 추적 | 카드에 "사용 코스 N개" 칩 + 클릭 시 사용처 리스트 모달 |
| 삭제 가드 | 사용 중이면 차단 + 사용처 안내 다이얼로그 |
| 편집 | 메타(이름·설명·썸네일)만 라이브러리에서. 본문은 빌더 안 |
| 코스 전용 비공개 | v2. 1차는 다 공용 |
| 권한 | 단일 tenant 조직 공용 |

### v2 (멀티테넌트 마스터)

| 영역 | 내용 |
|---|---|
| Master Library | 슈퍼관리자 전용 카탈로그, 별도 화면 |
| 푸시 방식 | **레퍼런스 디폴트 + 명시적 fork** |
| Tenant 배지 | "공용(중앙)" / "내 콘텐츠" / "내가 fork" 3종 |
| Master 업데이트 시 | 영향 tenant 알림. 학습 중 학습자는 시작 시점 버전 freeze |
| 회수(라이센스 만료) | reference 락 + 신규 차단 + grace period |
| Fork | 비가역. master 동기화 끊김 명시 |
| 카테고리·태그 | master 카탈로그 커지면 도입 검토 |

## 데이터 모델

```
LibraryItem {
  id, type: 'video' | 'pdf',
  title, description,
  thumbnailUrl, fileUrl,
  meta: {
    duration?: string,  // video: '30:00'
    pages?: number,     // pdf: 18
    sizeMB?: number,
  },
  uploadedAt, uploadedBy,
  source: 'tenant_upload' | 'builder_auto',  // v2: + 'master_ref' | 'master_fork'
  master_ref_id: null,    // v2: master 출처
  is_fork: false,         // v2: fork 시 master 동기화 끊김
  frozen_version: null,   // v2: 학습자 freeze 시 master version
}
```

> **1차 schema에 source/master_ref_id/is_fork/frozen_version 필드 미리 박기.** v2 마이그레이션 0건.

## 사용처 추적 (Reverse Index)

```
LibraryItem.usedIn = [{ courseId, courseName, chapterId, slotId }, ...]
```

빌더에서 slot 추가/삭제 시 양방향 업데이트. 사용 코스 N개 = `usedIn.length`.

## 삭제 정책

| 상태 | 동작 |
|---|---|
| 사용 X | [삭제] 버튼 활성, 확인 다이얼로그 후 즉시 삭제 |
| 사용 중 | [삭제] 버튼 차단. 호버 시 "사용 중인 코스 N개" 안내. 사용처 리스트 모달 |

## UI 구조

### 진입
관리자 좌측 사이드바 → [콘텐츠 라이브러리] (메뉴 신설)

### 페이지 레이아웃 (admin/offline-list.html 셸 동일)
```
┌─────────────────────────────────────────────┐
│ TOP NAV (52px)                              │
├──────────┬──────────────────────────────────┤
│ SIDEBAR  │  페이지 타이틀: 콘텐츠 라이브러리  │
│ (200px)  │  ─────────────────────────────   │
│          │  [검색바] [영상|PDF|전체] [정렬]   │
│ ...      │  [+ 업로드]                       │
│ [콘텐츠] │                                   │
│  라이브러리│  ┌─ 카드 그리드 ──────────────┐ │
│  ← active│  │ [영상 카드] [PDF 카드] ...  │ │
│          │  │  썸네일 / 제목 / 메타       │ │
│ ...      │  │  📅 등록일 · 🔗 N개 사용중   │ │
│          │  └────────────────────────────┘ │
└──────────┴──────────────────────────────────┘
```

### 카드 인터랙션
- 카드 클릭 → 상세 모달 (썸네일 큼 + 메타 편집 + 사용처 리스트)
- 호버 액션: [미리보기][편집][사용처][삭제(가드)]

### 업로드 흐름
1. [+ 업로드] 클릭 → 모달
2. 영상 / PDF 타입 선택
3. 파일 드래그&드롭 또는 클릭 업로드
4. 메타 입력 (제목·설명)
5. 라이브러리 카드 그리드에 즉시 추가

### 빌더 연동
- 빌더 AddItemModal "라이브러리에서 가져오기" → 같은 데이터셋의 그리드
- 빌더 "직접 업로드" → 새 콘텐츠를 라이브러리 + 코스 slot 동시 생성 (`source: 'builder_auto'`)

## Pre-mortem (v2 실패 시나리오)

1. **고객사 콘텐츠 사고**: tenant가 자기 콘텐츠 비활성 가능. master 본체 영향 없음.
2. **Master 갱신 → 학습 중 학습자 영향**: 학습자별 등록 시점 버전 freeze. 신규부터 새 버전.
3. **고객사 이탈**: tenant fork 콘텐츠만 export, master reference 자동 제거.
4. **라이센스 분쟁**: master 회수 플래그 + grace 정책 + 로그 추적.

## 구현 우선순위

1. 1차 schema 확정 (LibraryItem 필드, usedIn 역인덱스)
2. `admin/content-library.html` 신규 페이지 (index.html 셸)
3. 영상·PDF 카드 그리드 + 검색·필터·정렬
4. 업로드 모달
5. 카드 클릭 상세 모달 (메타 편집 + 사용처)
6. 삭제 가드
7. 빌더 연동 (LIBRARY_ITEMS 공유 데이터 ref)
8. (v2) Master Library + reference/fork

## 관련 문서

- 코스 빌더: `docs/01-plan/features/online-builder.plan.md`
- 디자인 가이드: `docs/02-design/features/online-builder.design.md` (라이브러리 카드 그리드 패턴 차용)
- 운영팀 용어: `docs/00-standard/legacy-course-manual.md`
