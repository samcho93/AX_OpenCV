/* =========================================================================
 * 🚀 응용 예제 화면: 갤러리 · 데모 상세 · 실행 (코드는 보여주지 않음)
 * ========================================================================= */
(function () {
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const VIDEO_LABEL = { 'vtest.mp4': '보행자 동영상', 'Megamind.mp4': '애니메이션 동영상', 'cup.mp4': '컵 동영상' };
  const isModel = (name) => /\.(onnx|pb|caffemodel|weights|tflite|xml|yml|yaml|txt)$/i.test(name);
  const assetUrl = (name) => (isModel(name) ? 'models/' : 'images/apps/') + name;

  function inputLabel(inp) {
    if (inp === 'camera') return '📷 웹캠';
    if (inp.startsWith('video:')) return `🎞️ ${VIDEO_LABEL[inp.slice(6)] || inp.slice(6)}`;
    return `🖼️ ${inp.replace(/\.(png|jpe?g)$/i, '').replace(/_/g, ' ')}`;
  }

  function sourceValue(inp) { return inp === 'camera' ? 'camera' : inp; }

  /* --------------------------------------------------------------- 갤러리 --- */
  function gallery(root) {
    const cats = APPS.categories.map((c) => {
      const items = APPS.list.filter((a) => a.cat === c.id);
      if (!items.length) return '';
      return `<section class="app-cat cat-${c.id}">
        <h2 class="section-title">${c.icon} ${esc(c.title)} <span class="muted">${items.length}종</span></h2>
        <p class="muted app-cat-desc">${esc(c.desc)}</p>
        <div class="app-grid">${items.map(card).join('')}</div>
      </section>`;
    }).join('');
    root.innerHTML = `<article class="lesson apps-home">
      <header class="hero apps-hero">
        <div class="hero-text">
          <div class="crumbs">실전 데모 · 코드 없이 실행</div>
          <h1>🚀 OpenCV 응용 예제</h1>
          <p class="lead">강좌에서 배운 OpenCV 가 <b>자율주행 · CCTV · 물류 · 스마트팩토리</b> 현장에서 어떻게 쓰이는지 직접 실행해 보세요.
          YOLO 같은 <b>딥러닝 객체 인식</b>부터 제조 라인의 <b>외관검사</b>까지, 각 데모의 <b>▶ 데모 실행</b>을 누르면 오른쪽에 결과가 나타납니다.</p>
        </div>
        <div class="hero-stats">
          ${APPS.categories.map((c) => `<div><b>${APPS.list.filter((a) => a.cat === c.id).length}</b><span>${c.icon} ${esc(c.title.split(' ')[0])}</span></div>`).join('')}
        </div>
      </header>
      ${cats}
      <div class="block callout note"><div class="callout-icon">📝</div><div><p>딥러닝 모델(YOLOX, YuNet, PP-HumanSeg, PP-OCR)은 OpenCV Zoo · 원 개발사의 공개 모델(MIT · Apache-2.0)이며,
        외관검사 · 물류 데모의 샘플 이미지는 교육용으로 직접 만든 합성 이미지입니다. 처음 실행할 때 모델 파일(최대 20MB)을 내려받습니다.</p></div></div>
    </article>`;
    root.scrollTop = 0;
  }

  function card(a) {
    return `<a class="app-card" href="#app-${a.id}">
      <div class="app-thumb"><img src="images/apps/thumbs/${a.id}.jpg" alt="" loading="lazy" onerror="this.remove()"><span class="app-thumb-icon">${a.icon}</span></div>
      <div class="app-card-body"><b>${a.icon} ${esc(a.title)}</b><small>${esc(a.subtitle)}</small>
        <div class="app-tags">${(a.tech || []).slice(0, 3).map((t) => `<code>${esc(t)}</code>`).join('')}</div></div>
    </a>`;
  }

  /* ------------------------------------------------------------ 데모 상세 --- */
  let active = null;

  function detail(root, a) {
    active = a;
    const cat = APPS.categories.find((c) => c.id === a.cat) || { icon: '', title: '' };
    const same = APPS.list.filter((x) => x.cat === a.cat);
    const idx = APPS.list.indexOf(a);
    const prev = APPS.list[idx - 1], next = APPS.list[idx + 1];
    root.innerHTML = `<article class="lesson app-detail cat-${a.cat}">
      <div class="crumbs"><a href="#apps">🚀 응용 예제</a><span class="sep">›</span>${cat.icon} ${esc(cat.title)}</div>
      <header class="app-head">
        <div class="app-head-icon">${a.icon}</div>
        <div><h1>${esc(a.title)}</h1><p class="lead">${esc(a.subtitle)}</p></div>
      </header>

      <section class="app-run-card">
        <div class="app-run-row">
          <button class="btn primary app-run-btn" data-app-run>▶ 데모 실행</button>
          <button class="btn ghost" data-app-stop title="실시간 처리 정지">■ 정지</button>
          <span class="app-status" id="appStatus">버튼을 누르면 오른쪽 <b>실행 결과</b> 패널에 결과가 나타납니다.</span>
        </div>
        <div class="app-progress hidden" id="appProgress"><div></div></div>
        <div class="app-inputs"><span class="muted">입력 바꿔 보기</span>
          ${(a.inputs || []).map((inp) => `<button class="app-input" data-input="${esc(inp)}">${esc(inputLabel(inp))}</button>`).join('')}
        </div>
        ${(a.controls || []).length ? `<div class="app-controls">🎚️ 결과 패널의 트랙바로 조절: ${a.controls.map(([n, d]) => `<span><b>${esc(n)}</b> — ${esc(d)}</span>`).join('')}</div>` : ''}
      </section>

      <div class="app-intro">
        <div class="app-summary">${a.summary || ''}</div>
        <figure class="app-sample"><img src="images/apps/thumbs/${a.id}.jpg" alt="실행 결과 예시" onerror="this.parentElement.remove()"><figcaption>실행 결과 예시</figcaption></figure>
      </div>

      <h2 class="section-title">🏭 현장에서는 이렇게 쓰여요</h2>
      <div class="app-uses">${(a.uses || []).map(([f, d]) => `<div class="app-use"><b>${esc(f)}</b><span>${d}</span></div>`).join('')}</div>

      <h2 class="section-title">⚙️ 어떻게 동작하나요?</h2>
      <ol class="app-steps">${(a.steps || []).map((s) => `<li>${s}</li>`).join('')}</ol>

      <h2 class="section-title">🧰 사용한 OpenCV 기능</h2>
      <div class="app-tech">${(a.tech || []).map((t) => `<code>${esc(t)}</code>`).join('')}</div>

      ${a.note ? `<div class="block callout tip"><div class="callout-icon">💡</div><div><p>${a.note}</p></div></div>` : ''}
      ${(a.refs || []).length ? `<h2 class="section-title">📚 더 알아보기</h2><ul class="app-refs">${a.refs.map(([l, u]) => `<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(l)} ↗</a></li>`).join('')}</ul>` : ''}

      <footer class="lesson-foot">
        <span class="muted">${cat.icon} ${esc(cat.title)} · ${same.indexOf(a) + 1} / ${same.length}</span>
        <div class="pager">
          ${prev ? `<a class="btn ghost" href="#app-${prev.id}">← ${prev.icon} ${esc(prev.title)}</a>` : ''}
          ${next ? `<a class="btn primary" href="#app-${next.id}">${next.icon} ${esc(next.title)} →</a>` : ''}
        </div>
      </footer>
    </article>`;
    root.scrollTop = 0;
    markInputs();
    // 작은 이미지 자산은 미리 받아서 입력 버튼을 바로 쓸 수 있게
    Promise.all((a.assets || []).filter((n) => !isModel(n)).map((n) => Runtime.loadAsset(assetUrl(n), n, { desc: a.title }).catch(() => null)));
  }

  function status(html, kind) {
    const s = document.getElementById('appStatus');
    if (!s) return;
    s.innerHTML = html;
    s.className = 'app-status ' + (kind || '');
  }
  function progress(frac) {
    const p = document.getElementById('appProgress');
    if (!p) return;
    p.classList.toggle('hidden', frac == null);
    if (frac != null) p.firstElementChild.style.width = Math.round(frac * 100) + '%';
  }
  function markInputs() {
    const cur = Runtime.source;
    document.querySelectorAll('.app-input').forEach((b) => b.classList.toggle('active', sourceValue(b.dataset.input) === cur));
  }

  async function run(a) {
    const btn = document.querySelector('[data-app-run]');
    if (btn) btn.disabled = true;
    try {
      status('⏳ Python · OpenCV 준비 중…');
      await Runtime.ready;
      const assets = a.assets || [];
      for (let i = 0; i < assets.length; i++) {
        const name = assets[i];
        status(`⏳ ${isModel(name) ? '모델' : '이미지'} 불러오는 중: <code>${esc(name)}</code> (${i + 1}/${assets.length})`);
        await Runtime.loadAsset(assetUrl(name), name, {
          desc: a.title,
          onProgress: (got, total) => progress(total ? got / total : null),
        });
      }
      progress(null);
      const inputs = a.inputs || [];
      if (!inputs.map(sourceValue).includes(Runtime.source)) {
        const first = inputs.find((i) => i !== 'camera') || inputs[0];
        if (first) Runtime.setSource(sourceValue(first));
      }
      markInputs();
      status('▶ 실행 중…');
      const res = await Runtime.run(a.code);
      if (active !== a) return;
      if (res.ok) status(`✅ 실행 중 — 위의 <b>입력</b>을 바꾸거나 오른쪽 <b>트랙바</b>를 움직여 보세요.${Runtime.isLive() ? '' : ''}`, 'ok');
      else status('⚠️ 실행 중 오류가 발생했습니다. 오른쪽 콘솔을 확인하세요.', 'err');
    } catch (e) {
      progress(null);
      status('⚠️ ' + esc(e.message) + ' (로컬 서버로 실행했는지 확인하세요)', 'err');
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  document.addEventListener('click', async (e) => {
    if (!active || !document.body.classList.contains('app-page')) return;
    const t = e.target.closest('[data-app-run], [data-app-stop], [data-input]');
    if (!t) return;
    if (t.hasAttribute('data-app-run')) run(active);
    else if (t.hasAttribute('data-app-stop')) { Runtime.stopLive(); status('■ 정지했습니다. ▶ 데모 실행으로 다시 시작하세요.'); }
    else if (t.dataset.input) {
      const inp = t.dataset.input;
      if (!inp.startsWith('video:') && inp !== 'camera' && (active.assets || []).includes(inp)) {
        try { await Runtime.loadAsset(assetUrl(inp), inp, { desc: active.title }); } catch (_) {}
      }
      Runtime.setSource(sourceValue(inp));
      markInputs();
      if (!Runtime.isLive()) run(active);
    }
  });
  document.addEventListener('change', (e) => { if (e.target.id === 'sourceSelect') markInputs(); });

  window.AppsView = { gallery, detail, run };
})();
