import { useRoute, Link, useLocation } from 'wouter';
import { useGetSong, useDeleteSong, getListSongsQueryKey, getGetSongQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Trash2, Loader2, Music } from 'lucide-react';
import { parseChords, CHORD_MAP } from '@/lib/chords';
import { PianoKeyboard } from '@/components/PianoKeyboard';

export default function SongView() {
  const [, params] = useRoute('/songs/:id');
  const id = params?.id ? parseInt(params.id) : 0;
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

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
        <h2 className="text-2xl font-serif text-amber-50 mb-2">Piece not found</h2>
        <Link href="/" className="text-primary hover:underline">Return to Library</Link>
      </div>
    );
  }

  const chords = parseChords(song.chordText);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground font-sans">
      <div className="max-w-6xl mx-auto p-6 md:p-10">

        {/* Header */}
        <div className="flex justify-between items-center mb-10">
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

        {/* Song title */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-serif text-amber-50 tracking-tight mb-2">{song.title}</h1>
          {song.artist && <p className="text-lg text-muted-foreground font-light">{song.artist}</p>}
        </div>

        {/* All chord keyboards */}
        {chords.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground italic">
            No recognized chords found in this piece.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {chords.map((chord, i) => {
              const notes = CHORD_MAP[chord] || [];
              const hasMapping = notes.length > 0;
              return (
                <div
                  key={chord}
                  className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 fade-in fill-mode-both"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {/* Chord name header */}
                  <div className="px-4 py-3 flex items-center justify-between border-b border-border/50">
                    <span className="text-xl font-semibold text-amber-50 tracking-wide">{chord}</span>
                    {hasMapping && (
                      <span className="text-xs text-muted-foreground font-mono">
                        {notes.join(' ')}
                      </span>
                    )}
                  </div>

                  {/* Piano keyboard */}
                  <div className="p-3 flex-1">
                    {hasMapping ? (
                      <PianoKeyboard activeNotes={notes} compact />
                    ) : (
                      <div className="h-28 flex items-center justify-center text-xs text-muted-foreground italic">
                        Chord not in dictionary
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
