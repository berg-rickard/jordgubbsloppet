'use client';

import { useState } from 'react';
import Link from 'next/link';
import { transposeChordLine, transposeKey } from '@/lib/transpose';
import type { Line } from '@/lib/songs';

interface Props {
  title: string;
  artist: string;
  originalKey: string;
  lines: Line[];
}

export function ChordSheet({ title, artist, originalKey, lines }: Props) {
  const [offset, setOffset] = useState(0);
  const [showChords, setShowChords] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('showChords');
    return saved !== null ? saved === 'true' : false;
  });
  const currentKey = transposeKey(originalKey, offset);

  const toggleChords = () => {
    setShowChords((s) => {
      const next = !s;
      localStorage.setItem('showChords', String(next));
      return next;
    });
  };

  return (
    <>
      <nav className="song-nav">
        <Link href="/" className="song-back">← All songs</Link>

        <button
          className={`chords-toggle ${showChords ? 'chords-toggle--on' : 'chords-toggle--off'}`}
          onClick={toggleChords}
          aria-pressed={showChords}
        >
          {showChords ? 'Hide chords' : 'Show chords'}
        </button>

        <div className="transpose-control">
          <span className="transpose-label">Key</span>
          {offset !== 0 && (
            <button className="transpose-reset" onClick={() => setOffset(0)}>
              reset
            </button>
          )}
          <button
            className="transpose-btn"
            onClick={() => setOffset((o) => o - 1)}
            aria-label="Transpose down one semitone"
          >−</button>
          <span className="transpose-key">{currentKey}</span>
          <button
            className="transpose-btn"
            onClick={() => setOffset((o) => o + 1)}
            aria-label="Transpose up one semitone"
          >+</button>
        </div>
      </nav>

      <main className="song-main">
        <h1 className="song-title">{title}</h1>
        <p className="song-meta">
          {artist}
          {offset !== 0 && <> · original key: {originalKey}</>}
        </p>

        <div className="chord-sheet">
          {lines.map((line, i) => {
            if (line.type === 'blank') {
              return <span key={i} className="blank-line" />;
            }
            if (line.type === 'lyric') {
              return <span key={i} className="lyric-line">{line.content}</span>;
            }
            if (!showChords) return null;
            const content = offset === 0
              ? line.content
              : transposeChordLine(line.content, offset);
            return <span key={i} className="chord-line">{content}</span>;
          })}
        </div>
      </main>
    </>
  );
}
