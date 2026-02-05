import { Shield, TrendingUp, Mic, Eye } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrustIndex } from '@/types/executive-intelligence';
import { cn } from '@/lib/utils';

interface TrustIndexCardProps {
  trustIndex: TrustIndex;
}

export function TrustIndexCard({ trustIndex }: TrustIndexCardProps) {
  const { totalScore, tier, rationale, components } = trustIndex;

  const getTierConfig = (tierName: string) => {
    if (tierName.toLowerCase().includes('high conviction') || totalScore >= 85) {
      return {
        color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        bgGlow: 'shadow-[0_0_30px_rgba(16,185,129,0.15)]',
        progressColor: 'bg-emerald-500',
        label: 'High Conviction',
      };
    }
    if (tierName.toLowerCase().includes('verify') || (totalScore >= 60 && totalScore < 85)) {
      return {
        color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        bgGlow: 'shadow-[0_0_30px_rgba(245,158,11,0.15)]',
        progressColor: 'bg-amber-500',
        label: 'Verify & Validate',
      };
    }
    return {
      color: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      bgGlow: 'shadow-[0_0_30px_rgba(244,63,94,0.15)]',
      progressColor: 'bg-rose-500',
      label: 'Distressed/Risk',
    };
  };

  const tierConfig = getTierConfig(tier);

  return (
    <div className={cn("glass-panel rounded-xl p-6", tierConfig.bgGlow)}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-full bg-primary/10">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <h3 className="font-serif italic text-lg">Kasona Trust Index</h3>
      </div>

      {/* Main Score */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="text-5xl font-mono font-bold text-foreground">
            {Math.round(totalScore)}
          </div>
          <Badge variant="outline" className={cn("text-sm px-3 py-1", tierConfig.color)}>
            {tierConfig.label}
          </Badge>
        </div>
      </div>

      {/* Rationale */}
      {rationale && (
        <p className="text-sm text-muted-foreground mb-6 border-l-2 border-primary/30 pl-3">
          {rationale}
        </p>
      )}

      {/* Component Breakdown */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[hsl(195,91%,78%)]" />
              Verbal Specificity
            </span>
            <span className="font-mono text-[hsl(195,91%,78%)]">
              {Math.round(components.verbalSpecificity)}%
            </span>
          </div>
          <Progress value={components.verbalSpecificity} className="h-2" />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground flex items-center gap-2">
              <Mic className="h-4 w-4 text-[hsl(55,100%,70%)]" />
              Vocal Stability
            </span>
            <span className="font-mono text-[hsl(55,100%,70%)]">
              {Math.round(components.vocalStability)}%
            </span>
          </div>
          <Progress value={components.vocalStability} className="h-2" />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground flex items-center gap-2">
              <Eye className="h-4 w-4 text-[hsl(342,90%,67%)]" />
              Visual Congruence
            </span>
            <span className="font-mono text-[hsl(342,90%,67%)]">
              {Math.round(components.visualCongruence)}%
            </span>
          </div>
          <Progress value={components.visualCongruence} className="h-2" />
        </div>
      </div>
    </div>
  );
}
