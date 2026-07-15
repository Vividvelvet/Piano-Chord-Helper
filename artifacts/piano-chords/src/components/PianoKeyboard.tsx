import React from 'react';
import { cn } from '@/lib/utils';

interface PianoKeyboardProps {
  /** Octave-qualified note strings in root position, e.g. ["G3", "B3", "D4"] */
  activeNotes: string[];
  compact?: boolean;
}

const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const WHITE_NOTES = new Set(['C', 'D', 'E', 'F', 'G', 'A', 'B']);

function isWhite(name: string) { return WHITE_NOTES.has(name); }

/**
 * Build an 8-white-key keyboard starting from `rootOctaveNote`.
 * - White-key roots (C, D, E…): keyboard starts on that note.
 * - Black-key roots (C#, D#…): keyboard starts one semitone below so the root
 *   appears as the very first black key at the left edge.
 *
 * Returns the white keys in order and the black keys with their gap position
 * (index of the white key immediately to their RIGHT).
 */
function buildKeyboard(rootOctaveNote: string): {
  whiteKeys: string[];
  blackKeys: { note: string; rightOf: number }[];
} {
  const m = rootOctaveNote.match(/^([A-G]#?)(\d)$/);
  if (!m) return { whiteKeys: [], blackKeys: [] };

  const rootName = m[1];
  let startSemitone = CHROMATIC.indexOf(rootName);
  let startOctave = parseInt(m[2]);

  // If root is a black key, back up one semitone so it sits at the left edge
  if (!isWhite(rootName)) {
    startSemitone -= 1;
    if (startSemitone < 0) { startSemitone += 12; startOctave -= 1; }
  }

  const whiteKeys: string[] = [];
  const blackKeys: { note: string; rightOf: number }[] = [];
  let whiteIdx = 0;

  // Walk chromatically for ~14 steps — enough to fill 8 white keys + their black keys
  for (let i = 0; i <= 14 && whiteKeys.length < 9; i++) {
    const abs = startSemitone + i;
    const semi = ((abs % 12) + 12) % 12;
    const oct  = startOctave + Math.floor(abs / 12);
    const name = CHROMATIC[semi];
    const key  = `${name}${oct}`;

    if (isWhite(name)) {
      if (whiteIdx < 8) whiteKeys.push(key);
      whiteIdx++;
    } else {
      // Only add black keys that sit between our 8 white keys
      blackKeys.push({ note: key, rightOf: whiteIdx });
    }
  }

  // Drop black keys that fall outside the 8-white-key range
  return { whiteKeys: whiteKeys.slice(0, 8), blackKeys: blackKeys.filter(b => b.rightOf <= 7) };
}

export function PianoKeyboard({ activeNotes, compact = false }: PianoKeyboardProps) {
  const active = new Set(activeNotes);
  // Derive root from the first active note (lowest = root in root-position input)
  const root = activeNotes[0] ?? 'C3';
  const { whiteKeys, blackKeys } = buildKeyboard(root);

  const N = whiteKeys.length || 8;
  const WHITE_PCT = 100 / N;
  const BLACK_PCT = WHITE_PCT * 0.57;

  return (
    <div className={cn(
      "relative w-full rounded-b-xl shadow-2xl bg-[#1a1512] p-2 pt-0 select-none",
      compact ? "h-28" : "h-48 md:h-64 max-w-3xl mx-auto"
    )}>
      <div className="relative w-full h-full flex rounded-b-lg overflow-hidden">

        {/* White keys */}
        {whiteKeys.map((note, i) => {
          const isActive = active.has(note);
          return (
            <div
              key={`w-${i}`}
              style={{ width: `${WHITE_PCT}%`, transformOrigin: 'top',
                       transform: isActive ? 'rotateX(2deg) translateY(2px)' : 'none' }}
              className={cn(
                "relative h-full border border-black/20 rounded-b-md transition-all duration-150 ease-out flex items-end justify-center",
                compact ? "pb-1" : "pb-4",
                isActive
                  ? "bg-amber-400 shadow-[inset_0_-4px_12px_rgba(217,119,6,0.6)] text-amber-900"
                  : "bg-[#fffff8] shadow-[inset_0_-4px_8px_rgba(0,0,0,0.1)] text-black/40 hover:bg-[#f4f4ea]"
              )}
            >
              <span className={cn(
                "font-medium transition-opacity duration-300",
                compact ? "text-[8px]" : "text-sm",
                isActive ? "opacity-100" : "opacity-0"
              )}>
                {note.replace(/\d/, '')}
              </span>
            </div>
          );
        })}

        {/* Black keys */}
        {blackKeys.map((key) => {
          const isActive = active.has(key.note);
          return (
            <div
              key={key.note}
              style={{
                left: `${WHITE_PCT * key.rightOf - BLACK_PCT / 2}%`,
                width: `${BLACK_PCT}%`,
                transformOrigin: 'top',
                transform: isActive ? 'rotateX(2deg) translateY(2px)' : 'none',
              }}
              className={cn(
                "absolute top-0 h-[65%] z-10 transition-all duration-150 ease-out rounded-b-md border-x border-b border-black flex items-end justify-center",
                compact ? "pb-1" : "pb-3",
                isActive
                  ? "bg-amber-500 shadow-[inset_0_-2px_8px_rgba(251,191,36,0.6),0_4px_8px_rgba(0,0,0,0.5)] text-amber-950"
                  : "bg-[#18181b] shadow-[inset_-2px_-4px_6px_rgba(255,255,255,0.1),0_4px_8px_rgba(0,0,0,0.5)] text-white/40 hover:bg-[#27272a]"
              )}
            >
              <span className={cn(
                "font-medium transition-opacity duration-300 text-center leading-tight",
                compact ? "text-[6px]" : "text-[9px]",
                isActive ? "opacity-100" : "opacity-0"
              )}>
                {key.note.replace(/\d/, '').replace('#', '♯')}
              </span>
            </div>
          );
        })}
      </div>
      {/* Decorative top wooden strip */}
      <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-[#2a1b14] to-[#1a1512] shadow-md z-20" />
    </div>
  );
}
