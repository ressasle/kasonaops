import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { Compass } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Auth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [quarterlyReminder, setQuarterlyReminder] = useState(false);
  
  // Forgot Password State
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  
  // Password Recovery State (when user clicks reset link from email)
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  useEffect(() => {
    // Check for recovery session from password reset email
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // If user is logged in and not in recovery mode, redirect to dashboard
    if (user && !isRecoveryMode) {
      navigate("/dashboard");
    }
  }, [user, navigate, isRecoveryMode]);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: t('auth.error'),
        description: error.message || "Google Sign-In fehlgeschlagen.",
        variant: "destructive",
      });
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) throw error;
      toast({
        title: t('auth.resetEmailSent'),
        description: t('auth.resetEmailSentDesc'),
      });
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error: any) {
      toast({
        title: t('auth.error'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setResetLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: t('auth.error'),
        description: t('auth.passwordMismatch'),
        variant: "destructive",
      });
      return;
    }
    
    setRecoveryLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) throw error;
      
      toast({
        title: t('auth.passwordUpdated'),
        description: t('auth.passwordUpdatedDesc'),
      });
      
      setIsRecoveryMode(false);
      setNewPassword("");
      setConfirmPassword("");
      
      // Sign out and redirect to login
      await supabase.auth.signOut();
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: t('auth.error'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;

        // Update profile with quarterly_reminder preference after signup
        if (data.user) {
          await supabase
            .from('profiles')
            .update({ quarterly_reminder: quarterlyReminder })
            .eq('id', data.user.id);
        }

        toast({
          title: t('auth.accountCreated'),
          description: t('auth.accountCreatedDesc'),
        });
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: t('auth.welcomeBack'),
          description: t('auth.welcomeBackDesc'),
        });
      }
    } catch (error: any) {
      toast({
        title: t('auth.error'),
        description: error.message || "Ein Fehler ist aufgetreten.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Recovery Mode UI - Set new password
  if (isRecoveryMode) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-accent/5 to-background">
        {/* Language Toggle */}
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === 'de' ? 'en' : 'de')}
            className="text-sm"
          >
            {language === 'de' ? '🇬🇧 EN' : '🇩🇪 DE'}
          </Button>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Compass className="h-12 w-12 text-accent" />
              </div>
              <CardTitle className="font-anton text-2xl">
                {t('auth.setNewPassword')}
              </CardTitle>
              <CardDescription>
                {t('auth.resetPasswordDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t('auth.newPassword')}</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={recoveryLoading}
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('auth.confirmNewPassword')}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={recoveryLoading}
                    minLength={6}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={recoveryLoading}>
                  {recoveryLoading ? t('auth.settingNewPassword') : t('auth.setNewPassword')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-accent/5 to-background">
      {/* Language Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLanguage(language === 'de' ? 'en' : 'de')}
          className="text-sm"
        >
          {language === 'de' ? '🇬🇧 EN' : '🇩🇪 DE'}
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Compass className="h-12 w-12 text-accent" />
            </div>
            <CardTitle className="font-anton text-2xl">
              {isSignUp ? t('auth.createAccount') : t('auth.login')}
            </CardTitle>
            <CardDescription>
              {isSignUp ? t('auth.signupDesc') : t('auth.loginDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Google Sign-In Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full mb-4 flex items-center justify-center gap-2"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
            >
              {googleLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              {t('auth.continueWithGoogle')}
            </Button>

            <div className="relative mb-4">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                {t('auth.orContinueWith')}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t('auth.name')}</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                />
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs text-accent hover:underline"
                  >
                    {t('auth.forgotPassword')}
                  </button>
                )}
              </div>

              {isSignUp && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="reminder"
                    checked={quarterlyReminder}
                    onCheckedChange={(checked) => setQuarterlyReminder(!!checked)}
                    disabled={loading}
                  />
                  <Label htmlFor="reminder" className="text-sm cursor-pointer">
                    {t('auth.reminderLabel')}
                  </Label>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('auth.loading') : isSignUp ? t('auth.register') : t('auth.login')}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm text-accent hover:underline"
                  disabled={loading}
                >
                  {isSignUp ? t('auth.hasAccount') : t('auth.noAccount')}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('auth.resetPassword')}</DialogTitle>
            <DialogDescription>{t('auth.resetPasswordDesc')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <Input
              type="email"
              placeholder={t('auth.email')}
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={resetLoading}>
              {resetLoading ? t('auth.loading') : t('auth.sendResetLink')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Auth;
