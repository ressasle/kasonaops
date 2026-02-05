import { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TranscriptSegment } from '@/types/executive-intelligence';
import { cn } from '@/lib/utils';

interface VideoTranscriptPanelProps {
  videoUrl: string;
  transcript: TranscriptSegment[];
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export function VideoTranscriptPanel({
  videoUrl,
  transcript,
  currentTime,
  onTimeUpdate,
  videoRef
}: VideoTranscriptPanelProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimestampClick = (timestamp: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
      onTimeUpdate(timestamp);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentSegment = () => {
    return transcript.find(
      segment => currentTime >= segment.timestamp && currentTime < segment.endTime
    );
  };

  const currentSegment = getCurrentSegment();

  // Auto-scroll to current segment
  useEffect(() => {
    if (currentSegment && transcriptRef.current) {
      const element = document.getElementById(`segment-${currentSegment.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentSegment?.id]);

  const getFlagColor = (type: string) => {
    switch (type) {
      case 'hedging':
      case 'uncertainty':
        return 'bg-[hsl(342,90%,67%)]/20 text-[hsl(342,90%,67%)]';
      case 'confidence':
        return 'bg-[hsl(195,91%,78%)]/20 text-[hsl(195,91%,78%)]';
      case 'deflection':
        return 'bg-[hsl(55,100%,70%)]/20 text-[hsl(55,100%,70%)]';
      default:
        return 'bg-muted/20 text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4">
      {/* Video Player */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="aspect-video bg-background/50 relative">
          {videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-cover"
              onTimeUpdate={(e) => onTimeUpdate(e.currentTarget.currentTime)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-2">
                <Play className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">Video Preview</p>
              </div>
            </div>
          )}
        </div>

        {/* Video Controls */}
        <div className="p-3 flex items-center gap-3 border-t border-border/50">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePlayPause}
            className="h-8 w-8"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleMute}
            className="h-8 w-8"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <span className="text-sm font-mono text-muted-foreground ml-auto">
            {formatTime(currentTime)}
          </span>
        </div>
      </div>

      {/* Transcript */}
      <div className="glass-panel rounded-xl">
        <div className="p-4 border-b border-border/50">
          <h3 className="font-serif italic text-lg">Transcript</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Click timestamps to navigate • Colored highlights indicate linguistic patterns
          </p>
        </div>
        
        <ScrollArea className="h-[400px]" ref={transcriptRef}>
          <div className="p-4 space-y-3">
            {transcript.map((segment) => (
              <div
                key={segment.id}
                id={`segment-${segment.id}`}
                className={cn(
                  "p-3 rounded-lg transition-all duration-300 cursor-pointer hover:bg-muted/10",
                  currentSegment?.id === segment.id && "bg-primary/10 border-l-2 border-primary"
                )}
                onClick={() => handleTimestampClick(segment.timestamp)}
              >
                <div className="flex items-start gap-3">
                  <button
                    className="text-xs font-mono text-primary hover:underline shrink-0 mt-0.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTimestampClick(segment.timestamp);
                    }}
                  >
                    {formatTime(segment.timestamp)}
                  </button>
                  <div className="flex-1">
                    {segment.speaker && (
                      <span className="text-xs font-medium text-muted-foreground block mb-1">
                        {segment.speaker}
                      </span>
                    )}
                    <p className="text-sm text-foreground leading-relaxed">
                      {segment.text}
                    </p>
                    {segment.linguisticFlags && segment.linguisticFlags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {segment.linguisticFlags.map((flag, idx) => (
                          <span
                            key={idx}
                            className={cn(
                              "text-xs px-2 py-0.5 rounded-full font-medium",
                              getFlagColor(flag.type)
                            )}
                          >
                            {flag.phrase}
                          </span>
                        ))}
                      </div>
                    )}
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
