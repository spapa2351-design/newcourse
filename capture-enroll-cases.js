const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const FILE_URL = 'file:///J:/claude/newcourse/user/course-detail.html';
const OUT = path.join('J:/claude/newcourse/screenshots/enroll-cases');

async function cap(locator, name) {
  await locator.screenshot({ path: path.join(OUT, name) });
  console.log('✓', name);
}

async function resetState(page) {
  await page.evaluate(() => {
    goScreen('screen-detail');
    switchMode('single');
    setMyStatus('none');
    setEnrollSim('enrolling');
    // close sheet if open
    const sheet = document.getElementById('sheet-enroll');
    if (sheet) sheet.classList.remove('open');
  });
  await page.waitForTimeout(300);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1200, height: 920 });
  await page.goto(FILE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);

  const app = page.locator('.app');

  // ════════════════════════════════════════════════════════════
  // A. 코스 상세 화면 — 상태별
  // ════════════════════════════════════════════════════════════

  // A-1. 신청 기간 중 · 단일선택 (기본)
  await resetState(page);
  await cap(app, 'A1_detail_single_enrolling.png');

  // A-2. 신청 오픈 전
  await resetState(page);
  await page.evaluate(() => setEnrollSim('before_open'));
  await page.waitForTimeout(300);
  await cap(app, 'A2_detail_before_open.png');

  // A-3. 신청 마감
  await resetState(page);
  await page.evaluate(() => setEnrollSim('closed'));
  await page.waitForTimeout(300);
  await cap(app, 'A3_detail_closed.png');

  // A-4. 다중선택 모드
  await resetState(page);
  await page.evaluate(() => { switchMode('multi'); });
  await page.waitForTimeout(300);
  await cap(app, 'A4_detail_multi.png');

  // A-5. 관리자 배정 모드
  await resetState(page);
  await page.evaluate(() => { switchMode('assigned'); });
  await page.waitForTimeout(300);
  await cap(app, 'A5_detail_assigned.png');

  // A-6. 수강중 상태
  await resetState(page);
  await page.evaluate(() => { setMyStatus('enrolled'); });
  await page.waitForTimeout(300);
  await cap(app, 'A6_detail_enrolled.png');

  // A-7. 수강 완료 상태
  await resetState(page);
  await page.evaluate(() => { setMyStatus('completed'); });
  await page.waitForTimeout(300);
  await cap(app, 'A7_detail_completed.png');

  // ════════════════════════════════════════════════════════════
  // B. 단일선택 신청 플로우
  // ════════════════════════════════════════════════════════════

  // B-1. 단일선택 모달 (선택 전)
  await resetState(page);
  await page.evaluate(() => openModal());
  await page.waitForTimeout(500);
  await cap(app, 'B1_modal_single_empty.png');

  // B-2. 단일선택 — 반 선택 후
  await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.modal-opt-card:not(.disabled)')];
    if (cards[0]) cards[0].click();
  });
  await page.waitForTimeout(400);
  await cap(app, 'B2_modal_single_selected.png');

  // B-3. 단일선택 신청 확인
  await page.evaluate(() => goConfirm());
  await page.waitForTimeout(400);
  await cap(app, 'B3_confirm_single.png');

  // ════════════════════════════════════════════════════════════
  // C. 다중선택 신청 플로우
  // ════════════════════════════════════════════════════════════

  // C-1. 다중선택 모달 (선택 전)
  await resetState(page);
  await page.evaluate(() => { switchMode('multi'); });
  await page.waitForTimeout(300);
  await page.evaluate(() => openModal());
  await page.waitForTimeout(500);
  await cap(app, 'C1_modal_multi_empty.png');

  // C-2. 다중선택 — 2개 선택 후 (다음 버튼 활성화)
  await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.modal-opt-card:not(.disabled)')];
    if (cards[0]) cards[0].click();
    if (cards[1]) cards[1].click();
  });
  await page.waitForTimeout(400);
  await cap(app, 'C2_modal_multi_selected.png');

  // C-3. 다중선택 신청 확인
  await page.evaluate(() => goConfirm());
  await page.waitForTimeout(400);
  await cap(app, 'C3_confirm_multi.png');

  // ════════════════════════════════════════════════════════════
  // D. 날짜선택형(sessionSelect) 플로우
  // ════════════════════════════════════════════════════════════

  // D-1. 모달 열기 → 날짜선택형 카드 클릭 → 캘린더 표시
  await resetState(page);
  await page.evaluate(() => openModal());
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.modal-opt-card:not(.disabled)')];
    const target = cards.find(c => c.textContent.includes('날짜 선택형'));
    if (target) target.click();
  });
  await page.waitForTimeout(500);
  await cap(app, 'D1_modal_session_calendar.png');

  // D-2. 캘린더에서 날짜 선택 → 회차 리스트 표시
  await page.evaluate(() => {
    // 세션이 있는 날짜 클릭
    const days = [...document.querySelectorAll('.ucal-day.has-sess')];
    if (days[0]) days[0].click();
  });
  await page.waitForTimeout(400);
  await cap(app, 'D2_modal_session_date_picked.png');

  // D-3. 회차 선택 후
  await page.evaluate(() => {
    const items = document.querySelectorAll('.sess-pick-item');
    if (items[0]) items[0].click();
  });
  await page.waitForTimeout(400);
  await cap(app, 'D3_modal_session_time_selected.png');

  // D-4. 날짜선택형 신청 확인
  await page.evaluate(() => goConfirm());
  await page.waitForTimeout(400);
  await cap(app, 'D4_confirm_session.png');

  // ════════════════════════════════════════════════════════════
  // E. 관리자 배정 — 배정 확인 화면
  // ════════════════════════════════════════════════════════════

  await resetState(page);
  await page.evaluate(() => { switchMode('assigned'); });
  await page.waitForTimeout(300);
  await page.evaluate(() => goConfirm());
  await page.waitForTimeout(400);
  await cap(app, 'E1_confirm_assigned.png');

  await browser.close();
  console.log('\n✅ 완료! 저장 위치:', OUT);
}

main().catch(err => { console.error(err); process.exit(1); });
