import { cn } from "@/lib/utils";

interface EngineRoomProps {
  netWorth: number;
  activeLeak: number;
  qualityScore: number;
  className?: string;
}

export function EngineRoom({ netWorth, activeLeak, qualityScore, className }: EngineRoomProps) {
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);

  return (
    <div className={cn("flex gap-8 items-center", className)}>
      {/* Left: Hero Text */}
      <div className="flex-1">
        <h1 className="font-serif italic text-6xl lg:text-7xl font-semibold leading-[0.9] mb-6 bg-gradient-to-r from-white to-muted-foreground/50 bg-clip-text text-transparent">
          The Portfolio <br />Engine.
        </h1>
        <p className="text-muted-foreground text-base max-w-md mb-8">
          Stop looking at vanity metrics. Master your Net Result, plug the Friction Leaks, and accelerate Cashflow.
        </p>
        
        {/* Stats Row */}
        <div className="flex gap-6">
          <div className="glass-panel px-6 py-4">
            <p className="font-mono text-2xl font-semibold text-kasona-orange glow-orange">
              {formatCurrency(netWorth)}
            </p>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Net Worth</p>
          </div>
          <div className="glass-panel px-6 py-4">
            <p className="font-mono text-2xl font-semibold text-kasona-pink">
              {formatCurrency(activeLeak)}
            </p>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Active Leak</p>
          </div>
        </div>
      </div>

      {/* Right: Engine Visualization */}
      <div className="relative w-[380px] h-[380px] flex items-center justify-center">
        {/* Outer Ring - Dashed */}
        <div className="absolute w-[380px] h-[380px] rounded-full border border-dashed border-muted-foreground/20 animate-spin-slow" />
        
        {/* Mid Ring */}
        <div className="absolute w-[280px] h-[280px] rounded-full border border-kasona-blue/30 shadow-[0_0_30px_hsla(195,91%,78%,0.1)]" />
        
        {/* Core Ring */}
        <div className="absolute w-[180px] h-[180px] rounded-full border-2 border-kasona-orange bg-gradient-radial from-kasona-orange/15 to-transparent shadow-[0_0_50px_hsla(33,100%,58%,0.2)] backdrop-blur-sm flex flex-col items-center justify-center z-10">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Quality Score</span>
          <span className="font-mono text-4xl font-bold text-white">{qualityScore}</span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-kasona-blue">OPTIMIZED</span>
        </div>

        {/* Leak Orbs */}
        <div className="absolute top-4 right-8 w-12 h-12 rounded-full bg-background border border-kasona-pink text-kasona-pink grid place-items-center font-mono text-[10px] shadow-[0_0_20px_hsla(342,90%,67%,0.4)] z-20 animate-float">
          FX
        </div>
        <div className="absolute bottom-8 left-4 w-12 h-12 rounded-full bg-background border border-kasona-blue text-kasona-blue grid place-items-center font-mono text-[10px] shadow-[0_0_20px_hsla(195,91%,78%,0.4)] z-20 animate-float" style={{ animationDelay: '1s' }}>
          DIV
        </div>
      </div>
    </div>
  );
}
