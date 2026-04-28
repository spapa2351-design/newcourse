const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('file:///J:/claude/newcourse/admin/offline-builder.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 수료 조건 섹션 찾기
  const section = page.locator('text=수료 조건').first();
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);

  const box = await section.boundingBox();
  console.log('수료 조건 위치:', box);

  // 섹션 전체 높이 파악 — 수료 조건 제목 아래 영역 캡처
  // 좌측 폼 영역(x: ~195, width: ~900)
  const clip = {
    x: 195,
    y: Math.max(0, box.y - 20),
    width: 920,
    height: 500,
  };
  console.log('clip:', clip);

  await page.screenshot({
    path: 'J:/claude/newcourse/screenshots/admin/offline-builder/05_completion_condition.png',
    clip,
  });
  console.log('✓ 05_completion_condition.png 재캡처 완료');

  await browser.close();
})();
