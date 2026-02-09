import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";

export interface Trade {
  date: string;
  name: string;
  isin: string;
  sellProceeds: number;
  costBasis: number;
  realizedPL: number;
  quality: 'clean' | 'loss' | 'check';
  qualityLabel?: string;
}

interface TradeLedgerProps {
  trades?: Trade[];
  className?: string;
}

const defaultTrades: Trade[] = [
  { date: '2025-12-15', name: 'Meta Platforms', isin: 'US30303M1027', sellProceeds: 3289.70, costBasis: 2801.57, realizedPL: 488.13, quality: 'clean' },
  { date: '2025-12-16', name: 'Disney (Walt)', isin: 'US2546871060', sellProceeds: 9498.10, costBasis: 13268.68, realizedPL: -3770.58, quality: 'loss', qualityLabel: 'LOSS' },
  { date: '2025-12-29', name: 'Meituan Cl.B', isin: 'KYG596691041', sellProceeds: 31.77, costBasis: 55.00, realizedPL: -23.23, quality: 'check', qualityLabel: 'CHK COST' },
];

export function TradeLedger({ trades = defaultTrades, className }: TradeLedgerProps) {
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(value);

  const totalPL = trades.reduce((sum, t) => sum + t.realizedPL, 0);

  return (
    <div className={cn("", className)}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-sans text-xl font-semibold text-white flex items-center gap-4">
          <span className="w-[3px] h-6 bg-kasona-orange shadow-[0_0_10px_hsl(33,100%,58%)]" />
          Trade Ledger
        </h2>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-kasona-blue/10 border border-kasona-blue/30 text-kasona-blue">
          <CheckCircle className="w-4 h-4" />
          <span className="font-mono text-xs uppercase tracking-wider">Audit Clean</span>
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-white/[0.02]">
              <th className="text-left font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-4 px-4 border-b border-border/50">Date</th>
              <th className="text-left font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-4 px-4 border-b border-border/50">Asset Details</th>
              <th className="text-left font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-4 px-4 border-b border-border/50">Sell Proceeds</th>
              <th className="text-left font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-4 px-4 border-b border-border/50">Cost Basis</th>
              <th className="text-left font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-4 px-4 border-b border-border/50">Realized P&L</th>
              <th className="text-left font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-4 px-4 border-b border-border/50">Quality</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade, i) => (
              <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-4 px-4 border-b border-border/20 font-mono text-sm text-muted-foreground">
                  {trade.date}
                </td>
                <td className="py-4 px-4 border-b border-border/20">
                  <p className="font-sans text-sm text-white">{trade.name}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{trade.isin}</p>
                </td>
                <td className="py-4 px-4 border-b border-border/20 font-mono text-sm text-white">
                  {formatCurrency(trade.sellProceeds)}
                </td>
                <td className="py-4 px-4 border-b border-border/20 font-mono text-sm text-muted-foreground">
                  {formatCurrency(trade.costBasis)}
                </td>
                <td className={cn(
                  "py-4 px-4 border-b border-border/20 font-mono text-sm font-medium",
                  trade.realizedPL >= 0 ? "text-kasona-blue" : "text-kasona-pink"
                )}>
                  {trade.realizedPL >= 0 ? '+' : ''}{formatCurrency(trade.realizedPL)}
                </td>
                <td className="py-4 px-4 border-b border-border/20">
                  {trade.quality === 'clean' && (
                    <CheckCircle className="w-5 h-5 text-kasona-blue" />
                  )}
                  {trade.quality === 'loss' && (
                    <span className="inline-block px-2 py-1 rounded text-[10px] uppercase font-mono bg-kasona-pink/10 text-kasona-pink border border-kasona-pink/30">
                      {trade.qualityLabel}
                    </span>
                  )}
                  {trade.quality === 'check' && (
                    <span className="inline-block px-2 py-1 rounded text-[10px] uppercase font-mono bg-kasona-yellow/10 text-kasona-yellow border border-kasona-yellow/30">
                      {trade.qualityLabel}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-white/[0.02]">
              <td colSpan={4} className="py-4 px-4 font-mono text-sm text-muted-foreground uppercase tracking-wider">
                Total Realized P&L (Net)
              </td>
              <td className={cn(
                "py-4 px-4 font-mono text-lg font-bold",
                totalPL >= 0 ? "text-kasona-blue" : "text-kasona-pink"
              )}>
                {totalPL >= 0 ? '+' : ''}{formatCurrency(totalPL)}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
