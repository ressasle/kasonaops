import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { TrueFocus } from "@/components/ui/true-focus";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Target } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface FocusGoalProps {
  showEffectToggle?: boolean;
}

export const FocusGoal = ({ showEffectToggle = false }: FocusGoalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [goal, setGoal] = useState("");
  const [savedGoal, setSavedGoal] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [goalEffect, setGoalEffect] = useState(true);

  useEffect(() => {
    const loadGoal = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("quarterly_goal, quarterly_goal_effect")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        
        if (data?.quarterly_goal) {
          setSavedGoal(data.quarterly_goal);
          setGoal(data.quarterly_goal);
        }
        if (data?.quarterly_goal_effect !== null) {
          setGoalEffect(data.quarterly_goal_effect ?? true);
        }
      } catch (error: any) {
        console.error("Error loading goal:", error);
      } finally {
        setLoading(false);
      }
    };

    loadGoal();
  }, [user]);

  const handleSave = async () => {
    if (!user || !goal.trim()) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ 
          quarterly_goal: goal.trim(),
          quarterly_goal_effect: goalEffect
        })
        .eq("id", user.id);

      if (error) throw error;

      setSavedGoal(goal.trim());
      setIsEditing(false);
      toast({
        title: t('common.save'),
        description: t('focusGoal.goalUpdated'),
      });
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEffectChange = async (effect: boolean) => {
    setGoalEffect(effect);
    if (!user || !savedGoal) return;
    
    try {
      await supabase
        .from("profiles")
        .update({ quarterly_goal_effect: effect })
        .eq("id", user.id);
    } catch (error) {
      console.error("Error updating effect:", error);
    }
  };

  if (loading) {
    return (
      <Card className="glass-panel">
        <CardContent className="py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-panel border-primary/20">
      <CardContent className="py-8">
        <div className="flex items-center gap-2 mb-6">
          <Target className="h-5 w-5 text-primary" />
          <h3 className="headline-serif italic text-xl">{t('dashboard.quarterlyGoal')}</h3>
        </div>

        {!isEditing && savedGoal ? (
          <div className="space-y-4">
            {/* Screen: Show with or without effect based on toggle */}
            <div className="min-h-[120px] flex flex-col items-center justify-center print:hidden">
              {goalEffect ? (
                <TrueFocus 
                  sentence={savedGoal} 
                  manualMode={false}
                  blurAmount={3}
                  animationDuration={0.6}
                  pauseBetweenAnimations={1.5}
                />
              ) : (
                <p className="font-serif text-2xl text-center text-foreground">{savedGoal}</p>
              )}
            </div>
            
            {/* Print: Always show clearly without effect - explicit dark color for PDF */}
            <div className="hidden print:flex min-h-[80px] items-center justify-center">
              <p className="font-serif text-2xl text-center" style={{ color: '#1a1a1a' }}>{savedGoal}</p>
            </div>
            
            {showEffectToggle && (
              <div className="flex items-center justify-center gap-3 print:hidden">
                <Label htmlFor="effect-toggle" className={`text-sm ${!goalEffect ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  {t('focusGoal.withoutEffect')}
                </Label>
                <Switch
                  id="effect-toggle"
                  checked={goalEffect}
                  onCheckedChange={handleEffectChange}
                />
                <Label htmlFor="effect-toggle" className={`text-sm ${goalEffect ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  {t('focusGoal.withEffect')}
                </Label>
              </div>
            )}
            
            <Button 
              onClick={() => setIsEditing(true)} 
              variant="outline"
              className="w-full glass-panel hover:glow-orange print:hidden"
            >
              {t('focusGoal.changeGoal')}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              placeholder={t('focusGoal.placeholder')}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="text-lg bg-background/50"
            />
            
            {showEffectToggle && (
              <div className="flex items-center justify-center gap-3">
                <Label htmlFor="effect-toggle-edit" className={`text-sm ${!goalEffect ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  {t('focusGoal.withoutEffect')}
                </Label>
                <Switch
                  id="effect-toggle-edit"
                  checked={goalEffect}
                  onCheckedChange={setGoalEffect}
                />
                <Label htmlFor="effect-toggle-edit" className={`text-sm ${goalEffect ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  {t('focusGoal.withEffect')}
                </Label>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                onClick={handleSave} 
                disabled={!goal.trim()}
                className="flex-1 shadow-glow"
              >
                {t('common.save')}
              </Button>
              {savedGoal && (
                <Button 
                  onClick={() => {
                    setGoal(savedGoal);
                    setIsEditing(false);
                  }} 
                  variant="outline"
                  className="flex-1"
                >
                  {t('common.cancel')}
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
