import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useCreateSong, getListSongsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { parseChords } from '@/lib/chords';

export default function AddSong() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [chordText, setChordText] = useState('');
  
  const createSong = useCreateSong();
  
  const handleSave = () => {
    if (!title.trim() || !chordText.trim()) return;
    
    createSong.mutate(
      { data: { title, artist, chordText } },
      {
        onSuccess: (song) => {
          queryClient.invalidateQueries({ queryKey: getListSongsQueryKey() });
          setLocation(`/songs/${song.id}`);
        }
      }
    );
  };

  const detectedChords = parseChords(chordText);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground p-6 md:p-12 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-amber-50 transition-colors gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Library</span>
        </Link>
        
        <header>
          <h1 className="text-4xl font-serif text-amber-50 tracking-tight mb-2">New Piece</h1>
          <p className="text-muted-foreground font-light">Add the chords for a song you want to practice.</p>
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
                placeholder="e.g. Funeral"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-amber-50/80">Artist <span className="text-muted-foreground font-normal">(Optional)</span></label>
              <input 
                type="text" 
                value={artist}
                onChange={e => setArtist(e.target.value)}
                className="w-full bg-black/40 border border-border rounded-md h-11 px-4 text-amber-50 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="e.g. Phoebe Bridgers"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-amber-50/80">Chord Progression</label>
            <textarea 
              value={chordText}
              onChange={e => setChordText(e.target.value)}
              className="w-full bg-black/40 border border-border rounded-md p-4 text-amber-50 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all min-h-[200px] resize-y font-mono text-sm leading-relaxed"
              placeholder="Am F C G&#10;Am F C E&#10;&#10;Verse 1:&#10;Am - C - G - F"
            />
          </div>

          {detectedChords.length > 0 && (
            <div className="pt-4 border-t border-border/50">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Detected Chords</p>
              <div className="flex flex-wrap gap-2">
                {detectedChords.map((chord, i) => (
                  <span key={i} className="px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-md border border-primary/20 font-medium">
                    {chord}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button 
            onClick={handleSave}
            disabled={!title.trim() || !chordText.trim() || createSong.isPending}
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
