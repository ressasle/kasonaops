import { Eye, Hand, User, Smile, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BodyLanguageCue, ExecutiveAnalysis } from '@/types/executive-intelligence';
import { TrustIndexCard } from './TrustIndexCard';
import { cn } from '@/lib/utils';

interface SignalCenterProps {
  analysis: ExecutiveAnalysis;
  onTimestampClick: (timestamp: number) => void;
}

export function SignalCenter({ analysis, onTimestampClick }: SignalCenterProps) {
  const { overallSentiment, bodyCues, transcript, trustIndex, communicationScore } = analysis;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCueIcon = (type: BodyLanguageCue['type']) => {
    switch (type) {
      case 'eye_contact': return Eye;
      case 'gesture': return Hand;
      case 'posture': return User;
      case 'micro_expression': return Smile;
      default: return Eye;
    }
  };

  const getSentimentColor = (sentiment: BodyLanguageCue['sentiment']) => {
    switch (sentiment) {
      case 'positive': return 'text-[hsl(195,91%,78%)] bg-[hsl(195,91%,78%)]/10';
      case 'negative': return 'text-[hsl(342,90%,67%)] bg-[hsl(342,90%,67%)]/10';
      default: return 'text-muted-foreground bg-muted/10';
    }
  };

  // Calculate linguistic pattern stats
  const linguisticStats = transcript.reduce(
    (acc, segment) => {
      segment.linguisticFlags?.forEach(flag => {
        if (flag.type === 'confidence') acc.confidence++;
        if (flag.type === 'hedging' || flag.type === 'uncertainty') acc.hedging++;
        if (flag.type === 'deflection') acc.deflection++;
      });
      return acc;
    },
    { confidence: 0, hedging: 0, deflection: 0 }
  );

  const totalFlags = linguisticStats.confidence + linguisticStats.hedging + linguisticStats.deflection;

  return (
    <div className="space-y-4">
      {/* Trust Index Card (if available from n8n) */}
      {trustIndex && (
        <TrustIndexCard trustIndex={trustIndex} />
      )}

      {/* Communication Scores (if available from n8n) */}
      {communicationScore && (
        <div className="glass-panel rounded-xl p-6">
          <h3 className="font-serif italic text-lg mb-4">Communication Score</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-[hsl(195,91%,78%)]">
                {communicationScore.clarity}
              </div>
              <div className="text-xs text-muted-foreground">Clarity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-[hsl(55,100%,70%)]">
                {communicationScore.confidence}
              </div>
              <div className="text-xs text-muted-foreground">Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-primary">
                {communicationScore.authenticity}
              </div>
              <div className="text-xs text-muted-foreground">Authenticity</div>
            </div>
          </div>
        </div>
      )}

      {/* Sentiment Overview */}
      <div className="glass-panel rounded-xl p-6">
        <h3 className="font-serif italic text-lg mb-6">Sentiment Analysis</h3>
        
        <div className="space-y-5">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[hsl(195,91%,78%)]" />
                Confidence Level
              </span>
              <span className="font-mono text-[hsl(195,91%,78%)]">{overallSentiment.confidence}%</span>
            </div>
            <Progress 
              value={overallSentiment.confidence} 
              className="h-2"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[hsl(342,90%,67%)]" />
                Hedging Index
              </span>
              <span className="font-mono text-[hsl(342,90%,67%)]">{overallSentiment.hedging}%</span>
            </div>
            <Progress 
              value={overallSentiment.hedging} 
              className="h-2" 
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                Transparency Score
              </span>
              <span className="font-mono text-primary">{overallSentiment.transparency}%</span>
            </div>
            <Progress 
              value={overallSentiment.transparency} 
              className="h-2"
            />
          </div>
        </div>
      </div>

      {/* Linguistic Patterns */}
      <div className="glass-panel rounded-xl p-6">
        <h3 className="font-serif italic text-lg mb-4">Linguistic Patterns</h3>
        
        {totalFlags > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[hsl(195,91%,78%)]/10">
              <span className="text-sm flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[hsl(195,91%,78%)]" />
                Confidence Phrases
              </span>
              <span className="font-mono text-[hsl(195,91%,78%)]">{linguisticStats.confidence}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-[hsl(342,90%,67%)]/10">
              <span className="text-sm flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[hsl(342,90%,67%)]" />
                Hedging / Uncertainty
              </span>
              <span className="font-mono text-[hsl(342,90%,67%)]">{linguisticStats.hedging}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-[hsl(55,100%,70%)]/10">
              <span className="text-sm flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[hsl(55,100%,70%)]" />
                Deflection Patterns
              </span>
              <span className="font-mono text-[hsl(55,100%,70%)]">{linguisticStats.deflection}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No linguistic patterns detected</p>
        )}
      </div>

      {/* Body Language Cues */}
      <div className="glass-panel rounded-xl">
        <div className="p-4 border-b border-border/50">
          <h3 className="font-serif italic text-lg">Body Language Analysis</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {bodyCues.length} behavioral cues detected
          </p>
        </div>
        
        <ScrollArea className="h-[280px]">
          <div className="p-4 space-y-2">
            {bodyCues.map((cue, index) => {
              const Icon = getCueIcon(cue.type);
              
              return (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-muted/5 hover:bg-muted/10 transition-colors cursor-pointer"
                  onClick={() => onTimestampClick(cue.timestamp)}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-full", getSentimentColor(cue.sentiment))}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-primary">
                          {formatTime(cue.timestamp)}
                        </span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {cue.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">{cue.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
