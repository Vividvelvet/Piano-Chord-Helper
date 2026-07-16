import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { useCreateSong, getListSongsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { parseChords } from '@/lib/chords';
import { cn } from '@/lib/utils';

export default function AddSong() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [rawText, setRawText] = useState('');
  const [selectedChords, setSelectedChords] = useState<Set<string>>(new Set());

  const createSong = useCreateSong();

  useEffect(() => {
    const detected = parseChords(rawText);
    setSelectedChords(new Set(detected));
  }, [rawText]);

  const detectedChords = parseChords(rawText);

  const toggleChord = (chord: string) => {
    setSelectedChords(prev => {
      const next = new Set(prev);
      if (next.has(chord)) next.delete(chord);
      else next.add(chord);
      return next;
    });
  };

  const handleSave = () => {
    const chordText = detectedChords.filter(c => selectedChords.has(c)).join(' ');
    if (!title.trim() || !chordText) return;
    createSong.mutate(
      { data: { title, artist, chordText, lyricsText: rawText } },
      {
        onSuccess: (song) => {
          queryClient.invalidateQueries({ queryKey: getListSongsQueryKey() });
          setLocation(`/songs/${song.id}`);
        }
      }
    );
  };

  const activeChords = detectedChords.filter(c => selectedChords.has(c));
  const canSave = title.trim() && activeChords.length > 0;

  return (
    <div className="min-h-[100dvh] bg-background text-foreground p-6 md:p-12 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-title transition-colors gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Library</span>
        </Link>

        <header>
          <h1 className="text-4xl font-serif text-title tracking-tight mb-2">New Piece</h1>
          <p className="text-muted-foreground font-light">Paste in chords or a full chord/lyric sheet. Then pick which chords to learn.</p>
        </header>

        <div className="space-y-6 bg-card p-6 md:p-8 rounded-2xl border border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-title/80">Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-input border border-border rounded-md h-11 px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="e.g. Blackbird"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-title/80">Artist <span className="text-muted-foreground font-normal">(Optional)</span></label>
              <input
                type="text"
                value={artist}
                onChange={e => setArtist(e.target.value)}
                className="w-full bg-input border border-border rounded-md h-11 px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="e.g. The Beatles"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-title/80">Chords &amp; Lyrics</label>
            <p className="text-xs text-muted-foreground">Paste anything — a chord-only list, a full lyric sheet with chords above lines, or chord charts from any site.</p>
            <textarea
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              className="w-full bg-input border border-border rounded-md p-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all min-h-[220px] resize-y font-mono text-sm leading-relaxed"
              placeholder={`Am          F           C    G\nAll the kids are singing it again\n\nAm          F           C    E\nSomething about the end of the world`}
            />
          </div>

          {detectedChords.length > 0 && (
            <div className="pt-4 border-t border-border/50 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Detected Chords — tap to include or exclude
                </p>
                <div className="flex gap-3 text-xs">
                  <button onClick={() => setSelectedChords(new Set(detectedChords))} className="text-primary hover:text-primary/80 transition-colors">Select all</button>
                  <span className="text-border">|</span>
                  <button onClick={() => setSelectedChords(new Set())} className="text-muted-foreground hover:text-title/60 transition-colors">Clear</button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {detectedChords.map((chord) => {
                  const isSelected = selectedChords.has(chord);
                  return (
                    <button
                      key={chord}
                      onClick={() => toggleChord(chord)}
                      className={cn(
                        "px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-150 active:scale-95",
                        isSelected
                          ? "bg-primary/20 text-primary border-primary/50 shadow-[0_0_12px_rgba(217,119,6,0.15)]"
                          : "bg-muted/50 text-muted-foreground border-border/40 hover:border-border hover:text-title/60 line-through decoration-muted-foreground/40"
                      )}
                    >
                      {chord}
                    </button>
                  );
                })}
              </div>
              {activeChords.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {activeChords.length} chord{activeChords.length !== 1 ? 's' : ''} will be saved: <span className="text-title/60">{activeChords.join(', ')}</span>
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={!canSave || createSong.isPending}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-11 px-8 gap-2"
          >
            {createSong.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>Save to Library</span>
          </button>
        </div>
      </div>
    </div>
  );
}
