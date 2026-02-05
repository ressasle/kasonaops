import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, History, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { MarketDataOverview } from "@/components/MarketDataOverview";
import { MarketDataCharts } from "@/components/MarketDataCharts";
import { useLanguage } from "@/contexts/LanguageContext";
import { VideoExplainerLink } from "@/components/VideoExplainerLink";
import { YoYPerformanceChart } from "@/components/YoYPerformanceChart";
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [reviewsCount, setReviewsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviewsCount = async () => {
      if (!user) return;

      try {
        const { count, error } = await supabase
          .from("quarterly_reviews")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        if (error) throw error;
        setReviewsCount(count || 0);
      } catch (error: any) {
        toast({
          title: t('common.error'),
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReviewsCount();
  }, [user, toast, t]);

  const getCurrentQuarter = () => {
    const month = new Date().getMonth();
    const quarter = Math.floor(month / 3) + 1;
    const year = new Date().getFullYear();
    return { quarter: `Q${quarter}`, year };
  };

  const { quarter, year } = getCurrentQuarter();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-5xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8 animate-fade-in">
            <h2 className="headline-serif italic text-5xl mb-3 gradient-text-hero">
              {t('dashboard.welcome')}!
            </h2>
            <p className="text-xl text-muted-foreground">
              {t('dashboard.subtitle')} <span className="font-bold">Q4 2025</span>
            </p>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card 
              className="glass-panel-hover cursor-pointer group" 
              onClick={() => navigate("/new-review")}
            >
              <CardHeader>
                <CardTitle className="headline-serif italic flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary group-hover:animate-glow-pulse" />
                  {t('dashboard.reviewPast')}
                </CardTitle>
                <CardDescription>
                  {t('dashboard.planFor')} {quarter} {year.toString().slice(-2)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full shadow-glow hover:shadow-glow-lg transition-all">
                  {t('dashboard.planFor')} {quarter} {year.toString().slice(-2)}
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="glass-panel-hover cursor-pointer group" 
              onClick={() => navigate("/history")}
            >
              <CardHeader>
                <CardTitle className="headline-serif italic flex items-center gap-2">
                  <History className="h-5 w-5 text-secondary" />
                  {t('nav.history')}
                </CardTitle>
                <CardDescription>
                  {loading ? t('common.loading') : `${reviewsCount} Reviews`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full glass-panel hover:glow-cyan">
                  {t('dashboard.viewHistory')}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Market Data Charts */}
          <div className="mb-8">
            <MarketDataCharts />
          </div>

          {/* Market Data Overview */}
          <div className="mb-8">
            <MarketDataOverview />
          </div>

          {/* YoY Performance Chart */}
          <div className="mb-8">
            <YoYPerformanceChart />
          </div>

          {/* Info Section */}
          <Card className="glass-panel border-primary/10">
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="headline-serif italic flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  {t('info.title')}
                </CardTitle>
                <CardDescription>
                  {t('info.subtitle')}
                </CardDescription>
              </div>
              <Button 
                className="shadow-glow hover:shadow-glow-lg transition-all"
                onClick={() => navigate("/new-review")}
              >
                {t('dashboard.planFor')} {quarter} {year.toString().slice(-2)}
              </Button>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{t('info.bullet1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{t('info.bullet2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{t('info.bullet3')}</span>
                </li>
              </ul>
              <VideoExplainerLink />
              
              {/* Embedded Video */}
              <div className="mt-6 aspect-video w-full rounded-lg overflow-hidden border border-border">
                <iframe
                  src="https://www.youtube.com/embed/6P26sXC7Dts"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                  title={t('info.videoTitle')}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
