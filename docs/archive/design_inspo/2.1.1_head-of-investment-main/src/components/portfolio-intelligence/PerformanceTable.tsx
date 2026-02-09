import { cn } from "@/lib/utils";

export interface Asset {
  ticker: string;
  name: string;
  type?: string;
  symbol?: string;
  marketValue: number;
  unrealized: number;
  perfPercent: number;
  qScore: 'A' | 'B' | 'C';
  color?: string;
}

interface PerformanceTableProps {
  assets?: Asset[];
  className?: string;
}

const defaultAssets: Asset[] = [
  { ticker: 'G', name: 'Alphabet', symbol: 'GOOGL', marketValue: 127440, unrealized: 98108, perfPercent: 335, qScore: 'A', color: 'bg-kasona-blue' },
  { ticker: 'V', name: 'FTSE All-World', symbol: 'VWRL', marketValue: 26390, unrealized: 5420, perfPercent: 25.8, qScore: 'A', color: 'bg-kasona-orange' },
  { ticker: 'B', name: 'Bitcoin', symbol: 'BTC', marketValue: 6887, unrealized: 1878, perfPercent: 37.5, qScore: 'B', color: 'bg-kasona-yellow' },
  { ticker: 'D', name: 'Disney', symbol: 'DIS', marketValue: 18411, unrealized: -6731, perfPercent: -26.8, qScore: 'A', color: 'bg-kasona-pink' },
];

export function PerformanceTable({ assets = defaultAssets, className }: PerformanceTableProps) {
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);

  const formatPercent = (value: number) => 
    `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;

  return (
    <div className={cn("glass-panel p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-sans text-sm font-medium text-white">Portfolio Snapshot</h3>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">SORT: WEIGHT</span>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3 px-4 border-b border-border/50">Asset</th>
            <th className="text-left font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3 px-4 border-b border-border/50">Market Value</th>
            <th className="text-left font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3 px-4 border-b border-border/50">Unrealized</th>
            <th className="text-left font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3 px-4 border-b border-border/50">Perf %</th>
            <th className="text-left font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3 px-4 border-b border-border/50">Q-Score</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset, i) => {
            const color = asset.color || ['bg-kasona-blue', 'bg-kasona-orange', 'bg-kasona-yellow', 'bg-kasona-pink'][i % 4];
            const displayTicker = asset.ticker.charAt(0);
            return (
            <tr key={i} className="hover:bg-white/[0.02] transition-colors">
              <td className="py-4 px-4 border-b border-border/20">
                <div className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-full grid place-items-center text-xs font-bold text-background", color)}>
                    {displayTicker}
                  </div>
                  <div>
                    <p className="font-sans text-sm text-white">{asset.name}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{asset.symbol || asset.ticker}</p>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4 border-b border-border/20 font-mono text-sm text-white">
                {formatCurrency(asset.marketValue)}
              </td>
              <td className={cn("py-4 px-4 border-b border-border/20 font-mono text-sm", asset.unrealized >= 0 ? "text-kasona-blue" : "text-kasona-pink")}>
                {asset.unrealized >= 0 ? '+' : ''}{formatCurrency(asset.unrealized)}
              </td>
              <td className={cn("py-4 px-4 border-b border-border/20 font-mono text-sm", asset.perfPercent >= 0 ? "text-kasona-blue" : "text-kasona-pink")}>
                {formatPercent(asset.perfPercent)}
              </td>
              <td className="py-4 px-4 border-b border-border/20 font-mono text-sm text-kasona-blue">
                {asset.qScore}
              </td>
            </tr>
          )})}
        </tbody>
      </table>
    </div>
  );
}
