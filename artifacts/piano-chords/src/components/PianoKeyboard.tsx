import React from 'react';
import { cn } from '@/lib/utils';

interface PianoKeyboardProps {
  activeNotes: string[];
  compact?: boolean;
}

// All keys in keyboard order (C3–C4), lowest to highest.
// Each key has a unique index so we can highlight exactly one occurrence per note.
const WHITE_KEYS = [
  { note: 'C' },
  { note: 'D' },
  { note: 'E' },
  { note: 'F' },
  { note: 'G' },
  { note: 'A' },
  { note: 'B' },
  { note: 'C' }, // high C — only lit if no lower C consumed the note
];

const BLACK_KEYS = [
  { note: 'C#', position: 1 },
  { note: 'D#', position: 2 },
  { note: 'F#', position: 4 },
  { note: 'G#', position: 5 },
  { note: 'A#', position: 6 },
];

/** Pre-compute which key indices should be lit, consuming each note name exactly once. */
function computeActiveIndices(activeNotes: string[]): { white: Set<number>; black: Set<number> } {
  const pool = [...activeNotes]; // mutable copy
  const white = new Set<number>();
  const black = new Set<number>();

  WHITE_KEYS.forEach((key, i) => {
    const idx = pool.indexOf(key.note);
    if (idx !== -1) {
      white.add(i);
      pool.splice(idx, 1);
    }
  });

  // Reset pool for black keys (independent scan)
  const pool2 = [...activeNotes];
  BLACK_KEYS.forEach((key, i) => {
    const idx = pool2.indexOf(key.note);
    if (idx !== -1) {
      black.add(i);
      pool2.splice(idx, 1);
    }
  });

  return { white, black };
}

export function PianoKeyboard({ activeNotes, compact = false }: PianoKeyboardProps) {
  const { white: activeWhite, black: activeBlack } = computeActiveIndices(activeNotes);

  return (
    <div className={cn(
      "relative w-full rounded-b-xl shadow-2xl bg-[#1a1512] p-2 pt-0 select-none",
      compact ? "h-28" : "h-48 md:h-64 max-w-3xl mx-auto"
    )}>
      <div className="relative w-full h-full flex rounded-b-lg overflow-hidden">
        {WHITE_KEYS.map((key, i) => {
          const active = activeWhite.has(i);
          return (
            <div
              key={`white-${i}`}
              className={cn(
                "relative h-full border border-black/20 rounded-b-md transition-all duration-150 ease-out flex items-end justify-center w-[12.5%]",
                compact ? "pb-1" : "pb-4",
                active
                  ? "bg-amber-400 shadow-[inset_0_-4px_12px_rgba(217,119,6,0.6)] text-amber-900 translate-y-1"
                  : "bg-[#fffff8] shadow-[inset_0_-4px_8px_rgba(0,0,0,0.1)] text-black/40 hover:bg-[#f4f4ea]"
              )}
              style={{
                transformOrigin: 'top',
                transform: active ? 'rotateX(2deg) translateY(2px)' : 'none'
              }}
            >
              <span className={cn(
                "font-medium transition-opacity duration-300",
                compact ? "text-[9px]" : "text-sm",
                active ? "opacity-100" : "opacity-0"
              )}>
                {key.note}
              </span>
            </div>
          );
        })}

        {BLACK_KEYS.map((key, i) => {
          const active = activeBlack.has(i);
          const leftPos = `calc((100% / 8) * ${key.position} - (100% / 14) / 2)`;
          return (
            <div
              key={`black-${i}`}
              className={cn(
                "absolute top-0 h-[65%] w-[calc(100%/14)] rounded-b-md z-10 transition-all duration-150 ease-out border-x border-b border-black flex items-end justify-center",
                compact ? "pb-1" : "pb-3",
                active
                  ? "bg-amber-500 shadow-[inset_0_-2px_8px_rgba(251,191,36,0.6),0_4px_8px_rgba(0,0,0,0.5)] text-amber-950 translate-y-1"
                  : "bg-[#18181b] shadow-[inset_-2px_-4px_6px_rgba(255,255,255,0.1),0_4px_8px_rgba(0,0,0,0.5)] text-white/40 hover:bg-[#27272a]"
              )}
              style={{
                left: leftPos,
                transformOrigin: 'top',
                transform: active ? 'rotateX(2deg) translateY(2px)' : 'none'
              }}
            >
              <span className={cn(
                "font-medium transition-opacity duration-300",
                compact ? "text-[7px]" : "text-xs",
                active ? "opacity-100" : "opacity-0"
              )}>
                {key.note}
              </span>
            </div>
          );
        })}
      </div>
      {/* Decorative top wooden strip */}
      <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-[#2a1b14] to-[#1a1512] shadow-md z-20"></div>
    </div>
  );
}
