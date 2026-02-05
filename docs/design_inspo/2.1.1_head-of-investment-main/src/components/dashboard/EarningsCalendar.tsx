import { Calendar, Loader2 } from 'lucide-react';
import { usePortfolioData } from '@/hooks/usePortfolioData';

export function EarningsCalendar() {
  const { holdings, isLoading } = usePortfolioData();

  // Get unique tickers from user's holdings
  const userTickers = holdings.map(h => h.ticker);

  return (
    <div className="glass-panel rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={18} className="text-primary" />
        <h2 className="text-lg font-semibold">Earnings diese Woche</h2>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : userTickers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            Keine Positionen im Portfolio
          </p>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            Earnings-Daten für {userTickers.length} Positionen
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Live-Daten demnächst verfügbar
          </p>
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {userTickers.slice(0, 8).map(ticker => (
              <span 
                key={ticker} 
                className="px-2 py-1 text-xs font-mono bg-muted rounded"
              >
                {ticker}
              </span>
            ))}
            {userTickers.length > 8 && (
              <span className="px-2 py-1 text-xs text-muted-foreground">
                +{userTickers.length - 8} weitere
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
