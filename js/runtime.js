/* =========================================================================
 * 실행 환경: Pyodide(브라우저 Python) + OpenCV + 결과 패널/웹캠/콘솔
 * ========================================================================= */
(function () {
  const $ = (sel) => document.querySelector(sel);
  const WORKDIR = '/home/pyodide';
  const CAMERA = '__camera__';

  const el = {
    status: $('#pyStatus'), statusText: $('#pyStatusText'),
    windows: $('#windows'), trackbars: $('#trackbars'), console: $('#console'),
    source: $('#sourceSelect'), camBtn: $('#camBtn'), snapBtn: $('#snapBtn'), upload: $('#uploadInput'),
    mirror: $('#mirrorChk'), camWrap: $('#camWrap'), video: $('#camVideo'), fileVideo: $('#fileVideo'), camInfo: $('#camInfo'),
    liveInfo: $('#liveInfo'), preview: $('#sourcePreview'),
    lightbox: $('#lightbox'), lightboxCanvas: $('#lightboxCanvas'), lightboxCap: $('#lightboxCap'),
  };

  let pyodide = null;
  let py = {};                 // 자주 쓰는 Python 함수 핸들
  let readyResolve;
  const ready = new Promise((r) => (readyResolve = r));
  const images = [];           // {name, url}
  let stream = null;
  const grabCanvas = document.createElement('canvas');
  const grabCtx = grabCanvas.getContext('2d', { willReadFrequently: true });

  const live = { on: false, raf: 0, busy: false, frames: 0, t0: 0, ms: 0 };
  let currentNs = null;
  let onLiveChange = () => {};
  const afterHooks = [];
  const fireAfter = (kind) => { for (const fn of afterHooks) { try { fn(kind); } catch (e) { console.error(e); } } };

  /* ------------------------------------------------------------ 콘솔 --- */
  function log(text, cls) {
    const span = document.createElement('span');
    if (cls) span.className = cls;
    span.textContent = text.endsWith('\n') ? text : text + '\n';
    el.console.appendChild(span);
    // 너무 길어지면 앞부분 제거
    while (el.console.childNodes.length > 800) el.console.removeChild(el.console.firstChild);
    el.console.scrollTop = el.console.scrollHeight;
  }
  function logNode(node) {
    el.console.appendChild(node);
    el.console.appendChild(document.createTextNode('\n'));
    el.console.scrollTop = el.console.scrollHeight;
  }
  function clearConsole() { el.console.textContent = ''; }

  function setStatus(kind, text) {
    el.status.className = 'status ' + kind;
    el.statusText.textContent = text;
  }

  /* ------------------------------------------------------- 오류 메시지 --- */
  const HINTS = [
    [/!_src\.empty\(\)|ssize\.empty\(\)|size\.width>0 && size\.height>0|src\.empty\(\)|!image\.empty\(\)/, '입력 이미지가 비어 있습니다. cv.imread() 파일 이름이 정확한지, None 이 아닌지 확인하세요.'],
    [/NoneType' object has no attribute 'shape'|NoneType' object is not subscriptable/, 'None 에 접근했습니다. cv.imread() 가 파일을 찾지 못했을 가능성이 큽니다.'],
    [/scn == 3 \|\| scn == 4|VScn::contains\(scn\)/, '컬러 변환에 필요한 채널 수가 맞지 않습니다. 이미 흑백(1채널) 이미지에 BGR2GRAY 를 적용하지 않았는지 확인하세요.'],
    [/ksize\.width > 0 && ksize\.width % 2 == 1|ksize % 2 == 1|ksize > 0 && ksize % 2 == 1/, '커널 크기(ksize)는 양의 홀수여야 합니다 (3, 5, 7 …).'],
    [/The operation is neither 'array op array'|sizes of input arguments do not match/, '두 이미지의 크기와 채널 수가 같아야 합니다. cv.resize 또는 cvtColor 로 맞추세요.'],
    [/Can't parse 'pt1'|Can't parse 'center'|Can't parse 'pt'|argument 'pt1'|expected 'int'/, '좌표는 정수 튜플이어야 합니다. (int(x), int(y)) 로 변환하세요.'],
    [/src\.type\(\) == CV_8UC1|image\.type\(\) == CV_8UC1|CV_8UC1 in function 'threshold'|_src\.type\(\) == CV_8UC1/, '이 함수는 8비트 흑백(1채널) 이미지가 필요합니다. cv.cvtColor(img, cv.COLOR_BGR2GRAY) 후 사용하세요.'],
    [/IndentationError/, '들여쓰기가 맞지 않습니다. 같은 블록은 같은 칸(스페이스 4칸)만큼 들여 써야 합니다.'],
    [/NameError: name 'cv' is not defined/, 'import cv2 as cv 를 코드 맨 위에 추가하세요.'],
    [/NameError: name 'np' is not defined/, 'import numpy as np 를 코드 맨 위에 추가하세요.'],
    [/has no attribute 'itemset'/, 'NumPy 2 에서는 itemset() 이 없어졌습니다. img[y, x, c] = 값 형태로 바꾸세요.'],
    [/has no attribute 'int0'/, 'NumPy 2 에서는 np.int0 이 없어졌습니다. np.intp 또는 np.int32 를 사용하세요.'],
  ];

  function formatError(err) {
    const msg = String(err && err.message ? err.message : err);
    const lines = msg.split('\n');
    let start = lines.findIndex((l) => l.includes('File "main.py"'));
    let body;
    if (start >= 0) {
      body = ['Traceback (most recent call last):', ...lines.slice(start)];
    } else {
      // 내부 프레임 제거 후 마지막 오류 줄 중심으로
      const idx = lines.findIndex((l) => /^\s*File "<exec>"/.test(l));
      body = idx >= 0 ? ['Traceback (most recent call last):', ...lines.slice(idx)] : lines;
    }
    // 실습 환경 내부(<webcv>) 프레임은 숨김
    const clean = [];
    for (let i = 0; i < body.length; i++) {
      if (/^\s*File "<webcv>"/.test(body[i])) {
        while (i + 1 < body.length && /^\s{4,}\S/.test(body[i + 1]) && !/^\s*File "/.test(body[i + 1])) i++;
        continue;
      }
      clean.push(body[i]);
    }
    const text = clean.join('\n').replace(/\s+$/, '')
      .replace(/OpenCV\((\d[\d.]*)\) \S*?\/modules\//g, 'OpenCV($1) modules/');
    let lineNo = null;
    const m = [...text.matchAll(/File "main\.py", line (\d+)/g)];
    if (m.length) lineNo = Number(m[m.length - 1][1]);
    const hint = HINTS.find(([re]) => re.test(msg));
    return { text, lineNo, hint: hint ? hint[1] : null };
  }

  function reportError(err, where) {
    const f = formatError(err);
    log((where ? `[${where}] ` : '') + f.text, 'err');
    if (f.hint) log('💡 ' + f.hint, 'hint');
    return f;
  }

  /* ------------------------------------------------------- 결과 창(카드) --- */
  const wins = new Map();  // name -> {card, canvas, ctx, ch, mouse}

  function clearWindows() {
    wins.clear();
    el.windows.innerHTML = '';
    el.trackbars.innerHTML = '';
    el.trackbars.classList.add('hidden');
    tbEls.clear();
  }

  function ensureWindow(name) {
    let w = wins.get(name);
    if (w) return w;
    const empty = el.windows.querySelector('.empty-out');
    if (empty) empty.remove();
    const card = document.createElement('figure');
    card.className = 'win';
    card.innerHTML = `
      <figcaption>
        <span class="win-name"></span>
        <span class="win-info muted"></span>
        <span class="spacer"></span>
        <span class="win-pix muted"></span>
        <button class="icon-btn small" data-act="zoom" title="크게 보기">⤢</button>
        <button class="icon-btn small" data-act="save" title="PNG 로 다운로드">⬇</button>
      </figcaption>
      <div class="win-body"><canvas width="1" height="1"></canvas><div class="win-empty muted">(아직 이미지가 없습니다)</div></div>`;
    card.querySelector('.win-name').textContent = name;
    const canvas = card.querySelector('canvas');
    w = { name, card, canvas, ctx: canvas.getContext('2d', { willReadFrequently: true }), ch: 3, mouse: false, hasImage: false };
    wins.set(name, w);
    el.windows.appendChild(card);

    card.querySelector('[data-act="zoom"]').onclick = () => openLightbox(w);
    card.querySelector('[data-act="save"]').onclick = () => {
      const a = document.createElement('a');
      a.download = name.replace(/[^\w가-힣.-]+/g, '_') + '.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    attachPixelReadout(w);
    return w;
  }

  function showImage(name, rgbaProxy, ch, info) {
    const buf = rgbaProxy.getBuffer('u8clamped');
    try {
      const [h, wd] = buf.shape;
      const data = new Uint8ClampedArray(buf.data);
      const w = ensureWindow(name);
      if (w.canvas.width !== wd || w.canvas.height !== h) {
        w.canvas.width = wd; w.canvas.height = h;
      }
      w.ctx.putImageData(new ImageData(data, wd, h), 0, 0);
      w.ch = ch;
      if (!w.hasImage) { w.hasImage = true; w.card.classList.add('has-image'); }
      w.card.querySelector('.win-info').textContent = info;
      if (lightboxWin === w) drawLightbox();
    } finally {
      buf.release();
    }
  }

  function canvasPoint(w, ev) {
    const r = w.canvas.getBoundingClientRect();
    if (!r.width || !r.height) return [0, 0];
    const x = Math.floor((ev.clientX - r.left) * (w.canvas.width / r.width));
    const y = Math.floor((ev.clientY - r.top) * (w.canvas.height / r.height));
    return [Math.max(0, Math.min(w.canvas.width - 1, x)), Math.max(0, Math.min(w.canvas.height - 1, y))];
  }

  function attachPixelReadout(w) {
    const pix = w.card.querySelector('.win-pix');
    w.canvas.addEventListener('mousemove', (ev) => {
      if (!w.hasImage) return;
      const [x, y] = canvasPoint(w, ev);
      const d = w.ctx.getImageData(x, y, 1, 1).data;
      pix.textContent = w.ch === 1 ? `(${x}, ${y})  값=${d[0]}` : `(${x}, ${y})  B=${d[2]} G=${d[1]} R=${d[0]}`;
    });
    w.canvas.addEventListener('mouseleave', () => (pix.textContent = ''));
  }

  const MOUSE = { MOVE: 0, LDOWN: 1, RDOWN: 2, MDOWN: 3, LUP: 4, RUP: 5, MUP: 6, LDBL: 7, RDBL: 8, MDBL: 9 };
  function mouseFlags(ev) {
    let f = 0;
    if (ev.buttons & 1) f |= 1;
    if (ev.buttons & 2) f |= 2;
    if (ev.buttons & 4) f |= 4;
    if (ev.ctrlKey) f |= 8;
    if (ev.shiftKey) f |= 16;
    if (ev.altKey) f |= 32;
    return f;
  }

  function enableMouse(name) {
    const w = ensureWindow(name);
    if (w.mouse) return;
    w.mouse = true;
    w.card.classList.add('mouse-on');
    const c = w.canvas;
    let pending = null;
    const send = (event, ev) => {
      const [x, y] = canvasPoint(w, ev);
      const flags = mouseFlags(ev);
      if (event === MOUSE.MOVE) {
        // 이동 이벤트는 프레임당 1번으로 묶어서 전달
        const first = !pending;
        pending = [x, y, flags];
        if (first) {
          setTimeout(() => {
            const p = pending; pending = null;
            if (p) callMouse(name, MOUSE.MOVE, p[0], p[1], p[2]);
          }, 16);
        }
        return;
      }
      if (pending) { const p = pending; pending = null; callMouse(name, MOUSE.MOVE, p[0], p[1], p[2]); }
      callMouse(name, event, x, y, flags);
    };
    const btn = (b, down) => (b === 0 ? (down ? MOUSE.LDOWN : MOUSE.LUP) : b === 2 ? (down ? MOUSE.RDOWN : MOUSE.RUP) : (down ? MOUSE.MDOWN : MOUSE.MUP));
    c.addEventListener('mousedown', (ev) => { ev.preventDefault(); send(btn(ev.button, true), ev); });
    c.addEventListener('mouseup', (ev) => send(btn(ev.button, false), ev));
    c.addEventListener('mousemove', (ev) => send(MOUSE.MOVE, ev));
    c.addEventListener('dblclick', (ev) => send(ev.button === 2 ? MOUSE.RDBL : MOUSE.LDBL, ev));
    c.addEventListener('contextmenu', (ev) => ev.preventDefault());
  }

  function callMouse(name, event, x, y, flags) {
    if (!pyodide) return;
    try {
      py.onMouse(name, event, x, y, flags);
      if (live.on) { if (isMedia()) live.dirty = true; else runProcessOnce(); }
      fireAfter('callback');
    } catch (e) {
      reportError(e, '마우스 콜백');
      py.disableMouse(name);
      log('마우스 콜백에서 오류가 발생해 이 창의 마우스 이벤트를 중지했습니다. 코드를 고친 뒤 다시 실행하세요.', 'warn');
    }
  }

  /* ------------------------------------------------------------ 트랙바 --- */
  const tbEls = new Map();
  function addTrackbar(win, name, value, min, max) {
    el.trackbars.classList.remove('hidden');
    const key = win + '␟' + name;
    let row = tbEls.get(key);
    if (!row) {
      row = document.createElement('label');
      row.className = 'tb';
      row.innerHTML = `<span class="tb-name"></span><input type="range"><output></output>`;
      row.querySelector('.tb-name').textContent = name;
      row.querySelector('.tb-name').title = `창: ${win}`;
      const input = row.querySelector('input');
      const out = row.querySelector('output');
      let scheduled = false;
      input.addEventListener('input', () => {
        out.textContent = input.value;
        if (scheduled) return;
        scheduled = true;
        setTimeout(() => {
          scheduled = false;
          try {
            py.onTrackbar(win, name, Number(input.value));
            if (live.on) { if (isMedia()) live.dirty = true; else runProcessOnce(); }
            fireAfter('callback');
          } catch (e) {
            reportError(e, '트랙바 콜백');
          }
        }, 16);
      });
      tbEls.set(key, row);
      el.trackbars.appendChild(row);
    }
    updateTrackbar(win, name, value, min, max);
  }
  function updateTrackbar(win, name, value, min, max) {
    const row = tbEls.get(win + '␟' + name);
    if (!row) return;
    const input = row.querySelector('input');
    input.min = min; input.max = max; input.value = value;
    row.querySelector('output').textContent = value;
  }

  /* ---------------------------------------------------------- 라이트박스 --- */
  let lightboxWin = null;
  function openLightbox(w) {
    if (!w.hasImage) return;
    lightboxWin = w;
    el.lightbox.classList.remove('hidden');
    drawLightbox();
  }
  function drawLightbox() {
    const w = lightboxWin;
    el.lightboxCanvas.width = w.canvas.width;
    el.lightboxCanvas.height = w.canvas.height;
    el.lightboxCanvas.getContext('2d').drawImage(w.canvas, 0, 0);
    el.lightboxCap.textContent = `${w.name} · ${w.card.querySelector('.win-info').textContent}  (클릭하거나 Esc 로 닫기)`;
  }
  el.lightbox.addEventListener('click', () => { el.lightbox.classList.add('hidden'); lightboxWin = null; });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && lightboxWin) el.lightbox.click(); });

  /* ------------------------------------------------------ 입력 소스/이미지 --- */
  function b64ToBytes(b64) {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  function mimeOf(name) { return /\.png$/i.test(name) ? 'image/png' : 'image/jpeg'; }

  const loadedAssets = new Set();
  function addImageFile(name, bytes, desc, select) {
    if (pyodide) pyodide.FS.writeFile(`${WORKDIR}/${name}`, bytes);
    else pendingFiles.push([name, bytes]);
    let item = images.find((i) => i.name === name);
    const url = URL.createObjectURL(new Blob([bytes], { type: mimeOf(name) }));
    if (item) { URL.revokeObjectURL(item.url); item.url = url; }
    else { item = { name, url, desc: desc || '' }; images.push(item); }
    renderSourceOptions(select ? name : undefined);
    return item;
  }
  const pendingFiles = [];

  /* 동영상: OpenCV 공식 저장소 샘플(samples/data/vtest.avi, Megamind.avi, doc/js_tutorials cup.mp4)을
     브라우저에서 재생 가능한 H.264 MP4 로 변환한 파일. 튜토리얼 원래 이름(.avi)으로도 열 수 있습니다. */
  const VIDEO = 'video:';
  const videos = [
    { name: 'vtest.mp4', aliases: ['vtest.avi'], fps: 10, desc: '거리의 보행자 (영상 튜토리얼 기본)' },
    { name: 'Megamind.mp4', aliases: ['Megamind.avi'], fps: 23.976, desc: '애니메이션 장면' },
    { name: 'cup.mp4', aliases: [], fps: 26.78, desc: '움직이는 컵 (추적 실습용)' },
  ].map((v) => ({ ...v, url: 'videos/' + v.name }));

  function renderSourceOptions(selectName) {
    const prev = selectName || el.source.value || 'messi5.jpg';
    el.source.innerHTML = '';
    el.source.add(new Option('📷 웹캠 (실시간)', CAMERA));
    const gv = document.createElement('optgroup');
    gv.label = '동영상';
    for (const v of videos) gv.appendChild(new Option(`🎞️ ${v.name} — ${v.desc}`, VIDEO + v.name));
    el.source.add(gv);
    const g = document.createElement('optgroup');
    g.label = '이미지';
    for (const img of images) g.appendChild(new Option(img.desc ? `${img.name} — ${img.desc}` : img.name, img.name));
    el.source.add(g);
    el.source.value = prev;
    if (!el.source.value) el.source.value = 'messi5.jpg';
    updatePreview();
  }

  function isCamera() { return el.source.value === CAMERA; }
  function isVideo() { return el.source.value.startsWith(VIDEO); }
  function isMedia() { return isCamera() || isVideo(); }
  function currentVideo() { return isVideo() ? videos.find((v) => VIDEO + v.name === el.source.value) : null; }
  function findVideo(name) {
    const base = String(name).split(/[\\/]/).pop();
    return videos.find((v) => v.name === base || v.aliases.includes(base));
  }

  function updatePreview() {
    if (isCamera()) { el.preview.innerHTML = ''; }
    else if (isVideo()) {
      const v = currentVideo();
      el.preview.innerHTML = `<span><b>🎞️ ${v.name}</b> <span class="muted">· cv.VideoCapture('${v.aliases[0] || v.name}') 또는 process(frame)</span></span>`;
    } else {
      const img = images.find((i) => i.name === el.source.value);
      el.preview.innerHTML = img
        ? `<img alt="" src="${img.url}"><span><b>${img.name}</b><br><span class="muted">cv.imread('${img.name}')</span></span>`
        : '';
    }
    updateMediaPanel();
  }

  function updateMediaPanel() {
    const cam = isCamera(), vid = isVideo();
    el.video.classList.toggle('hidden', !cam);
    el.fileVideo.classList.toggle('hidden', !vid);
    el.camWrap.classList.toggle('hidden', !(vid || (cam && stream)));
    if (vid) {
      const v = currentVideo();
      if (el.fileVideo.dataset.name !== v.name) {
        el.fileVideo.dataset.name = v.name;
        el.fileVideo.src = v.url;
        el.camInfo.textContent = `${v.name} · 불러오는 중…`;
      }
      el.fileVideo.play().catch(() => {});
    } else {
      el.fileVideo.pause();
      if (cam && stream) el.camInfo.textContent = `웹캠 ${el.video.videoWidth}×${el.video.videoHeight}`;
    }
    el.snapBtn.disabled = !((cam && stream) || vid);
  }

  el.fileVideo.addEventListener('loadedmetadata', () => {
    const v = videos.find((x) => x.name === el.fileVideo.dataset.name);
    if (!v) return;
    v.width = el.fileVideo.videoWidth; v.height = el.fileVideo.videoHeight; v.duration = el.fileVideo.duration;
    el.camInfo.textContent = `${v.name} · ${v.width}×${v.height} · ${Math.round(v.duration * v.fps)}프레임`;
  });
  el.fileVideo.addEventListener('error', () => {
    log(`동영상을 불러오지 못했습니다: ${el.fileVideo.dataset.name} (브라우저가 지원하는 mp4/webm 형식인지 확인하세요)`, 'err');
  });

  el.source.addEventListener('change', async () => {
    updatePreview();
    if (isCamera() && !stream) await startCamera();
    if (live.on) restartLive();
  });

  el.upload.addEventListener('change', async () => {
    const files = [...el.upload.files];
    for (const f of files) {
      const safe = f.name.replace(/\s+/g, '_');
      if (f.type.startsWith('video/')) {
        const old = videos.find((v) => v.name === safe);
        if (old) { URL.revokeObjectURL(old.url); old.url = URL.createObjectURL(f); }
        else videos.push({ name: safe, aliases: [], fps: 30, desc: '업로드', url: URL.createObjectURL(f) });
        el.fileVideo.dataset.name = '';
        renderSourceOptions(VIDEO + safe);
        log(`⬆ 동영상 업로드됨: 입력 소스로 선택했습니다. cv.VideoCapture('${safe}') 또는 process(frame) 으로 처리하세요.`, 'ok');
      } else {
        const bytes = new Uint8Array(await f.arrayBuffer());
        addImageFile(safe, bytes, '업로드', true);
        log(`⬆ 업로드됨: cv.imread('${safe}') 로 사용할 수 있습니다.`, 'ok');
      }
    }
    el.upload.value = '';
    if (live.on) restartLive();
  });

  /* ------------------------------------------------------------- 웹캠 --- */
  async function startCamera() {
    if (stream) return true;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      log('이 브라우저(또는 접속 주소)에서는 웹캠을 사용할 수 없습니다. http://localhost 로 접속했는지 확인하세요.', 'err');
      return false;
    }
    try {
      el.camBtn.disabled = true;
      el.camBtn.textContent = '⏳ 연결 중…';
      stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
      el.video.srcObject = stream;
      await el.video.play();
      await new Promise((r) => (el.video.videoWidth ? r() : el.video.addEventListener('loadedmetadata', r, { once: true })));
      el.camBtn.textContent = '■ 웹캠 끄기';
      if (!isCamera()) el.source.value = CAMERA;
      updatePreview();
      if (live.on) restartLive();
      log('📷 웹캠이 켜졌습니다. process(frame) 함수를 정의한 코드를 실행하면 실시간으로 처리됩니다.', 'ok');
      return true;
    } catch (e) {
      stream = null;
      el.camBtn.textContent = '📷 웹캠 켜기';
      log('웹캠을 열 수 없습니다: ' + e.message + '\n(브라우저의 카메라 권한을 허용했는지, 다른 프로그램이 카메라를 쓰고 있지 않은지 확인하세요.)', 'err');
      if (isCamera()) { el.source.value = 'messi5.jpg'; updatePreview(); }
      return false;
    } finally {
      el.camBtn.disabled = false;
    }
  }

  function stopCamera() {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    stream = null;
    el.video.srcObject = null;
    el.camBtn.textContent = '📷 웹캠 켜기';
    if (isCamera()) {
      el.source.value = 'messi5.jpg';
      if (live.on) restartLive();
    }
    updatePreview();
  }

  el.camBtn.addEventListener('click', () => (stream ? stopCamera() : startCamera()));

  function cameraReady() { return !!(stream && el.video.readyState >= 2 && el.video.videoWidth); }
  function videoReady() { return !!(el.fileVideo.dataset.name && el.fileVideo.readyState >= 2 && el.fileVideo.videoWidth); }

  let taintWarned = false;
  /** kind: 'camera' | 'video' | undefined(현재 입력 소스) → {data(RGBA), width, height} 또는 undefined */
  function grabRGBA(kind) {
    kind = kind || (isCamera() ? 'camera' : isVideo() ? 'video' : null);
    const media = kind === 'camera' ? (cameraReady() ? el.video : null) : kind === 'video' ? (videoReady() ? el.fileVideo : null) : null;
    if (!media) return undefined;
    const w = media.videoWidth, h = media.videoHeight;
    if (grabCanvas.width !== w || grabCanvas.height !== h) { grabCanvas.width = w; grabCanvas.height = h; }
    grabCtx.save();
    if (kind === 'camera' && el.mirror.checked) { grabCtx.translate(w, 0); grabCtx.scale(-1, 1); }
    grabCtx.drawImage(media, 0, 0, w, h);
    grabCtx.restore();
    try {
      return { data: grabCtx.getImageData(0, 0, w, h).data, width: w, height: h };
    } catch (e) {
      if (!taintWarned) {
        taintWarned = true;
        log('동영상 프레임을 읽을 수 없습니다. index.html 을 파일로 직접 열었다면 start.bat(로컬 서버)으로 실행하세요.', 'err');
      }
      return undefined;
    }
  }

  el.mirror.addEventListener('change', () => el.video.classList.toggle('mirror', el.mirror.checked));

  el.snapBtn.addEventListener('click', () => {
    const cam = isCamera();
    if (!grabRGBA()) return;
    const name = cam ? 'webcam.png' : 'frame.png';
    grabCanvas.toBlob(async (blob) => {
      const bytes = new Uint8Array(await blob.arrayBuffer());
      addImageFile(name, bytes, cam ? '웹캠 스냅샷' : '동영상 프레임', false);
      log(`📸 스냅샷 저장: cv.imread('${name}') 로 사용할 수 있습니다.`, 'ok');
    }, 'image/png');
  });

  /* Python 의 cv.VideoCapture('파일') 에서 호출: 동영상을 입력 소스로 연다 */
  function openVideo(name) {
    const v = findVideo(name);
    if (!v) return 'missing';
    if (currentVideo() !== v) {
      el.source.value = VIDEO + v.name;
      updatePreview();
    }
    return videoReady() && el.fileVideo.dataset.name === v.name ? 'ready' : 'loading';
  }

  function videoInfo(name) {
    const v = findVideo(name);
    const loaded = v && el.fileVideo.dataset.name === v.name;
    const fps = v ? v.fps : 30;
    return {
      fps,
      frames: loaded && isFinite(el.fileVideo.duration) ? Math.round(el.fileVideo.duration * fps) : 0,
      pos: loaded ? Math.round(el.fileVideo.currentTime * fps) : 0,
      msec: loaded ? el.fileVideo.currentTime * 1000 : 0,
      width: loaded ? el.fileVideo.videoWidth : 0,
      height: loaded ? el.fileVideo.videoHeight : 0,
    };
  }

  function seekVideo(name, frame) {
    const v = findVideo(name);
    if (!v || el.fileVideo.dataset.name !== v.name) return false;
    el.fileVideo.currentTime = Math.max(0, frame / v.fps);
    return true;
  }

  /* ----------------------------------------------------- 실시간 처리 루프 --- */
  function setLive(on) {
    live.on = on;
    el.liveInfo.textContent = '';
    onLiveChange(on);
  }

  function runProcessOnce() {
    const t = performance.now();
    try {
      if (isMedia()) {
        const f = grabRGBA();
        if (!f) return false;
        py.processCamera(f.data, f.width, f.height);
      } else {
        py.processFile(el.source.value);
      }
      live.ms = performance.now() - t;
      fireAfter('frame');
      return true;
    } catch (e) {
      const f = reportError(e, 'process(frame)');
      stopLive();
      App.markErrorLine(f.lineNo);
      return false;
    }
  }

  function loop() {
    if (!live.on) return;
    if (isMedia()) {
      // 일시정지된 동영상은 같은 프레임을 반복 처리하지 않음 (트랙바 변경 시에는 다시 처리)
      // 동영상은 새 프레임이 나왔을 때만 처리 (일시정지 중이면 트랙바/마우스 변경 시에만 다시 처리)
      const paused = isVideo() && live.lastTime === el.fileVideo.currentTime && !live.dirty;
      live.lastTime = isVideo() ? el.fileVideo.currentTime : null;
      live.dirty = false;
      if (!paused && runProcessOnce()) {
        live.frames++;
        const now = performance.now();
        if (now - live.t0 > 500) {
          const fps = (live.frames * 1000) / (now - live.t0);
          el.liveInfo.textContent = `● 실시간 ${fps.toFixed(1)} fps · process ${live.ms.toFixed(0)} ms`;
          live.frames = 0; live.t0 = now;
        }
      }
      live.raf = requestAnimationFrame(loop);
    }
  }

  function startLive() {
    if (!currentNs || !py.hasProcess(currentNs)) return;
    setLive(true);
    live.frames = 0; live.t0 = performance.now();
    live.lastTime = null;
    if (isCamera()) {
      if (!cameraReady()) {
        log('입력 소스가 웹캠이지만 아직 켜지지 않았습니다. 📷 웹캠 켜기를 누르세요.', 'warn');
      }
      live.raf = requestAnimationFrame(loop);
    } else if (isVideo()) {
      log(`process(frame) 을 동영상 '${currentVideo().name}' 의 매 프레임에 적용합니다. 영상 컨트롤로 일시정지·탐색할 수 있어요.`, 'muted');
      el.fileVideo.play().catch(() => {});
      live.raf = requestAnimationFrame(loop);
    } else {
      if (runProcessOnce()) log(`process(frame) 을 '${el.source.value}' 에 적용했습니다. 입력 소스를 바꾸거나 트랙바를 움직이면 다시 실행됩니다.`, 'muted');
    }
  }

  function restartLive() {
    cancelAnimationFrame(live.raf);
    if (live.on) startLive();
  }

  function stopLive() {
    cancelAnimationFrame(live.raf);
    if (live.on) setLive(false);
  }

  /* -------------------------------------------------------- Pyodide 준비 --- */
  async function init() {
    try {
      setStatus('loading', 'Python 불러오는 중…');
      if (typeof loadPyodide !== 'function') throw new Error('pyodide.js 를 불러오지 못했습니다 (인터넷 연결 확인).');
      pyodide = await loadPyodide({
        stdout: (s) => log(s),
        stderr: (s) => log(s, 'warn'),
      });
      setStatus('loading', 'OpenCV · NumPy 설치 중… (첫 실행은 수십 초 걸릴 수 있어요)');
      await pyodide.loadPackage(['numpy', 'opencv-python'], { messageCallback: () => {}, errorCallback: (m) => log(m, 'warn') });

      pyodide.FS.mkdirTree(WORKDIR);
      pyodide.FS.chdir(WORKDIR);
      for (const [name, bytes] of pendingFiles.splice(0)) pyodide.FS.writeFile(`${WORKDIR}/${name}`, bytes);

      setStatus('loading', '실습 환경 연결 중…');
      pyodide.runPython(window.WEBCV_BRIDGE_PY, { filename: '<webcv>' });
      const g = (n) => pyodide.globals.get(n);
      py = {
        beginRun: g('_begin_run'), endRun: g('_end_run'), hasProcess: g('_has_process'),
        onTrackbar: g('_on_trackbar'), onMouse: g('_on_mouse'), disableMouse: g('_disable_mouse'),
        processCamera: g('_process_camera'), processFile: g('_process_file'),
        patchMpl: g('_patch_matplotlib'),
      };
      setStatus('ready', '준비 완료');
      readyResolve();
      // 그래프 예제가 처음부터 빠르게 뜨도록 Matplotlib 패키지를 미리 내려받아 둠 (import 는 하지 않음)
      setTimeout(() => pyodide.loadPackage('matplotlib', { messageCallback: () => {}, errorCallback: () => {} }).catch(() => {}), 1500);
    } catch (e) {
      console.error(e);
      setStatus('error', '실행 환경 로드 실패');
      log('실행 환경을 불러오지 못했습니다: ' + e.message + '\n인터넷 연결을 확인한 뒤 새로고침하세요.', 'err');
    }
  }

  /* ------------------------------------------------------------ 코드 실행 --- */
  /* 코드에 VideoCapture('동영상') / VideoCapture(0) 이 있으면 실행 전에 영상·웹캠을 준비해 둔다 */
  async function prepareMedia(code) {
    const waitUntil = async (cond, ms) => {
      const t0 = performance.now();
      while (!cond() && performance.now() - t0 < ms) await new Promise((r) => setTimeout(r, 50));
    };
    const file = code.match(/VideoCapture\(\s*['"]([^'"]+)['"]/);
    if (file) {
      const v = findVideo(file[1]);
      if (v) {
        if (openVideo(v.name) !== 'ready') {
          setStatus('busy', `동영상 불러오는 중… (${v.name})`);
          await waitUntil(() => videoReady() && el.fileVideo.dataset.name === v.name, 8000);
        }
      }
    } else if (/VideoCapture\(\s*0\s*[,)]/.test(code) && !stream) {
      setStatus('busy', '웹캠 켜는 중… (카메라 권한을 허용하세요)');
      if (await startCamera()) await waitUntil(cameraReady, 3000);
    }
  }

  let running = false;
  async function run(code, opts = {}) {
    await ready;
    if (running) return { ok: false };
    running = true;
    stopLive();
    clearWindows();
    if (!opts.keepConsole && !opts.quiet) log(`▶ 실행 (${new Date().toLocaleTimeString()})`, 'run');
    setStatus('busy', '실행 중…');
    await new Promise((r) => setTimeout(r, 20)); // 화면 갱신 기회
    code = String(code ?? '');
    try { await prepareMedia(code); } catch (e) { console.warn('prepareMedia', e); }

    if (currentNs) { try { currentNs.destroy(); } catch (_) {} }
    const ns = pyodide.globals.get('dict')();
    ns.set('__name__', '__main__');
    currentNs = ns;
    let result = { ok: true };
    try {
      if (/\bmatplotlib\b/.test(code)) setStatus('busy', 'Matplotlib 준비 중… (처음 한 번만 오래 걸립니다)');
      await pyodide.loadPackagesFromImports(code, { messageCallback: () => {}, errorCallback: (m) => log(m, 'warn') });
      if (/\bmatplotlib\b/.test(code)) py.patchMpl();
      setStatus('busy', '실행 중…');
      py.beginRun(ns);
      pyodide.runPython(code, { globals: ns, filename: 'main.py' });
      py.endRun();
      fireAfter('run');
      if (py.hasProcess(ns)) startLive();
    } catch (e) {
      const f = reportError(e);
      result = { ok: false, error: f };
    } finally {
      running = false;
      setStatus('ready', '준비 완료');
    }
    return result;
  }

  /* ------------------------------------------------------------ 초기화 --- */
  for (const img of window.SAMPLE_IMAGES || []) {
    addImageFile(img.name, b64ToBytes(img.b64), img.desc, false);
  }
  renderSourceOptions('messi5.jpg');

  /* JS ↔ Python 연결 객체 (webcv-bridge.js 에서 사용) */
  window.webcvHost = {
    showImage, ensureWindow: (n) => { ensureWindow(n); }, enableMouse,
    addTrackbar, updateTrackbar,
    grabFrame: grabRGBA,
    cameraReady, cameraWidth: () => el.video.videoWidth || 640, cameraHeight: () => el.video.videoHeight || 480,
    requestCamera: () => { if (!stream) startCamera(); },
    openVideo, videoInfo, seekVideo, videoReady,
    isCameraSource: isCamera, isVideoSource: isVideo, isMediaSource: isMedia,
    sourceName: () => (isVideo() ? currentVideo().name : el.source.value),
    videoNames: () => videos.map((v) => (v.aliases[0] || v.name)).join(', '),
    fileSaved(name) {
      try {
        const bytes = pyodide.FS.readFile(`${WORKDIR}/${name}`);
        const isImg = /\.(png|jpe?g|bmp|webp)$/i.test(name);
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([bytes], { type: isImg ? mimeOf(name) : 'application/octet-stream' }));
        a.download = name.split('/').pop();
        a.textContent = `💾 저장됨: ${name} (클릭하여 다운로드)`;
        a.className = 'ok';
        logNode(a);
        if (isImg && !name.includes('/')) {
          let item = images.find((i) => i.name === name);
          if (!item) { images.push({ name, url: a.href, desc: '저장한 파일' }); renderSourceOptions(); }
        }
      } catch (e) {
        log('파일 저장 알림 실패: ' + e.message, 'warn');
      }
    },
  };

  window.Runtime = {
    ready, run, stopLive, clearConsole, log, isLive: () => live.on,
    onLiveChange: (fn) => (onLiveChange = fn),
    /** 실행 후 · 매 프레임 후 · 트랙바/마우스 콜백 후 호출 (노드 편집기 미리보기용) */
    onAfter: (fn) => afterHooks.push(fn),
    /** 브리지(Python)의 함수를 이름으로 호출 */
    callPy: (name, ...args) => {
      if (!pyodide) return undefined;
      const fn = pyodide.globals.get(name);
      try { return fn(...args); } finally { if (fn && fn.destroy) fn.destroy(); }
    },
    formatError,
    isCameraSource: () => isCamera(), isVideoSource: () => isVideo(),
    images,
    get pyodide() { return pyodide; },
    /** 서버의 파일(모델 · 추가 이미지)을 받아 가상 폴더에 같은 이름으로 넣음. 이미지는 입력 소스 목록에도 추가 */
    async loadAsset(url, name, { desc = '', onProgress } = {}) {
      const isImage = /\.(png|jpe?g|bmp|webp)$/i.test(name);
      if (loadedAssets.has(name)) return true;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${name} 을(를) 불러오지 못했습니다 (HTTP ${res.status})`);
      let bytes;
      const total = Number(res.headers.get('content-length')) || 0;
      if (onProgress && res.body && total) {
        const reader = res.body.getReader();
        const chunks = [];
        let got = 0;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          got += value.length;
          onProgress(got, total);
        }
        bytes = new Uint8Array(got);
        let o = 0;
        for (const c of chunks) { bytes.set(c, o); o += c.length; }
      } else {
        bytes = new Uint8Array(await res.arrayBuffer());
      }
      if (isImage) addImageFile(name, bytes, desc, false);
      else if (pyodide) pyodide.FS.writeFile(`${WORKDIR}/${name}`, bytes);
      else pendingFiles.push([name, bytes]);
      loadedAssets.add(name);
      return true;
    },
    /** 입력 소스 바꾸기: 이미지 이름 · 'video:vtest.mp4' · 'camera' */
    setSource(value) {
      const v = value === 'camera' ? CAMERA : value;
      if (!Array.from(el.source.options).some((o) => o.value === v)) return false;
      if (el.source.value === v) return true;
      el.source.value = v;
      el.source.dispatchEvent(new Event('change'));
      return true;
    },
    get source() { return el.source.value === CAMERA ? 'camera' : el.source.value; },
  };

  init();
})();
