import { cn } from "@/lib/utils";

interface NetWorthCardProps {
  totalValue?: number;
  vsInvestedPercent?: number;
  dividends?: number;
  interest?: number;
  tradingPL?: number;
  sollzinsen?: number;
  className?: string;
}

export function NetWorthCard({ 
  totalValue = 391394, 
  vsInvestedPercent = 101,
  dividends = 2242,
  interest = 1287,
  tradingPL = -3250,
  sollzinsen = -571,
  className 
}: NetWorthCardProps) {
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Total Net Worth */}
      <div className="glass-panel p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">TOTAL NET WORTH</span>
          <span className="w-2 h-2 rounded-full bg-kasona-orange animate-pulse" />
        </div>
        <p className="font-mono text-4xl font-bold text-kasona-orange glow-orange">{formatCurrency(totalValue)}</p>
        <p className="font-mono text-sm text-kasona-blue mt-2">+{vsInvestedPercent}% vs Invested</p>
      </div>

      {/* Cashflow YTD */}
      <div className="glass-panel p-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">CASHFLOW YTD</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Dividends</span>
            <span className="font-mono text-sm text-kasona-blue">+{formatCurrency(dividends)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Interest</span>
            <span className="font-mono text-sm text-kasona-blue">+{formatCurrency(interest)}</span>
          </div>
        </div>
      </div>

      {/* Realized Friction */}
      <div className="glass-panel p-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">REALIZED FRICTION</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Trading P&L</span>
            <span className="font-mono text-sm text-kasona-pink">{formatCurrency(tradingPL)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Sollzinsen</span>
            <span className="font-mono text-sm text-kasona-pink">{formatCurrency(sollzinsen)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
