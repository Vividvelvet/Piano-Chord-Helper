import { Link } from 'wouter';
import { useListSongs } from '@workspace/api-client-react';
import { Plus, Music } from 'lucide-react';
import { parseChords } from '@/lib/chords';

export default function Home() {
  const { data: songs, isLoading } = useListSongs();

  return (
    <div className="min-h-[100dvh] bg-background text-foreground p-6 md:p-12 font-sans selection:bg-primary/30">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="flex items-end justify-between border-b border-border pb-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-serif text-title tracking-tight">Library</h1>
            <p className="text-muted-foreground text-sm md:text-base font-light">Your personal collection of practice pieces.</p>
          </div>
          <Link href="/songs/new" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 gap-2">
            <Plus className="w-4 h-4" />
            <span>Add Piece</span>
          </Link>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-card rounded-xl border border-border"></div>
            ))}
          </div>
        ) : !songs || songs.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-12 bg-card/50 rounded-2xl border border-border/50 border-dashed">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Music className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-serif text-title mb-2">The stand is empty</h3>
            <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
              Begin your practice by adding a new song. Paste in the chords, and we'll light the way.
            </p>
            <Link href="/songs/new" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-6 py-2">
              Add your first piece
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {songs.map(song => {
              const chords = parseChords(song.chordText);
              return (
                <Link key={song.id} href={`/songs/${song.id}`} className="group block h-full">
                  <div className="h-full bg-card hover:bg-card/80 transition-colors border border-border rounded-xl p-6 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors"></div>
                    <div className="relative z-10 mb-6">
                      <h2 className="text-2xl font-serif text-title mb-1 group-hover:text-primary transition-colors">{song.title}</h2>
                      {song.artist && <p className="text-muted-foreground font-light">{song.artist}</p>}
                    </div>
                    <div className="relative z-10 flex flex-wrap gap-2">
                      {chords.slice(0, 5).map((chord, i) => (
                        <span key={i} className="px-2.5 py-1 bg-muted text-muted-foreground text-xs rounded-md border border-border font-medium">
                          {chord}
                        </span>
                      ))}
                      {chords.length > 5 && (
                        <span className="px-2.5 py-1 text-muted-foreground text-xs flex items-center">
                          +{chords.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
