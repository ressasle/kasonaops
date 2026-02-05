import { useState } from 'react';
import { Link, Youtube, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface VideoUploadZoneProps {
  onVideoSubmit: (source: { type: 'youtube'; value: string }) => void;
  isLoading?: boolean;
}

export function VideoUploadZone({ onVideoSubmit, isLoading = false }: VideoUploadZoneProps) {
  const [youtubeUrl, setYoutubeUrl] = useState('');

  const handleYoutubeSubmit = () => {
    if (youtubeUrl.trim() && isValidYoutubeUrl(youtubeUrl)) {
      onVideoSubmit({ type: 'youtube', value: youtubeUrl.trim() });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValidYoutubeUrl(youtubeUrl)) {
      handleYoutubeSubmit();
    }
  };

  const isValidYoutubeUrl = (url: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    return youtubeRegex.test(url);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-center mb-12 space-y-4">
        <h1 className="font-serif italic text-4xl md:text-5xl text-foreground">
          Executive Intelligence
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Analyze executive videos with AI-powered behavioral analysis and due diligence insights at hedge fund level.
        </p>
      </div>

      <div className="w-full max-w-2xl">
        <div className="glass-panel p-8 rounded-xl space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-red-500/10">
              <Youtube className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="font-medium text-foreground">YouTube Video Analysis</p>
              <p className="text-sm text-muted-foreground">
                Paste a YouTube link to analyze earnings calls, interviews, or presentations
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="relative flex-1">
              <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10 bg-background/50"
                disabled={isLoading}
              />
            </div>
            <Button 
              onClick={handleYoutubeSubmit}
              disabled={!isValidYoutubeUrl(youtubeUrl) || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                'Analyze'
              )}
            </Button>
          </div>

          <div className="pt-4 border-t border-border/50 space-y-3">
            <p className="text-xs text-muted-foreground">
              💡 Tip: Earnings calls, investor presentations, and executive interviews yield the best insights.
            </p>
            <p className="text-xs text-muted-foreground">
              🔒 Videos are analyzed securely and not stored. Only the analysis results are returned.
            </p>
          </div>
        </div>

        {/* Example Videos */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">Try with sample videos:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { label: 'Tesla Earnings Call', url: 'https://www.youtube.com/watch?v=example1' },
              { label: 'NVIDIA Keynote', url: 'https://www.youtube.com/watch?v=example2' },
            ].map((sample) => (
              <Button
                key={sample.label}
                variant="outline"
                size="sm"
                onClick={() => setYoutubeUrl(sample.url)}
                disabled={isLoading}
                className="text-xs"
              >
                {sample.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
