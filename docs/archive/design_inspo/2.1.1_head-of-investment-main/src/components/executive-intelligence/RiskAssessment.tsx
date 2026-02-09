import { AlertTriangle, AlertCircle, Info, HelpCircle, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RedFlag, FollowUpQuestion } from '@/types/executive-intelligence';
import { cn } from '@/lib/utils';

interface RiskAssessmentProps {
  redFlags: RedFlag[];
  followUpQuestions: FollowUpQuestion[];
  onTimestampClick: (timestamp: number) => void;
}

export function RiskAssessment({ redFlags, followUpQuestions, onTimestampClick }: RiskAssessmentProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSeverityIcon = (severity: RedFlag['severity']) => {
    switch (severity) {
      case 'critical': return AlertTriangle;
      case 'warning': return AlertCircle;
      default: return Info;
    }
  };

  const getSeverityStyles = (severity: RedFlag['severity']) => {
    switch (severity) {
      case 'critical':
        return 'border-l-[hsl(342,90%,67%)] bg-[hsl(342,90%,67%)]/5';
      case 'warning':
        return 'border-l-[hsl(55,100%,70%)] bg-[hsl(55,100%,70%)]/5';
      default:
        return 'border-l-[hsl(195,91%,78%)] bg-[hsl(195,91%,78%)]/5';
    }
  };

  const getSeverityBadge = (severity: RedFlag['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-[hsl(342,90%,67%)]/20 text-[hsl(342,90%,67%)] border-[hsl(342,90%,67%)]/30';
      case 'warning':
        return 'bg-[hsl(55,100%,70%)]/20 text-[hsl(55,100%,70%)] border-[hsl(55,100%,70%)]/30';
      default:
        return 'bg-[hsl(195,91%,78%)]/20 text-[hsl(195,91%,78%)] border-[hsl(195,91%,78%)]/30';
    }
  };

  const getCategoryLabel = (category: RedFlag['category']) => {
    switch (category) {
      case 'financial': return 'Financial';
      case 'operational': return 'Operational';
      case 'leadership': return 'Leadership';
      case 'legal': return 'Legal';
      default: return category;
    }
  };

  const getPriorityStyles = (priority: FollowUpQuestion['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-[hsl(342,90%,67%)]';
      case 'medium':
        return 'text-[hsl(55,100%,70%)]';
      default:
        return 'text-muted-foreground';
    }
  };

  const criticalCount = redFlags.filter(f => f.severity === 'critical').length;
  const warningCount = redFlags.filter(f => f.severity === 'warning').length;

  return (
    <div className="space-y-4">
      {/* Red Flags Summary */}
      <div className="glass-panel rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif italic text-lg">Red Flags</h3>
          <div className="flex gap-2">
            {criticalCount > 0 && (
              <Badge variant="outline" className="bg-[hsl(342,90%,67%)]/10 text-[hsl(342,90%,67%)] border-[hsl(342,90%,67%)]/30">
                {criticalCount} Critical
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="outline" className="bg-[hsl(55,100%,70%)]/10 text-[hsl(55,100%,70%)] border-[hsl(55,100%,70%)]/30">
                {warningCount} Warning
              </Badge>
            )}
          </div>
        </div>

        <ScrollArea className="h-[300px]">
          <div className="space-y-3 pr-4">
            {redFlags.map((flag) => {
              const Icon = getSeverityIcon(flag.severity);
              
              return (
                <div
                  key={flag.id}
                  className={cn(
                    "p-4 rounded-lg border-l-4 transition-all",
                    getSeverityStyles(flag.severity)
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={cn(
                      "h-5 w-5 mt-0.5",
                      flag.severity === 'critical' && 'text-[hsl(342,90%,67%)]',
                      flag.severity === 'warning' && 'text-[hsl(55,100%,70%)]',
                      flag.severity === 'info' && 'text-[hsl(195,91%,78%)]'
                    )} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium text-foreground">{flag.title}</span>
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", getSeverityBadge(flag.severity))}
                        >
                          {getCategoryLabel(flag.category)}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {flag.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-1">
                        {flag.relatedTimestamps.map((ts, idx) => (
                          <button
                            key={idx}
                            onClick={() => onTimestampClick(ts)}
                            className="text-xs font-mono text-primary hover:underline px-1.5 py-0.5 rounded bg-primary/10"
                          >
                            {formatTime(ts)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Follow-up Questions */}
      <div className="glass-panel rounded-xl">
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <h3 className="font-serif italic text-lg">Suggested Follow-up Questions</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            AI-generated questions based on detected patterns
          </p>
        </div>

        <ScrollArea className="h-[280px]">
          <div className="p-4 space-y-3">
            {followUpQuestions.map((question) => (
              <div
                key={question.id}
                className="p-4 rounded-lg bg-muted/5 hover:bg-muted/10 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <ChevronRight className={cn(
                    "h-5 w-5 mt-0.5 transition-transform group-hover:translate-x-1",
                    getPriorityStyles(question.priority)
                  )} />
                  
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground mb-1">
                      {question.question}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {question.context}
                    </p>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "mt-2 text-xs capitalize",
                        question.priority === 'high' && 'border-[hsl(342,90%,67%)]/30 text-[hsl(342,90%,67%)]',
                        question.priority === 'medium' && 'border-[hsl(55,100%,70%)]/30 text-[hsl(55,100%,70%)]',
                        question.priority === 'low' && 'border-muted-foreground/30'
                      )}
                    >
                      {question.priority} priority
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
