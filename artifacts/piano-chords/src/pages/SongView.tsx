import { useState } from 'react';
import { useRoute, Link, useLocation } from 'wouter';
import { useGetSong, useDeleteSong, getListSongsQueryKey, getGetSongQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Trash2, Pencil, Loader2, Music } from 'lucide-react';
import { parseChords, chordNotes, isChordToken, chordToKeyboardNotes } from '@/lib/chords';
import { PianoKeyboard } from '@/components/PianoKeyboard';
import { cn } from '@/lib/utils';

const SECTION_RE = /^\[.+\]$/;

interface LyricsLineProps {
  line: string;
  onChordEnter: (chord: string) => void;
  onChordLeave: () => void;
}

function LyricsLine({ line, onChordEnter, onChordLeave }: LyricsLineProps) {
  if (SECTION_RE.test(line.trim())) {
    const label = line.trim().slice(1, -1);
    return (
      <span className="block text-xl font-bold text-title mt-4 mb-1 not-italic">
        {label}
      </span>
    );
  }

  const tokens = line.split(/(\s+)/);
  return (
    <span>
      {tokens.map((tok, i) => {
        const normalised = parseChords(tok)[0];
        return normalised ? (
          <span
            key={i}
            className="text-primary font-semibold cursor-default rounded px-0.5 hover:bg-primary/20 transition-colors duration-100"
            onMouseEnter={() => onChordEnter(normalised)}
            onMouseLeave={onChordLeave}
          >
            {tok}
          </span>
        ) : (
          <span key={i}>{tok}</span>
        );
      })}
    </span>
  );
}

export default function SongView() {
  const [, params] = useRoute('/songs/:id');
  const id = params?.id ? parseInt(params.id) : 0;
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [hoveredChord, setHoveredChord] = useState<string | null>(null);

  const { data: song, isLoading } = useGetSong(id, {
    query: { enabled: !!id, queryKey: getGetSongQueryKey(id) }
  });

  const deleteSong = useDeleteSong();

  const handleDelete = () => {
    if (!confirm('Are you sure you want to remove this piece?')) return;
    deleteSong.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListSongsQueryKey() });
          setLocation('/');
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-background text-foreground flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
      </div>
    );
  }

  if (!song) {
    return (
      <div className="min-h-[100dvh] bg-background text-foreground flex flex-col items-center justify-center">
        <Music className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
        <h2 className="text-2xl font-serif text-title mb-2">Piece not found</h2>
        <Link href="/" className="text-primary hover:underline">Return to Library</Link>
      </div>
    );
  }

  const chords = parseChords(song.chordText);
  const lyricsLines = song.lyricsText ? song.lyricsText.split('\n') : null;

  return (
    <div className="min-h-[100dvh] bg-background text-foreground font-sans">
      <div className="max-w-6xl mx-auto p-6 md:p-10">

        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-title transition-colors gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Library</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href={`/songs/${id}/edit`}
              className="text-muted-foreground hover:text-title transition-colors p-2 rounded-md hover:bg-foreground/5"
              title="Edit song"
            >
              <Pencil className="w-4 h-4" />
            </Link>
            <button
              onClick={handleDelete}
              className="text-muted-foreground hover:text-destructive transition-colors p-2 rounded-md hover:bg-destructive/10"
              title="Delete song"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Song title */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-serif text-title tracking-tight mb-2">{song.title}</h1>
          {song.artist && <p className="text-lg text-muted-foreground font-light">{song.artist}</p>}
        </div>

        {/* Two-column layout */}
        <div className="flex flex-col xl:flex-row gap-10">

          {/* Chord keyboards grid */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">Chords</h2>
            {chords.length === 0 ? (
              <p className="text-muted-foreground italic">No recognised chords found.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
                {chords.map((chord, i) => {
                  const notes         = chordNotes(chord);
                  const keyboardNotes = chordToKeyboardNotes(chord);
                  const hasMapping    = keyboardNotes.length > 0;
                  const isHovered     = hoveredChord === chord;
                  return (
                    <div
                      key={chord}
                      className={cn(
                        "border rounded-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 fade-in fill-mode-both transition-all duration-150",
                        isHovered
                          ? "bg-primary/10 border-primary/50 shadow-[0_0_24px_rgba(217,119,6,0.2)]"
                          : "bg-card border-border"
                      )}
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <div className={cn(
                        "px-4 py-3 flex items-center justify-between border-b transition-colors duration-150",
                        isHovered ? "border-primary/30" : "border-border/50"
                      )}>
                        <span className={cn(
                          "text-xl font-semibold tracking-wide transition-colors duration-150",
                          isHovered ? "text-primary" : "text-title"
                        )}>
                          {chord}
                        </span>
                        {hasMapping && (
                          <span className="text-xs text-muted-foreground font-mono">{notes.join(' ')}</span>
                        )}
                      </div>
                      <div className="p-3 flex-1">
                        {hasMapping ? (
                          <PianoKeyboard activeNotes={keyboardNotes} compact />
                        ) : (
                          <div className="h-28 flex items-center justify-center text-xs text-muted-foreground italic">
                            Not in dictionary
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Lyrics & chords sheet */}
          {lyricsLines && (
            <div className="xl:w-96 shrink-0">
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">Chords &amp; Lyrics</h2>
              <div className="bg-card border border-border rounded-2xl p-5 overflow-x-auto">
                <pre className="font-mono text-sm leading-7 text-foreground/80 whitespace-pre">
                  {lyricsLines.map((line, i) => (
                    <div key={i}>
                      {line === '' ? '\u00a0' : (
                        <LyricsLine
                          line={line}
                          onChordEnter={setHoveredChord}
                          onChordLeave={() => setHoveredChord(null)}
                        />
                      )}
                    </div>
                  ))}
                </pre>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
