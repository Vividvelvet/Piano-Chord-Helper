import { Link } from "wouter";
import { Music } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-background p-6">
      <div className="text-center max-w-md bg-card/50 p-12 rounded-3xl border border-border">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Music className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-serif text-title mb-3 tracking-tight">
          Page Not Found
        </h1>
        <p className="text-muted-foreground mb-8">
          The piece you're looking for seems to have slipped off the stand. Let's get you back to the music.
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-6 py-2"
        >
          Return to Library
        </Link>
      </div>
    </div>
  );
}
