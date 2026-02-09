import { TrendingUp, Calendar, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePortfolioData, getAllocation } from '@/hooks/usePortfolioData';

interface ContextPanelProps {
  activeTicker?: string;
}

export function ContextPanel({ activeTicker }: ContextPanelProps) {
  const { holdings, totalValue, topHoldings, isLoading } = usePortfolioData(5);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Find active ticker details from holdings
  const activeHolding = activeTicker 
    ? holdings.find(h => h.ticker === activeTicker)
    : null;

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 overflow-y-auto">
      {/* Portfolio Summary */}
      <div className="glass-panel rounded-xl p-4 mb-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
          Portfolio
        </h3>
        <div className="space-y-1">
          <p className="text-2xl font-bold">
            {formatCurrency(totalValue)}
          </p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <TrendingUp size={16} />
            <span>{holdings.length} Positionen</span>
          </div>
        </div>
      </div>

      {/* Top Holdings */}
      <div className="glass-panel rounded-xl p-4 mb-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
          Top Positionen
        </h3>
        {topHoldings.length === 0 ? (
          <p className="text-sm text-muted-foreground">Keine Positionen vorhanden</p>
        ) : (
          <div className="space-y-2">
            {topHoldings.map((holding) => {
              const allocation = getAllocation(holding, totalValue);
              return (
                <div
                  key={holding.id}
                  className={cn(
                    'flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer',
                    'hover:bg-muted/50',
                    activeTicker === holding.ticker && 'bg-primary/10 border border-primary/20'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                      {holding.ticker.slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{holding.ticker}</p>
                      <p className="text-xs text-muted-foreground">{allocation.toFixed(1)}%</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">
                    {holding.shares?.toFixed(0) ?? 0} St.
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Earnings Calendar - simplified without live data */}
      <div className="glass-panel rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Earnings diese Woche
          </h3>
          <Calendar size={14} className="text-muted-foreground" />
        </div>
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            Earnings-Daten werden geladen...
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Demnächst verfügbar
          </p>
        </div>
      </div>

      {/* Active Ticker Detail (if available) */}
      {activeHolding && (
        <div className="mt-4 glass-panel rounded-xl p-4 border border-primary/20">
          <h3 className="text-xs font-mono uppercase tracking-wider text-primary mb-3">
            Im Fokus: {activeHolding.ticker}
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-mono">{activeHolding.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Stücke</span>
              <span className="font-mono">{activeHolding.shares?.toFixed(2) ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Einstandskurs</span>
              <span className="font-mono">
                {activeHolding.avg_cost?.toLocaleString('de-DE', { style: 'currency', currency: activeHolding.currency ?? 'EUR' }) ?? '–'}
              </span>
            </div>
            {activeHolding.sector && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sektor</span>
                <span className="font-mono">{activeHolding.sector}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
