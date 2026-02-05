import { useState, useRef, useCallback } from 'react';
import { AppNavbar } from '@/components/layout/AppNavbar';
import { KasonaBanner } from '@/components/executive-intelligence/KasonaBanner';
import { VideoUploadZone } from '@/components/executive-intelligence/VideoUploadZone';
import { ProcessingStatus } from '@/components/executive-intelligence/ProcessingStatus';
import { VideoTranscriptPanel } from '@/components/executive-intelligence/VideoTranscriptPanel';
import { SignalCenter } from '@/components/executive-intelligence/SignalCenter';
import { RiskAssessment } from '@/components/executive-intelligence/RiskAssessment';
import { ViewState, ExecutiveAnalysis, VideoAnalysisResponse } from '@/types/executive-intelligence';
import { MOCK_EXECUTIVE_ANALYSIS } from '@/data/mock-executive-analysis';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVideoAnalysis } from '@/hooks/useVideoAnalysis';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function ExecutiveIntelligence() {
  const [viewState, setViewState] = useState<ViewState>('upload');
  const [analysisResult, setAnalysisResult] = useState<ExecutiveAnalysis | null>(null);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const [videoSource, setVideoSource] = useState<string>('');
  const [apiError, setApiError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const { analyze, isLoading } = useVideoAnalysis();
  const { profile } = useAuth();

  const handleVideoSubmit = useCallback(async (source: { type: 'youtube'; value: string }) => {
    setVideoSource(source.value);
    setViewState('processing');
    setApiError(null);

    try {
      const accountId = profile?.account_id || undefined;
      const result = await analyze(source.value, accountId);
      
      // Transform API response to ExecutiveAnalysis format
      const transformedResult: ExecutiveAnalysis = {
        id: result.id,
        executiveName: 'Executive Analysis',
        company: 'From YouTube Video',
        role: 'Speaker',
        videoUrl: '',
        youtubeUrl: result.youtubeUrl,
        duration: 0,
        analyzedAt: result.analyzedAt,
        
        // Use mock transcript for now (real transcript would come from n8n in future)
        transcript: MOCK_EXECUTIVE_ANALYSIS.transcript,
        bodyCues: MOCK_EXECUTIVE_ANALYSIS.bodyCues,
        
        // Transform key findings to red flags
        redFlags: (result.keyFindings || []).map((finding, idx) => ({
          id: finding.id,
          category: 'operational' as const,
          title: finding.claim.substring(0, 50) + (finding.claim.length > 50 ? '...' : ''),
          description: `${finding.linguisticSignal}. ${finding.visualCue}`,
          severity: idx === 0 ? 'critical' as const : 'warning' as const,
          relatedTimestamps: [parseTimestamp(finding.timestamp)],
        })),
        
        followUpQuestions: result.followUpQuestions,
        overallSentiment: result.overallSentiment,
        
        // New n8n fields
        trustIndex: result.trustIndex,
        communicationScore: result.communicationScore,
        keyFindings: result.keyFindings,
        executiveSummary: result.executiveSummary,
        accountId: result.accountId,
        rawResponse: result.rawResponse,
      };
      
      setAnalysisResult(transformedResult);
      setViewState('results');
      toast.success('Video analysis complete!');
    } catch (error) {
      console.error('Analysis failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      setApiError(errorMessage);
      setViewState('upload');
      toast.error(`Analysis failed: ${errorMessage}`);
    }
  }, [analyze, profile]);

  const handleProcessingComplete = useCallback(() => {
    // This is now handled by the API call in handleVideoSubmit
    // Keeping for backwards compatibility with ProcessingStatus animation
  }, []);

  const handleTimestampClick = useCallback((timestamp: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
      setCurrentVideoTime(timestamp);
    }
  }, []);

  const handleReset = useCallback(() => {
    setViewState('upload');
    setAnalysisResult(null);
    setCurrentVideoTime(0);
    setVideoSource('');
    setApiError(null);
  }, []);

  // Helper to parse timestamp string "MM:SS" to seconds
  const parseTimestamp = (ts: string): number => {
    const parts = ts.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Kasona Banner */}
          <div className="mb-8">
            <KasonaBanner />
          </div>

          {/* Error Display */}
          {apiError && viewState === 'upload' && (
            <div className="mb-6 p-4 rounded-xl border border-destructive/50 bg-destructive/10 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Analysis Failed</p>
                <p className="text-sm text-muted-foreground mt-1">{apiError}</p>
              </div>
            </div>
          )}

          {/* Upload State */}
          {viewState === 'upload' && (
            <VideoUploadZone onVideoSubmit={handleVideoSubmit} isLoading={isLoading} />
          )}

          {/* Processing State */}
          {viewState === 'processing' && (
            <ProcessingStatus onComplete={handleProcessingComplete} />
          )}

          {/* Results Dashboard */}
          {viewState === 'results' && analysisResult && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleReset}
                    className="h-10 w-10"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div>
                    <h1 className="font-serif italic text-2xl md:text-3xl text-foreground">
                      {analysisResult.executiveName}
                    </h1>
                    <p className="text-muted-foreground">
                      {analysisResult.role} • {analysisResult.company}
                    </p>
                    {analysisResult.youtubeUrl && (
                      <a 
                        href={analysisResult.youtubeUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        View source video →
                      </a>
                    )}
                  </div>
                </div>
                <Button variant="outline" onClick={handleReset}>
                  Analyze New Video
                </Button>
              </div>

              {/* Executive Summary */}
              {analysisResult.executiveSummary && (
                <div className="glass-panel p-6 rounded-xl">
                  <h3 className="font-serif italic text-lg mb-3">Executive Summary</h3>
                  <p className="text-muted-foreground">{analysisResult.executiveSummary}</p>
                </div>
              )}

              {/* 3-Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Video + Transcript */}
                <div className="lg:col-span-1">
                  <VideoTranscriptPanel
                    videoUrl={analysisResult.videoUrl}
                    transcript={analysisResult.transcript}
                    currentTime={currentVideoTime}
                    onTimeUpdate={setCurrentVideoTime}
                    videoRef={videoRef}
                  />
                </div>

                {/* Middle Column: Signal Center (with Trust Index) */}
                <div className="lg:col-span-1">
                  <SignalCenter
                    analysis={analysisResult}
                    onTimestampClick={handleTimestampClick}
                  />
                </div>

                {/* Right Column: Risk & Questions */}
                <div className="lg:col-span-1">
                  <RiskAssessment
                    redFlags={analysisResult.redFlags}
                    followUpQuestions={analysisResult.followUpQuestions}
                    onTimestampClick={handleTimestampClick}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
