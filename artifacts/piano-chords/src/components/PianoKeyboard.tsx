import React from 'react';
import { cn } from '@/lib/utils';

interface PianoKeyboardProps {
  activeNotes: string[]; // e.g. ['C', 'E', 'G']
}

export function PianoKeyboard({ activeNotes }: PianoKeyboardProps) {
  // We map notes to keys.
  const whiteKeys = [
    { note: 'C', label: 'C' },
    { note: 'D', label: 'D' },
    { note: 'E', label: 'E' },
    { note: 'F', label: 'F' },
    { note: 'G', label: 'G' },
    { note: 'A', label: 'A' },
    { note: 'B', label: 'B' },
    { note: 'C', label: 'C', isHigh: true }, // C4
  ];

  const blackKeys = [
    { note: 'C#', label: 'C#', position: 1 },
    { note: 'D#', label: 'D#', position: 2 },
    { note: 'F#', label: 'F#', position: 4 },
    { note: 'G#', label: 'G#', position: 5 },
    { note: 'A#', label: 'A#', position: 6 },
  ];

  const isNoteActive = (note: string) => activeNotes.includes(note);

  return (
    <div className="relative w-full max-w-3xl mx-auto h-48 md:h-64 rounded-b-xl shadow-2xl bg-[#1a1512] p-2 pt-0 select-none">
      <div className="relative w-full h-full flex rounded-b-lg overflow-hidden">
        {whiteKeys.map((key, i) => (
          <div
            key={`white-${i}`}
            className={cn(
              "relative h-full border border-black/20 rounded-b-md transition-all duration-150 ease-out flex items-end justify-center pb-4",
              isNoteActive(key.note)
                ? "bg-amber-400 shadow-[inset_0_-4px_12px_rgba(217,119,6,0.6)] text-amber-900 translate-y-1"
                : "bg-[#fffff8] shadow-[inset_0_-4px_8px_rgba(0,0,0,0.1)] text-black/40 hover:bg-[#f4f4ea]",
              "w-[12.5%]"
            )}
            style={{
              transformOrigin: 'top',
              transform: isNoteActive(key.note) ? 'rotateX(2deg) translateY(2px)' : 'none'
            }}
          >
            <span className={cn(
              "font-medium text-sm transition-opacity duration-300",
              isNoteActive(key.note) ? "opacity-100" : "opacity-0"
            )}>
              {key.label}
            </span>
          </div>
        ))}

        {blackKeys.map((key, i) => {
          const leftPos = `calc((100% / 8) * ${key.position} - (100% / 14) / 2)`;
          return (
            <div
              key={`black-${i}`}
              className={cn(
                "absolute top-0 h-[65%] w-[calc(100%/14)] rounded-b-md z-10 transition-all duration-150 ease-out border-x border-b border-black flex items-end justify-center pb-3",
                isNoteActive(key.note)
                  ? "bg-amber-500 shadow-[inset_0_-2px_8px_rgba(251,191,36,0.6),0_4px_8px_rgba(0,0,0,0.5)] text-amber-950 translate-y-1"
                  : "bg-[#18181b] shadow-[inset_-2px_-4px_6px_rgba(255,255,255,0.1),0_4px_8px_rgba(0,0,0,0.5)] text-white/40 hover:bg-[#27272a]"
              )}
              style={{
                left: leftPos,
                transformOrigin: 'top',
                transform: isNoteActive(key.note) ? 'rotateX(2deg) translateY(2px)' : 'none'
              }}
            >
              <span className={cn(
                "font-medium text-xs transition-opacity duration-300",
                isNoteActive(key.note) ? "opacity-100" : "opacity-0"
              )}>
                {key.label}
              </span>
            </div>
          );
        })}
      </div>
      {/* Decorative top wooden strip */}
      <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-[#2a1b14] to-[#1a1512] shadow-md z-20"></div>
    </div>
  );
}
