// Chromatic scale using sharps
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Map flat names to their sharp equivalents
const FLAT_TO_SHARP: Record<string, string> = {
  'Db': 'C#', 'Eb': 'D#', 'Fb': 'E', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#', 'Cb': 'B',
};

function noteAt(root: string, semitones: number): string {
  const sharp = FLAT_TO_SHARP[root] ?? root;
  const idx = NOTES.indexOf(sharp);
  if (idx === -1) return root;
  return NOTES[(idx + semitones) % 12];
}

function buildChord(root: string, intervals: number[]): string[] {
  return intervals.map(i => noteAt(root, i));
}

// All chord types by semitone intervals from root
const TYPES: Record<string, number[]> = {
  '':      [0, 4, 7],        // major
  'm':     [0, 3, 7],        // minor
  '7':     [0, 4, 7, 10],    // dominant 7th
  'maj7':  [0, 4, 7, 11],    // major 7th
  'm7':    [0, 3, 7, 10],    // minor 7th
  'sus2':  [0, 2, 7],        // suspended 2nd
  'sus4':  [0, 5, 7],        // suspended 4th
  'add9':  [0, 2, 4, 7],     // add 9 (no 7th)
  'dim':   [0, 3, 6],        // diminished triad
  'dim7':  [0, 3, 6, 9],     // diminished 7th
  'aug':   [0, 4, 8],        // augmented
  'm7b5':  [0, 3, 6, 10],    // half-diminished
  'maj9':  [0, 2, 4, 7, 11], // major 9th
  'm9':    [0, 2, 3, 7, 10], // minor 9th
  '9':     [0, 2, 4, 7, 10], // dominant 9th
  '6':     [0, 4, 7, 9],     // major 6th
  'm6':    [0, 3, 7, 9],     // minor 6th
  '2':     [0, 2, 7],        // same as sus2 but written differently
  '4':     [0, 5, 7],        // same as sus4 but written differently
};

// Roots: naturals + sharps + flats
const ROOTS = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F',
  'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
];

// Build the full chord map
export const CHORD_MAP: Record<string, string[]> = {};
for (const root of ROOTS) {
  for (const [suffix, intervals] of Object.entries(TYPES)) {
    const name = root + suffix;
    CHORD_MAP[name] = buildChord(root, intervals);
  }
}

// Suffix aliases for parsing (e.g. "min" → "m", "Maj7" → "maj7")
const SUFFIX_ALIASES: Record<string, string> = {
  'min':  'm',
  'MIN':  'm',
  'MAJ7': 'maj7',
  'Maj7': 'maj7',
  'MAJ':  '',
  'Maj':  '',
  'M':    '',      // CM = C major (some charts)
  'SUS2': 'sus2',
  'SUS4': 'sus4',
  'DIM':  'dim',
  'AUG':  'aug',
};

// Chord regex: root note, optional accidental, optional suffix
const CHORD_RE = /^([A-G][#b]?)(m(?:aj7|aj9|7b5|9|6)?|maj7|maj9|sus[24]|add9|dim7|dim|aug|m7b5|7|9|6|2|4)?$/;

function normaliseChord(token: string): string | null {
  const m = CHORD_RE.exec(token);
  if (!m) return null;
  const root = m[1];
  let suffix = m[2] ?? '';
  suffix = SUFFIX_ALIASES[suffix] ?? suffix;
  return root + suffix;
}

export function parseChords(text: string): string[] {
  // Split on whitespace, bar lines, commas, dashes, brackets, slashes
  const tokens = text.split(/[\s|,\-/\[\]()]+/);
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of tokens) {
    const chord = normaliseChord(raw.trim());
    if (chord && !seen.has(chord)) {
      seen.add(chord);
      result.push(chord);
    }
  }
  return result;
}

// Returns true if a word-token looks like a chord name (for lyric highlighting)
export function isChordToken(token: string): boolean {
  return normaliseChord(token.trim()) !== null;
}
