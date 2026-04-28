const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const CHROMIUM = 'C:/Users/happy/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe';
const ADMIN_DIR = 'J:/claude/newcourse/admin/';
const SS = 'J:/claude/newcourse/screenshots/admin/';

function fileUrl(p) {
  return 'file:///' + p.replace(/\\/g, '/');
}

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

async function waitForReact(page) {
  await page.waitForFunction(
    () => document.querySelector('#root') && document.querySelector('#root').children.length > 0,
    { timeout: 30000 }
  );
  await page.waitForTimeout(2000);
}

// Expand an element into view and return its bounding box with padding
async function getBbox(locator, pad = 0) {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (!box) return null;
  return { x: Math.max(0, box.x - pad), y: Math.max(0, box.y - pad), width: box.width + pad * 2, height: box.height + pad * 2 };
}

async function run() {
  ensureDir(SS + 'offline-builder');

  const browser = await chromium.launch({
    executablePath: CHROMIUM,
    headless: true,
    args: ['--disable-web-security', '--allow-file-access-from-files'],
  });

  const context = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  const page = await context.newPage();

  // ─────────────────────────────────────────────────────────────
  // 1. offline-builder.html
  // ─────────────────────────────────────────────────────────────
  console.log('Opening offline-builder...');
  await page.goto(fileUrl(ADMIN_DIR + 'offline-builder.html'), { waitUntil: 'networkidle', timeout: 60000 });
  await waitForReact(page);

  // ── 04: 강제 할당 설정 상태 ──
  // Section 2 is open by default (s2: true in useState).
  // Just click "관리자가 강제 할당" row which sets isSelfEnroll=false.
  console.log('  → 04_enroll_setting_assign');
  {
    // The row has onClick={() => setIsSelfEnroll(false)} and contains this text
    const forceRow = page.locator('div').filter({ hasText: /^관리자가 강제 할당/ }).first();
    if (await forceRow.isVisible({ timeout: 3000 }).catch(() => false)) {
      await forceRow.click();
      await page.waitForTimeout(800);
      console.log('    clicked 강제 할당');
    } else {
      // Try broader match
      const forceRow2 = page.locator('text=관리자가 강제 할당').first();
      await forceRow2.click();
      await page.waitForTimeout(800);
      console.log('    clicked 강제 할당 (fallback)');
    }

    // Screenshot section 2 element
    const sec2 = page.locator('section').filter({ hasText: '모집 및 수강 신청 설정' }).first();
    if (await sec2.isVisible({ timeout: 2000 }).catch(() => false)) {
      await sec2.scrollIntoViewIfNeeded();
      await sec2.screenshot({ path: SS + 'offline-builder/04_enroll_setting_assign.png' });
      console.log('    saved 04_enroll_setting_assign');
    } else {
      await page.screenshot({ path: SS + 'offline-builder/04_enroll_setting_assign.png' });
      console.log('    saved (full fallback)');
    }
  }

  // ── 07: 그룹 배정 UI (강제 할당 모드, 옵션 카드 내부) ──
  // bg-indigo-50 div inside <aside> that contains "배정 그룹" text
  console.log('  → 07_package_assign_group');
  {
    // The RIGHT panel is the second <aside> (first is the left nav)
    // Capture the entire option card (bg-white border-2 rounded-xl) which contains 배정 그룹
    const box = await page.evaluate(() => {
      const rightAside = document.querySelectorAll('aside')[1];
      if (!rightAside) return null;
      // Look for the option card (bg-white border-2 rounded-xl) that contains 배정 그룹
      for (const el of rightAside.querySelectorAll('div')) {
        if (el.classList.contains('bg-white') && el.classList.contains('border-2') && el.classList.contains('rounded-xl') && el.textContent.includes('배정 그룹')) {
          const b = el.getBoundingClientRect();
          if (b.width > 200 && b.height > 100) return { x: b.x, y: b.y, w: b.width, h: b.height };
        }
      }
      return null;
    });

    if (box) {
      // Capture card header + 배정 그룹 area (top ~220px of the card)
      await page.screenshot({
        path: SS + 'offline-builder/07_package_assign_group.png',
        clip: { x: Math.max(0, box.x - 10), y: Math.max(0, box.y - 10), width: Math.min(box.w + 20, 520), height: Math.min(box.h, 220) }
      });
      console.log('    saved 07_package_assign_group');
    } else {
      // Fallback: screenshot the right aside top portion
      const asideBox = await page.evaluate(() => {
        const el = document.querySelectorAll('aside')[1];
        if (!el) return null;
        const b = el.getBoundingClientRect();
        return { x: b.x, y: b.y, w: b.width, h: b.height };
      });
      if (asideBox) {
        await page.screenshot({
          path: SS + 'offline-builder/07_package_assign_group.png',
          clip: { x: asideBox.x, y: asideBox.y, width: asideBox.w, height: Math.min(asideBox.h, 500) }
        });
        console.log('    saved (right aside fallback)');
      } else {
        console.log('    배정 그룹 NOT FOUND - skipping');
      }
    }
  }

  // ── package_type: 수강 유형 모달 (전체일정형 / 날짜선택형) ──
  console.log('  → package_type_default');
  {
    // The type pill button shows "전체일정" (default, sessionSelect=false)
    const typeBtn = page.locator('button').filter({ hasText: '전체일정' }).first();
    if (await typeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await typeBtn.click();
      await page.waitForTimeout(600);

      // Modal inner card — look for "수강 유형" heading
      const modalCard = page.locator('div.bg-white.rounded-2xl').filter({ hasText: '수강 유형' }).first();
      if (await modalCard.isVisible({ timeout: 2000 }).catch(() => false)) {
        await modalCard.screenshot({ path: SS + 'offline-builder/package_type_default.png' });
        console.log('    saved package_type_default');

        // Button text inside modal is "날짜 선택형" (with space)
        const sessionBtn = modalCard.locator('button').filter({ hasText: '날짜 선택형' }).first();
        if (await sessionBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
          await sessionBtn.click();
          await page.waitForTimeout(600);
          console.log('    switched to 날짜 선택형');
        } else {
          // Close by clicking backdrop (top-left corner is outside modal card)
          await page.mouse.click(50, 50);
          await page.waitForTimeout(400);
        }
      } else {
        // Force close via JS
        await page.evaluate(() => { document.querySelector('div.fixed')?.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
        await page.waitForTimeout(400);
        console.log('    modal card not found');
      }
    } else {
      console.log('    type button not found');
    }
  }

  console.log('  → package_type_session');
  {
    // After clicking 날짜 선택형, pill shows "날짜선택형", open modal again
    await page.waitForTimeout(300);
    const typeBtn = page.locator('button').filter({ hasText: '날짜선택형' }).first();
    if (await typeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await typeBtn.click();
      await page.waitForTimeout(600);

      const modalCard = page.locator('div.bg-white.rounded-2xl').filter({ hasText: '수강 유형' }).first();
      if (await modalCard.isVisible({ timeout: 2000 }).catch(() => false)) {
        await modalCard.screenshot({ path: SS + 'offline-builder/package_type_session.png' });
        console.log('    saved package_type_session');
        // Close by clicking backdrop
        await page.mouse.click(50, 50);
        await page.waitForTimeout(500);
      } else {
        console.log('    modal card not found for package_type_session');
      }
    } else {
      console.log('    날짜선택형 pill button not found');
    }
  }

  // ── 08: 회차 일괄 생성 UI ──
  console.log('  → 08_session_bulk_create');
  {
    // Force close any open modal via JS before attempting click
    const modalOpen = await page.evaluate(() => !!document.querySelector('div.fixed[class*="z-\\\\[110\\\\]"], div.fixed[class*="z-[110]"]'));
    if (modalOpen) {
      await page.evaluate(() => {
        const fixed = document.querySelector('div.fixed');
        if (fixed) fixed.click();
      });
      await page.waitForTimeout(400);
    }

    const wandBtn = page.locator('[title="회차 일괄 생성"]').first();
    if (await wandBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await wandBtn.click();
      await page.waitForTimeout(800);

      // The batch form is rendered inside the option card as "진행 기간" form
      const batchForm = page.locator('div').filter({ hasText: '진행 기간' }).filter({ has: page.locator('input[type="date"]') }).first();
      if (await batchForm.isVisible({ timeout: 2000 }).catch(() => false)) {
        await batchForm.scrollIntoViewIfNeeded();
        await batchForm.screenshot({ path: SS + 'offline-builder/08_session_bulk_create.png' });
        console.log('    saved 08_session_bulk_create');
      } else {
        // Fallback: screenshot the whole option card
        const optCard = page.locator('text=일정 자동 채우기').first();
        if (await optCard.isVisible({ timeout: 2000 }).catch(() => false)) {
          const parent = optCard.locator('../../..');
          const box = await parent.boundingBox().catch(() => null);
          if (box) {
            await page.screenshot({
              path: SS + 'offline-builder/08_session_bulk_create.png',
              clip: { x: Math.max(0, box.x - 5), y: Math.max(0, box.y - 5), width: Math.min(box.width + 10, 700), height: box.height + 10 }
            });
            console.log('    saved (parent card)');
          } else {
            await page.screenshot({ path: SS + 'offline-builder/08_session_bulk_create.png' });
            console.log('    saved (page fallback)');
          }
        } else {
          await page.screenshot({ path: SS + 'offline-builder/08_session_bulk_create.png' });
          console.log('    saved (full page fallback)');
        }
      }
    } else {
      console.log('    Wand2 button not found');
    }
  }

  await browser.close();

  // Done sound
  const { execSync } = require('child_process');
  try {
    execSync('powershell -Command "[console]::beep(880,200); Start-Sleep -Milliseconds 100; [console]::beep(1047,200); Start-Sleep -Milliseconds 100; [console]::beep(1319,300)"', { stdio: 'ignore' });
  } catch (_) {}

  console.log('\nDone!');
}

run().catch(e => { console.error(e); process.exit(1); });
