const { chromium } = require('playwright');

const ADMIN_PAGES = [
  { id: 'admin-overview',        label: '01-관리자화면개요' },
  { id: 'admin-list-overview',   label: '02-코스목록개요' },
  { id: 'admin-list-status',     label: '03-코스상태관리' },
  { id: 'admin-list-expand',     label: '04-차수펼침뷰' },
  { id: 'admin-builder-basic',   label: '05-빌더-기본정보' },
  { id: 'admin-builder-enroll',  label: '06-빌더-수강신청설정' },
  { id: 'admin-builder-completion', label: '07-빌더-수료조건' },
  { id: 'admin-builder-package', label: '08-빌더-차수관리' },
  { id: 'admin-builder-session', label: '09-빌더-회차설정' },
  { id: 'admin-view-dashboard',  label: '10-수강관리-대시보드' },
  { id: 'admin-view-students',   label: '11-수강관리-수강생관리' },
  { id: 'admin-view-attendance', label: '12-수강관리-출석수료' },
  { id: 'admin-view-qr',         label: '13-수강관리-QR라이브모드' },
  { id: 'admin-learners-enroll', label: '14-수강생수동등록' },
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  const FILE = 'file:///J:/claude/newcourse/docs/guide-offline-lms.html';
  const OUT  = 'J:/claude/newcourse/screenshots/guide-offline-lms';

  await page.goto(FILE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  for (const { id, label } of ADMIN_PAGES) {
    // showPage() 직접 호출
    await page.evaluate(pageId => {
      if (typeof showPage === 'function') showPage(pageId, null);
      else {
        // fallback: 직접 DOM 조작
        document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
        const target = document.getElementById('page-' + pageId);
        if (target) target.classList.add('active');
      }
    }, id);
    await page.waitForTimeout(300);

    // 해당 nav 항목 하이라이트 (스크롤도 맞춤)
    await page.evaluate(pageId => {
      const nav = document.querySelector(`[onclick*="${pageId}"]`);
      if (nav) nav.scrollIntoView({ block: 'nearest' });
    }, id);

    await page.screenshot({
      path: `${OUT}/${label}.png`,
      fullPage: false,
    });
    console.log(`✓ ${label}`);
  }

  await browser.close();
  console.log('\n모든 어드민 페이지 캡처 완료.');
})();
