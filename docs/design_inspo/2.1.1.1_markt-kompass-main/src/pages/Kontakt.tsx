import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Youtube, ExternalLink, Linkedin, Clock, HelpCircle, Send, Mail, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Kontakt = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { toast } = useToast();
  
  // Feedback form state
  const [stocks, setStocks] = useState(false);
  const [tradelog, setTradelog] = useState(false);
  const [allocation, setAllocation] = useState(false);
  const [moreCommodities, setMoreCommodities] = useState("");
  const [moreIndices, setMoreIndices] = useState("");
  const [moreCurrencies, setMoreCurrencies] = useState("");
  const [otherFeedback, setOtherFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: t('contact.feedbackError'),
        description: t('contact.feedbackLoginRequired'),
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    
    const { error } = await supabase
      .from('user_feedback')
      .insert({
        user_id: user.id,
        wants_stocks: stocks,
        wants_tradelog: tradelog,
        wants_allocation: allocation,
        more_commodities: moreCommodities || null,
        more_indices: moreIndices || null,
        more_currencies: moreCurrencies || null,
        other_feedback: otherFeedback || null,
      });
    
    setIsSubmitting(false);
    
    if (error) {
      toast({
        title: t('contact.feedbackError'),
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: t('contact.feedbackSent'),
        description: t('contact.feedbackSentDesc'),
      });
      // Reset form
      setStocks(false);
      setTradelog(false);
      setAllocation(false);
      setMoreCommodities("");
      setMoreIndices("");
      setMoreCurrencies("");
      setOtherFeedback("");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <img 
              src={theme === 'dark' ? '/kasona-logo-dark.png' : '/kasona-logo-light.png'}
              alt="Kasona Logo"
              className="h-10 w-auto object-contain"
            />
            <h1 className="font-serif text-4xl">{t('footer.contact')}</h1>
          </div>
          
          {/* Erreichbarkeit */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <Clock className="h-5 w-5 text-accent" />
                {t('contact.availability')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-2">
                {t('contact.availabilityHours')}
              </p>
              <a 
                href="mailto:hallo@kasona.ai"
                className="text-accent hover:underline flex items-center gap-2 mb-2"
              >
                <Mail className="h-4 w-4" />
                hallo@kasona.ai
              </a>
              <p className="text-sm text-muted-foreground">
                {t('contact.availabilityResponse')}
              </p>
            </CardContent>
          </Card>

          {/* Links & Ressourcen */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <ExternalLink className="h-5 w-5 text-accent" />
                Links & Ressourcen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Website */}
              <div>
                <h3 className="font-semibold mb-2">Website</h3>
                <a 
                  href="https://www.kasona.ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Kasona AI
                </a>
              </div>
              
              {/* LinkedIn */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Linkedin className="h-4 w-4 text-blue-600" />
                  LinkedIn
                </h3>
                <a 
                  href="https://www.linkedin.com/in/julian-elsaesser/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  Julian Elsässer (Geschäftsführer)
                </a>
              </div>
              
              {/* YouTube Kanäle */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Youtube className="h-4 w-4 text-red-500" />
                  YouTube Kanäle
                </h3>
                <div className="space-y-3">
                  <div>
                    <a 
                      href="https://www.youtube.com/@julianelsaesser"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline"
                    >
                      Julian Elsässer
                    </a>
                    <p className="text-xs text-muted-foreground">KI & Innovation Anwendungen</p>
                  </div>
                  <div>
                    <a 
                      href="https://www.youtube.com/@MarkusElsaesser1"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline"
                    >
                      Dr. Markus Elsässer
                    </a>
                    <p className="text-xs text-muted-foreground">Geldanlage & Mentor</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature-Fragebogen */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-accent" />
                {t('contact.feedbackTitle')}
              </CardTitle>
              <CardDescription>{t('contact.feedbackDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleFeedbackSubmit}>
                {/* Checkboxen */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="stocks" 
                      checked={stocks}
                      onCheckedChange={(checked) => setStocks(!!checked)}
                    />
                    <Label htmlFor="stocks">{t('contact.feedback.stocks')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="tradelog"
                      checked={tradelog}
                      onCheckedChange={(checked) => setTradelog(!!checked)}
                    />
                    <Label htmlFor="tradelog">{t('contact.feedback.tradelog')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="allocation"
                      checked={allocation}
                      onCheckedChange={(checked) => setAllocation(!!checked)}
                    />
                    <Label htmlFor="allocation">{t('contact.feedback.allocation')}</Label>
                  </div>
                </div>
                
                {/* Textfelder für "Weitere..." */}
                <div className="space-y-3 pt-2">
                  <div>
                    <Label>{t('contact.feedback.moreCommodities')}</Label>
                    <Input 
                      placeholder="z.B. Platin, Palladium..."
                      value={moreCommodities}
                      onChange={(e) => setMoreCommodities(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>{t('contact.feedback.moreIndices')}</Label>
                    <Input 
                      placeholder="z.B. Nikkei 225, FTSE 100..."
                      value={moreIndices}
                      onChange={(e) => setMoreIndices(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>{t('contact.feedback.moreCurrencies')}</Label>
                    <Input 
                      placeholder="z.B. EUR/GBP, USD/JPY..."
                      value={moreCurrencies}
                      onChange={(e) => setMoreCurrencies(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>{t('contact.feedback.other')}</Label>
                    <Textarea 
                      placeholder={t('contact.feedback.otherPlaceholder')}
                      rows={3}
                      value={otherFeedback}
                      onChange={(e) => setOtherFeedback(e.target.value)}
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  {t('contact.feedback.submit')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Kontakt;