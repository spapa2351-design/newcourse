import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
const b = await chromium.launch();

async function check(file, fn){
  const p = await b.newPage({ viewport:{width:1100,height:900} });
  const errs=[];
  p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
  p.on('pageerror',e=>errs.push('PAGEERR: '+e.message));
  await p.goto(pathToFileURL('J:/claude/newcourse/user/'+file).href,{waitUntil:'networkidle'}).catch(()=>{});
  await p.waitForTimeout(250);
  const out = await fn(p);
  console.log('\n===== '+file+' =====');
  out.forEach(([k,v])=>console.log(`  ${v?'OK ':'!! '} ${k}`));
  console.log('  콘솔/런타임 에러:', errs.length?errs.join(' | '):'없음');
  await p.close();
}

const txt=(p,s)=>p.$eval(s,e=>e.textContent.replace(/\s+/g,' ').trim()).catch(()=>'<none>');
const dis=(p,s)=>p.$eval(s,e=>e.disabled).catch(()=>'<none>');
const hasOpen=(p,s)=>p.$eval(s,e=>e.classList.contains('open')).catch(()=>false);

await check('course-enrolled.html', async p=>{
  const r=[];
  // 정책 open (1st chip)
  await p.click('.proto-bar .proto-chip:nth-child(1)'); await p.waitForTimeout(50);
  r.push(['정책 open: 변경·취소 모두 활성', (await dis(p,'#btn-change'))===false && (await dis(p,'#btn-cancel'))===false]);
  await p.click('.proto-bar .proto-chip:nth-child(2)'); await p.waitForTimeout(50);
  r.push(['변경기한 경과: 변경 비활성·취소 활성', (await dis(p,'#btn-change'))===true && (await dis(p,'#btn-cancel'))===false]);
  await p.click('.proto-bar .proto-chip:nth-child(3)'); await p.waitForTimeout(50);
  r.push(['전체 경과: 변경·취소 모두 비활성', (await dis(p,'#btn-change'))===true && (await dis(p,'#btn-cancel'))===true]);
  // 강사 3단: 3회차 이서연 노출
  const sessTxt = await txt(p,'#app-main .sess-list');
  r.push(['회차별 강사(이서연) 노출', sessTxt.includes('이서연')]);
  r.push(['회차별 강사 상이 칩 존재', (await p.$$('.section-title')).length>0 && (await txt(p,'.section')).includes('회차별 강사 상이')]);
  // 일정 변경 시트
  await p.click('.proto-bar .proto-chip:nth-child(1)');
  await p.click('#btn-change'); await p.waitForTimeout(350);
  r.push(['일정 변경 시트 open', await hasOpen(p,'#change-sheet')]);
  await p.click('#pkg-b'); await p.waitForTimeout(50);
  r.push(['패키지 선택 시 변경확정 활성', await p.$eval('#btn-change-confirm',e=>e.style.pointerEvents==='auto')]);
  await p.click('#btn-change-confirm'); await p.waitForTimeout(50);
  r.push(['변경 완료 모달 open', await hasOpen(p,'#modal-change-done')]);
  // QR
  await p.click('#modal-change-done .modal-btn.primary'); await p.waitForTimeout(50);
  await p.click('.bottom-cta .btn-primary.qr'); await p.waitForTimeout(50);
  r.push(['QR 모달 open', await hasOpen(p,'#modal-qr')]);
  await p.click('#modal-qr .modal-btn.primary'); await p.waitForTimeout(50);
  r.push(['QR 스캔 완료뷰 표시', await p.$eval('#qr-done-view',e=>e.style.display==='block')]);
  await p.click('#modal-qr .modal-btn.primary'); await p.waitForTimeout(50);
  // 취소 → 취소완료 화면 (마지막)
  await p.click('#btn-cancel'); await p.waitForTimeout(50);
  await p.click('#modal-cancel .modal-btn.danger'); await p.waitForTimeout(50);
  r.push(['취소 확정 → 취소완료 화면', await p.$eval('#app-cancelled',e=>e.style.display==='flex')]);
  await p.screenshot({path:'_enrolled.png'});
  return r;
});

await check('course-completed.html', async p=>{
  const r=[];
  // 초기 pass
  r.push(['초기 수료 배지', (await txt(p,'#complete-badge')).includes('수료') && !(await txt(p,'#complete-badge')).includes('미수료')]);
  r.push(['초기 출석률 100%', (await txt(p,'#stat-rate'))==='100%']);
  r.push(['수료증 버튼 활성', (await dis(p,'#btn-cert'))===false]);
  r.push(['회차 4개 렌더', (await p.$$('#sess-list .sess-item')).length===4]);
  r.push(['회차별 강사 상이 칩 표시(한지민 혼재)', await p.$eval('#mixed-instr-badge',e=>e.style.display!=='none')]);
  // fail
  await p.click('.proto-chip:nth-child(3)'); await p.waitForTimeout(60);
  r.push(['미수료 전환: 배지', (await txt(p,'#complete-badge')).includes('미수료')]);
  r.push(['미수료: 수료증 버튼 비활성', (await dis(p,'#btn-cert'))===true]);
  r.push(['미수료: 출석률 50%', (await txt(p,'#stat-rate'))==='50%']);
  // pass-late
  await p.click('.proto-chip:nth-child(2)'); await p.waitForTimeout(60);
  r.push(['지각포함: 지각 회차 존재', (await txt(p,'#sess-list')).includes('지각')]);
  // 수료증 모달 (pass로 복귀)
  await p.click('.proto-chip:nth-child(1)'); await p.waitForTimeout(60);
  await p.click('#btn-cert'); await p.waitForTimeout(80);
  r.push(['수료증 모달 open + 과정명 채움', await hasOpen(p,'#cert-overlay') && (await txt(p,'#cert-course')).length>2]);
  await p.screenshot({path:'_completed.png'});
  return r;
});

await b.close();
