import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Cookie } from "lucide-react";

const COOKIE_CONSENT_KEY = "cookie_consent";

export const CookieBanner = () => {
  const { t } = useLanguage();
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [marketingCookies, setMarketingCookies] = useState(false);
  const [statisticsCookies, setStatisticsCookies] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const saveConsent = (acceptAll: boolean) => {
    const consent = {
      essential: true,
      marketing: acceptAll || marketingCookies,
      statistics: acceptAll || statisticsCookies,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-background/70 backdrop-blur-md border-t border-border/50">
      <Card className="max-w-2xl mx-auto bg-background/80 backdrop-blur-sm">
        <CardHeader className="pb-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <Cookie className="h-4 w-4" />
            {t('cookies.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">{t('cookies.description')}</p>
          
          {showDetails && (
            <div className="space-y-3 p-4 bg-muted/50 rounded-md">
              {/* Essenzielle Cookies - immer an */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t('cookies.essential')}</Label>
                  <p className="text-xs text-muted-foreground">{t('cookies.essentialDesc')}</p>
                </div>
                <Switch checked disabled />
              </div>
              
              {/* Marketing Cookies */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t('cookies.marketing')}</Label>
                  <p className="text-xs text-muted-foreground">{t('cookies.marketingDesc')}</p>
                </div>
                <Switch checked={marketingCookies} onCheckedChange={setMarketingCookies} />
              </div>
              
              {/* Statistik Cookies */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t('cookies.statistics')}</Label>
                  <p className="text-xs text-muted-foreground">{t('cookies.statisticsDesc')}</p>
                </div>
                <Switch checked={statisticsCookies} onCheckedChange={setStatisticsCookies} />
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowDetails(!showDetails)}>
              {showDetails ? t('cookies.hideDetails') : t('cookies.showDetails')}
            </Button>
            <Button variant="outline" onClick={() => saveConsent(false)}>
              {t('cookies.acceptSelected')}
            </Button>
            <Button onClick={() => saveConsent(true)}>
              {t('cookies.acceptAll')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};