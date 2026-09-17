// 요약 슬라이드(slides/weekN.js) 검사기
// 사용: node tools/check_slides.js [lessonIdPrefix] [--course advanced]
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const root = path.join(__dirname, '..');
const ctx = { console };
ctx.window = ctx;
vm.createContext(ctx);

const load = (f) => {
  const p = path.join(root, f);
  if (!fs.existsSync(p)) return;
  vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: f });
};
const argv = process.argv.slice(2);
const ci = argv.indexOf('--course');
const course = ci >= 0 ? argv[ci + 1] : (argv.find((a) => /^a\d/.test(a)) ? 'advanced' : 'intro');
const ADV = course === 'advanced';
load(ADV ? 'js/course-advanced.js' : 'js/course.js');
for (let w = 1; w <= 5; w++) load(`${ADV ? 'lessons-adv' : 'lessons'}/week${w}.js`);
// slides.js 의 addSlides 만 흉내 (DOM 없이)
ctx.COURSE.addSlides = function (map) {
  for (const [id, deck] of Object.entries(map)) {
    if (!this.byId[id]) { console.log(`✗ 알 수 없는 교시 id: ${id}`); process.exitCode = 1; continue; }
    if (this.byId[id].deck) { console.log(`✗ ${id}: 슬라이드가 두 번 등록됨`); process.exitCode = 1; }
    this.byId[id].deck = deck;
  }
};
for (let w = 1; w <= 5; w++) {
  try { load(`${ADV ? 'slides-adv' : 'slides'}/week${w}.js`); } catch (e) { console.log(`✗ [SYNTAX] slides/week${w}.js: ${e.message}`); process.exitCode = 1; }
}

const prefix = argv.filter((a, i) => !a.startsWith('--') && (ci < 0 || i !== ci + 1))[0] || '';
const text = (h) => String(h || '').replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();
let errors = 0, warns = 0, done = 0;
const err = (id, m) => { errors++; console.log(`✗ ${id}: ${m}`); };
const warn = (id, m) => { warns++; console.log(`△ ${id}: ${m}`); };

for (const l of ctx.COURSE.lessons) {
  if (!l.id.startsWith(prefix)) continue;
  const d = l.deck;
  if (!d) { warn(l.id, '요약 슬라이드 없음 (자동 생성 사용)'); continue; }
  done++;
  const codes = l.blocks.filter((b) => b.type === 'code');
  if (!Array.isArray(d.slides) || !d.slides.length) { err(l.id, 'slides 배열이 비어 있음'); continue; }
  if (d.slides.length < 6 || d.slides.length > 18) warn(l.id, `slides ${d.slides.length}장 (권장 8~14)`);
  if (!d.intro) warn(l.id, 'intro 노트 없음');
  if (!Array.isArray(d.summary) || !d.summary.length) warn(l.id, 'summary 없음');
  if (d.practiceNotes && d.practiceNotes.length > l.practice.length) err(l.id, `practiceNotes ${d.practiceNotes.length}개 > 실습 ${l.practice.length}개`);
  const used = new Set();
  d.slides.forEach((s, i) => {
    const tag = `${l.id} #${i + 1} “${text(s.title)}”`;
    if (!s.title) err(tag, 'title 없음');
    if (s.practice !== undefined || s.quiz !== undefined) err(tag, 'practice/quiz 슬라이드는 자동으로 붙으므로 넣지 마세요');
    if (s.example !== undefined) {
      if (!Number.isInteger(s.example) || s.example < 0 || s.example >= codes.length) err(tag, `example ${s.example} 범위 밖 (code 블록 ${codes.length}개)`);
      else used.add(s.example);
    }
    const pts = s.points || [];
    if (!Array.isArray(pts)) err(tag, 'points 는 배열이어야 함');
    if (s.example === undefined && !s.table && !s.image && !pts.length) err(tag, '내용 없음 (points/example/table/image 중 하나 필요)');
    if (pts.length > 6) err(tag, `글머리표 ${pts.length}개 (최대 5~6)`);
    pts.forEach((p) => { if (text(p).length > 70) warn(tag, `긴 글머리표(${text(p).length}자): ${text(p).slice(0, 40)}…`); });
    if (s.example !== undefined && pts.length > 2) warn(tag, '예제 슬라이드의 points 는 1~2개 권장');
    if (s.table && (!Array.isArray(s.table.head) || !Array.isArray(s.table.rows))) err(tag, 'table 은 {head, rows}');
    if (s.table && s.table.rows.length > 7) warn(tag, `표 행 ${s.table.rows.length}개 (6개 이하 권장)`);
    if (s.image && !fs.existsSync(path.join(root, 'images', s.image))) err(tag, `이미지 없음: ${s.image}`);
    if (!text(s.notes)) warn(tag, 'notes 없음');
    const extra = Object.keys(s).filter((k) => !['title', 'points', 'notes', 'example', 'table', 'image', 'caption', 'tip', 'warn'].includes(k));
    if (extra.length) err(tag, `알 수 없는 필드: ${extra.join(', ')}`);
  });
  const runnable = codes.map((c, i) => (!c.norun ? i : -1)).filter((i) => i >= 0);
  const missing = runnable.filter((i) => !used.has(i));
  if (missing.length > runnable.length / 2) warn(l.id, `예제 슬라이드에 빠진 실행 예제가 많음: ${missing.join(', ')}`);
}
console.log(`\n요약 슬라이드 ${done}개 교시 검사 · 오류 ${errors} · 경고 ${warns}`);
if (errors) process.exitCode = 1;
