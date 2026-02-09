import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VideoAnalysisResponse } from '@/types/executive-intelligence';

interface UseVideoAnalysisReturn {
  analyze: (youtubeUrl: string, accountId?: string) => Promise<VideoAnalysisResponse>;
  isLoading: boolean;
  error: string | null;
  progress: number;
}

export function useVideoAnalysis(): UseVideoAnalysisReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const analyze = async (youtubeUrl: string, accountId?: string): Promise<VideoAnalysisResponse> => {
    setIsLoading(true);
    setError(null);
    setProgress(10);

    try {
      // Simulate progress while waiting for API
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 85));
      }, 500);

      const { data, error: invokeError } = await supabase.functions.invoke('analyze-executive-video', {
        body: { youtubeUrl, accountId },
      });

      clearInterval(progressInterval);

      if (invokeError) {
        throw new Error(invokeError.message || 'Failed to analyze video');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setProgress(100);
      return data as VideoAnalysisResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { analyze, isLoading, error, progress };
}
