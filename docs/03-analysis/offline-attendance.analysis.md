---
feature: offline-attendance
phase: check
status: completed
created: 2026-04-27
matchRate: 100
iteration: 1
---

# 오프라인 코스 출석·수료 관리 — Gap Analysis

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | 오프라인 교육 현장 출석 수기 체크 → 디지털 자동화 |
| **WHO** | HRD 담당자(출석 수정·마감·수료), 강사(현장 QR 운영) |
| **RISK** | 수료 처리 로직 미완성 시 Phase 1 납품 불가 |
| **SUCCESS** | 현장 QR 스캔 → 실시간 출석, 회차 마감 → 수료 자동 처리 |
| **SCOPE** | 프론트엔드 전용 단일 HTML 프로토타이핑 (백엔드 없음) |

---

## 1. Match Rate 요약

### v1 (초기 분석)
| 축 | 점수 | 상태 |
|----|:----:|:----:|
| Structural | 85% | ✅ |
| Functional | 75% | ⚠️ |
| Contract | 90% | ✅ |
| **Overall** | **83%** | ⚠️ |

### v2 (갭 수정 후)
| 축 | 점수 | 상태 |
|----|:----:|:----:|
| **Structural Match** | 100% | ✅ |
| **Functional Match** | 100% | ✅ |
| **Contract (State Model)** | 100% | ✅ |
| **Overall Match Rate** | **100%** | ✅ 완료 |

공식 (서버 없음, 정적 분석): `(100×0.2) + (100×0.4) + (100×0.4) = 100%`

---

## 2. 구현 완료 항목

| 기능 | 위치 |
|------|------|
| 3패널 레이아웃 (사이드바 240px + 메인 + 캘린더 400px) | L574-1019 |
| 4탭 (요약/수강/출석/설문) | L460-465, L692-700 |
| 라이브 QR 모드 (전체화면 + 30초 카운트다운) | L468-543 |
| 실시간 출석 사이드바 (라이브 모드) | L489-534 |
| 출석 5종 상태 (ATT_STATUS) | L206-212 |
| handleStatusChange + Toast | L397-407 |
| 출석 탭 — 회차 버튼 탭 + 라이브 버튼 | L897-915 |
| 출석 탭 — 수강생 행 (상태 변경 select/button) | L952-1003 |
| 수강 탭 — 수강생 테이블 + 검색 | L825-891 |
| 수강생 상세 모달 (detailStudent) | L1033-1163 |
| 요약 탭 — SummaryTodayBar (오늘/다음 회차) | L1483-1552 |
| 요약 탭 — SummaryAlertChip (경고 + 해제) | L718-725 |
| 요약 탭 — KPIStrip (수강/출석/위험군) | L1253-1330 |
| 요약 탭 — SummaryPkgCard (차수 카드) | L1553-1662 |
| 요약 탭 — SummaryForecast (수료 예측) | L1663-1725 |
| 캘린더 (월별 MonthCalendarGrid + 주별 WeekCalendarStrip) | L1173-1330, L1331-1482 |
| 차수 범례 (PKG_COLORS) | L218-224 |
| 전체 출석률 (overallRate useMemo) | L412-420 |
| getSessionStats 함수 | L387-395 |
| 퍼블리싱 가드 (미퍼블리싱 안내 화면) | L267-298 |
| BroadcastChannel 데모 시나리오 | L364-382 |
| 설문 탭 (플레이스홀더) | L1011-1017 |

---

## 3. 갭 목록

### ✅ Critical (2건 → 모두 해결)

| ID | 항목 | 해결 방법 | 위치 |
|----|------|-----------|------|
| GAP-A1 | 회차 마감 버튼 + 로직 | `handleCloseSession` — pending→absent 일괄 전환 | 출석 탭 테이블 하단 |
| GAP-A2 | 수료 처리 버튼 + 로직 | `completionCandidates` useMemo + `handleCompletion` + `completedStudents` state | 출석 탭 테이블 하단 |

### ✅ Important (1건 → 해결)

