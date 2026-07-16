import { useState, useEffect } from 'react';
import { useRoute, useLocation, Link } from 'wouter';
import { useGetSong, useUpdateSong, getListSongsQueryKey, getGetSongQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { parseChords, upperChord } from '@/lib/chords';
import { cn } from '@/lib/utils';

export default function EditSong() {
  const [, params] = useRoute('/songs/:id/edit');
  const id = params?.id ? parseInt(params.id) : 0;
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: song, isLoading } = useGetSong(id, {
    query: { enabled: !!id, queryKey: getGetSongQueryKey(id) }
  });

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [rawText, setRawText] = useState('');
  const [selectedChords, setSelectedChords] = useState<Set<string>>(new Set());
  const [initialised, setInitialised] = useState(false);

  // Populate fields once the song loads
  useEffect(() => {
    if (song && !initialised) {
      setTitle(song.title);
      setArtist(song.artist ?? '');
      const text = song.lyricsText ?? song.chordText ?? '';
      setRawText(text);

      // Build the saved chord set from chordText
      const savedChords = new Set(song.chordText.split(/\s+/).filter(Boolean));

      // Re-detect from the full lyrics text. For each detected chord, pre-select
      // it if either the full name (e.g. "Dsus2/A") or its upper chord ("Dsus2")
      // is in the saved set. This upgrades bare chords to their slash variants
      // when the song was saved before slash chord support was added.
      const detected = parseChords(text);
      const initial  = new Set(
        detected.filter(c => savedChords.has(c) || savedChords.has(upperChord(c)))
      );
      // Also keep any saved chords that weren't re-detected (edge cases)
      savedChords.forEach(c => { if (!initial.has(c)) initial.add(c); });

      setSelectedChords(initial);
      setInitialised(true);
    }
  }, [song, initialised]);

  // When raw text changes, re-detect chords but preserve existing selections where possible
  const [manuallyChanged, setManuallyChanged] = useState(false);
  useEffect(() => {
    if (!manuallyChanged) return;
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

  const updateSong = useUpdateSong();

  const handleSave = () => {
    const chordText = detectedChords.filter(c => selectedChords.has(c)).join(' ');
    if (!title.trim() || !chordText) return;
    updateSong.mutate(
      { id, data: { title, artist, chordText, lyricsText: rawText } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListSongsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetSongQueryKey(id) });
          setLocation(`/songs/${id}`);
        }
      }
    );
  };

  const activeChords = detectedChords.filter(c => selectedChords.has(c));
  const canSave = title.trim() && activeChords.length > 0;

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-background text-foreground flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background text-foreground p-6 md:p-12 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href={`/songs/${id}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-amber-50 transition-colors gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {song?.title ?? 'Song'}</span>
        </Link>

        <header>
          <h1 className="text-4xl font-serif text-amber-50 tracking-tight mb-2">Edit Piece</h1>
          <p className="text-muted-foreground font-light">Update the title, artist, chords or lyrics. Toggle any chords on or off below.</p>
        </header>

        <div className="space-y-6 bg-card p-6 md:p-8 rounded-2xl border border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-amber-50/80">Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-black/40 border border-border rounded-md h-11 px-4 text-amber-50 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-amber-50/80">Artist <span className="text-muted-foreground font-normal">(Optional)</span></label>
              <input
                type="text"
                value={artist}
                onChange={e => setArtist(e.target.value)}
                className="w-full bg-black/40 border border-border rounded-md h-11 px-4 text-amber-50 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-amber-50/80">Chords &amp; Lyrics</label>
            <p className="text-xs text-muted-foreground">Edit the text below — chord toggles will update automatically.</p>
            <textarea
              value={rawText}
              onChange={e => { setManuallyChanged(true); setRawText(e.target.value); }}
              className="w-full bg-black/40 border border-border rounded-md p-4 text-amber-50 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all min-h-[220px] resize-y font-mono text-sm leading-relaxed"
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
                  <button onClick={() => setSelectedChords(new Set())} className="text-muted-foreground hover:text-amber-50/60 transition-colors">Clear</button>
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
                          : "bg-black/20 text-muted-foreground border-border/40 hover:border-border hover:text-amber-50/60 line-through decoration-muted-foreground/40"
                      )}
                    >
                      {chord}
                    </button>
                  );
                })}
              </div>
              {activeChords.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {activeChords.length} chord{activeChords.length !== 1 ? 's' : ''} will be saved: <span className="text-amber-50/60">{activeChords.join(', ')}</span>
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={!canSave || updateSong.isPending}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-11 px-8 gap-2"
          >
            {updateSong.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
}
