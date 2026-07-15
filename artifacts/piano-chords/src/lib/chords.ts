// Chromatic scale using sharps
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Map flat names to their sharp equivalents
export const FLAT_TO_SHARP: Record<string, string> = {
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
  '5':     [0, 7],            // power chord — root + fifth only
  '':      [0, 4, 7],         // major
  'm':     [0, 3, 7],         // minor
  '7':     [0, 4, 7, 10],     // dominant 7th
  'maj7':  [0, 4, 7, 11],     // major 7th
  'm7':    [0, 3, 7, 10],     // minor 7th
  'sus2':  [0, 2, 7],         // suspended 2nd
  'sus4':  [0, 5, 7],         // suspended 4th
  'add9':  [0, 2, 4, 7],      // add 9 (no 7th)
  'dim':   [0, 3, 6],         // diminished triad
  'dim7':  [0, 3, 6, 9],      // diminished 7th
  'aug':   [0, 4, 8],         // augmented
  'm7b5':  [0, 3, 6, 10],     // half-diminished
  'maj9':  [0, 2, 4, 7, 11],  // major 9th
  'm9':    [0, 2, 3, 7, 10],  // minor 9th
  '9':     [0, 2, 4, 7, 10],  // dominant 9th
  '6':     [0, 4, 7, 9],      // major 6th
  'm6':    [0, 3, 7, 9],      // minor 6th
  '2':     [0, 2, 7],         // sus2 alternate spelling
  '4':     [0, 5, 7],         // sus4 alternate spelling
};

// Roots: naturals + sharps + flats
const ROOTS = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F',
  'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
];

// Build the full chord map (upper chords only — slash chords resolved at lookup time)
export const CHORD_MAP: Record<string, string[]> = {};
for (const root of ROOTS) {
  for (const [suffix, intervals] of Object.entries(TYPES)) {
    CHORD_MAP[root + suffix] = buildChord(root, intervals);
  }
}

/** Strip the slash-bass part and return just the upper chord name. */
export function upperChord(chordName: string): string {
  return chordName.includes('/') ? chordName.split('/')[0] : chordName;
}

/** Notes for display label (plain note names, e.g. ["G","B","D"]). Handles slash chords. */
export function chordNotes(chordName: string): string[] {
  return CHORD_MAP[upperChord(chordName)] ?? [];
}

// Suffix aliases for parsing
const SUFFIX_ALIASES: Record<string, string> = {
  'min':  'm', 'MIN':  'm',
  'MAJ7': 'maj7', 'Maj7': 'maj7',
  'MAJ':  '', 'Maj':  '',
  'M':    '',
  'SUS2': 'sus2', 'SUS4': 'sus4',
  'DIM':  'dim', 'AUG':  'aug',
};

/**
 * Chord regex — matches:
 *   - Root note:          [A-G][#b]?
 *   - Optional suffix:    5 | m | maj7 | sus2 | add9 | dim | … etc.
 *   - Optional slash bass: /[A-G][#b]?   (e.g. /B in G/B)
 *
 * The '5' alternative is listed first so "A5" is not mis-read as A + "5" after another suffix.
 */
const CHORD_RE =
  /^([A-G][#b]?)(5|m(?:aj7|aj9|7b5|9|6)?|maj7|maj9|sus[24]|add9|dim7|dim|aug|m7b5|7|9|6|2|4)?(?:\/([A-G][#b]?))?$/;

function normaliseChord(token: string): string | null {
  const m = CHORD_RE.exec(token.trim());
  if (!m) return null;
  const root   = m[1];
  let suffix   = m[2] ?? '';
  suffix       = SUFFIX_ALIASES[suffix] ?? suffix;
  const bass   = m[3]; // present for slash chords, e.g. "B" in "G/B"
  const upper  = root + suffix;
  // Validate the upper chord is in the dictionary
  if (!CHORD_MAP[upper]) return null;
  return bass ? `${upper}/${bass}` : upper;
}

export function parseChords(text: string): string[] {
  // Split on whitespace and typical separators — but NOT on "/" so slash chords stay intact.
  const tokens = text.split(/[\s|,\-\[\]()]+/);
  const seen   = new Set<string>();
  const result: string[] = [];
  for (const raw of tokens) {
    const chord = normaliseChord(raw);
    if (chord && !seen.has(chord)) {
      seen.add(chord);
      result.push(chord);
    }
  }
  return result;
}

/** True if a whitespace-delimited token looks like a chord (used for lyric highlighting). */
export function isChordToken(token: string): boolean {
  return normaliseChord(token) !== null;
}

// --- Octave-aware root-position notes for keyboard display ---

const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Returns note+octave strings for a chord in strict root position,
 * e.g. "G" → ["G3","B3","D4"], "G/B" → same as "G" (upper chord shown).
 * Root is always placed in octave 3; each subsequent note ascends strictly.
 */
export function chordToKeyboardNotes(chordName: string): string[] {
  // For slash chords use the upper chord's notes
  const notes = CHORD_MAP[upperChord(chordName)];
  if (!notes || notes.length === 0) return [];

  let prevAbsolute = -1;
  return notes.map((note, i) => {
    const sharp    = FLAT_TO_SHARP[note] ?? note;
    const semitone = CHROMATIC.indexOf(sharp);
    if (semitone === -1) return '';
    let absolute   = semitone + (i === 0 ? 3 : 0) * 12;
    while (absolute <= prevAbsolute) absolute += 12;
    prevAbsolute   = absolute;
    const octave   = Math.floor(absolute / 12);
    return `${sharp}${octave}`;
  }).filter(Boolean);
}
