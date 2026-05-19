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

  let next = raw;
  const esc = author.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

  // A) 【author】 → _author_
  next = next.replaceAll(`【${author}】`, `_${author}_`);

  // B) bare 'author 繪製' → '_author_ 繪製'（前面不是 _ 或 】 才包）
  const bare = new RegExp(`(?<![_】])${esc}(?=\\s+繪製)`, 'g');
  next = next.replace(bare, `_${author}_`);

  // C) 確保斜體結尾後緊接的非空白字元中間有空白：_author_繪 → _author_ 繪
  const trailing = new RegExp(`(_${esc}_)(\\S)`, 'g');
  next = next.replace(trailing, '$1 $2');

  if (next !== raw) {
    writeFileSync(full, next);
    changed += 1;
  }
}
console.log(`✓ updated ${changed} files`);
