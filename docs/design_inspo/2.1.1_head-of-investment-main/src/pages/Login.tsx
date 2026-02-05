import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Background } from '@/components/kasona/Background';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap, Eye, EyeOff, UserPlus, ArrowLeft, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import kasonaLogo from '@/assets/kasona-logo.png';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword, user, profile, loading } = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      if (profile?.onboarding_complete) {
        navigate('/app/chat');
      } else {
        navigate('/onboarding');
      }
    }
  }, [user, profile, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isForgotPassword) {
        const { error } = await resetPassword(email);
        if (error) {
          toast({
            title: 'Fehler beim Zurücksetzen',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          setResetEmailSent(true);
          toast({
            title: 'E-Mail gesendet',
            description: 'Überprüfen Sie Ihr Postfach für den Reset-Link.',
          });
        }
      } else if (isSignUp) {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: 'E-Mail bereits registriert',
              description: 'Bitte melden Sie sich an oder verwenden Sie eine andere E-Mail.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Registrierung fehlgeschlagen',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Willkommen!',
            description: 'Ihr Konto wurde erfolgreich erstellt.',
          });
          // Auth state change will handle navigation
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: 'Anmeldung fehlgeschlagen',
            description: 'E-Mail oder Passwort ist falsch.',
            variant: 'destructive',
          });
        }
        // Auth state change will handle navigation
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password View
  if (isForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Background />
        
        <div className="relative z-10 w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <img 
              src={kasonaLogo} 
              alt="Kasona" 
              className="h-12 mx-auto mb-4"
            />
            <p className="font-serif italic text-accent text-sm">
              Your Digital Investment Twin
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-8">
            {resetEmailSent ? (
              <>
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6 text-green-500" />
                </div>
                <h1 className="text-2xl font-bold mb-2">E-Mail gesendet</h1>
                <p className="text-muted-foreground text-sm mb-8">
                  Wir haben Ihnen eine E-Mail mit einem Link zum Zurücksetzen Ihres Passworts gesendet.
                  Bitte überprüfen Sie auch Ihren Spam-Ordner.
                </p>
                <Button
                  onClick={() => {
                    setIsForgotPassword(false);
                    setResetEmailSent(false);
                    setEmail('');
                  }}
                  className="w-full"
                  variant="outline"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Zurück zur Anmeldung
                </Button>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold mb-2">Passwort vergessen?</h1>
                <p className="text-muted-foreground text-sm mb-8">
                  Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      E-Mail
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-input/50 border-border"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Senden...
                      </span>
                    ) : (
                      'Reset-Link senden'
                    )}
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t border-border text-center">
                  <button 
                    onClick={() => setIsForgotPassword(false)}
                    className="text-sm text-accent hover:underline flex items-center justify-center gap-1 mx-auto"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Zurück zur Anmeldung
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-8">
            © {new Date().getFullYear()} Kasona. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Background />
      
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src={kasonaLogo} 
            alt="Kasona" 
            className="h-12 mx-auto mb-4"
          />
          <p className="font-serif italic text-accent text-sm">
            Your Digital Investment Twin
          </p>
        </div>

        {/* Login/Signup Card */}
        <div className="glass-panel rounded-2xl p-8">
          <h1 className="text-2xl font-bold mb-2">
            {isSignUp ? 'Konto erstellen' : 'Willkommen zurück'}
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            {isSignUp 
              ? 'Erstellen Sie ein Konto, um Ihr Investment Terminal zu nutzen.'
              : 'Melden Sie sich an, um auf Ihr Investment Terminal zuzugreifen.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium">
                  Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Max Mustermann"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-input/50 border-border"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                E-Mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-input/50 border-border"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Passwort
                </Label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-xs text-accent hover:underline"
                  >
                    Passwort vergessen?
                  </button>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-input/50 border-border pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  {isSignUp ? 'Registrieren...' : 'Anmelden...'}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {isSignUp ? <UserPlus size={18} /> : <Zap size={18} />}
                  {isSignUp ? 'Registrieren' : 'Anmelden'}
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              {isSignUp ? 'Bereits ein Konto?' : 'Noch kein Zugang?'}{' '}
              <button 
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-accent hover:underline"
              >
                {isSignUp ? 'Anmelden' : 'Registrieren'}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          © {new Date().getFullYear()} Kasona. Alle Rechte vorbehalten.
        </p>
      </div>
    </div>
  );
}
