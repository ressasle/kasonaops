import { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Background } from "@/components/kasona/Background";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  Users,
  Brain,
  FileSpreadsheet,
  Code,
  Save,
  Trash2,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Mail,
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ValidationBanner } from "@/components/team/ValidationBanner";
import { ProfileCompleteness } from "@/components/team/ProfileCompleteness";
import { EmailTemplateModal } from "@/components/team/EmailTemplateModal";
import { supabase } from "@/integrations/supabase/client";

interface CustomerProfile {
  name: string;
  email: string;
  exclusions: string[];
  holyMetrics: string[];
  warningLevel: number;
  riskTolerance: number;
  investmentHorizon: string;
  notes: string;
}

interface Holding {
  ticker: string;
  name: string;
  shares: number;
  avgCost: number;
  reviewed: boolean;
}

const EXCLUSION_OPTIONS = [
  { id: "weapons", label: "Waffenhersteller" },
  { id: "tobacco", label: "Tabak" },
  { id: "oil_gas", label: "Öl & Gas" },
  { id: "cyclicals", label: "Zykliker" },
  { id: "china", label: "China-Exposure" },
  { id: "crypto", label: "Krypto-Assets" },
  { id: "gambling", label: "Glücksspiel" },
];

const METRIC_OPTIONS = [
  { id: "roic", label: "ROIC", description: "Return on Invested Capital" },
  { id: "fcf", label: "Free Cash Flow", description: "Freier Cashflow" },
  { id: "kgv", label: "KGV", description: "Kurs-Gewinn-Verhältnis" },
  { id: "dividend", label: "Dividende", description: "Dividendenrendite" },
  { id: "ebit_margin", label: "EBIT-Marge", description: "Operative Marge" },
  { id: "debt_equity", label: "Verschuldung", description: "Debt/Equity Ratio" },
];

const HORIZON_OPTIONS = [
  { value: "short", label: "Kurzfristig (< 2 Jahre)" },
  { value: "medium", label: "Mittelfristig (2-5 Jahre)" },
  { value: "long", label: "Langfristig (5+ Jahre)" },
  { value: "very_long", label: "Buy & Hold (10+ Jahre)" },
];

