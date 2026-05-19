#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import path from 'node:path';
import yaml from 'js-yaml';

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, 'src/posts');
const IMG_DIR = path.join(ROOT, 'static/images/posts');

const PREFIX_MAP = [
  { prefix: 'fan_drawing_',  category: 'fan' },
  { prefix: 'self_drawing_', category: 'self' },
  { prefix: 'commission_',   category: 'commission' },
  { prefix: 'skeb_',         category: 'skeb' }
];

function shortHash(s) {
  return createHash('md5').update(s).digest('hex').slice(0, 4);
}

function gitMv(from, to) {
  execSync(`git mv "${from}" "${to}"`, { stdio: 'inherit' });
}

// Pass 1: collect entries
const files = readdirSync(POSTS_DIR)
  .filter((f) => PREFIX_MAP.some((p) => f.startsWith(p.prefix)) && f.endsWith('.md'));

const entries = [];
for (const file of files) {
  const full = path.join(POSTS_DIR, file);
  const raw = readFileSync(full, 'utf8');
  const m = raw.match(/---[\r\n]+([\s\S]+?)[\r\n]+---/);
  if (!m) { console.warn('skip (no frontmatter):', file); continue; }
  const meta = yaml.load(m[1]);
  const prefix = PREFIX_MAP.find((p) => file.startsWith(p.prefix));
  if (!meta.date) { console.warn('skip (no date):', file); continue; }
  entries.push({
    file,
    oldBase: file.replace('.md', ''),
    prefix: prefix.prefix,
    category: prefix.category,
    date: meta.date,
    author: meta.author || '',
    raw,
    meta
  });
}

// Pass 2: detect same-day collisions
const groups = new Map();
for (const e of entries) {
  const k = `${e.category}|${e.date}`;
  if (!groups.has(k)) groups.set(k, []);
  groups.get(k).push(e);
}

for (const e of entries) {
  const grp = groups.get(`${e.category}|${e.date}`);
  if (grp.length === 1) {
    e.newBase = `${e.prefix}${e.date}`;
  } else {
    e.newBase = `${e.prefix}${e.date}_${shortHash(`${e.author}|${e.date}`)}`;
  }
}

// Sanity: ensure new names are unique
const seen = new Map();
for (const e of entries) {
  if (seen.has(e.newBase)) {
    console.error(`COLLISION: ${e.newBase} (from ${e.oldBase} and ${seen.get(e.newBase)})`);
    process.exit(1);
  }
  seen.set(e.newBase, e.oldBase);
}

// Pass 3: execute renames
let renames = 0;
for (const e of entries) {
  if (e.oldBase === e.newBase) continue;
  // 3a: git mv markdown
  const oldMd = path.join('src/posts', `${e.oldBase}.md`);
  const newMd = path.join('src/posts', `${e.newBase}.md`);
  gitMv(oldMd, newMd);

  // 3b: find image files matching old base, rename them
  const imgFiles = readdirSync(IMG_DIR).filter((f) =>
    f === `${e.oldBase}.webp` || f.startsWith(`${e.oldBase}_`)
  );
  for (const img of imgFiles) {
    const newImg = img.replace(e.oldBase, e.newBase);
    gitMv(
      path.join('static/images/posts', img),
      path.join('static/images/posts', newImg)
    );
  }

  // 3c: update markdown content references (thumbnail in frontmatter + body images)
  let content = readFileSync(path.join(ROOT, newMd), 'utf8');
  content = content.replaceAll(e.oldBase, e.newBase);
  writeFileSync(path.join(ROOT, newMd), content);

  renames += 1;
}

console.log(`\n✓ renamed ${renames} entries (markdown + images + internal refs)`);
console.log(`  collisions resolved with hash suffix: ${entries.filter((e) => /_[0-9a-f]{4}$/.test(e.newBase)).length}`);
