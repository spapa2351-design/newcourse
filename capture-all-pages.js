const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = 'file:///J:/claude/newcourse/user/';
const OUT_BASE = 'J:/claude/newcourse/screenshots';

async function cap(locator, dir, name) {
  const out = path.join(OUT_BASE, dir);
  fs.mkdirSync(out, { recursive: true });
  await locator.screenshot({ path: path.join(out, name) });
  console.log('✓', dir + '/' + name);
}

async function capPage(browser, url, dir, captures) {
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1200, height: 920 });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  const app = page.locator('.app').first();
  for (const [name, fn] of captures) {
    if (fn) await fn(page);
    await page.waitForTimeout(400);
    await cap(app, dir, name);
  }
  await page.close();
}

async function main() {
  const browser = await chromium.launch();

  // ── home.html ─────────────────────────────────────────────
  await capPage(browser, BASE + 'home.html', 'home', [
    ['01_home_default.png', null],
  ]);

  // ── course-list.html ──────────────────────────────────────
  await capPage(browser, BASE + 'course-list.html', 'course-list', [
    ['01_list_default.png', null],
  ]);

  // ── course-enrolled.html ──────────────────────────────────
  await capPage(browser, BASE + 'course-enrolled.html', 'course-enrolled', [
    ['01_enrolled_default.png', null],
    ['02_enrolled_today.png', async (page) => {
      // timeSim을 today로 변경하는 라디오가 있으면 클릭
      const todayBtn = page.locator('input[value="today"], input[value="ing"]').first();
      if (await todayBtn.count() > 0) await todayBtn.click();
    }],
  ]);

  // ── course-completed.html ─────────────────────────────────
  await capPage(browser, BASE + 'course-completed.html', 'course-completed', [
    ['01_completed_default.png', null],
  ]);

  // ── my.html ───────────────────────────────────────────────
  await capPage(browser, BASE + 'my.html', 'my', [
    ['01_my_default.png', null],
  ]);

  await browser.close();
  console.log('\n✅ 전체 캡처 완료!');
}

main().catch(err => { console.error(err); process.exit(1); });
