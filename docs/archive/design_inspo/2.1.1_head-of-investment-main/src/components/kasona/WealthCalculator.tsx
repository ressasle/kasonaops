import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/lib/translations';
import { Clock, TrendingDown, TrendingUp, Zap, Shield } from 'lucide-react';

export function WealthCalculator() {
  const { language } = useLanguage();
  const t = useTranslation(language);

  const [initialInvest, setInitialInvest] = useState(10000);
  const [monthlyInvest, setMonthlyInvest] = useState(500);
  const [years, setYears] = useState(25);

  const ANNUAL_RETURN = 0.08; // 8% average return
  const NOISE_COST = 0.035; // 3.5% cost of emotional decisions (from Dalbar studies)

  // Calculate data points for the chart - both with and without Kasona
  const chartData = useMemo(() => {
    const points: { year: number; withKasona: number; withoutKasona: number }[] = [];
    const monthlyRateWithKasona = ANNUAL_RETURN / 12;
    const monthlyRateWithoutKasona = (ANNUAL_RETURN - NOISE_COST) / 12; // Reduced by noise cost
    
    for (let year = 0; year <= years; year++) {
      const months = year * 12;
      
      // With Kasona - full 8% return due to rational decisions
      let valueWithKasona = initialInvest * Math.pow(1 + monthlyRateWithKasona, months);
      if (monthlyRateWithKasona > 0) {
        valueWithKasona += monthlyInvest * ((Math.pow(1 + monthlyRateWithKasona, months) - 1) / monthlyRateWithKasona);
      }
      
      // Without Kasona - reduced return due to emotional trading
      let valueWithoutKasona = initialInvest * Math.pow(1 + monthlyRateWithoutKasona, months);
      if (monthlyRateWithoutKasona > 0) {
        valueWithoutKasona += monthlyInvest * ((Math.pow(1 + monthlyRateWithoutKasona, months) - 1) / monthlyRateWithoutKasona);
      }
      
      points.push({ year, withKasona: valueWithKasona, withoutKasona: valueWithoutKasona });
    }
    
    return points;
  }, [initialInvest, monthlyInvest, years]);

  const finalValueWithKasona = chartData[chartData.length - 1]?.withKasona || 0;
  const finalValueWithoutKasona = chartData[chartData.length - 1]?.withoutKasona || 0;
  const totalInvested = initialInvest + (monthlyInvest * years * 12);
  const advantageFromKasona = finalValueWithKasona - finalValueWithoutKasona;
  const maxValue = Math.max(...chartData.map(d => d.withKasona));

  const formatCurrency = (val: number) => {
    if (val >= 1000000) {
      return (val / 1000000).toFixed(2) + ' Mio €';
    }
    return Math.floor(val).toLocaleString('de-DE') + ' €';
  };

  // Generate SVG path for the curve
  const generatePath = (dataKey: 'withKasona' | 'withoutKasona') => {
    if (chartData.length < 2) return '';
    
    const width = 100;
    const height = 100;
    const padding = 5;
    
    const xScale = (width - padding * 2) / years;
    const yScale = (height - padding * 2) / maxValue;
    
    let path = `M ${padding} ${height - padding - (chartData[0][dataKey] * yScale)}`;
    
    for (let i = 1; i < chartData.length; i++) {
      const x = padding + (chartData[i].year * xScale);
      const y = height - padding - (chartData[i][dataKey] * yScale);
      
      const prevX = padding + (chartData[i - 1].year * xScale);
      const prevY = height - padding - (chartData[i - 1][dataKey] * yScale);
      const cpX = (prevX + x) / 2;
      
      path += ` Q ${cpX} ${prevY}, ${x} ${y}`;
    }
    
    return path;
  };

  // Generate fill path (closed area under curve)
  const generateFillPath = (dataKey: 'withKasona' | 'withoutKasona') => {
    const linePath = generatePath(dataKey);
    if (!linePath) return '';
    
    const width = 100;
    const height = 100;
    const padding = 5;
    const xScale = (width - padding * 2) / years;
    
    const endX = padding + (years * xScale);
    
    return `${linePath} L ${endX} ${height - padding} L ${padding} ${height - padding} Z`;
  };

  return (
    <section id="wealth-calculator" className="py-32 relative z-10">
      <div className="max-w-5xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="font-mono text-xs text-primary tracking-[0.2em] uppercase">
            {t.calculator.subtitle}
          </span>
          <h2 className="font-serif italic text-4xl md:text-5xl mt-4 text-foreground">
            {language === 'de' ? "Vermögensaufbau" : "Wealth Building"}
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto font-light">
            {language === 'de' 
              ? "Der Zinseszins-Effekt bei durchschnittlich 8% jährlicher Rendite."
              : "The compound interest effect at an average 8% annual return."}
          </p>
        </div>

        {/* Value Proposition Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="glass-panel rounded-xl p-4 border border-border flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
              <TrendingDown size={20} className="text-destructive" />
            </div>
            <div>
              <h4 className="font-medium text-foreground text-sm">
                {language === 'de' ? "Kosten des Rauschens" : "Cost of Noise"}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                {language === 'de' 
                  ? "Emotionales Trading kostet ~3-4% p.a. (Dalbar-Studie)"
                  : "Emotional trading costs ~3-4% p.a. (Dalbar study)"}
              </p>
            </div>
          </div>
          
          <div className="glass-panel rounded-xl p-4 border border-border flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Clock size={20} className="text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-foreground text-sm">
                {language === 'de' ? "Zeit ist begrenzt" : "Time is Limited"}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                {language === 'de' 
                  ? "3 Min statt 2 Std. Recherche pro Tag"
                  : "3 min instead of 2 hrs research per day"}
              </p>
            </div>
          </div>
          
          <div className="glass-panel rounded-xl p-4 border border-accent/20 bg-accent/5 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
              <Shield size={20} className="text-accent" />
            </div>
            <div>
              <h4 className="font-medium text-foreground text-sm">
                {language === 'de' ? "Mit Portfolio Briefing" : "With Portfolio Briefing"}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                {language === 'de' 
                  ? "Rationale Entscheidungen durch gefilterte Info"
                  : "Rational decisions through filtered info"}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 md:p-10 border border-border relative overflow-hidden">
          {/* Subtle gradient background */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="relative z-10">
            {/* Final Value Display - Trade Republic Style */}
            <div className="text-center mb-6">
              <div className="text-4xl md:text-6xl font-bold text-foreground font-mono tracking-tight">
                {formatCurrency(finalValueWithKasona)}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 mt-3 text-sm">
                <span className="text-muted-foreground">
                  {language === 'de' ? "Eingezahlt:" : "Invested:"} {formatCurrency(totalInvested)}
                </span>
              </div>
            </div>

            {/* Advantage Highlight */}
            <div className="flex items-center justify-center mb-8">
              <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/30 rounded-full px-4 py-2">
                <Zap size={16} className="text-accent" />
                <span className="text-sm font-medium text-accent">
                  +{formatCurrency(advantageFromKasona)} {language === 'de' ? "Vorteil durch rationale Entscheidungen" : "advantage from rational decisions"}
                </span>
              </div>
            </div>

            {/* Chart Container */}
            <div className="relative h-64 md:h-80 mb-8">
              {/* Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="border-t border-border/30 w-full" />
                ))}
              </div>
              
              {/* SVG Chart */}
              <svg 
                viewBox="0 0 100 100" 
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full"
              >
                {/* Gradient Definitions */}
                <defs>
                  <linearGradient id="chartGradientWithKasona" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="lineGradientWithKasona" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--accent))" />
                  </linearGradient>
                </defs>
                
                {/* Without Kasona - Dashed line (lower curve) */}
                <path
                  d={generatePath('withoutKasona')}
                  fill="none"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth="0.5"
                  strokeDasharray="2,2"
                  strokeOpacity="0.5"
                  className="transition-all duration-500"
                />
                
                {/* With Kasona - Fill Area */}
                <path
                  d={generateFillPath('withKasona')}
                  fill="url(#chartGradientWithKasona)"
                  className="transition-all duration-500"
                />
                
                {/* With Kasona - Line */}
                <path
                  d={generatePath('withKasona')}
                  fill="none"
                  stroke="url(#lineGradientWithKasona)"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
                
                {/* End Point Dot */}
                <circle
                  cx={95}
                  cy={5 + ((maxValue - finalValueWithKasona) / maxValue) * 90}
                  r="1.5"
                  fill="hsl(var(--accent))"
                  className="animate-pulse"
                />
              </svg>

              {/* Legend - Centered */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-6 text-[10px]">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-accent rounded" />
                  <span className="text-muted-foreground">{language === 'de' ? "Mit personalisiertem Briefing" : "With personalized briefing"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 border-t border-dashed border-muted-foreground" />
                  <span className="text-muted-foreground">{language === 'de' ? "Mit unspezifischen News" : "With unspecific news"}</span>
                </div>
              </div>

              {/* X-Axis Labels */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground font-mono px-2">
                <span>0</span>
                <span>{Math.floor(years / 4)}</span>
                <span>{Math.floor(years / 2)}</span>
                <span>{Math.floor(years * 3 / 4)}</span>
                <span>{years} {language === 'de' ? 'J' : 'Y'}</span>
              </div>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {/* Initial Investment */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm text-muted-foreground font-medium">
                    {language === 'de' ? "Startkapital" : "Initial Investment"}
                  </label>
                  <span className="text-sm font-mono text-foreground font-bold">
                    {formatCurrency(initialInvest)}
                  </span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="500000"
                  step="1000"
                  value={initialInvest}
                  onChange={(e) => setInitialInvest(Number(e.target.value))}
                  className="range-slider w-full"
                />
              </div>

              {/* Monthly Investment */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm text-muted-foreground font-medium">
                    {language === 'de' ? "Monatlich" : "Monthly"}
                  </label>
                  <span className="text-sm font-mono text-foreground font-bold">
                    {formatCurrency(monthlyInvest)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="50"
                  value={monthlyInvest}
                  onChange={(e) => setMonthlyInvest(Number(e.target.value))}
                  className="range-slider w-full"
                />
              </div>

              {/* Years */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm text-muted-foreground font-medium">
                    {language === 'de' ? "Anlagehorizont" : "Investment Horizon"}
                  </label>
                  <span className="text-sm font-mono text-foreground font-bold">
                    {years} {language === 'de' ? "Jahre" : "Years"}
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="1"
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="range-slider w-full"
                />
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-[10px] text-muted-foreground/60 mt-8 text-center">
              {language === 'de' 
                ? "Modellrechnung basierend auf 8% durchschnittlicher Jahresrendite vs. 4.5% bei emotionalem Trading. Keine Garantie für zukünftige Ergebnisse."
                : "Model calculation based on 8% average annual return vs. 4.5% with emotional trading. No guarantee of future results."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
