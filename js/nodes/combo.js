/* =========================================================================
 * 선택지가 있는 인자 입력칸 (노드 카드 · 속성 탭 공용)
 * 브라우저 기본 datalist 는 입력된 값으로 목록을 걸러서, 이미 값이 들어 있으면
 * 다른 항목이 보이지 않는다. ▾ 버튼으로 항상 전체 목록을 보여 주고, 직접 입력도 그대로 가능.
 * ========================================================================= */
(function () {
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /** inputHtml: <input ...> 문자열, opts: 선택지 배열 */
  function html(inputHtml, opts) {
    return `<span class="ncombo">${inputHtml}<button type="button" class="ncombo-btn" tabindex="-1" title="선택 목록 보기">▾</button>`
      + `<span class="ncombo-list" hidden>${opts.map((o) => `<button type="button" class="ncombo-opt" data-v="${esc(o)}">${esc(o)}</button>`).join('')}</span></span>`;
  }

  function close(list) {
    list.hidden = true;
    const node = list.closest('.nnode');
    if (node) node.classList.remove('combo-open');
  }
  function closeAll(except) {
    document.querySelectorAll('.ncombo-list:not([hidden])').forEach((l) => { if (l !== except) close(l); });
  }
  function open(combo) {
    const list = combo.querySelector('.ncombo-list');
    const cur = combo.querySelector('input').value.trim();
    closeAll(list);
    list.hidden = false;
    // 아래 공간이 모자라면 위로 펼침 (속성 탭 아래쪽 · 화면 아래쪽)
    list.classList.remove('up');
    const box = (combo.closest('.ntab-pane, .nwrap') || document.documentElement).getBoundingClientRect();
    const r = combo.getBoundingClientRect();
    const below = Math.min(box.bottom, window.innerHeight) - r.bottom - 6;
    const above = r.top - Math.max(box.top, 0) - 6;
    const want = Math.min(list.scrollHeight, 220);
    const up = below < want && above > below;
    list.classList.toggle('up', up);
    list.style.maxHeight = Math.max(90, Math.min(220, up ? above : below)) + 'px';
    const node = combo.closest('.nnode');
    if (node) node.classList.add('combo-open');
    let sel = null;
    list.querySelectorAll('.ncombo-opt').forEach((o) => {
      const on = o.dataset.v === cur;
      o.classList.toggle('cur', on);
      if (on) sel = o;
    });
    if (sel) sel.scrollIntoView({ block: 'nearest' });
  }

  // mousedown(캡처): 입력칸의 포커스를 빼앗지 않고, 노드 끌기보다 먼저 처리
  document.addEventListener('mousedown', (e) => {
    const btn = e.target.closest('.ncombo-btn');
    if (btn) {
      e.preventDefault();
      const combo = btn.closest('.ncombo');
      const list = combo.querySelector('.ncombo-list');
      if (list.hidden) open(combo); else close(list);
      return;
    }
    const opt = e.target.closest('.ncombo-opt');
    if (opt) {
      e.preventDefault();
      const combo = opt.closest('.ncombo');
      const input = combo.querySelector('input');
      close(combo.querySelector('.ncombo-list'));
      if (input.value !== opt.dataset.v) {
        input.value = opt.dataset.v;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
      return;
    }
    if (!e.target.closest('.ncombo-list')) closeAll();
  }, true);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll();
    // 입력칸에서 Alt+↓ : 목록 열기 (select 와 같은 단축키)
    if (e.altKey && e.key === 'ArrowDown' && e.target.closest && e.target.closest('.ncombo')) {
      e.preventDefault();
      open(e.target.closest('.ncombo'));
    }
  });

  window.NodeCombo = { html, closeAll };
})();
