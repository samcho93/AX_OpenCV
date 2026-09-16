// 강좌 데이터(js/course.js + lessons/*.js)를 읽어 코드 스니펫을 JSON으로 출력합니다.
// 사용: node tools/dump_lessons.js [lessonIdPrefix] > snippets.json
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const root = path.join(__dirname, '..');
const ctx = { console };
ctx.window = ctx;
vm.createContext(ctx);

const files = ['js/course.js', 'lessons/week1.js', 'lessons/week2.js', 'lessons/week3.js', 'lessons/week4.js', 'lessons/week5.js'];
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

const prefix = process.argv[2] || '';
const out = [];
const stats = [];
for (const l of ctx.COURSE.lessons) {
  if (!l.id.startsWith(prefix)) continue;
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
process.stdout.write(JSON.stringify({ stats, snippets: out }, null, 1));
