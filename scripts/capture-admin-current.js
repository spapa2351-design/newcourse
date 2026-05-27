// 현재 admin/ 모든 페이지 풀스크린 캡처
// 출력: J:/claude/newcourse/screenshots/admin/<page>/full.png

const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const CHROMIUM = 'C:/Users/happy/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe';
const ADMIN_DIR = 'J:/claude/newcourse/admin/';
const SS = 'J:/claude/newcourse/screenshots/admin/';

const PAGES = [
  { id: 'offline-list',    file: 'offline-list.html',    name: '오프라인 코스 목록' },
  { id: 'offline-builder', file: 'offline-builder.html', name: '오프라인 코스 빌더' },
  { id: 'offline-view',    file: 'offline-view.html',    name: '오프라인 수강관리' },
  { id: 'online-list',     file: 'online-list.html',     name: '온라인 코스 목록' },
  { id: 'online-builder',  file: 'online-builder.html',  name: '온라인 코스 빌더' },
  { id: 'online-view',     file: 'online-view.html',     name: '온라인 수강관리' },
  { id: 'content-library', file: 'content-library.html', name: '콘텐츠 라이브러리' },
  { id: 'blended-builder', file: 'blended-builder.html', name: '블렌디드 빌더' },
];

function fileUrl(p) { return 'file:///' + p.replace(/\\/g, '/'); }
function ensureDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }

async function waitForReact(page) {
  try {
    await page.waitForFunction(
      () => document.querySelector('#root') && document.querySelector('#root').children.length > 0,
      { timeout: 15000 }
    );
  } catch (e) { /* non-React page may not have #root */ }
  await page.waitForTimeout(2500);
}

async function run() {
  const browser = await chromium.launch({
    executablePath: CHROMIUM,
    headless: true,
    args: ['--disable-web-security', '--allow-file-access-from-files'],
  });
  const context = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  const page = await context.newPage();

  for (const p of PAGES) {
    const url = fileUrl(ADMIN_DIR + p.file);
    const outDir = SS + p.id;
    ensureDir(outDir);
    const outFile = path.join(outDir, 'full.png');
    console.log(`[${p.id}] ${p.name} → ${url}`);
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await waitForReact(page);
      await page.screenshot({ path: outFile, fullPage: true });
      console.log(`  ✓ ${outFile}`);
    } catch (e) {
      console.error(`  ✗ ${p.id}: ${e.message}`);
    }
  }

  await browser.close();
  console.log('Done.');
}

run().catch(e => { console.error(e); process.exit(1); });
