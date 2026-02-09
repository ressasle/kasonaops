import { cn } from "@/lib/utils";

export interface WaterfallItem {
  label: string;
  value: number;
  type: 'pos' | 'neg' | 'res';
}

interface PerformanceBridgeProps {
  items?: WaterfallItem[];
  className?: string;
}

const defaultItems: WaterfallItem[] = [
  { label: 'DIVS', value: 2200, type: 'pos' },
  { label: 'INT', value: 1300, type: 'pos' },
  { label: 'FX', value: 800, type: 'pos' },
  { label: 'FIN', value: -600, type: 'neg' },
  { label: 'TRADES', value: -3300, type: 'neg' },
  { label: 'RESULT', value: 169, type: 'res' },
];

export function PerformanceBridge({ items = defaultItems, className }: PerformanceBridgeProps) {
  const maxValue = Math.max(...items.map(i => Math.abs(i.value)));
  
  const formatValue = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    if (Math.abs(value) >= 1000) {
      return `${sign}€${(value / 1000).toFixed(1)}k`;
    }
    return `${sign}€${value}`;
  };

  const getBarHeight = (value: number) => {
    return `${(Math.abs(value) / maxValue) * 100}%`;
  };

  return (
    <div className={cn("glass-panel p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-sans text-lg font-semibold text-white flex items-center gap-3">
            <span className="w-[3px] h-6 bg-kasona-orange shadow-[0_0_10px_hsl(33,100%,58%)]" />
            Performance Bridge
          </h3>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">YEAR TO DATE 2025</span>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 rounded-lg bg-white/5 text-white font-mono text-xs border border-white/10">
            P&L View
          </button>
          <button className="px-3 py-1.5 rounded-lg text-muted-foreground font-mono text-xs hover:bg-white/5 transition-colors">
            Cashflow
          </button>
        </div>
      </div>

      <div className="flex items-end justify-between h-[200px] gap-4 pt-8">
        {items.map((item, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            {/* Value Label */}
            <span className={cn(
              "font-mono text-xs font-medium",
              item.type === 'pos' && "text-kasona-blue",
              item.type === 'neg' && "text-kasona-pink",
              item.type === 'res' && "text-white"
            )}>
              {formatValue(item.value)}
            </span>
            
            {/* Bar */}
            <div className="w-full flex flex-col items-center" style={{ height: '140px' }}>
              <div 
                className={cn(
                  "w-full max-w-[40px] rounded-t-sm transition-all duration-500",
                  item.type === 'pos' && "bg-kasona-blue shadow-[0_0_15px_hsla(195,91%,78%,0.3)]",
                  item.type === 'neg' && "bg-kasona-pink shadow-[0_0_15px_hsla(342,90%,67%,0.3)]",
                  item.type === 'res' && "bg-white shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                )}
                style={{ height: getBarHeight(item.value), marginTop: 'auto' }}
              />
            </div>
            
            {/* Label */}
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
