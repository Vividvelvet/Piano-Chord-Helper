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

// ---------------------------------------------------------------------------
// All chord types — semitone intervals from root (mod-12, ascending intent)
// The keyboard builder (chordToKeyboardNotes) converts these to strict
// ascending octave-qualified notes at display time.
// ---------------------------------------------------------------------------
const TYPES: Record<string, number[]> = {

  // ── Dyads ─────────────────────────────────────────────────────────────────
  '5':        [0, 7],             // power chord — root + 5th

  // ── Triads ────────────────────────────────────────────────────────────────
  '':         [0, 4, 7],          // major
  'm':        [0, 3, 7],          // minor
  'dim':      [0, 3, 6],          // diminished
  'aug':      [0, 4, 8],          // augmented

  // ── Suspended ─────────────────────────────────────────────────────────────
  'sus2':     [0, 2, 7],          // suspended 2nd
  'sus4':     [0, 5, 7],          // suspended 4th
  '2':        [0, 2, 7],          // sus2 shorthand
  '4':        [0, 5, 7],          // sus4 shorthand

  // ── Add chords ────────────────────────────────────────────────────────────
  'add2':     [0, 2, 4, 7],       // add 2nd (no 7th)
  'add4':     [0, 4, 5, 7],       // add 4th
  'add9':     [0, 2, 4, 7],       // add 9th (enharmonic to add2 in note names)
  'add11':    [0, 4, 5, 7],       // add 11th (enharmonic to add4)

  // ── Sixth chords ──────────────────────────────────────────────────────────
  '6':        [0, 4, 7, 9],       // major 6th
  'm6':       [0, 3, 7, 9],       // minor 6th
  '69':       [0, 4, 7, 9, 14],   // six-nine (6/9)

  // ── Dominant 7th & alterations ────────────────────────────────────────────
  '7':        [0, 4, 7, 10],      // dominant 7th
  '7sus4':    [0, 5, 7, 10],      // dominant 7 suspended 4th
  '7sus2':    [0, 2, 7, 10],      // dominant 7 suspended 2nd
  '7b5':      [0, 4, 6, 10],      // dominant 7 flat 5
  '7#5':      [0, 4, 8, 10],      // dominant 7 sharp 5 (= aug7)
  'aug7':     [0, 4, 8, 10],      // augmented dominant 7
  '7b9':      [0, 4, 7, 10, 13],  // dominant 7 flat 9  (Hendrix-adjacent)
  '7#9':      [0, 4, 7, 10, 15],  // dominant 7 sharp 9 (Hendrix chord)
  '7#11':     [0, 4, 7, 10, 18],  // dominant 7 sharp 11 (Lydian dominant)
  '7b13':     [0, 4, 7, 10, 20],  // dominant 7 flat 13
  'dim7':     [0, 3, 6, 9],       // fully diminished 7th
  'm7b5':     [0, 3, 6, 10],      // half-diminished (minor 7 flat 5)

  // ── Major 7th family ──────────────────────────────────────────────────────
  'maj7':     [0, 4, 7, 11],      // major 7th
  'maj7#5':   [0, 4, 8, 11],      // major 7 sharp 5 (augmented major 7)
  'maj7#11':  [0, 4, 7, 11, 18],  // major 7 sharp 11 (Lydian)
  'augmaj7':  [0, 4, 8, 11],      // augmented major 7 (alias)

  // ── Minor 7th family ──────────────────────────────────────────────────────
  'm7':       [0, 3, 7, 10],      // minor 7th
  'mmaj7':    [0, 3, 7, 11],      // minor-major 7th

  // ── 9th chords ────────────────────────────────────────────────────────────
  '9':        [0, 2, 4, 7, 10],   // dominant 9th
  'maj9':     [0, 2, 4, 7, 11],   // major 9th
  'm9':       [0, 2, 3, 7, 10],   // minor 9th
  'mmaj9':    [0, 2, 3, 7, 11],   // minor-major 9th

  // ── 11th chords (root, 5th, 7th, 11th — 3rd commonly omitted) ───────────
  '11':       [0, 7, 10, 17],     // dominant 11th
  'maj11':    [0, 4, 7, 11, 17],  // major 11th
  'm11':      [0, 3, 7, 10, 17],  // minor 11th

  // ── 13th chords (root, 3rd, 5th, 7th, 13th) ─────────────────────────────
  '13':       [0, 4, 7, 10, 21],  // dominant 13th
  'maj13':    [0, 4, 7, 11, 21],  // major 13th
  'm13':      [0, 3, 7, 10, 21],  // minor 13th
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

// ---------------------------------------------------------------------------
// Suffix aliases — normalise alternate spellings found in real chord sheets
// ---------------------------------------------------------------------------
const SUFFIX_ALIASES: Record<string, string> = {
  // Minor spellings
  'min':      'm',
  'MIN':      'm',
  'mi':       'm',
  'min7':     'm7',
  'min9':     'm9',
  'min11':    'm11',
  'min13':    'm13',
  'mMaj7':    'mmaj7',
  'minmaj7':  'mmaj7',
  'mM7':      'mmaj7',

  // Major spellings
  'MAJ7':     'maj7',
  'Maj7':     'maj7',
  'MAJ':      '',
  'Maj':      '',
  'M':        '',       // CM = C major (some charts)
  'Δ':        'maj7',   // triangle = major 7
  '△':        'maj7',
  'Δ7':       'maj7',

  // Sus
  'SUS2':     'sus2',
  'SUS4':     'sus4',
  'sus':      'sus4',   // bare "sus" defaults to sus4

  // Dim / aug
  'DIM':      'dim',
  'AUG':      'aug',
  'o':        'dim',    // Co = C diminished
  'o7':       'dim7',
  '+':        'aug',
  '7+':       'aug7',

  // Half-dim
  'ø':        'm7b5',
  'ø7':       'm7b5',
  'hdim':     'm7b5',
  'hdim7':    'm7b5',
  'half-dim': 'm7b5',

  // Extended shorthand
  'dom7':     '7',
  'dom':      '7',
  '6/9':      '69',
};

// ---------------------------------------------------------------------------
// Chord regex
// Alternatives are ordered longest-to-shortest so the engine always matches
// the most specific suffix before a shorter prefix of it.
// ---------------------------------------------------------------------------
const CHORD_RE = /^([A-G][#b]?)(mmaj9|mmaj7|mMaj7|minmaj7|mM7|augmaj7|maj13|maj11|maj9|maj7#11|maj7#5|maj7|m13|m11|m9|m7b5|m7|m6|m|7sus4|7sus2|7b13|7#11|7#9|7b9|7#5|7b5|aug7|aug|dim7|dim|add11|add9|add4|add2|sus4|sus2|69|13|11|9|7|6|5|4|2)?(?:\/([A-G][#b]?))?$/;

function normaliseChord(token: string): string | null {
  const raw = token.trim();
  const m = CHORD_RE.exec(raw);
  if (!m) return null;
  const root   = m[1];
  let suffix   = m[2] ?? '';
  suffix       = SUFFIX_ALIASES[suffix] ?? suffix;
  const bass   = m[3]; // present for slash chords, e.g. "B" in "G/B"
  const upper  = root + suffix;
  if (!CHORD_MAP[upper]) return null;
  return bass ? `${upper}/${bass}` : upper;
}

export function parseChords(text: string): string[] {
  // Split on whitespace and common separators — NOT on "/" (slash chords stay intact)
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

/** True if a whitespace-delimited token looks like a chord (for lyric highlighting). */
export function isChordToken(token: string): boolean {
  return normaliseChord(token) !== null;
}

// ---------------------------------------------------------------------------
// Octave-aware root-position notes for keyboard display
// ---------------------------------------------------------------------------

const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Returns note+octave strings for a chord in strict root position,
 * e.g. "G" → ["G3","B3","D4"], "G/B" → same as "G" (upper chord shown).
 * Root is always placed in octave 3; each subsequent note ascends strictly.
 */
export function chordToKeyboardNotes(chordName: string): string[] {
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
