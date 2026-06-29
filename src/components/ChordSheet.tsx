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

const IconEyeOpen = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M1 7.5C1 7.5 3.5 3 7.5 3S14 7.5 14 7.5 11.5 12 7.5 12 1 7.5 1 7.5z"/>
    <circle cx="7.5" cy="7.5" r="2"/>
  </svg>
);

const IconEyeClosed = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M1 7.5C1 7.5 3.5 3 7.5 3S14 7.5 14 7.5 11.5 12 7.5 12 1 7.5 1 7.5z"/>
    <circle cx="7.5" cy="7.5" r="2"/>
    <line x1="2.5" y1="2.5" x2="12.5" y2="12.5"/>
  </svg>
);

const IconReset = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 7a5 5 0 1 0 1.5-3.5"/>
    <polyline points="1 3 2 7 6 6"/>
  </svg>
);

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
        <Link href="/" className="song-back" aria-label="All songs">←</Link>

        <div className="transpose-control">
          <span className="transpose-label">⇅</span>
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
          <button
            className="transpose-reset"
            onClick={() => setOffset(0)}
            aria-label="Reset key"
            aria-hidden={offset === 0}
            style={{ visibility: offset === 0 ? 'hidden' : 'visible' }}
          >
            <IconReset />
          </button>
        </div>

        <button
          className={`chords-toggle ${showChords ? 'chords-toggle--on' : 'chords-toggle--off'}`}
          onClick={toggleChords}
          aria-pressed={showChords}
          aria-label={showChords ? 'Hide chords' : 'Show chords'}
        >
          {showChords ? <IconEyeOpen /> : <IconEyeClosed />}
        </button>
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
