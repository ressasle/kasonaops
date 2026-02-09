import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Save } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { FocusGoal } from "@/components/FocusGoal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { MarketDataCharts } from "@/components/MarketDataCharts";
import { MarketDataOverview } from "@/components/MarketDataOverview";
import { YoYPerformanceChart } from "@/components/YoYPerformanceChart";

const DRAFT_KEY_PREFIX = 'review_draft_';

const NewReview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  // Section 0: Quartals-Reflexion
  const [quarterKeywords, setQuarterKeywords] = useState("");
  const [dominantEvent, setDominantEvent] = useState("");
  const [surprisinglyStable, setSurprisinglyStable] = useState("");
  const [personalInsight, setPersonalInsight] = useState("");
  
  // Section 1: Währungen & Zinsen
  const [currencyNotes, setCurrencyNotes] = useState("");
  const [currencyReflection, setCurrencyReflection] = useState("");
  
  // Section 2: Gold & Silber
  const [preciousMetalsNotes, setPreciousMetalsNotes] = useState("");
  const [preciousMetalsReflection, setPreciousMetalsReflection] = useState("");
  
  // Section 3: Ölpreise
  const [oilNotes, setOilNotes] = useState("");
  const [oilReflection, setOilReflection] = useState("");
  
  // Section 4: Kupfer & Rohstoffe
  const [commoditiesNotes, setCommoditiesNotes] = useState("");
  const [commoditiesReflection, setCommoditiesReflection] = useState("");
  
  // Section 5: Börsen-Indizes
  const [indicesNotes, setIndicesNotes] = useState("");
  const [indicesReflection, setIndicesReflection] = useState("");
  
  // Section 6: Einzelaktien
  const [stocksNotes, setStocksNotes] = useState("");
  const [stocksReflection, setStocksReflection] = useState("");
  
  // Section 7: Quartalsstrategie
  const [strengthens, setStrengthens] = useState("");
  const [uncertainties, setUncertainties] = useState("");
  const [nextQuarterChanges, setNextQuarterChanges] = useState("");
  
  const [isSaving, setIsSaving] = useState(false);
  const [remindNextQuarter, setRemindNextQuarter] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const getPreviousQuarter = () => {
    const month = new Date().getMonth();
    const currentQuarter = Math.floor(month / 3) + 1;
    const currentYear = new Date().getFullYear();
    
    if (currentQuarter === 1) {
      return { quarter: 'Q4', year: currentYear - 1 };
    } else {
      return { quarter: `Q${currentQuarter - 1}`, year: currentYear };
    }
  };

  const { quarter, year } = getPreviousQuarter();

  // Load draft on mount
  useEffect(() => {
    if (!user) return;
    
    const draftKey = `${DRAFT_KEY_PREFIX}${user.id}`;
    const draft = localStorage.getItem(draftKey);
    
    if (draft) {
      try {
        const data = JSON.parse(draft);
        setQuarterKeywords(data.quarterKeywords || "");
        setDominantEvent(data.dominantEvent || "");
        setSurprisinglyStable(data.surprisinglyStable || "");
        setPersonalInsight(data.personalInsight || "");
        setCurrencyNotes(data.currencyNotes || "");
        setCurrencyReflection(data.currencyReflection || "");
        setPreciousMetalsNotes(data.preciousMetalsNotes || "");
        setPreciousMetalsReflection(data.preciousMetalsReflection || "");
        setOilNotes(data.oilNotes || "");
        setOilReflection(data.oilReflection || "");
        setCommoditiesNotes(data.commoditiesNotes || "");
        setCommoditiesReflection(data.commoditiesReflection || "");
        setIndicesNotes(data.indicesNotes || "");
        setIndicesReflection(data.indicesReflection || "");
        setStocksNotes(data.stocksNotes || "");
        setStocksReflection(data.stocksReflection || "");
        setStrengthens(data.strengthens || "");
        setUncertainties(data.uncertainties || "");
        setNextQuarterChanges(data.nextQuarterChanges || "");
        
        toast({
          title: t('newReview.draftRestored'),
          description: t('newReview.draftRestoredDesc'),
        });
      } catch (e) {
        console.error('Error restoring draft:', e);
      }
    }
    
    // Load reminder preference
    const loadReminderPref = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('quarterly_reminder')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setRemindNextQuarter(data.quarterly_reminder || false);
      }
    };
    loadReminderPref();
  }, [user]);

  // Auto-save draft
  useEffect(() => {
    if (!user || !isDirty) return;
    
    const draftData = {
      quarterKeywords,
      dominantEvent,
      surprisinglyStable,
      personalInsight,
      currencyNotes,
      currencyReflection,
      preciousMetalsNotes,
      preciousMetalsReflection,
      oilNotes,
      oilReflection,
      commoditiesNotes,
      commoditiesReflection,
      indicesNotes,
      indicesReflection,
      stocksNotes,
      stocksReflection,
      strengthens,
      uncertainties,
      nextQuarterChanges,
    };
    
    const draftKey = `${DRAFT_KEY_PREFIX}${user.id}`;
    localStorage.setItem(draftKey, JSON.stringify(draftData));
    setLastSaved(new Date());
  }, [
    user, isDirty, quarterKeywords, dominantEvent, surprisinglyStable, personalInsight,
    currencyNotes, currencyReflection, preciousMetalsNotes, preciousMetalsReflection,
    oilNotes, oilReflection, commoditiesNotes, commoditiesReflection,
    indicesNotes, indicesReflection, stocksNotes, stocksReflection,
    strengthens, uncertainties, nextQuarterChanges
  ]);

  // Track changes
  const handleChange = <T,>(setter: React.Dispatch<React.SetStateAction<T>>) => (value: T) => {
    setter(value);
    setIsDirty(true);
  };

  const compileReviewData = () => {
    return `
Quartals-Reflexion:
- Dominante Themen: ${quarterKeywords}
- Wichtigstes Ereignis: ${dominantEvent}
- Überraschend stabil: ${surprisinglyStable}
- Persönliche Erkenntnis: ${personalInsight}

Währungen & Zinsen:
${currencyNotes}
Reflexion: ${currencyReflection}

Gold & Silber:
${preciousMetalsNotes}
Reflexion: ${preciousMetalsReflection}

Ölpreise:
${oilNotes}
Reflexion: ${oilReflection}

Kupfer & Rohstoffe:
${commoditiesNotes}
Reflexion: ${commoditiesReflection}

Börsen-Indizes:
${indicesNotes}
Reflexion: ${indicesReflection}

Einzelaktien:
${stocksNotes}
Reflexion: ${stocksReflection}

Quartalsstrategie:
- Stärkt Strategie: ${strengthens}
- Verunsichert: ${uncertainties}
- Nächstes Quartal ändern: ${nextQuarterChanges}
    `.trim();
  };

  const handleReminderChange = async (checked: boolean) => {
    setRemindNextQuarter(checked);
    if (!user) return;
    
    try {
      await supabase
        .from('profiles')
        .update({ quarterly_reminder: checked })
        .eq('id', user.id);
      
      toast({
        title: t('settings.reminderUpdated'),
      });
    } catch (error) {
      console.error('Error updating reminder:', error);
    }
  };

  const exportToPDF = () => {
    // Generate filename with YYYYMM format
    const today = new Date();
    const yearStr = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const filename = `${yearStr}${month}-quarterly market-snapshot`;
    
    // Set document title for print filename
    const originalTitle = document.title;
    document.title = filename;
    
    window.print();
    
    // Restore original title after print
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  const saveReview = async () => {
    if (!user) {
      toast({
        title: t('toast.notLoggedIn'),
        description: t('toast.notLoggedInDesc'),
        variant: "destructive",
      });
      return;
    }

    const compiledData = compileReviewData();
    if (!compiledData.trim()) {
      toast({
        title: t('toast.noData'),
        description: t('toast.noDataDesc'),
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const reviewData = {
        quarterKeywords,
        dominantEvent,
        surprisinglyStable,
        personalInsight,
        currencyNotes,
        currencyReflection,
        preciousMetalsNotes,
        preciousMetalsReflection,
        oilNotes,
        oilReflection,
        commoditiesNotes,
        commoditiesReflection,
        indicesNotes,
        indicesReflection,
        stocksNotes,
        stocksReflection,
        strengthens,
        uncertainties,
        nextQuarterChanges,
      };

      const { error } = await supabase
        .from('quarterly_reviews')
        .upsert(
          {
            user_id: user.id,
            quarter,
            year,
            review_data: reviewData
          },
          { onConflict: 'user_id,quarter,year' }
        );

      if (error) throw error;

      // Clear draft
      const draftKey = `${DRAFT_KEY_PREFIX}${user.id}`;
      localStorage.removeItem(draftKey);

      // Export PDF after saving
      exportToPDF();

      toast({
        title: t('toast.reviewSaved'),
        description: t('toast.reviewSavedDesc'),
      });
      
      setTimeout(() => navigate('/history'), 1000);
    } catch (error) {
      console.error('Error saving review:', error);
      toast({
        title: t('common.error'),
        description: t('toast.reviewError'),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-abril text-3xl mb-2">
              {t('newReview.reviewQ4')} {year.toString().slice(-2)}
            </h1>
            <p className="text-muted-foreground">
              {t('newReview.subtitle')}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              💾 {t('newReview.autoSaveHint')} • 📄 {t('newReview.exportHint')}
            </p>
            {lastSaved && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Save className="h-3 w-3" />
                {t('newReview.autoSaved')}: {lastSaved.toLocaleTimeString()}
              </p>
            )}
          </div>

          {/* 1. Focus Goal - TOP with effect toggle */}
          <div className="mb-8">
            <FocusGoal showEffectToggle={true} />
          </div>

          <div className="space-y-8">

            {/* 3A. Section A: Wechselkurse & Währungen/Zinsen */}
            <section className="space-y-6">
              <h2 className="headline-serif text-2xl italic">A. {t('newReview.sectionA')}</h2>
              
              <MarketDataCharts category="currencies" />
              <MarketDataOverview category="currencies" />
              
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="currencies">
                  <AccordionTrigger className="font-anton text-lg">
                    <span className="flex items-center gap-2">
                      ✏️ {t('newReview.section1')}
                    </span>
                    <span className="text-sm text-muted-foreground font-normal ml-auto mr-2">
                      {t('newReview.expandForNotes')}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div>
                      <Label htmlFor="currency-notes">{t('newReview.q1_notes')}</Label>
                      <Textarea
                        id="currency-notes"
                        value={currencyNotes}
                        onChange={(e) => handleChange(setCurrencyNotes)(e.target.value)}
                        placeholder={t('newReview.q1_notesPlaceholder')}
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label htmlFor="currency-reflection">{t('newReview.q1_reflection')}</Label>
                      <Textarea
                        id="currency-reflection"
                        value={currencyReflection}
                        onChange={(e) => handleChange(setCurrencyReflection)(e.target.value)}
                        placeholder={t('newReview.q1_reflectionPlaceholder')}
                        rows={3}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            {/* 3B. Section B: Rohstoffe */}
            <section className="space-y-6">
              <h2 className="headline-serif text-2xl italic">B. {t('newReview.sectionB')}</h2>
              
              <MarketDataCharts category="commodities" />
              <MarketDataOverview category="commodities" />
              
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="gold-silver">
                  <AccordionTrigger className="font-anton text-lg">
                    <span className="flex items-center gap-2">
                      ✏️ {t('newReview.section2')}
                    </span>
                    <span className="text-sm text-muted-foreground font-normal ml-auto mr-2">
                      {t('newReview.expandForNotes')}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div>
                      <Label htmlFor="metals-notes">{t('newReview.q2_notes')}</Label>
                      <Textarea
                        id="metals-notes"
                        value={preciousMetalsNotes}
                        onChange={(e) => handleChange(setPreciousMetalsNotes)(e.target.value)}
                        placeholder={t('newReview.q2_notesPlaceholder')}
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label htmlFor="metals-reflection">{t('newReview.q2_reflection')}</Label>
                      <Textarea
                        id="metals-reflection"
                        value={preciousMetalsReflection}
                        onChange={(e) => handleChange(setPreciousMetalsReflection)(e.target.value)}
                        placeholder={t('newReview.q2_reflectionPlaceholder')}
                        rows={3}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="oil">
                  <AccordionTrigger className="font-anton text-lg">
                    <span className="flex items-center gap-2">
                      ✏️ {t('newReview.section3')}
                    </span>
                    <span className="text-sm text-muted-foreground font-normal ml-auto mr-2">
                      {t('newReview.expandForNotes')}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div>
                      <Label htmlFor="oil-notes">{t('newReview.q3_notes')}</Label>
                      <Textarea
                        id="oil-notes"
                        value={oilNotes}
                        onChange={(e) => handleChange(setOilNotes)(e.target.value)}
                        placeholder={t('newReview.q3_notesPlaceholder')}
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label htmlFor="oil-reflection">{t('newReview.q3_reflection')}</Label>
                      <Textarea
                        id="oil-reflection"
                        value={oilReflection}
                        onChange={(e) => handleChange(setOilReflection)(e.target.value)}
                        placeholder={t('newReview.q3_reflectionPlaceholder')}
                        rows={3}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="copper">
                  <AccordionTrigger className="font-anton text-lg">
                    <span className="flex items-center gap-2">
                      ✏️ {t('newReview.section4')}
                    </span>
                    <span className="text-sm text-muted-foreground font-normal ml-auto mr-2">
                      {t('newReview.expandForNotes')}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div>
                      <Label htmlFor="commodities-notes">{t('newReview.q4_notes')}</Label>
                      <Textarea
                        id="commodities-notes"
                        value={commoditiesNotes}
                        onChange={(e) => handleChange(setCommoditiesNotes)(e.target.value)}
                        placeholder={t('newReview.q4_notesPlaceholder')}
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label htmlFor="commodities-reflection">{t('newReview.q4_reflection')}</Label>
                      <Textarea
                        id="commodities-reflection"
                        value={commoditiesReflection}
                        onChange={(e) => handleChange(setCommoditiesReflection)(e.target.value)}
                        placeholder={t('newReview.q4_reflectionPlaceholder')}
                        rows={3}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            {/* 3C. Section C: Aktien & Indizes */}
            <section className="space-y-6">
              <h2 className="headline-serif text-2xl italic">C. {t('newReview.sectionC')}</h2>
              
              <MarketDataCharts category="indices" />
              <MarketDataOverview category="indices" />
              
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="indices">
                  <AccordionTrigger className="font-anton text-lg">
                    <span className="flex items-center gap-2">
                      ✏️ {t('newReview.section5')}
                    </span>
                    <span className="text-sm text-muted-foreground font-normal ml-auto mr-2">
                      {t('newReview.expandForNotes')}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div>
                      <Label htmlFor="indices-notes">{t('newReview.q5_notes')}</Label>
                      <Textarea
                        id="indices-notes"
                        value={indicesNotes}
                        onChange={(e) => handleChange(setIndicesNotes)(e.target.value)}
                        placeholder={t('newReview.q5_notesPlaceholder')}
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label htmlFor="indices-reflection">{t('newReview.q5_reflection')}</Label>
                      <Textarea
                        id="indices-reflection"
                        value={indicesReflection}
                        onChange={(e) => handleChange(setIndicesReflection)(e.target.value)}
                        placeholder={t('newReview.q5_reflectionPlaceholder')}
                        rows={3}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="stocks">
                  <AccordionTrigger className="font-anton text-lg">
                    <span className="flex items-center gap-2">
                      ✏️ {t('newReview.section6')}
                    </span>
                    <span className="text-sm text-muted-foreground font-normal ml-auto mr-2">
                      {t('newReview.expandForNotes')}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div>
                      <Label htmlFor="stocks-notes">{t('newReview.q6_notes')}</Label>
                      <Textarea
                        id="stocks-notes"
                        value={stocksNotes}
                        onChange={(e) => handleChange(setStocksNotes)(e.target.value)}
                        placeholder={t('newReview.q6_notesPlaceholder')}
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label htmlFor="stocks-reflection">{t('newReview.q6_reflection')}</Label>
                      <Textarea
                        id="stocks-reflection"
                        value={stocksReflection}
                        onChange={(e) => handleChange(setStocksReflection)(e.target.value)}
                        placeholder={t('newReview.q6_reflectionPlaceholder')}
                        rows={3}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            {/* 3D. Section D: Gesamt */}
            <section className="space-y-6">
              <h2 className="headline-serif text-2xl italic">D. {t('newReview.sectionD')}</h2>
              
              {/* YoY Performance Chart */}
              <YoYPerformanceChart />
              
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="observations">
                  <AccordionTrigger className="font-anton text-lg">
                    <span className="flex items-center gap-2">
                      ✏️ {t('newReview.observations')}
                    </span>
                    <span className="text-sm text-muted-foreground font-normal ml-auto mr-2">
                      {t('newReview.expandForNotes')}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div>
                      <Label htmlFor="keywords">{t('newReview.q0_keywords')}</Label>
                      <Input
                        id="keywords"
                        value={quarterKeywords}
                        onChange={(e) => handleChange(setQuarterKeywords)(e.target.value)}
                        placeholder={t('newReview.q0_keywordsPlaceholder')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="event">{t('newReview.q0_event')}</Label>
                      <Textarea
                        id="event"
                        value={dominantEvent}
                        onChange={(e) => handleChange(setDominantEvent)(e.target.value)}
                        placeholder={t('newReview.q0_eventPlaceholder')}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="stable">{t('newReview.q0_stable')}</Label>
                      <Textarea
                        id="stable"
                        value={surprisinglyStable}
                        onChange={(e) => handleChange(setSurprisinglyStable)(e.target.value)}
                        placeholder={t('newReview.q0_stablePlaceholder')}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="insight">{t('newReview.q0_insight')}</Label>
                      <Textarea
                        id="insight"
                        value={personalInsight}
                        onChange={(e) => handleChange(setPersonalInsight)(e.target.value)}
                        placeholder={t('newReview.q0_insightPlaceholder')}
                        rows={3}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            {/* 4. Ihre Quartalsstrategie */}
            <Accordion type="multiple" className="w-full">
              <AccordionItem value="strategy">
                <AccordionTrigger className="font-anton text-lg">
                  <span className="flex items-center gap-2">
                    ✏️ {t('newReview.section7')}
                  </span>
                  <span className="text-sm text-muted-foreground font-normal ml-auto mr-2">
                    {t('newReview.expandForNotes')}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div>
                    <Label htmlFor="strengthens">{t('newReview.q7_strengthens')}</Label>
                    <Textarea
                      id="strengthens"
                      value={strengthens}
                      onChange={(e) => handleChange(setStrengthens)(e.target.value)}
                      placeholder={t('newReview.q7_strengthensPlaceholder')}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="uncertainties">{t('newReview.q7_uncertainties')}</Label>
                    <Textarea
                      id="uncertainties"
                      value={uncertainties}
                      onChange={(e) => handleChange(setUncertainties)(e.target.value)}
                      placeholder={t('newReview.q7_uncertaintiesPlaceholder')}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="changes">{t('newReview.q7_changes')}</Label>
                    <Textarea
                      id="changes"
                      value={nextQuarterChanges}
                      onChange={(e) => handleChange(setNextQuarterChanges)(e.target.value)}
                      placeholder={t('newReview.q7_changesPlaceholder')}
                      rows={3}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* 5. Action Area */}
            <Card className="glass-panel">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <Button
                    onClick={saveReview}
                    disabled={isSaving}
                    size="lg"
                    className="flex-1 w-full md:w-auto shadow-glow hover:shadow-glow-lg"
                  >
                    <Download className={`mr-2 h-4 w-4 ${isSaving ? 'animate-pulse' : ''}`} />
                    {isSaving ? t('common.saving') : t('newReview.exportPlan')}
                  </Button>
                  
                  <div className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${remindNextQuarter ? 'bg-secondary/20' : ''}`}>
                    <Checkbox 
                      id="reminder"
                      checked={remindNextQuarter}
                      onCheckedChange={(checked) => handleReminderChange(checked as boolean)}
                    />
                    <Label 
                      htmlFor="reminder" 
                      className={`cursor-pointer transition-colors ${remindNextQuarter ? 'text-secondary font-medium' : ''}`}
                    >
                      {t('newReview.remindNextQuarter')}
                    </Label>
                  </div>
                </div>

              </CardContent>
            </Card>
            
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NewReview;
