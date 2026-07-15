export const CHORD_MAP: Record<string, string[]> = {
  // Major
  'C': ['C', 'E', 'G'],
  'D': ['D', 'F#', 'A'],
  'E': ['E', 'G#', 'B'],
  'F': ['F', 'A', 'C'],
  'G': ['G', 'B', 'D'],
  'A': ['A', 'C#', 'E'],
  'B': ['B', 'D#', 'F#'],
  
  // Minor
  'Am': ['A', 'C', 'E'],
  'Bm': ['B', 'D', 'F#'],
  'Cm': ['C', 'D#', 'G'], // Eb -> D#
  'Dm': ['D', 'F', 'A'],
  'Em': ['E', 'G', 'B'],
  'Fm': ['F', 'G#', 'C'], // Ab -> G#
  'Gm': ['G', 'A#', 'D'], // Bb -> A#
  
  // 7th
  'G7': ['G', 'B', 'D', 'F'],
  'C7': ['C', 'E', 'G', 'A#'], // Bb -> A#
  'D7': ['D', 'F#', 'A', 'C'],
  'A7': ['A', 'C#', 'E', 'G'],
  'E7': ['E', 'G#', 'B', 'D'],
  'B7': ['B', 'D#', 'F#', 'A'],
  
  // Others
  'Cadd9': ['C', 'D', 'E', 'G'],
  'Dsus2': ['D', 'E', 'A'],
  'Dsus4': ['D', 'G', 'A'],
  'Asus2': ['A', 'B', 'E'],
  'Asus4': ['A', 'D', 'E'],
  'Esus4': ['E', 'A', 'B'],
  'Gsus2': ['G', 'A', 'D'],
  'F#m': ['F#', 'A', 'C#']
};

export function parseChords(text: string): string[] {
  // Match tokens by splitting on whitespace, pipe, commas, dashes
  const tokens = text.split(/[\s|,-]+/);
  const chords: string[] = [];
  const chordPattern = /^[A-G][#b]?(m|maj|min|7|m7|maj7|sus2|sus4|add9|dim|aug)?$/;
  
  for (const token of tokens) {
    if (chordPattern.test(token)) {
      chords.push(token);
    }
  }
  
  // Deduplicate but preserve order
  return Array.from(new Set(chords));
}
