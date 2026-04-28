const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = 'file:///J:/claude/newcourse/admin/';
const OUT  = 'J:/claude/newcourse/screenshots/admin/';
const W = 1920, H = 1080;

async function shot(page, outRel, clip) {
  const outPath = path.join(OUT, outRel);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const opts = clip ? { clip } : {};
  await page.screenshot({ path: outPath, ...opts });
  console.log(`   ✅ ${outRel}`);
}

async function goto(page, file) {
  await page.goto(BASE + file, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1200);
}

// exact: true prevents ':has-text' substring collisions (e.g. '출석' matching '출석 체크')
async function clickTab(page, labelText) {
  const btn = page.getByRole('button', { name: labelText, exact: true }).first();
  await btn.waitFor({ timeout: 5000 });
  await btn.click();
  await page.waitForTimeout(600);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ locale: 'ko-KR' });

  // ── 1. 코스 목록 (index.html) ──────────────────────────────
  console.log('\n📂 코스 목록');
  {
    const page = await ctx.newPage();
    await page.setViewportSize({ width: W, height: H });
    await goto(page, 'index.html');

    await shot(page, 'course-list/01_list_default.png');
    await shot(page, 'course-list/02_status_tabs.png', { x: 380, y: 80, width: 700, height: 56 });

    const expandBtn = page.locator('tbody tr').first().locator('button').first();
    await expandBtn.click();
    await page.waitForTimeout(500);
    await shot(page, 'course-list/03_expand_row.png');

    await page.close();
  }

  // ── 2. 오프라인 빌더 (offline-builder.html) ────────────────
  console.log('\n📂 오프라인 빌더');
  {
    const page = await ctx.newPage();
    await page.setViewportSize({ width: W, height: H });
    await goto(page, 'offline-builder.html');

    await shot(page, 'offline-builder/01_builder_overview.png');
    await shot(page, 'offline-builder/02_basic_info.png', { x: 195, y: 56, width: 900, height: 900 });

    await page.evaluate(() => window.scrollTo({ top: 950, behavior: 'instant' }));
    await page.waitForTimeout(300);
    await shot(page, 'offline-builder/03_enroll_setting_self.png', { x: 195, y: 0, width: 900, height: 900 });

    await page.evaluate(() => window.scrollTo({ top: 1900, behavior: 'instant' }));
    await page.waitForTimeout(300);
    await shot(page, 'offline-builder/05_completion_condition.png', { x: 195, y: 0, width: 900, height: 600 });

    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(300);
    await shot(page, 'offline-builder/06_package_sidebar.png', { x: 1105, y: 56, width: 815, height: 950 });

    await page.close();
  }

  // ── 3. 코스 운영 현황 (offline-course-view.html) ───────────
  console.log('\n📂 코스 운영 현황');
  {
    const page = await ctx.newPage();
    await page.setViewportSize({ width: W, height: H });
    await goto(page, 'offline-course-view.html');

    // 대시보드 탭 (기본값)
    await shot(page, 'course-view/01_dashboard_overview.png');

    // 수강생 현황 탭
    await clickTab(page, '수강생 현황');
    await shot(page, 'course-view/02_students_tab.png');

    // 출석 관리 탭
    await clickTab(page, '출석 관리');
    await shot(page, 'course-view/03_attendance_tab.png');

    // QR 라이브 모드 — 대시보드 탭의 'QR 출석 시작' 버튼
    await clickTab(page, '대시보드');
    await page.waitForTimeout(400);
    const liveBtn = page.locator('button').filter({ hasText: 'QR 출석 시작' }).first();
    if (await liveBtn.isVisible()) {
      await liveBtn.click();
      await page.waitForTimeout(1000);
      await shot(page, 'course-view/04_qr_live.png');
    } else {
      // 차수 캘린더에서 QR 출석 버튼 시도
      const liveBtn2 = page.locator('button').filter({ hasText: '라이브 출석' }).first();
      if (await liveBtn2.isVisible()) { await liveBtn2.click(); await page.waitForTimeout(1000); }
      await shot(page, 'course-view/04_qr_live.png');
    }

    await page.close();
  }

  // ── 4. 수강생 등록 (offline-course-view.html 재활용) ──────────
  console.log('\n📂 수강생 등록');
  {
    const page = await ctx.newPage();
    await page.setViewportSize({ width: W, height: H });
    await goto(page, 'offline-course-view.html');

    // 수강생 탭으로 이동
    await clickTab(page, '수강생 현황');
    await shot(page, 'course-learners/01_learners_overview.png');

    // 출석 명단 모달 열기 — 첫번째 명단 버튼
    const attModalBtn = page.locator('button').filter({ hasText: '명단' }).first();
    if (await attModalBtn.isVisible()) {
      await attModalBtn.click();
      await page.waitForTimeout(600);
      await shot(page, 'course-learners/02_enroll_modal.png');
    } else {
      await shot(page, 'course-learners/02_enroll_modal.png');
    }

    await page.close();
  }

  await browser.close();
  console.log('\n🎉 전체 캡처 완료!');
})();
