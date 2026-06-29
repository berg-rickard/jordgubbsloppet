import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { isChordLine } from './transpose';

const SONGS_DIR = path.join(process.cwd(), 'songs');

export interface Line {
  type: 'chord' | 'lyric' | 'blank';
  content: string;
}

export interface Song {
  slug: string;
  title: string;
  artist: string;
  key: string;
  lines: Line[];
}

export function getSongSlugs(): string[] {
  return fs
    .readdirSync(SONGS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));
}

export function getSong(slug: string): Song {
  const raw = fs.readFileSync(path.join(SONGS_DIR, `${slug}.md`), 'utf-8');
  const { data, content } = matter(raw);

  const lines: Line[] = content.split('\n').map((line) => {
    if (!line.trim()) return { type: 'blank', content: '' };
    if (isChordLine(line)) return { type: 'chord', content: line };
    return { type: 'lyric', content: line };
  });

  // Drop trailing blank lines
  while (lines.length && lines[lines.length - 1].type === 'blank') lines.pop();

  return {
    slug,
    title: data.title as string,
    artist: data.artist as string,
    key: data.key as string,
    lines,
  };
}

export function getAllSongs(): Song[] {
  return getSongSlugs()
    .map(getSong)
    .sort((a, b) => a.title.localeCompare(b.title, 'sv'));
}
