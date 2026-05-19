import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const POSTS_DIR = 'src/posts';
const re = /^(fan_drawing|commission|self_drawing|skeb)_.*\.md$/;
const files = readdirSync(POSTS_DIR).filter((f) => re.test(f));

let changed = 0;
for (const file of files) {
  const full = path.join(POSTS_DIR, file);
  let raw = readFileSync(full, 'utf8');
  const m = raw.match(/---[\r\n]+([\s\S]+?)[\r\n]+---/);
  if (!m) continue;
  const meta = yaml.load(m[1]);
  const author = meta.author;
  if (!author) continue;

  const esc = author.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const wrapped = `<u>${author}</u>`;

  // 拆 frontmatter / body
  const fmEnd = m[0].length;
  let fm = raw.slice(0, fmEnd);
  let body = raw.slice(fmEnd);

  // Frontmatter：作者也用 <u> 包（顯示時走 @html、JSON-LD 那邊 strip）
  fm = fm.replaceAll(`【${author}】`, wrapped);
  fm = fm.replaceAll(`_${author}_`, wrapped);
  fm = fm.replaceAll(`${wrapped} 繪製`, `${wrapped}繪製`);
  // bare 'author 繪製' in excerpt (commission style) → '<u>author</u>繪製'
  const fmBare = new RegExp(`(?<![>】])${esc}(?=\\s*繪製)`, 'g');
  fm = fm.replace(fmBare, wrapped);
  fm = fm.replaceAll(`${wrapped} 繪製`, `${wrapped}繪製`);

  // Body：作者名統一包 <u>...</u>，並貼合下一個字（無空白）
  body = body.replaceAll(`【${author}】`, wrapped);
  body = body.replaceAll(`_${author}_`, wrapped);
  // bare 'author 繪製' → '<u>author</u>繪製'（前面不是 > 或 】 才包，後接 繪製）
  const bare = new RegExp(`(?<![>】])${esc}(?=\\s*繪製)`, 'g');
  body = body.replace(bare, wrapped);
  // 收掉 </u> 後面緊跟 ' 繪製' 的單個空白
  body = body.replaceAll(`${wrapped} 繪製`, `${wrapped}繪製`);

  const next = fm + body;

  if (next !== raw) {
    writeFileSync(full, next);
    changed += 1;
  }
}
console.log(`✓ updated ${changed} files`);