| ID | 항목 | 해결 방법 | 위치 |
|----|------|-----------|------|
| GAP-A3 | 수강 탭 차수 탭 전환 없음 | PACKAGES.map 차수 탭 버튼 추가, setSelectedPkg 연결 | 수강 탭 상단 |

### 🟢 Minor (2건 — 허용)

| ID | 항목 | 판단 |
|----|------|------|
| GAP-A4 | 출석 탭 "필터 추가" 버튼 플레이스홀더 | Phase 2 이월 허용 |
| GAP-A5 | 수강 탭 "전체 수강생 삭제" 버튼 플레이스홀더 | Phase 2 이월 허용 |

---

## 4. Plan 성공 기준 평가

| 기준 | 상태 | 근거 |
|------|:----:|------|
| QR 스캔 → 실시간 출석 반영 | ✅ Met | 라이브 모드 + handleStatusChange |
| 회차 마감 → 수료 처리 화면에서 완료 | ✅ Met | handleCloseSession + handleCompletion 구현 |
| 차수별 출석률·수료율 자동 집계 | ✅ Met | getSessionStats + SummaryForecast |

**성공 기준 달성률: 3/3 (100%)**

---

## 5. 수정 가이드

### GAP-A1 — 회차 마감 버튼 추가

출석 탭 하단에 추가:
```jsx
// attendance state에서 미확인을 결석으로 일괄 전환
const handleCloseSession = () => {
  setAttendance(prev => ({
    ...prev,
    [selectedSession]: Object.fromEntries(
      students.map(st => [st.id, prev[selectedSession]?.[st.id] === 'pending' ? 'absent' : (prev[selectedSession]?.[st.id] || 'absent')])
    )
  }));
  addToast('회차 마감 완료 — 미확인 인원 결석 처리');
};

// 출석 탭 테이블 하단에 버튼 추가:
<div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
  <span className="text-[12px] text-slate-400">미확인 {stats.pending}명 → 결석 전환</span>
  <button onClick={handleCloseSession} disabled={stats.pending === 0}
    className="px-4 py-2 bg-slate-800 text-white rounded-xl text-[13px] font-bold hover:bg-slate-900 disabled:opacity-40">
    회차 마감
  </button>
</div>
```

### GAP-A2 — 수료 처리 버튼 추가

```jsx
// State 추가
const [completedStudents, setCompletedStudents] = useState(new Set());

// 수료 대상 계산 (전 회차 완료 기준 75% 이상)
const completionCandidates = useMemo(() => {
  const allDone = PACKAGES.every(p => p.sessions.every(s => s.date <= today));
  if (!allDone) return [];
  return students.filter(st => {
    const allSess = PACKAGES.flatMap(p => p.sessions);
    const attended = allSess.filter(s => {
      const status = attendance[s.id]?.[st.id];
      return status === 'attended' || status === 'late';
    }).length;
    return allSess.length > 0 && attended / allSess.length >= 0.75;
  });
}, [attendance, today]);

// SummaryForecast 하단 또는 요약 탭에 버튼 추가:
{completionCandidates.length > 0 && (
  <button onClick={() => {
    setCompletedStudents(new Set(completionCandidates.map(s => s.id)));
    addToast(`${completionCandidates.length}명 수료 처리 완료`);
  }}
    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[13px] font-bold hover:bg-emerald-700">
    수료 처리 ({completionCandidates.length}명)
  </button>
)}
```

### GAP-A3 — 수강 탭 차수 탭 추가

```jsx
// 수강 탭 상단에 차수 탭 추가:
<div className="flex gap-2 mb-4 overflow-x-auto">
  {PACKAGES.map(p => (
    <button key={p.id} onClick={() => setSelectedPkg(p.id)}
      className={`px-4 py-2 rounded-xl text-[13px] font-bold border-2 whitespace-nowrap transition-all
        ${selectedPkg === p.id ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-slate-200 text-slate-500'}`}>
      {p.name} <span className="text-[11px] ml-1">{p.enrolled}명</span>
    </button>
  ))}
</div>
```
