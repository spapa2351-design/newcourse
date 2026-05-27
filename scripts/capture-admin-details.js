// admin/*.html detail 캡처 — 토글·모달·탭 상태별 element-level screenshot
// 출력: screenshots/admin/<page>/<state>.png
//
// 실행: node scripts/capture-admin-details.js

const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const CHROMIUM = 'C:/Users/happy/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe';
const ADMIN_DIR = 'J:/claude/newcourse/admin/';
const SS = 'J:/claude/newcourse/screenshots/admin/';

function fileUrl(p) { return 'file:///' + p.replace(/\\/g, '/'); }
function ensureDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }

async function waitReact(page) {
  try {
    await page.waitForFunction(
      () => document.querySelector('#root') && document.querySelector('#root').children.length > 0,
      { timeout: 15000 }
    );
  } catch (e) {}
  await page.waitForTimeout(2500);
}

async function snapEl(page, selector, outPath) {
  const el = await page.locator(selector).first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await el.screenshot({ path: outPath });
  console.log(`  ✓ ${outPath}`);
}

async function snapClip(page, clip, outPath) {
  await page.screenshot({ path: outPath, clip });
  console.log(`  ✓ ${outPath}`);
}

// ───────────────────────── offline-builder ─────────────────────────
async function captureOfflineBuilder(page) {
  const url = fileUrl(ADMIN_DIR + 'offline-builder.html');
  const out = SS + 'offline-builder/';
  ensureDir(out);
  console.log('[offline-builder]');
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await waitReact(page);

  // 02 기본 정보 섹션 (step-info)
  await snapEl(page, '#step-info', out + '02_basic_info.png');

  // 03 자율 수강 (기본 상태가 자율 ON일 듯)
  // 자율 토글이 OFF면 ON으로 만들기
  await page.locator('#step-register').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  // 자율 영역이 펼쳐져 있는지 확인 (자율 텍스트 옆 toggle 체크 어려우니 클릭 후 expand 확인)
  const selfRow = page.locator('text=회원이 직접 신청 (자율 수강)').first();
  await selfRow.click();
  await page.waitForTimeout(600);
  // 펼쳐졌으면 다시 클릭하면 닫힘 — 자율 영역의 "취소 · 일정 변경 정책" 텍스트 보이는지로 확인
  const policyVisible = await page.locator('text=취소 · 일정 변경 정책').isVisible().catch(() => false);
  if (!policyVisible) {
    await selfRow.click();
    await page.waitForTimeout(600);
  }
  await snapEl(page, '#step-register', out + '03_enroll_setting_self.png');

  // 04 강제 할당
  await page.locator('text=관리자가 강제 할당 (기수/반 단위)').first().click();
  await page.waitForTimeout(600);
  await snapEl(page, '#step-register', out + '04_enroll_setting_assign.png');

  // 05 수료 조건
  await snapEl(page, '#step-completion', out + '05_completion_condition.png');

  // 06 차수 사이드바 (우측 패널)
  // 우측 사이드바를 잡는 selector — text "차수·회차 관리" 또는 "새 차수 추가" 버튼 기반
  const sidebar = page.locator('text=차수 · 회차 관리').locator('xpath=ancestor::aside').first();
  const sidebarExists = await sidebar.count();
  if (sidebarExists) {
    await sidebar.screenshot({ path: out + '06_package_sidebar.png' });
    console.log(`  ✓ ${out}06_package_sidebar.png`);
  } else {
    // fallback: 우측 절반 클립
    const vw = await page.viewportSize();
    await snapClip(page, { x: vw.width * 0.65, y: 80, width: vw.width * 0.34, height: vw.height - 100 }, out + '06_package_sidebar.png');
  }

  // 07 그룹 배정 (강제 할당 모드 + 차수 카드 펼침)
  // 강제 모드는 이미 켰음 → 첫 차수 카드의 "배정 그룹" 영역이 보일 것
  const groupArea = page.locator('text=배정 그룹').first();
  if (await groupArea.count()) {
    const card = groupArea.locator('xpath=ancestor::div[contains(@class,"rounded-xl")][1]');
    await card.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await card.screenshot({ path: out + '07_package_assign_group.png' });
    console.log(`  ✓ ${out}07_package_assign_group.png`);
  } else {
    console.log('  ⚠ 배정 그룹 영역 못 찾음 — 07 스킵');
  }

  // 08 회차 일괄 생성 (마법봉 클릭)
  // 자율 모드로 되돌려서 차수 카드 펼침 확인
  await page.locator('text=회원이 직접 신청 (자율 수강)').first().click();
  await page.waitForTimeout(500);
  const wand = page.locator('[title="회차 일괄 생성"]').first();
  if (await wand.count()) {
    await wand.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await wand.click();
    await page.waitForTimeout(700);
    // 마법봉 폼은 차수 카드 내부에 펼쳐짐 — "일정 자동 채우기" 버튼이 보일 때까지 대기
    const batchForm = page.locator('text=일정 자동 채우기').first();
    if (await batchForm.count()) {
      const card = batchForm.locator('xpath=ancestor::div[contains(@class,"animate-fadeIn")][1]');
      await card.screenshot({ path: out + '08_session_bulk_create.png' });
      console.log(`  ✓ ${out}08_session_bulk_create.png`);
    } else {
      console.log('  ⚠ 일괄 생성 폼 못 찾음');
    }
  } else {
    console.log('  ⚠ 마법봉 버튼 못 찾음 — 08 스킵');
  }

  // package_type_default / package_type_session: 차수 카드 캡처 (button 토글로 전환)
  // 차수 카드는 우측 사이드바 안에 있고, 카드 자체에 "전체일정"/"날짜선택형" 토글 버튼이 있음
  const typeBtn = page.locator('button').filter({ hasText: /^전체일정$|^날짜선택형$/ }).first();
  if (await typeBtn.count()) {
    // 카드(button의 가장 가까운 카드 ancestor) 잡기
    // 차수 카드 root: bg-slate-800 또는 비슷한 어두운 배경 + rounded
    // 우측 사이드바 안 차수 카드는 id 또는 클래스로 정확히 잡히지 않음 → 텍스트 "새 차수" 또는 "1차수" + 카드 wrap
    const cardWrap = typeBtn.locator('xpath=ancestor::div[contains(@class,"bg-slate-800") or contains(@class,"rounded-xl")][1]');
    await cardWrap.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await cardWrap.screenshot({ path: out + 'package_type_default.png' });
    console.log(`  ✓ ${out}package_type_default.png`);
    // 토글 — 현재 상태 확인 후 클릭
    const isDefault = await typeBtn.textContent();
    await typeBtn.click();
    await page.waitForTimeout(700);
    const cardWrap2 = page.locator('button').filter({ hasText: /^전체일정$|^날짜선택형$/ }).first()
      .locator('xpath=ancestor::div[contains(@class,"bg-slate-800") or contains(@class,"rounded-xl")][1]');
    await cardWrap2.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await cardWrap2.screenshot({ path: out + 'package_type_session.png' });
    console.log(`  ✓ ${out}package_type_session.png  (이전 상태: ${isDefault})`);
  } else {
    console.log('  ⚠ 전체일정/날짜선택형 버튼 못 찾음 — package_type_* 스킵');
  }
}

