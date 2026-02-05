import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, AlertTriangle, Lightbulb, Sparkles, ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import type { Holding, InvestorProfile } from "@/pages/Onboarding";

interface LiveDemoStepProps {
  holdings: Holding[];
  profile: InvestorProfile;
  onComplete: () => void;
  isLoading?: boolean;
}

interface DemoResult {
  earnings: { ticker: string; name: string; date: string; focus: string }[];
  risks: { ticker: string; message: string; severity: "high" | "medium" }[];
  recommendation: { ticker: string; name: string; reason: string; metric: string };
}

export function LiveDemoStep({ holdings, profile, onComplete, isLoading = false }: LiveDemoStepProps) {
  const [isGenerating, setIsGenerating] = useState(true);
  const [result, setResult] = useState<DemoResult | null>(null);

  useEffect(() => {
    // Simulate AI analysis
    const timer = setTimeout(() => {
      const metricLabels: Record<string, string> = {
        kgv: "KGV 15.2 (historisch günstig)",
        roic: "ROIC 28% (exzellent)",
        dividend: "Dividendenrendite 3.1%",
        fcf: "FCF Wachstum +18%",
      };

      // Generate demo result based on holdings
      setResult({
        earnings: [
          {
            ticker: holdings.find(h => h.ticker === "MSFT")?.ticker || "MSFT",
            name: "Microsoft",
            date: "Mittwoch, 15:00",
            focus: "Cloud-Wachstum (Azure), KI-Investitionen",
          },
          {
            ticker: holdings.find(h => h.ticker === "AAPL")?.ticker || "AAPL",
            name: "Apple",
            date: "Donnerstag, 22:00",
            focus: "iPhone-Sales, Services-Marge",
          },
        ],
        risks: [
          {
            ticker: "DIS",
            message: `CEO-Wechsel und Streaming-Verluste = erhöhtes Risiko. ${
              profile.riskTolerance < 50 ? "Vorsicht vor Nachkauf empfohlen." : "Beobachten."
            }`,
            severity: "high",
          },
          {
            ticker: "NVDA",
            message: "KI-Hype treibt Bewertung. KGV 65 ist historisch hoch für Halbleiter.",
            severity: "medium",
          },
        ],
        recommendation: {
          ticker: "KO",
          name: "Coca-Cola",
          reason: profile.riskTolerance < 50
            ? "Passend zu Ihrem konservativen Profil: Defensive Qualität mit stabilem Cashflow."
            : "Solide Dividenden-Basis für Ihr Portfolio. Stabilisiert bei Volatilität.",
          metric: metricLabels[profile.preferredMetric],
        },
      });
      setIsGenerating(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, [holdings, profile]);

  if (isGenerating) {
    return (
      <div className="text-center space-y-8 animate-fade-in py-12">
        <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
          <Sparkles className="h-12 w-12 text-primary animate-spin" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Analysiere Ihr Portfolio...</h2>
          <p className="text-muted-foreground">
            Prüfe Earnings-Kalender, Risiken und Chancen
          </p>
        </div>
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-primary animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Ihre erste Analyse</h2>
        <p className="text-muted-foreground">
          Basierend auf {holdings.length} Positionen in Ihrem Portfolio
        </p>
      </div>

      {/* Earnings This Week */}
      <div className="glass-card rounded-xl p-6 space-y-4 border-l-4 border-l-accent">
        <div className="flex items-center gap-3">
          <Calendar className="h-6 w-6 text-accent" />
          <h3 className="text-lg font-semibold">Earnings diese Woche</h3>
        </div>
        <div className="space-y-3">
          {result.earnings.map((earning) => (
            <div
              key={earning.ticker}
              className="flex items-start justify-between p-4 rounded-lg bg-muted/50"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-accent">
                    {earning.ticker}
                  </span>
                  <span className="text-muted-foreground">{earning.name}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>Fokus:</strong> {earning.focus}
                </p>
              </div>
              <span className="text-sm font-medium whitespace-nowrap">
                {earning.date}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Warnings */}
      <div className="glass-card rounded-xl p-6 space-y-4 border-l-4 border-l-destructive">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          <h3 className="text-lg font-semibold">Risikohinweise</h3>
        </div>
        <div className="space-y-3">
          {result.risks.map((risk, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                risk.severity === "high" ? "bg-destructive/10" : "bg-yellow-500/10"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono font-bold">{risk.ticker}</span>
                {risk.severity === "high" ? (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-yellow-500" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">{risk.message}</p>
            </div>
          ))}
        </div>
      </div>

      {/* First Recommendation */}
      <div className="glass-card rounded-xl p-6 space-y-4 border-l-4 border-l-primary">
        <div className="flex items-center gap-3">
          <Lightbulb className="h-6 w-6 text-primary" />
          <h3 className="text-lg font-semibold">Erste Empfehlung</h3>
        </div>
        <div className="p-4 rounded-lg bg-primary/10">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono font-bold text-primary text-lg">
              {result.recommendation.ticker}
            </span>
            <span className="text-muted-foreground">
              {result.recommendation.name}
            </span>
          </div>
          <p className="text-sm mb-3">{result.recommendation.reason}</p>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-sm">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span>{result.recommendation.metric}</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-4">
        <Button size="lg" onClick={onComplete} disabled={isLoading} className="gap-2 text-lg px-8">
          Zum Chat Terminal
          <ArrowRight className="h-5 w-5" />
        </Button>
        <p className="text-sm text-muted-foreground mt-3">
          Stellen Sie Ihre erste Frage an Ihren Investment-Assistenten
        </p>
      </div>
    </div>
  );
}
