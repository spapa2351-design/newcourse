const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const FILE_URL = 'file:///J:/claude/newcourse/user/course-detail.html';
const OUT = path.join('J:/claude/newcourse/screenshots/course-detail');

async function cap(locator, name) {
  await locator.screenshot({ path: path.join(OUT, name) });
  console.log('✓', name);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1200, height: 920 });
  await page.goto(FILE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  const app = page.locator('.app');

  // ── 1. 코스 상세 · single mode (기본값) ──────────────────
  await cap(app, '01_single_detail.png');

  // ── 2. 수강 신청 모달 열기 (single) ──────────────────────
  await page.evaluate(() => document.getElementById('btn-enroll').click());
  await page.waitForTimeout(500);
  await cap(app, '02_single_modal.png');

  // ── 3. 모달에서 옵션 선택 (single) ───────────────────────
  await page.evaluate(() => {
    const cards = document.querySelectorAll('.modal-opt-card:not(.disabled)');
    if (cards[0]) cards[0].click();
  });
  await page.waitForTimeout(400);
  await cap(app, '03_single_modal_selected.png');

  // ── 4. 신청 확인 화면 (single) ────────────────────────────
  await page.evaluate(() => goConfirm());
  await page.waitForTimeout(400);
  await cap(app, '04_single_confirm.png');

  // ── 5. 코스 상세 · multi mode ─────────────────────────────
  await page.evaluate(() => { goScreen('screen-detail'); switchMode('multi'); });
  await page.waitForTimeout(500);
  await cap(app, '05_multi_detail.png');

  // ── 6. 모달 열고 2개 선택 (multi) ────────────────────────
  await page.evaluate(() => document.getElementById('btn-enroll').click());
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.modal-opt-card:not(.disabled)')];
    if (cards[0]) cards[0].click();
    if (cards[1]) cards[1].click();
  });
  await page.waitForTimeout(400);
  await cap(app, '06_multi_modal_selected.png');

  // ── 7. 신청 확인 화면 (multi) ─────────────────────────────
  await page.evaluate(() => goConfirm());
  await page.waitForTimeout(400);
  await cap(app, '07_multi_confirm.png');

  // ── 8. 코스 상세 · assigned mode ─────────────────────────
  await page.evaluate(() => { goScreen('screen-detail'); switchMode('assigned'); });
  await page.waitForTimeout(500);
  await cap(app, '08_assigned_detail.png');

  // ── 9. 신청 확인 화면 (assigned) ─────────────────────────
  await page.evaluate(() => goConfirm());
  await page.waitForTimeout(400);
  await cap(app, '09_assigned_confirm.png');

  // ── 10. sessionSelect · 날짜 선택 모달 ───────────────────
  await page.evaluate(() => { goScreen('screen-detail'); switchMode('single'); });
  await page.waitForTimeout(400);
  await page.evaluate(() => document.getElementById('btn-enroll').click());
  await page.waitForTimeout(500);
  // s5 (날짜선택형) 카드 클릭
  await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.modal-opt-card:not(.disabled)')];
    const s5 = cards.find(c => c.textContent.includes('날짜 선택형'));
    if (s5) s5.click();
  });
  await page.waitForTimeout(500);
  await cap(app, '10_session_date_picker.png');

  // ── 11. 날짜 선택 후 신청 확인 (sessionSelect) ───────────
  await page.evaluate(() => {
    const items = document.querySelectorAll('.sess-pick-item');
    if (items[0]) items[0].click();
  });
  await page.waitForTimeout(400);
  await page.evaluate(() => goConfirm());
  await page.waitForTimeout(400);
  await cap(app, '11_session_confirm.png');

  // ── 12. 내 수강 내역 탭 ───────────────────────────────────
  await page.evaluate(() => goScreen('screen-my'));
  await page.waitForTimeout(400);
  await cap(app, '12_my_tab.png');

  await browser.close();
  console.log('\n✅ 완료! 저장 위치:', OUT);
}

main().catch(err => { console.error(err); process.exit(1); });
