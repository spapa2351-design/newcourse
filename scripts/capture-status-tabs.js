const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('file:///J:/claude/newcourse/admin/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 탭: x:432 y:135 ~ x:962 / 검색: y:193~227
  const clip = { x: 416, y: 118, width: 570, height: 128 };
  await page.screenshot({
    path: 'J:/claude/newcourse/screenshots/admin/course-list/02_status_tabs.png',
    clip,
  });
  console.log('✓ 02_status_tabs.png 재캡처 완료');

  await browser.close();
})();
