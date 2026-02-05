import { useState, useRef, useEffect } from 'react';
import { Send, Mic, Image, X, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Waveform } from '@/components/kasona/Waveform';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (content: string, type: 'text' | 'voice' | 'image') => void;
}

export function ChatInput({ onSend }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      setRecordingTime(0);
    }
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [isRecording]);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim(), selectedImage ? 'image' : 'text');
      setMessage('');
      setSelectedImage(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording and send
      setIsRecording(false);
      onSend(`[Sprachnachricht: ${formatTime(recordingTime)}]`, 'voice');
    } else {
      setIsRecording(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  return (
    <div className="border-t border-border bg-background/50 backdrop-blur-xl p-4">
      {/* Selected Image Preview */}
      {selectedImage && (
        <div className="mb-3 flex items-center gap-3 p-3 rounded-lg bg-muted/30">
          <img
            src={URL.createObjectURL(selectedImage)}
            alt="Selected"
            className="h-16 w-16 object-cover rounded-lg"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{selectedImage.name}</p>
            <p className="text-xs text-muted-foreground">
              {(selectedImage.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedImage(null)}
            className="flex-shrink-0"
          >
            <X size={18} />
          </Button>
        </div>
      )}

      {/* Recording Mode */}
      {isRecording ? (
        <div className="flex items-center gap-4 py-2">
          <div className="flex-1 flex items-center gap-4">
            <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
            <span className="text-sm font-mono">{formatTime(recordingTime)}</span>
            <div className="flex-1">
              <Waveform playing={true} barCount={24} />
            </div>
          </div>
          <Button
            onClick={toggleRecording}
            className="bg-destructive hover:bg-destructive/90 rounded-full h-12 w-12"
          >
            <Square size={18} className="fill-current" />
          </Button>
        </div>
      ) : (
        <div className="flex items-end gap-3">
          {/* Image Upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground"
          >
            <Image size={20} />
          </Button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Fragen Sie mich zu Ihrem Portfolio..."
              className="min-h-[48px] max-h-32 resize-none bg-input/50 border-border pr-12"
              rows={1}
            />
          </div>

          {/* Voice / Send Button */}
          {message.trim() || selectedImage ? (
            <Button
              onClick={handleSend}
              className="bg-primary hover:bg-primary/90 rounded-full h-12 w-12 flex-shrink-0"
            >
              <Send size={18} />
            </Button>
          ) : (
            <Button
              onClick={toggleRecording}
              variant="secondary"
              className={cn(
                'rounded-full h-12 w-12 flex-shrink-0 transition-all',
                'hover:bg-primary/20 hover:text-primary'
              )}
            >
              <Mic size={20} />
            </Button>
          )}
        </div>
      )}

      {/* Hint Text */}
      <p className="text-xs text-muted-foreground mt-3 text-center">
        Tippen, sprechen oder Bilder senden für multimodale Analyse
      </p>
    </div>
  );
}
