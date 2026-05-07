/**
 * Feature Highlight — 가벼운 툴팁 모드
 *
 * 부모 창(feature-spec.html)에서 postMessage로 selector를 보내면,
 * 해당 요소가 있을 때만 툴팁 + 부드러운 글로우를 띄움.
 * 못 찾으면 조용히 무시 (에러/토스트 없음).
 *
 * 메시지 형식:
 *   { type: 'feature-highlight', selector: 'CSS 선택자', featureId: 'A1-02', featureName: '코스 상태 탭' }
 *
 * 클릭 또는 ESC로 해제. 5초 후 자동 페이드.
 */
(function () {
  if (window.__featureHighlightLoaded) return;
  window.__featureHighlightLoaded = true;

  let activeTooltip = null;
  let activeTarget = null;
  let originalStyle = null;
  let autoHideTimer = null;

  function clear() {
    if (autoHideTimer) { clearTimeout(autoHideTimer); autoHideTimer = null; }
    if (activeTarget && originalStyle !== null) {
      activeTarget.style.cssText = originalStyle;
    }
    if (activeTooltip) activeTooltip.remove();
    activeTooltip = null;
    activeTarget = null;
    originalStyle = null;
    document.removeEventListener('keydown', onKey, true);
    document.removeEventListener('click', onClickAnywhere, true);
  }

  function onKey(e) {
    if (e.key === 'Escape') clear();
  }

  function onClickAnywhere() {
    clear();
  }

  function findElement(selector) {
    const list = selector.split(',').map(s => s.trim()).filter(Boolean);
    for (const sel of list) {
      try {
        const el = document.querySelector(sel);
        if (el) return el;
      } catch (e) { /* 미지원 셀렉터 무시 */ }
    }
    return null;
  }

  function highlight(selector, featureId, featureName, retriesLeft) {
    if (retriesLeft === undefined) retriesLeft = 6; // 100ms × 6 = 0.6s 동안 재시도
    clear();
    const target = findElement(selector);

    /* React 렌더링 대기 — 못 찾으면 짧게 재시도 */
    if (!target) {
      if (retriesLeft > 0) {
        setTimeout(() => highlight(selector, featureId, featureName, retriesLeft - 1), 100);
      }
      /* 재시도 다 떨어지면 조용히 종료 */
      return;
    }

    activeTarget = target;
    originalStyle = target.style.cssText;

    /* 자동 스크롤 — 화면 중앙으로 */
    target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

    /* 스크롤 후 툴팁 + 가벼운 글로우 */
    setTimeout(() => {
      const rect = target.getBoundingClientRect();

      /* 부드러운 글로우 — 마스크 없이 outline + box-shadow */
      target.style.cssText = `${originalStyle}; outline: 2px solid #6366f1 !important; outline-offset: 3px !important; box-shadow: 0 0 0 4px rgba(99,102,241,0.15), 0 0 20px rgba(99,102,241,0.3) !important; border-radius: 4px; transition: outline-color .2s, box-shadow .3s;`;

      /* 툴팁 */
      const tooltip = document.createElement('div');
      tooltip.innerHTML = `
        <div style="font-size:10px; font-weight:800; opacity:0.7; letter-spacing:1px; margin-bottom:2px;">📍 ${featureId || '기능'}</div>
        <div style="font-size:14px; font-weight:800;">${featureName || ''}</div>
      `;
      tooltip.style.cssText = `
        position: fixed; z-index: 999999;
        background: #6366f1; color: white;
        padding: 8px 12px; border-radius: 8px;
        box-shadow: 0 8px 20px rgba(99, 102, 241, 0.35), 0 2px 6px rgba(0,0,0,0.1);
        max-width: 260px; min-width: 160px;
        animation: __feat-pulse-in .35s ease-out;
        pointer-events: none;
      `;
      document.body.appendChild(tooltip);
      activeTooltip = tooltip;

      const ttRect = tooltip.getBoundingClientRect();
      let top = rect.top - ttRect.height - 12;
      let arrow = 'bottom';
      if (top < 16) {
        top = rect.bottom + 12;
        arrow = 'top';
      }
      let left = rect.left + (rect.width / 2) - (ttRect.width / 2);
      left = Math.max(12, Math.min(left, window.innerWidth - ttRect.width - 12));
      tooltip.style.top = `${top}px`;
      tooltip.style.left = `${left}px`;

      /* 화살표 */
      const arrowEl = document.createElement('div');
      arrowEl.style.cssText = arrow === 'bottom'
        ? `position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 7px solid transparent; border-right: 7px solid transparent; border-top: 7px solid #6366f1;`
        : `position: absolute; top: -6px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 7px solid transparent; border-right: 7px solid transparent; border-bottom: 7px solid #6366f1;`;
      tooltip.appendChild(arrowEl);

      /* 클릭 또는 Esc로 닫기 */
      document.addEventListener('keydown', onKey, true);
      /* 짧은 지연 후 click 리스너 등록 (현재 클릭이 즉시 닫지 않도록) */
      setTimeout(() => document.addEventListener('click', onClickAnywhere, true), 100);

      /* 5초 후 자동 페이드 (선택적) */
      autoHideTimer = setTimeout(() => {
        if (activeTooltip) activeTooltip.style.transition = 'opacity .4s';
        if (activeTooltip) activeTooltip.style.opacity = '0';
        autoHideTimer = setTimeout(clear, 400);
      }, 5000);
    }, 320);
  }

  /* CSS 애니메이션 주입 */
  const style = document.createElement('style');
  style.textContent = `
    @keyframes __feat-pulse-in {
      from { opacity: 0; transform: translateY(-4px) scale(0.95); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
  `;
  document.head.appendChild(style);

  /* postMessage 수신 */
  window.addEventListener('message', (e) => {
    const msg = e.data;
    if (!msg || msg.type !== 'feature-highlight') return;
    if (!msg.selector) { clear(); return; }
    highlight(msg.selector, msg.featureId, msg.featureName);
  });

  /* 외부에서 직접 호출용 (디버깅) */
  window.__featureHighlight = { clear, highlight };
})();
