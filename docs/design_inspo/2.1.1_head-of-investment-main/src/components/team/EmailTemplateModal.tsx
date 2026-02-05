import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Eye, Edit3, Mail, CheckCircle, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Customer {
  id: string;
  name: string;
  email: string;
  portfolioCount?: number;
  status?: string;
}

interface EmailTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
}

const EMAIL_TEMPLATES = [
  {
    id: "welcome",
    name: "Willkommen bei Kasona",
    icon: Sparkles,
    subject: "Willkommen bei Kasona – Ihr Investment-Assistent ist bereit!",
    body: `Hallo {{name}},

herzlich willkommen bei Kasona! Wir freuen uns, Sie als neuen Kunden begrüßen zu dürfen.

Ihr persönlicher Investment-Assistent wurde basierend auf Ihrem Anlegerprofil konfiguriert und ist ab sofort einsatzbereit. Er kennt Ihre Präferenzen, versteht Ihre Investment-Philosophie und wird Sie bei allen Anlageentscheidungen unterstützen.

**Ihre nächsten Schritte:**
1. Melden Sie sich in Ihrem Kasona-Portal an
2. Stellen Sie Ihre erste Frage an den Assistenten
3. Erkunden Sie Ihr personalisiertes Dashboard

Bei Fragen stehen wir Ihnen jederzeit zur Verfügung.

Mit besten Grüßen,
Ihr Kasona Team`,
  },
  {
    id: "portfolio_confirmed",
    name: "Portfolio bestätigt",
    icon: CheckCircle,
    subject: "Ihr Portfolio wurde erfolgreich importiert",
    body: `Hallo {{name}},

gute Nachrichten! Wir haben Ihr Portfolio erfolgreich importiert und verifiziert.

**Portfolio-Übersicht:**
- Anzahl Positionen: {{portfolioCount}}
- Status: Vollständig geprüft ✓

Ihr Investment-Assistent wurde mit diesen Daten aktualisiert und kann Ihnen nun fundierte, auf Ihr Portfolio zugeschnittene Analysen liefern.

Probieren Sie es aus – fragen Sie zum Beispiel:
- "Welche Earnings stehen diese Woche für mein Portfolio an?"
- "Zeige mir Konzentrationsrisiken in meinem Depot"

Mit besten Grüßen,
Ihr Kasona Team`,
  },
  {
    id: "first_analysis",
    name: "Erste Analyse bereit",
    icon: Mail,
    subject: "Ihre erste personalisierte Analyse wartet auf Sie!",
    body: `Hallo {{name}},

Ihr Investment-Assistent hat die erste Analyse Ihres Portfolios abgeschlossen und möchte Ihnen einige interessante Einblicke präsentieren.

**Was Sie erwartet:**
- Earnings-Kalender für Ihre Positionen
- Potenzielle Risiken und Chancen
- Handlungsempfehlungen basierend auf Ihrem Anlageprofil

Starten Sie jetzt Ihren ersten Chat und entdecken Sie, wie Kasona Ihre Investment-Entscheidungen verbessern kann.

[Jetzt einloggen und Chat starten]

Mit besten Grüßen,
Ihr Kasona Team`,
  },
];

export function EmailTemplateModal({
  open,
  onOpenChange,
  customer,
}: EmailTemplateModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState(EMAIL_TEMPLATES[0].id);
  const [subject, setSubject] = useState(EMAIL_TEMPLATES[0].subject);
  const [body, setBody] = useState(EMAIL_TEMPLATES[0].body);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [isSending, setIsSending] = useState(false);

  const handleTemplateChange = (templateId: string) => {
    const template = EMAIL_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setSubject(template.subject);
      setBody(template.body);
    }
  };

  const replaceVariables = (text: string) => {
    if (!customer) return text;
    return text
      .replace(/\{\{name\}\}/g, customer.name.split(" ")[0])
      .replace(/\{\{email\}\}/g, customer.email)
      .replace(/\{\{portfolioCount\}\}/g, String(customer.portfolioCount || 0));
  };

  const handleSend = () => {
    setIsSending(true);
    // Simulate sending
    setTimeout(() => {
      setIsSending(false);
      onOpenChange(false);
      toast({
        title: "E-Mail gesendet",
        description: `E-Mail wurde erfolgreich an ${customer?.email} gesendet.`,
      });
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            E-Mail an {customer?.name} senden
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Selection */}
          <div className="space-y-2">
            <Label>Vorlage wählen</Label>
            <div className="grid grid-cols-3 gap-2">
              {EMAIL_TEMPLATES.map((template) => {
                const Icon = template.icon;
                return (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateChange(template.id)}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-all ${
                      selectedTemplate === template.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Icon className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm font-medium truncate">{template.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Edit/Preview Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "edit" | "preview")}>
            <TabsList className="w-full">
              <TabsTrigger value="edit" className="flex-1 gap-2">
                <Edit3 className="h-4 w-4" />
                Bearbeiten
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex-1 gap-2">
                <Eye className="h-4 w-4" />
                Vorschau
              </TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Betreff</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body">Nachricht</Label>
                <textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full h-64 p-3 rounded-lg bg-input border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Verfügbare Variablen: {"{{name}}"}, {"{{email}}"}, {"{{portfolioCount}}"}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="mt-4">
              <div className="border border-border rounded-lg overflow-hidden">
                {/* Email Header */}
                <div className="bg-muted/50 p-4 border-b border-border">
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">An:</span>{" "}
                      {customer?.email}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Betreff:</span>{" "}
                      <span className="font-medium">{replaceVariables(subject)}</span>
                    </p>
                  </div>
                </div>
                {/* Email Body */}
                <div className="p-4 bg-background min-h-64">
                  <pre className="whitespace-pre-wrap text-sm font-sans">
                    {replaceVariables(body)}
                  </pre>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSend} disabled={isSending} className="gap-2">
              {isSending ? (
                <>
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Senden...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  E-Mail senden
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
