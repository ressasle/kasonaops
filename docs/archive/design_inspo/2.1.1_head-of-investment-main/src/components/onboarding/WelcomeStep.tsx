import { Button } from "@/components/ui/button";
import { Brain, LineChart, Bell, ArrowRight } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="text-center space-y-8 animate-fade-in">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold">
          Willkommen bei{" "}
          <span className="text-primary">Kasona</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Ihr digitaler Zwilling eines Investment-Komitees. Er schläft nicht, 
          er vergisst nichts, und er kombiniert Ihre Daten blitzschnell mit der Weltmarktlage.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
        <div className="glass-card p-6 rounded-xl space-y-3">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold">Das Gehirn</h3>
          <p className="text-sm text-muted-foreground">
            KI trainiert auf Value-Philosophie
          </p>
        </div>

        <div className="glass-card p-6 rounded-xl space-y-3">
          <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
            <LineChart className="h-6 w-6 text-accent" />
          </div>
          <h3 className="font-semibold">Das Gedächtnis</h3>
          <p className="text-sm text-muted-foreground">
            Kennt Ihr Portfolio & Ihre No-Gos
          </p>
        </div>

        <div className="glass-card p-6 rounded-xl space-y-3">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold">Die Wachsamkeit</h3>
          <p className="text-sm text-muted-foreground">
            Proaktive Warnungen & Chancen
          </p>
        </div>
      </div>

      <div className="pt-4">
        <Button size="lg" onClick={onNext} className="gap-2 text-lg px-8">
          Jetzt einrichten
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