// ───────────────────────── offline-list ─────────────────────────
async function captureOfflineList(page) {
  const url = fileUrl(ADMIN_DIR + 'offline-list.html');
  const out = SS + 'offline-list/';
  ensureDir(out);
  console.log('[offline-list]');
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await waitReact(page);

  // 03 차수 확장 행 — A1-07 셀 안 ChevronRight 버튼 (첫 행)
  const expandTrigger = page.locator('[data-feature-id="A1-07"] button').first();
  if (await expandTrigger.count()) {
    await expandTrigger.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await expandTrigger.click();
    await page.waitForTimeout(700);
    // 펼친 후 페이지 스크린샷 (위쪽 헤더 + 펼친 행이 포함되도록 fullPage)
    await page.screenshot({ path: out + 'expand_row.png', fullPage: true });
    console.log(`  ✓ ${out}expand_row.png`);
  } else {
    console.log('  ⚠ 차수 배지 버튼 못 찾음 — expand_row 스킵');
  }
}

// ───────────────────────── offline-view ─────────────────────────
async function captureOfflineView(page) {
  const url = fileUrl(ADMIN_DIR + 'offline-view.html');
  const out = SS + 'offline-view/';
  ensureDir(out);
  console.log('[offline-view]');
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await waitReact(page);

  // 수강생 현황 탭
  const rosterTab = page.locator('button:has-text("수강생 현황")').first();
  if (await rosterTab.count()) {
    await rosterTab.click();
    await page.waitForTimeout(700);
    await page.screenshot({ path: out + 'tab_roster.png', fullPage: true });
    console.log(`  ✓ ${out}tab_roster.png`);
  }

  // 출석 관리 탭
  const attTab = page.locator('button:has-text("출석 관리")').first();
  if (await attTab.count()) {
    await attTab.click();
    await page.waitForTimeout(700);
    await page.screenshot({ path: out + 'tab_attendance.png', fullPage: true });
    console.log(`  ✓ ${out}tab_attendance.png`);
  }

  // 통계 탭
  const statsTab = page.locator('button:has-text("통계")').first();
  if (await statsTab.count()) {
    await statsTab.click();
    await page.waitForTimeout(700);
    await page.screenshot({ path: out + 'tab_stats.png', fullPage: true });
    console.log(`  ✓ ${out}tab_stats.png`);
  }

  // QR 라이브 모드
  const liveBtn = page.locator('button:has-text("라이브 출석")').first();
  if (await liveBtn.count()) {
    await liveBtn.click();
    await page.waitForTimeout(900);
    // 회차 선택 모달 또는 바로 QR 모드 — "QR 출석 시작" 또는 실시간 출석 현황 텍스트
    const qrStart = page.locator('button:has-text("QR 출석 시작")').first();
    if (await qrStart.count()) {
      await qrStart.click();
      await page.waitForTimeout(900);
    }
    await page.screenshot({ path: out + 'qr_live.png', fullPage: true });
    console.log(`  ✓ ${out}qr_live.png`);
  } else {
    console.log('  ⚠ 라이브 출석 버튼 못 찾음 — qr_live 스킵');
  }
}

async function run() {
  const browser = await chromium.launch({
    executablePath: CHROMIUM,
    headless: true,
    args: ['--disable-web-security', '--allow-file-access-from-files'],
  });
  const context = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  const page = await context.newPage();

  try {
    await captureOfflineBuilder(page);
  } catch (e) { console.error('offline-builder error:', e.message); }

  try {
    await captureOfflineList(page);
  } catch (e) { console.error('offline-list error:', e.message); }

  try {
    await captureOfflineView(page);
  } catch (e) { console.error('offline-view error:', e.message); }

  await browser.close();
  console.log('\nDone.');
}

run().catch(e => { console.error(e); process.exit(1); });