export default function TeamOnboarding() {
  const navigate = useNavigate();
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [profile, setProfile] = useState<CustomerProfile>({
    name: "",
    email: "",
    exclusions: [],
    holyMetrics: [],
    warningLevel: 50,
    riskTolerance: 50,
    investmentHorizon: "long",
    notes: "",
  });
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation logic
  const validation = useMemo(() => {
    const items: { message: string; type: "error" | "warning" }[] = [];

    // Errors (block saving)
    if (profile.holyMetrics.length < 2) {
      items.push({
        message: `Mindestens 2 Kennzahlen auswählen (aktuell: ${profile.holyMetrics.length})`,
        type: "error",
      });
    }

    if (isNewCustomer && !profile.name.trim()) {
      items.push({ message: "Name ist erforderlich", type: "error" });
    }

    if (isNewCustomer && !profile.email.trim()) {
      items.push({ message: "E-Mail ist erforderlich", type: "error" });
    }

    if (isNewCustomer && profile.email.trim() && !profile.email.includes("@")) {
      items.push({ message: "Gültige E-Mail-Adresse eingeben", type: "error" });
    }

    // Warnings (just hints)
    if (holdings.length === 0) {
      items.push({ message: "Kein Portfolio importiert", type: "warning" });
    }

    if (holdings.some((h) => !h.reviewed)) {
      items.push({
        message: `${holdings.filter((h) => !h.reviewed).length} Positionen nicht geprüft`,
        type: "warning",
      });
    }

    if (!profile.notes.trim()) {
      items.push({ message: "Keine zusätzlichen Hinweise angegeben", type: "warning" });
    }

    return items;
  }, [profile, holdings, isNewCustomer]);

  const hasErrors = validation.some((v) => v.type === "error");

  // Profile completeness calculation
  const profileCompleteness = useMemo(() => {
    let score = 0;
    const weights = {
      hasMetrics: 30,
      hasName: 15,
      hasEmail: 15,
      hasPortfolio: 20,
      hasReviewedPositions: 10,
      hasNotes: 10,
    };

    if (profile.holyMetrics.length >= 2) score += weights.hasMetrics;
    if (profile.name.trim() || !isNewCustomer) score += weights.hasName;
    if (profile.email.trim() || !isNewCustomer) score += weights.hasEmail;
    if (holdings.length > 0) score += weights.hasPortfolio;
    if (holdings.length > 0 && holdings.every((h) => h.reviewed)) score += weights.hasReviewedPositions;
    if (profile.notes.trim()) score += weights.hasNotes;

    return score;
  }, [profile, holdings, isNewCustomer]);

  const toggleExclusion = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      exclusions: prev.exclusions.includes(id)
        ? prev.exclusions.filter((e) => e !== id)
        : [...prev.exclusions, id],
    }));
  };

  const toggleMetric = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      holyMetrics: prev.holyMetrics.includes(id)
        ? prev.holyMetrics.filter((m) => m !== id)
        : [...prev.holyMetrics, id],
    }));
  };

  const generateSystemPrompt = () => {
    const exclusionList = profile.exclusions
      .map((id) => EXCLUSION_OPTIONS.find((o) => o.id === id)?.label)
      .filter(Boolean)
      .join(", ");

    const metricList = profile.holyMetrics
      .map((id) => METRIC_OPTIONS.find((o) => o.id === id)?.label)
      .filter(Boolean)
      .join(", ");

    const warningStyle =
      profile.warningLevel < 33
        ? "diplomatisch und vorsichtig"
        : profile.warningLevel < 66
        ? "ausgewogen und sachlich"
        : "direkt und klar";

    const riskStyle =
      profile.riskTolerance < 33
        ? "konservativ"
        : profile.riskTolerance < 66
        ? "moderat"
        : "wachstumsorientiert";

    return `Du bist ein Investment-Assistent für ${profile.name || "[Kundenname]"}.

INVESTMENT-PROFIL:
- Risikoprofil: ${riskStyle}
- Anlagehorizont: ${HORIZON_OPTIONS.find((h) => h.value === profile.investmentHorizon)?.label}
- Bevorzugte Kennzahlen: ${metricList || "Keine angegeben"}

HARTE REGELN:
${exclusionList ? `- NIEMALS empfehlen: ${exclusionList}` : "- Keine Ausschlüsse definiert"}

KOMMUNIKATIONSSTIL:
- Warnungen: ${warningStyle}
- Sprache: Deutsch

${profile.notes ? `ZUSÄTZLICHE HINWEISE:\n${profile.notes}` : ""}`;
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleSave = async () => {
    if (hasErrors) {
      toast({
        title: "Speichern nicht möglich",
        description: "Bitte beheben Sie zuerst alle Fehler.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      let customerId: string;

      if (isNewCustomer) {
        // Generate temporary password for new customer
        const tempPassword = generatePassword();
        
        // Create user via Edge Function (admin API)
        const { data: createData, error: createError } = await supabase.functions.invoke('create-customer-user', {
          body: {
            email: profile.email,
            fullName: profile.name,
            password: tempPassword,
          },
        });

        if (createError || !createData?.userId) {
          throw new Error(createData?.error || createError?.message || 'Fehler beim Erstellen des Benutzers');
        }

        customerId = createData.userId;
        console.log('New customer created:', customerId);

        // Profile is auto-created by trigger, but update with full name
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: profile.name,
            onboarding_complete: true,
          })
          .eq('id', customerId);

        if (profileError) {
          console.error('Error updating profile:', profileError);
        }

      } else {
        // For existing customer (demo data), use a placeholder
        // In real app, selectedCustomer would be the actual user ID
        customerId = selectedCustomer;
        console.log('Updating existing customer:', customerId);
      }

      // Save investor profile
      const { error: investorError } = await supabase
        .from('investor_profiles')
        .upsert({
          user_id: customerId,
          risk_tolerance: profile.riskTolerance,
          preferred_metric: profile.holyMetrics[0] || 'roic', // Legacy field
          preferred_metrics: profile.holyMetrics,
          warning_level: profile.warningLevel < 33 ? 'soft' : profile.warningLevel < 66 ? 'normal' : 'direct',
          exclusion_criteria: profile.exclusions,
          investment_horizon: profile.investmentHorizon,
          additional_notes: profile.notes,
          system_prompt: generateSystemPrompt(),
        }, {
          onConflict: 'user_id',
        });

      if (investorError) {
        console.error('Error saving investor profile:', investorError);
        throw new Error('Fehler beim Speichern des Anlegerprofils');
      }

      // Save holdings
      if (holdings.length > 0) {
        // Delete existing holdings first
        await supabase
          .from('holdings')
          .delete()
          .eq('user_id', customerId);

        // Insert new holdings
        const { error: holdingsError } = await supabase
          .from('holdings')
          .insert(
            holdings.map(h => ({
              user_id: customerId,
              ticker: h.ticker,
              name: h.name,
              shares: h.shares,
              avg_cost: h.avgCost,
            }))
          );

        if (holdingsError) {
          console.error('Error saving holdings:', holdingsError);
          throw new Error('Fehler beim Speichern des Portfolios');
        }
      }

      // Create customer assignment (for new customers)
      if (isNewCustomer) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error: assignmentError } = await supabase
            .from('customer_assignments')
            .insert({
              team_member_id: user.id,
              customer_id: customerId,
              status: 'active',
            });

          if (assignmentError) {
            console.error('Error creating assignment:', assignmentError);
          }
        }
      }

      toast({
        title: "Kunde aktiviert",
        description: `${profile.name || "Kunde"} wurde erfolgreich eingerichtet.`,
      });
      setEmailModalOpen(true);

    } catch (error) {
      console.error('Error saving customer:', error);
      toast({
        title: "Fehler beim Speichern",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const processFile = async (file: File) => {
    const allowedTypes = ['application/pdf', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.csv')) {
      toast({
        title: "Ungültiges Dateiformat",
        description: "Bitte laden Sie eine PDF-, CSV- oder Excel-Datei hoch.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const base64 = await fileToBase64(file);
      
      console.log('Sending file to parse-portfolio:', file.name, file.type);
      
      const { data, error } = await supabase.functions.invoke('parse-portfolio', {
        body: {
          file: base64,
          filename: file.name,
          mimetype: file.type,
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Fehler beim Verarbeiten der Datei');
      }

      console.log('Parse-portfolio response:', data);

      if (data?.holdings && Array.isArray(data.holdings)) {
        const parsedHoldings: Holding[] = data.holdings.map((h: any) => ({
          ticker: h.ticker || 'N/A',
          name: h.name || '',
          shares: parseFloat(h.shares) || 0,
          avgCost: parseFloat(h.avgCost) || 0,
          reviewed: false,
        }));
        
        setHoldings(parsedHoldings);
        
        toast({
          title: "Portfolio importiert",
          description: `${parsedHoldings.length} Positionen erkannt. Bitte prüfen Sie die Daten.`,
        });
      } else {
        toast({
          title: "Keine Positionen gefunden",
          description: "Die Datei konnte nicht analysiert werden oder enthält keine erkennbaren Positionen.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Fehler beim Import",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const toggleReviewed = (index: number) => {
    setHoldings((prev) =>
      prev.map((h, i) => (i === index ? { ...h, reviewed: !h.reviewed } : h))
    );
  };

  const removeHolding = (index: number) => {
    setHoldings((prev) => prev.filter((_, i) => i !== index));
  };

  const metricsNeeded = Math.max(0, 2 - profile.holyMetrics.length);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Background />

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/team")}
                  className="mr-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Team Portal</h1>
                  <p className="text-sm text-muted-foreground">
                    Neuen Kunden einrichten
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <ProfileCompleteness percentage={profileCompleteness} size="sm" />
                <Button
                  onClick={handleSave}
                  disabled={isSaving || hasErrors}
                  className="gap-2"
                >
                  {isSaving ? (
                    <>
                      <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Speichern...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Kunden aktivieren
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Validation Banner */}
          <ValidationBanner items={validation} />

          {/* Customer Selection */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Kunde auswählen</h2>
            </div>
            <div className="flex gap-4">
              <Select
                value={selectedCustomer}
                onValueChange={(val) => {
                  setSelectedCustomer(val);
                  setIsNewCustomer(val === "new");
                  if (val === "demo1") {
                    setProfile((p) => ({
                      ...p,
                      name: "Max Mustermann",
                      email: "max@example.com",
                      holyMetrics: ["roic", "fcf"],
                    }));
                  } else if (val === "demo2") {
                    setProfile((p) => ({
                      ...p,
                      name: "Erika Beispiel",
                      email: "erika@example.com",
                      holyMetrics: ["kgv", "dividend"],
                    }));
                  }
                }}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Kunde wählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">+ Neuer Kunde</SelectItem>
                  <SelectItem value="demo1">Max Mustermann</SelectItem>
                  <SelectItem value="demo2">Erika Beispiel</SelectItem>
                </SelectContent>
              </Select>
              {isNewCustomer && (
                <div className="flex gap-4 flex-1">
                  <div className="flex-1">
                    <Input
                      placeholder="Name *"
                      value={profile.name}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, name: e.target.value }))
                      }
                      className={!profile.name.trim() && isNewCustomer ? "border-destructive" : ""}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      type="email"
                      placeholder="E-Mail *"
                      value={profile.email}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, email: e.target.value }))
                      }
                      className={!profile.email.trim() && isNewCustomer ? "border-destructive" : ""}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Investment DNA */}
            <div className="glass-card rounded-xl p-6 space-y-6">
              <div className="flex items-center gap-3">
                <Brain className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Investment-DNA</h2>
              </div>

              {/* Exclusions */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Ausschlusskriterien</Label>
                <div className="grid grid-cols-2 gap-2">
                  {EXCLUSION_OPTIONS.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        id={option.id}
                        checked={profile.exclusions.includes(option.id)}
                        onCheckedChange={() => toggleExclusion(option.id)}
                      />
                      <label
                        htmlFor={option.id}
                        className="text-sm cursor-pointer"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Holy Metrics */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Heilige Kennzahlen (2-3 wählen)
                  </Label>
                  {metricsNeeded > 0 && (
                    <span className="text-xs text-destructive font-medium">
                      Noch {metricsNeeded} wählen
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {METRIC_OPTIONS.map((option) => (
                    <div
                      key={option.id}
                      className={`flex items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer ${
                        profile.holyMetrics.includes(option.id)
                          ? "border-primary bg-primary/10"
                          : metricsNeeded > 0
                          ? "border-destructive/50 hover:border-primary/50"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => toggleMetric(option.id)}
                    >
                      <Checkbox
                        checked={profile.holyMetrics.includes(option.id)}
                        onCheckedChange={() => toggleMetric(option.id)}
                      />
                      <div>
                        <p className="text-sm font-medium">{option.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label className="text-sm font-medium">
                      Warn-Aggressivität
                    </Label>
                    <span className="text-sm text-muted-foreground">
                      {profile.warningLevel < 33
                        ? "Sanft"
                        : profile.warningLevel < 66
                        ? "Normal"
                        : "Direkt"}
                    </span>
                  </div>
                  <Slider
                    value={[profile.warningLevel]}
                    onValueChange={([val]) =>
                      setProfile((p) => ({ ...p, warningLevel: val }))
                    }
                    max={100}
                    step={1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Diplomatisch</span>
                    <span>Direkt & Klar</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label className="text-sm font-medium">Risikobereitschaft</Label>
                    <span className="text-sm text-muted-foreground">
                      {profile.riskTolerance < 33
                        ? "Konservativ"
                        : profile.riskTolerance < 66
                        ? "Moderat"
                        : "Wachstum"}
                    </span>
                  </div>
                  <Slider
                    value={[profile.riskTolerance]}
                    onValueChange={([val]) =>
                      setProfile((p) => ({ ...p, riskTolerance: val }))
                    }
                    max={100}
                    step={1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Kapitalerhalt</span>
                    <span>Wachstum</span>
                  </div>
                </div>
              </div>

              {/* Horizon */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Anlagehorizont</Label>
                <Select
                  value={profile.investmentHorizon}
                  onValueChange={(val) =>
                    setProfile((p) => ({ ...p, investmentHorizon: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HORIZON_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Zusätzliche Hinweise</Label>
                <textarea
                  value={profile.notes}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, notes: e.target.value }))
                  }
                  placeholder="z.B. Kunde bevorzugt defensive Titel, hat schlechte Erfahrungen mit Tech-Aktien gemacht..."
                  className="w-full h-24 p-3 rounded-lg bg-input border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Portfolio Import + System Prompt */}
            <div className="space-y-6">
              {/* Portfolio Import */}
              <div className="glass-card rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">Portfolio-Import</h2>
                  </div>
                  {holdings.some((h) => !h.reviewed) && (
                    <span className="flex items-center gap-1 text-sm text-yellow-500">
                      <AlertTriangle className="h-4 w-4" />
                      Needs Review
                    </span>
                  )}
                </div>

                {holdings.length === 0 ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                      isDragging 
                        ? "border-primary bg-primary/10" 
                        : "border-border hover:border-primary/50"
                    } ${isUploading ? "pointer-events-none opacity-70" : ""}`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.csv,.xls,.xlsx"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    {isUploading ? (
                      <>
                        <Loader2 className="h-8 w-8 mx-auto text-primary mb-3 animate-spin" />
                        <p className="text-sm">Datei wird analysiert...</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Positionen werden erkannt
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                        <p className="text-sm">Depotauszug hochladen</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PDF, CSV oder Excel (Drag & Drop)
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {holdings.map((holding, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          holding.reviewed ? "bg-muted/30" : "bg-yellow-500/10"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleReviewed(index)}
                            className={`${
                              holding.reviewed
                                ? "text-green-500"
                                : "text-muted-foreground"
                            }`}
                          >
                            <CheckCircle2 className="h-5 w-5" />
                          </button>
                          <span className="font-mono font-semibold text-primary">
                            {holding.ticker}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            {holding.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm">{holding.shares.toFixed(2)} Stk</span>
                          {holding.avgCost === 0 ? (
                            <span className="text-sm text-yellow-500 italic">
                              Einstandskurs fehlt
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              @€{holding.avgCost.toFixed(2)}
                            </span>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => removeHolding(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* System Prompt Preview */}
              <div className="glass-card rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Code className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">
                    Generierter System-Prompt
                  </h2>
                </div>
                <pre className="bg-background/50 border border-border rounded-lg p-4 text-xs font-mono whitespace-pre-wrap overflow-x-auto max-h-80">
                  {generateSystemPrompt()}
                </pre>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Email Modal after save */}
      <EmailTemplateModal
        open={emailModalOpen}
        onOpenChange={setEmailModalOpen}
        customer={
          profile.name
            ? {
                id: "new",
                name: profile.name,
                email: profile.email,
                portfolioCount: holdings.length,
              }
            : null
        }
      />
    </div>
  );
}
