import { useState } from 'react';
import { useRoute, Link, useLocation } from 'wouter';
import { useGetSong, useDeleteSong, getListSongsQueryKey, getGetSongQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Trash2, Loader2, Music } from 'lucide-react';
import { parseChords, CHORD_MAP } from '@/lib/chords';
import { PianoKeyboard } from '@/components/PianoKeyboard';
import { cn } from '@/lib/utils';

export default function SongView() {
  const [, params] = useRoute('/songs/:id');
  const id = params?.id ? parseInt(params.id) : 0;
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const { data: song, isLoading } = useGetSong(id, { 
    query: { enabled: !!id, queryKey: getGetSongQueryKey(id) } 
  });
  
  const deleteSong = useDeleteSong();
  
  const [activeChord, setActiveChord] = useState<string | null>(null);

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
      <div className="min-h-[100dvh] bg-background text-foreground p-6 md:p-12 font-sans flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
      </div>
    );
  }

  if (!song) {
    return (
      <div className="min-h-[100dvh] bg-background text-foreground p-6 md:p-12 flex flex-col items-center justify-center">
        <Music className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
        <h2 className="text-2xl font-serif text-amber-50 mb-2">Piece not found</h2>
        <Link href="/" className="text-primary hover:underline">Return to Library</Link>
      </div>
    );
  }

  const chords = parseChords(song.chordText);
  const activeNotes = activeChord ? (CHORD_MAP[activeChord] || []) : [];

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col font-sans relative overflow-hidden">
      {/* Background glow behind piano */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-[100%] blur-[120px] pointer-events-none"></div>

      <div className="p-6 md:p-12 pb-32 max-w-5xl mx-auto w-full flex-grow flex flex-col z-10">
        <div className="flex justify-between items-start mb-12">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-amber-50 transition-colors gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Library</span>
          </Link>
          
          <button 
            onClick={handleDelete}
            className="text-muted-foreground hover:text-destructive transition-colors p-2 rounded-md hover:bg-destructive/10"
            title="Delete song"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        
        <header className="mb-16 text-center">
          <h1 className="text-4xl md:text-6xl font-serif text-amber-50 tracking-tight mb-4">{song.title}</h1>
          {song.artist && <p className="text-xl text-muted-foreground font-light">{song.artist}</p>}
        </header>

        <div className="mb-16">
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 px-4">
            {chords.map((chord, i) => (
              <button
                key={`${chord}-${i}`}
                onClick={() => setActiveChord(chord)}
                className={cn(
                  "px-6 py-4 md:px-8 md:py-6 rounded-xl border text-xl md:text-2xl font-medium transition-all duration-300 ease-out transform active:scale-95 flex items-center justify-center min-w-[5rem] animate-in slide-in-from-bottom-4 fade-in fill-mode-both",
                  activeChord === chord
                    ? "bg-primary text-primary-foreground border-primary shadow-[0_0_30px_rgba(217,119,6,0.3)] scale-105"
                    : "bg-card text-amber-50 border-border hover:border-primary/50 hover:bg-card/80 hover:scale-105 hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)]"
                )}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {chord}
              </button>
            ))}
            {chords.length === 0 && (
              <p className="text-muted-foreground italic">No recognized chords found in the progression.</p>
            )}
          </div>
          
          {activeChord && !CHORD_MAP[activeChord] && (
            <p className="text-center mt-6 text-amber-500/80 text-sm">
              Note mapping for '{activeChord}' is not in the dictionary yet.
            </p>
          )}
        </div>
        
        <div className="mt-auto">
          <div className="mb-6 text-center h-8">
            {activeChord && CHORD_MAP[activeChord] ? (
              <p className="text-amber-500/80 text-sm tracking-widest uppercase font-medium animate-in fade-in">
                {activeChord} : {CHORD_MAP[activeChord].join(' - ')}
              </p>
            ) : null}
          </div>
          <PianoKeyboard activeNotes={activeNotes} />
        </div>
      </div>
    </div>
  );
}
