import { cn } from "@/lib/utils";
import { AlertTriangle, Lightbulb } from "lucide-react";

export interface FrictionItem {
  source: string;
  description: string;
  value: number;
  severity: 'Critical' | 'Standard' | 'Low' | 'critical' | 'standard' | 'low';
}

interface FrictionLeaksProps {
  totalLeak?: number;
  primaryLeak?: {
    source: string;
    description: string;
    value: number;
    severity: string;
  };
  items?: FrictionItem[];
  recommendation?: string;
  className?: string;
}

const defaultItems: FrictionItem[] = [
  { source: 'PRIMARY SOURCE', description: 'Financing (Sollzinsen)', value: -571.73, severity: 'Critical' },
  { source: 'ESTIMATED FEES', description: 'Trading Execution', value: -94.00, severity: 'Standard' },
];

export function FrictionLeaks({ 
  totalLeak = -965, 
  primaryLeak,
  items = defaultItems,
  recommendation = "Your debit interest is the largest friction point. Action: Balance your USD account using idle EUR cash to eliminate the 6.8% rate immediately.",
  className 
}: FrictionLeaksProps) {
  const primaryLeakValue = primaryLeak?.value ?? items[0]?.value ?? 0;
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(value);

  return (
    <div className={cn("", className)}>
      <h2 className="font-sans text-xl font-semibold text-white mb-6 flex items-center gap-4">
        <span className="w-[3px] h-6 bg-kasona-orange shadow-[0_0_10px_hsl(33,100%,58%)]" />
        Friction & Leaks
      </h2>

      <div className="grid grid-cols-2 gap-6">
        {/* Left: Engine Visualization */}
        <div className="glass-panel p-6 flex items-center justify-center">
          <div className="relative w-[200px] h-[200px] flex items-center justify-center">
            {/* Ring */}
            <div className="absolute w-[180px] h-[180px] rounded-full border border-kasona-pink/30" />
            <div className="absolute w-[140px] h-[140px] rounded-full border border-dashed border-kasona-pink/20 animate-spin-slow" style={{ animationDuration: '30s' }} />
            
            {/* Center */}
            <div className="flex flex-col items-center z-10">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">TOTAL LEAK</span>
              <span className="font-mono text-3xl font-bold text-kasona-pink">{formatCurrency(totalLeak)}</span>
            </div>

            {/* Leak Orb */}
            <div className="absolute -top-2 right-4 px-3 py-1.5 rounded-lg bg-kasona-pink/10 border border-kasona-pink/30 text-kasona-pink font-mono text-xs shadow-[0_0_15px_hsla(342,90%,67%,0.3)]">
              FIN<br />€{Math.abs(primaryLeakValue).toFixed(0)}
            </div>
          </div>
        </div>

        {/* Right: Details */}
        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={i} className="glass-panel p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{item.source}</p>
                  <p className="font-sans text-sm text-white mt-1">{item.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-lg font-semibold text-kasona-pink">{formatCurrency(item.value)}</p>
                  <span className={cn(
                    "inline-block mt-1 px-2 py-0.5 rounded text-[10px] uppercase font-mono",
                    (item.severity === 'critical' || item.severity === 'Critical') && "bg-kasona-pink/10 text-kasona-pink border border-kasona-pink/30",
                    (item.severity === 'standard' || item.severity === 'Standard') && "bg-kasona-yellow/10 text-kasona-yellow border border-kasona-yellow/30",
                    (item.severity === 'low' || item.severity === 'Low') && "bg-kasona-blue/10 text-kasona-blue border border-kasona-blue/30"
                  )}>
                    {item.severity}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* AI Recommendation */}
          <div className="glass-panel p-4 border-kasona-blue/30">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-kasona-blue" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-kasona-blue">AI RECOMMENDATION</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{recommendation}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
