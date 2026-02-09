import { useEffect, useState } from 'react';
import { Check, Loader2, FileText, Brain, Activity, FileCheck } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { ProcessingStep } from '@/types/executive-intelligence';

interface ProcessingStatusProps {
  onComplete: () => void;
}

const PROCESSING_STEPS: ProcessingStep[] = [
  { id: 'transcript', label: 'Extracting Transcript', status: 'pending' },
  { id: 'linguistic', label: 'Analyzing Linguistic Patterns', status: 'pending' },
  { id: 'behavioral', label: 'Syncing Behavioral Cues', status: 'pending' },
  { id: 'report', label: 'Generating Intelligence Report', status: 'pending' },
];

const STEP_ICONS = {
  transcript: FileText,
  linguistic: Brain,
  behavioral: Activity,
  report: FileCheck,
};

const STEP_COLORS = {
  transcript: 'text-[hsl(195,91%,78%)]',
  linguistic: 'text-[hsl(55,100%,70%)]',
  behavioral: 'text-[hsl(342,90%,67%)]',
  report: 'text-primary',
};

export function ProcessingStatus({ onComplete }: ProcessingStatusProps) {
  const [steps, setSteps] = useState<ProcessingStep[]>(PROCESSING_STEPS);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepDuration = 2000; // 2 seconds per step
    const progressInterval = 50; // Update progress every 50ms
    const progressIncrement = 100 / (stepDuration / progressInterval);

    let stepProgress = 0;

    const progressTimer = setInterval(() => {
      stepProgress += progressIncrement;
      setProgress(Math.min(100, stepProgress));

      if (stepProgress >= 100) {
        stepProgress = 0;
        setProgress(0);

        setSteps(prev => prev.map((step, idx) => ({
          ...step,
          status: idx < currentStep + 1 ? 'completed' : idx === currentStep + 1 ? 'active' : 'pending'
        })));

        setCurrentStep(prev => {
          const next = prev + 1;
          if (next >= PROCESSING_STEPS.length) {
            clearInterval(progressTimer);
            setTimeout(onComplete, 500);
            return prev;
          }
          return next;
        });
      }
    }, progressInterval);

    // Start first step immediately
    setSteps(prev => prev.map((step, idx) => ({
      ...step,
      status: idx === 0 ? 'active' : 'pending'
    })));

    return () => clearInterval(progressTimer);
  }, [onComplete]);

  const overallProgress = ((currentStep / PROCESSING_STEPS.length) * 100) + (progress / PROCESSING_STEPS.length);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-center mb-12 space-y-4">
        <h2 className="font-serif italic text-3xl md:text-4xl text-foreground">
          Analyzing Executive
        </h2>
        <p className="text-muted-foreground">
          Our AI is processing the video for behavioral and linguistic insights
        </p>
      </div>

      <div className="w-full max-w-xl space-y-8">
        {/* Overall Progress */}
        <div className="glass-panel p-6 rounded-xl">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="text-foreground font-mono">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Step List */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = STEP_ICONS[step.id as keyof typeof STEP_ICONS];
            const colorClass = STEP_COLORS[step.id as keyof typeof STEP_COLORS];
            
            return (
              <div
                key={step.id}
                className={`
                  glass-panel p-4 rounded-xl flex items-center gap-4 transition-all duration-500
                  ${step.status === 'active' ? 'border-primary/50 bg-primary/5' : ''}
                  ${step.status === 'completed' ? 'opacity-60' : ''}
                `}
              >
                <div className={`
                  p-3 rounded-full transition-all duration-500
                  ${step.status === 'active' ? 'bg-primary/20' : 'bg-muted/10'}
                `}>
                  {step.status === 'completed' ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : step.status === 'active' ? (
                    <Loader2 className={`h-5 w-5 ${colorClass} animate-spin`} />
                  ) : (
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1">
                  <p className={`font-medium ${step.status === 'active' ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.label}
                  </p>
                  {step.status === 'active' && (
                    <Progress value={progress} className="h-1 mt-2" />
                  )}
                </div>

                <span className="text-xs text-muted-foreground font-mono">
                  {index + 1}/{PROCESSING_STEPS.length}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
