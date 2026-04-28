const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('file:///J:/claude/newcourse/admin/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 첫 번째 행의 ChevronRight 버튼 클릭 (차수 확장)
  // 테이블 내 두 번째 td의 button
  const expandBtn = page.locator('tbody tr').first().locator('button').first();
  await expandBtn.click();
  await page.waitForTimeout(600);

  await page.screenshot({ path: 'J:/claude/newcourse/screenshots/admin/course-list/03_expand_row.png' });
  console.log('✅ 차수 확장 행 캡처 완료');

  await browser.close();
})();
