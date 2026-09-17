// 강좌 데이터(js/course*.js + lessons*/*.js)를 읽어 코드 스니펫을 JSON으로 출력합니다.
// 사용: node tools/dump_lessons.js [lessonIdPrefix] [--course advanced] > snippets.json
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const root = path.join(__dirname, '..');
const args = process.argv.slice(2);
const ci = args.indexOf('--course');
const course = ci >= 0 ? args[ci + 1] : (args.find((a) => /^a\d/.test(a)) ? 'advanced' : 'intro');
const prefix = args.filter((a, i) => !a.startsWith('--') && (ci < 0 || i !== ci + 1))[0] || '';

const ctx = { console };
ctx.window = ctx;
vm.createContext(ctx);

const adv = course === 'advanced';
const files = [adv ? 'js/course-advanced.js' : 'js/course.js'];
for (let w = 1; w <= 5; w++) files.push(`${adv ? 'lessons-adv' : 'lessons'}/week${w}.js`);
for (const f of files) {
  const p = path.join(root, f);
  if (!fs.existsSync(p)) continue;
  try {
    vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: f });
  } catch (e) {
    console.error(`[SYNTAX] ${f}: ${e.message}`);
    process.exitCode = 1;
  }
}

const out = [];
const stats = [];
const assets = new Set();
for (const l of ctx.COURSE.lessons) {
  if (!l.id.startsWith(prefix)) continue;
  (l.assets || []).forEach((a) => assets.add(a));
  stats.push({ id: l.id, placeholder: l.placeholder, blocks: l.blocks.length, practice: l.practice.length, quiz: l.quiz.length });
  if (l.starter) out.push({ id: l.id, kind: 'starter', title: 'starter', code: l.starter });
  l.blocks.forEach((b, i) => {
    if (b.type === 'code' && !b.norun) out.push({ id: l.id, kind: 'block', index: i, title: b.title || '', code: b.code });
  });
  l.practice.forEach((p, i) => {
    if (p.starter && !p.norun) out.push({ id: l.id, kind: 'practice-starter', index: i, title: p.title || '', code: p.starter });
    if (p.solution) out.push({ id: l.id, kind: 'practice-solution', index: i, title: p.title || '', code: p.solution });
  });
}
process.stdout.write(JSON.stringify({ course, stats, assets: [...assets], snippets: out }, null, 1));
