import React from 'react';
import { cn } from '@/lib/utils';

interface PianoKeyboardProps {
  /** Octave-qualified note strings, e.g. ["G3", "B3", "D4"] */
  activeNotes: string[];
  compact?: boolean;
}

// Keyboard spans C3–G4 (12 white keys) — wide enough for any root-position triad.
const WHITE_KEYS = [
  'C3','D3','E3','F3','G3','A3','B3',
  'C4','D4','E4','F4','G4',
] as const;

// position = index of the white key immediately to the right of this black key
const BLACK_KEYS = [
  { note: 'C#3', position: 1  },
  { note: 'D#3', position: 2  },
  { note: 'F#3', position: 4  },
  { note: 'G#3', position: 5  },
  { note: 'A#3', position: 6  },
  { note: 'C#4', position: 8  },
  { note: 'D#4', position: 9  },
  { note: 'F#4', position: 11 },
] as const;

const N = WHITE_KEYS.length; // 12
const WHITE_PCT = 100 / N;         // width of one white key as %
const BLACK_PCT = WHITE_PCT * 0.57; // black key width ≈ 57% of white

export function PianoKeyboard({ activeNotes, compact = false }: PianoKeyboardProps) {
  const active = new Set(activeNotes);

  return (
    <div className={cn(
      "relative w-full rounded-b-xl shadow-2xl bg-[#1a1512] p-2 pt-0 select-none",
      compact ? "h-28" : "h-48 md:h-64 max-w-3xl mx-auto"
    )}>
      <div className="relative w-full h-full flex rounded-b-lg overflow-hidden">

        {/* White keys */}
        {WHITE_KEYS.map((note, i) => {
          const isActive = active.has(note);
          return (
            <div
              key={`w-${i}`}
              style={{
                width: `${WHITE_PCT}%`,
                transformOrigin: 'top',
                transform: isActive ? 'rotateX(2deg) translateY(2px)' : 'none',
              }}
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
        {BLACK_KEYS.map((key) => {
          const isActive = active.has(key.note);
          return (
            <div
              key={key.note}
              style={{
                left: `${WHITE_PCT * key.position - BLACK_PCT / 2}%`,
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
