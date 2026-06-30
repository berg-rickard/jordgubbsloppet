const SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

// Enharmonic equivalents: sharp → flat
const TO_FLAT: Record<string, string> = {
  'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb',
};

// Normalize flat input to sharp for index lookup
const TO_SHARP: Record<string, string> = {
  'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#', 'Cb': 'B', 'Fb': 'E',
};

// Keys that conventionally use flats in chord notation
const FLAT_KEYS = new Set(['F', 'Bb', 'Eb', 'Ab']);

function transposeNote(note: string, semitones: number): string {
  const sharp = TO_SHARP[note] ?? note;
  const idx = SHARPS.indexOf(sharp as (typeof SHARPS)[number]);
  if (idx === -1) return note;
  const newSharp = SHARPS[((idx + semitones) % 12 + 12) % 12];
  const flat = TO_FLAT[newSharp];
  return flat && FLAT_KEYS.has(flat) ? flat : newSharp;
}

// Matches: root, quality, number, optional sus/add + number (e.g. C7sus4, Am9add11), slash bass
// Longest quality alternative first so 'maj' beats 'm'
const CHORD_RE = /^([A-G][#b]?)(maj|min|m|aug|dim)?(\d*)(sus|add)?(\d*)(?:\/([A-G][#b]?))?$/;

function transposeChordToken(token: string, semitones: number): string {
  const m = token.match(CHORD_RE);
  if (!m) return token;
  const [, root, quality = '', num = '', mod = '', modNum = '', bass] = m;
  const newRoot = transposeNote(root, semitones);
  const newBass = bass ? transposeNote(bass, semitones) : undefined;
  return newRoot + quality + num + mod + modNum + (newBass ? '/' + newBass : '');
}

export function transposeChordLine(line: string, semitones: number): string {
  if (semitones === 0) return line;

  // Split into alternating whitespace / non-whitespace segments
  const segments = line.match(/(\s+|\S+)/g) ?? [];
  let result = '';
  let widthDelta = 0; // accumulated width change from transposed chords

  for (const seg of segments) {
    if (/^\s/.test(seg)) {
      // Absorb any width delta into the following whitespace; keep ≥1 space
      const adjusted = seg.length - widthDelta;
      result += ' '.repeat(Math.max(1, adjusted));
      widthDelta = 0;
    } else {
      const transposed = transposeChordToken(seg, semitones);
      result += transposed;
      widthDelta += transposed.length - seg.length;
    }
  }

  return result;
}

export function transposeKey(key: string, semitones: number): string {
  if (semitones === 0) return key;
  // Handle minor suffix, e.g. "Am", "C#m"
  const isMinor = key.length > 1 && key.endsWith('m') && /[A-G]/.test(key[0]);
  const root = isMinor ? key.slice(0, -1) : key;
  return transposeNote(root, semitones) + (isMinor ? 'm' : '');
}

export function isChordLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  return trimmed.split(/\s+/).every((token) => CHORD_RE.test(token));
}
