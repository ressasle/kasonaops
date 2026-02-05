import { Button } from '@/components/ui/button';
import { ExternalLink, Sparkles } from 'lucide-react';

export function KasonaBanner() {
  return (
    <div className="glass-panel p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-l-4 border-l-primary">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-primary/10">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-serif italic text-lg">
            Created by <span className="text-primary font-semibold">Kasona</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Become a Decision Maker on Hedge Fund Level
          </p>
        </div>
      </div>
      <a 
        href="https://www.kasona.ai/" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        <Button 
          variant="outline" 
          className="gap-2 border-primary/30 hover:border-primary hover:bg-primary/10 transition-all duration-300"
        >
          Visit Kasona.ai
          <ExternalLink className="h-4 w-4" />
        </Button>
      </a>
    </div>
  );
}
