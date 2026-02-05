import { Shield, BellRing, BarChart3 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export function OnboardingProfile() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-2xl font-semibold">Investment-DNA</div>
        <p className="text-sm text-muted-foreground">Kurze Kalibrierung fur Ton, Risiko und Fokus.</p>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Risikotoleranz</span>
        </div>
        <Label className="text-xs text-muted-foreground">Konservativ bis Wachstum</Label>
        <Slider value={55} onChange={() => undefined} />
      </Card>

      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-accent" />
          <span className="text-sm font-semibold">Lieblingskennzahl</span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
          <div className="rounded-xl border border-primary/40 bg-primary/10 p-3">ROIC</div>
          <div className="rounded-xl border border-border p-3">Free Cash Flow</div>
          <div className="rounded-xl border border-border p-3">KGV</div>
          <div className="rounded-xl border border-border p-3">Dividende</div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <BellRing className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Warn-Intensitat</span>
        </div>
        <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground">
          <div className="rounded-xl border border-border p-3 text-center">Sanft</div>
          <div className="rounded-xl border border-primary/40 bg-primary/10 p-3 text-center">Normal</div>
          <div className="rounded-xl border border-border p-3 text-center">Direkt</div>
        </div>
      </Card>
    </div>
  );
}
