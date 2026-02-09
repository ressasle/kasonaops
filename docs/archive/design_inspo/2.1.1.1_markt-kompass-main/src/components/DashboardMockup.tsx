import { Bell, DollarSign, Plus, TrendingUp, Clock } from "lucide-react";

export const DashboardMockup = () => {
  return (
    <div 
      className="relative perspective-1200" 
      aria-hidden="true"
    >
      {/* 3D Tilted Container */}
      <div className="transform-3d-tilt transition-transform duration-500 hover:transform-3d-flat">
        <div className="glass-panel p-4 md:p-6 rounded-2xl shadow-glow-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="label-mono text-primary">STAND Q4 2025</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bell className="w-4 h-4 text-primary" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="mb-6">
            <h3 className="headline-serif text-xl md:text-2xl text-foreground mb-1">
              Quartalsrückblick & Marktübersicht
            </h3>
            <p className="text-sm text-muted-foreground">
              Benachrichtigen für Q1 26
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Currency Card */}
            <div className="glass-panel p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-secondary" />
                </div>
                <span className="label-mono">Währungen & Zinsen</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">USD</span>
                  <span className="data-value">3,63 %</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-green-500/20 text-green-500">
                    QoQ: +12.89%
                  </span>
                </div>
              </div>
            </div>

            {/* Review CTA Card */}
            <div className="glass-panel p-4 rounded-xl border-primary/30 hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-primary" />
                </div>
                <span className="label-mono">Review vergangenes Quartal</span>
              </div>
              <div className="mt-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
                  Plan für Q1 26
                </div>
              </div>
            </div>
          </div>

          {/* Chart Area */}
          <div className="glass-panel p-4 rounded-xl">
            {/* Chart Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium text-foreground">Quartalsweise Entwicklung</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <span className="px-2 py-1 rounded bg-primary/20 text-primary font-mono">1 JAHR</span>
                <span className="px-2 py-1 rounded text-muted-foreground font-mono">2 JAHRE</span>
                <span className="px-2 py-1 rounded text-muted-foreground font-mono">ALLE</span>
              </div>
            </div>

            {/* Current Value Display */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-2xl font-mono font-bold text-foreground">1.17</span>
              <span className="text-lg text-muted-foreground">USD</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-secondary/20 text-secondary">
                QoQ +0.11%
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-green-500/20 text-green-500">
                YoY +13.47%
              </span>
            </div>

            {/* SVG Chart */}
            <div className="relative h-24 md:h-32">
              <svg 
                viewBox="0 0 400 100" 
                className="w-full h-full" 
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="mockupGoldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(33 100% 58%)" />
                    <stop offset="50%" stopColor="hsl(48 100% 67%)" />
                    <stop offset="100%" stopColor="hsl(195 91% 78%)" />
                  </linearGradient>
                  <linearGradient id="mockupAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="hsl(33 100% 58%)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="hsl(33 100% 58%)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                
                {/* Grid lines */}
                <line x1="0" y1="25" x2="400" y2="25" stroke="hsl(0 0% 100% / 0.05)" strokeWidth="1" />
                <line x1="0" y1="50" x2="400" y2="50" stroke="hsl(0 0% 100% / 0.05)" strokeWidth="1" />
                <line x1="0" y1="75" x2="400" y2="75" stroke="hsl(0 0% 100% / 0.05)" strokeWidth="1" />
                
                {/* Area fill */}
                <path 
                  d="M0,70 Q50,65 100,55 T200,45 T300,35 T400,50 L400,100 L0,100 Z" 
                  fill="url(#mockupAreaGradient)"
                />
                
                {/* Main curve */}
                <path 
                  d="M0,70 Q50,65 100,55 T200,45 T300,35 T400,50" 
                  fill="none" 
                  stroke="url(#mockupGoldGradient)" 
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                
                {/* Glow effect */}
                <path 
                  d="M0,70 Q50,65 100,55 T200,45 T300,35 T400,50" 
                  fill="none" 
                  stroke="hsl(33 100% 58%)" 
                  strokeWidth="6"
                  strokeLinecap="round"
                  opacity="0.3"
                  filter="blur(4px)"
                />
              </svg>
            </div>

            {/* X-Axis Labels */}
            <div className="flex justify-between mt-2 text-xs font-mono text-muted-foreground">
              <span>Q1 24</span>
              <span className="hidden sm:inline">Q2 24</span>
              <span>Q3 24</span>
              <span className="hidden sm:inline">Q4 24</span>
              <span>Q1 25</span>
              <span className="hidden sm:inline">Q2 25</span>
              <span>Q3 25</span>
              <span>Q4 25</span>
            </div>
          </div>

          {/* Bottom Status Bar */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span className="font-mono">Letzte Aktualisierung: Heute</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">Live</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
