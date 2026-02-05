import { useState, useEffect } from 'react';
import { Brain, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThoughtProcessProps {
  steps: string[];
}

export function ThoughtProcess({ steps }: ThoughtProcessProps) {
  const [visibleSteps, setVisibleSteps] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (visibleSteps < steps.length) {
      const timer = setTimeout(() => {
        setVisibleSteps((prev) => prev + 1);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [visibleSteps, steps.length]);

  return (
    <div className="mb-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
      >
        <Brain size={14} className="text-accent" />
        <span className="font-mono uppercase tracking-wider">Thought Process</span>
        <span className="text-[10px]">
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>

      {isExpanded && (
        <div className="pl-5 border-l-2 border-accent/30 space-y-2">
          {steps.map((step, index) => (
            <div
              key={index}
              className={cn(
                'flex items-start gap-2 text-xs transition-all duration-300',
                index < visibleSteps
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 -translate-x-2'
              )}
            >
              <div
                className={cn(
                  'w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                  index < visibleSteps - 1
                    ? 'bg-accent/20 text-accent'
                    : index === visibleSteps - 1
                    ? 'bg-primary/20 text-primary animate-pulse'
                    : 'bg-muted'
                )}
              >
                {index < visibleSteps - 1 ? (
                  <Check size={10} />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                )}
              </div>
              <span
                className={cn(
                  'font-mono',
                  index < visibleSteps - 1
                    ? 'text-muted-foreground'
                    : 'text-foreground'
                )}
              >
                {step}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
