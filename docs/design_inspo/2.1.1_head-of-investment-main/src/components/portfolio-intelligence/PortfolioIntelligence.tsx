import { cn } from "@/lib/utils";
import { EngineRoom } from "./EngineRoom";
import { PerformanceTable, Asset } from "./PerformanceTable";
import { PerformanceBridge, WaterfallItem } from "./PerformanceBridge";
import { FrictionLeaks, FrictionItem } from "./FrictionLeaks";
import { TradeLedger, Trade } from "./TradeLedger";
import { NetWorthCard } from "./NetWorthCard";

interface PortfolioIntelligenceProps {
  className?: string;
  netWorth: number;
  invested: number;
  cashflow: {
    dividends: number;
    interest: number;
  };
  friction: {
    total: number;
    items: FrictionItem[];
    recommendation: string;
  };
  assets: Asset[];
  waterfall: WaterfallItem[];
  trades: Trade[];
}

export function PortfolioIntelligence({ 
  className,
  netWorth,
  invested,
  cashflow,
  friction,
  assets,
  waterfall,
  trades
}: PortfolioIntelligenceProps) {
  const vsInvestedPercent = ((netWorth - invested) / invested) * 100;
  const primaryLeak = friction.items.reduce((min, item) => item.value < min.value ? item : min, friction.items[0]);

  return (
    <div className={cn("min-h-screen bg-background p-6 lg:p-10 space-y-12", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[3px] text-muted-foreground mb-2">KASONA INTELLIGENCE</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-kasona-orange/10 border border-kasona-orange/30 text-kasona-orange shadow-[0_0_10px_hsla(33,100%,58%,0.1)]">
          <span className="w-2 h-2 rounded-full bg-kasona-orange animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-wider">Live Data</span>
        </div>
      </div>

      {/* Section 1: Engine Room */}
      <section className="glass-panel p-8 lg:p-12">
        <EngineRoom 
          netWorth={netWorth} 
          activeLeak={friction.total} 
          qualityScore={87} 
        />
      </section>

      {/* Section 2: Performance Intelligence */}
      <section>
        <h2 className="font-sans text-xl font-semibold text-white mb-6 flex items-center gap-4">
          <span className="w-[3px] h-6 bg-kasona-orange shadow-[0_0_10px_hsl(33,100%,58%)]" />
          Performance Intelligence
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PerformanceTable assets={assets} />
          </div>
          <div>
            <NetWorthCard 
              totalValue={netWorth}
              vsInvestedPercent={vsInvestedPercent}
              dividends={cashflow.dividends}
              interest={cashflow.interest}
              tradingPL={waterfall.find(w => w.label === 'TRADES')?.value ?? 0}
              sollzinsen={primaryLeak?.value ?? 0}
            />
          </div>
        </div>
      </section>

      {/* Section 3: Performance Bridge */}
      <section>
        <PerformanceBridge items={waterfall} />
      </section>

      {/* Section 4: Friction & Leaks */}
      <section>
        <FrictionLeaks 
          totalLeak={friction.total}
          primaryLeak={{
            source: primaryLeak?.source ?? 'Unknown',
            description: primaryLeak?.description ?? '',
            value: primaryLeak?.value ?? 0,
            severity: primaryLeak?.severity ?? 'Standard'
          }}
          items={friction.items}
          recommendation={friction.recommendation}
        />
      </section>

      {/* Section 5: Trade Ledger */}
      <section>
        <TradeLedger trades={trades} />
      </section>
    </div>
  );
}

export default PortfolioIntelligence;
