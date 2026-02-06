import { Lightbulb, AlertTriangle, Calendar } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function OnboardingLiveDemo() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-2xl font-semibold">Erste Analyse</div>
        <p className="text-sm text-muted-foreground">So sieht die Auswertung fur den Kunden aus.</p>
      </div>

      <Card className="p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-accent" />
          <span className="text-sm font-semibold">Earnings diese Woche</span>
        </div>
        <div className="rounded-xl bg-white/5 p-3 text-xs text-muted-foreground">
          MSFT · Azure Wachstum · Mittwoch 15:00
        </div>
      </Card>

      <Card className="p-6 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <span className="text-sm font-semibold">Risikohinweise</span>
        </div>
        <div className="rounded-xl bg-destructive/10 p-3 text-xs text-muted-foreground">
          NVDA Bewertung hoch, Beobachtung empfohlen.
        </div>
      </Card>

      <Card className="p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Empfehlung</span>
        </div>
        <div className="rounded-xl bg-primary/10 p-3 text-xs text-muted-foreground">
          KO passt zu defensiver Strategie. ROIC 28%.
        </div>
      </Card>

      <div className="text-center">
        <Button>Zum Chat Terminal</Button>
      </div>
    </div>
  );
}
