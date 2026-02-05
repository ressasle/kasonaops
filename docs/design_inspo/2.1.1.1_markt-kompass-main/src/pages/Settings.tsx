import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Bell, Lock, Mail } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [darkMode, setDarkMode] = useState(false);
  const [quarterlyReminder, setQuarterlyReminder] = useState(false);
  const [loadingReminder, setLoadingReminder] = useState(true);
  const [passwordResetLoading, setPasswordResetLoading] = useState(false);

  useEffect(() => {
    // Check if dark mode is enabled
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);

    // Fetch quarterly reminder preference
    const fetchReminderPreference = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('quarterly_reminder')
          .eq('id', user.id)
          .single();
        
        if (!error && data) {
          setQuarterlyReminder(data.quarterly_reminder || false);
        }
        setLoadingReminder(false);
      }
    };

    fetchReminderPreference();
  }, [user]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleReminderChange = async (checked: boolean) => {
    if (!user) return;
    
    setQuarterlyReminder(checked);
    
    const { error } = await supabase
      .from('profiles')
      .update({ quarterly_reminder: checked })
      .eq('id', user.id);
    
    if (error) {
      // Revert on error
      setQuarterlyReminder(!checked);
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: t('settings.reminderUpdated'),
      });
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    
    setPasswordResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      
      if (error) throw error;
      
      toast({
        title: t('settings.passwordResetSent'),
        description: t('settings.passwordResetSentDesc'),
      });
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setPasswordResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="font-anton">{t('settings.appearance')}</CardTitle>
              <CardDescription>
                {t('settings.appearanceDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {darkMode ? (
                    <Moon className="h-5 w-5 text-accent" />
                  ) : (
                    <Sun className="h-5 w-5 text-accent" />
                  )}
                  <div>
                    <Label htmlFor="dark-mode" className="text-base">
                      {t('settings.darkMode')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.darkModeDesc')}
                    </p>
                  </div>
                </div>
                <Switch
                  id="dark-mode"
                  checked={darkMode}
                  onCheckedChange={toggleDarkMode}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="font-anton">{t('settings.security')}</CardTitle>
              <CardDescription>
                {t('settings.securityDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-accent" />
                  <div>
                    <Label className="text-base">
                      {t('settings.changePassword')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.changePasswordDesc')}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handlePasswordReset}
                  disabled={passwordResetLoading}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {passwordResetLoading ? t('auth.loading') : t('settings.changePassword')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="font-anton">{t('settings.notifications')}</CardTitle>
              <CardDescription>
                {t('settings.notificationsDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-accent" />
                  <div>
                    <Label htmlFor="quarterly-reminder" className="text-base">
                      {t('settings.quarterlyReminder')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.quarterlyReminderDesc')}
                    </p>
                  </div>
                </div>
                <Switch
                  id="quarterly-reminder"
                  checked={quarterlyReminder}
                  onCheckedChange={handleReminderChange}
                  disabled={loadingReminder}
                />
              </div>
            </CardContent>
          </Card>

          {/* Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="font-anton">{t('settings.profile')}</CardTitle>
              <CardDescription>
                {t('settings.profileDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <Label className="text-sm text-muted-foreground">{t('settings.email')}</Label>
                  <p className="text-base">{user?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle className="font-anton">{t('settings.about')}</CardTitle>
              <CardDescription>
                {t('settings.aboutDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t('settings.aboutText')}
              </p>
              <div className="mt-4">
                <a
                  href="https://www.kasona.ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm"
                >
                  www.kasona.ai
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Settings;
