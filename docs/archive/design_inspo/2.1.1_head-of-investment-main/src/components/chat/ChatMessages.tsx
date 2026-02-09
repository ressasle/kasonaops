import { ThumbsUp, ThumbsDown, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThoughtProcess } from '@/components/chat/ThoughtProcess';
import { FeedbackModal } from '@/components/chat/FeedbackModal';
import { cn } from '@/lib/utils';
import type { Message } from '@/pages/Chat';
import { useState } from 'react';

interface ChatMessagesProps {
  messages: Message[];
  isTyping: boolean;
  onFeedback: (messageId: string, feedback: 'positive' | 'negative', correction?: string) => void;
}

export function ChatMessages({ messages, isTyping, onFeedback }: ChatMessagesProps) {
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  const handleNegativeFeedback = (messageId: string) => {
    setSelectedMessageId(messageId);
    setFeedbackModalOpen(true);
  };

  const handleFeedbackSubmit = (correction: string) => {
    if (selectedMessageId) {
      onFeedback(selectedMessageId, 'negative', correction);
    }
    setFeedbackModalOpen(false);
    setSelectedMessageId(null);
  };

  return (
    <div className="px-4 md:px-8 py-6 space-y-6">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Bot size={32} className="text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Ihr Investment Twin</h2>
          <p className="text-muted-foreground max-w-md">
            Stellen Sie mir Fragen zu Ihrem Portfolio, Marktbewertungen oder senden Sie mir Charts zur Analyse.
          </p>
        </div>
      )}

      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            'flex gap-4 animate-fade-in',
            message.role === 'user' ? 'justify-end' : 'justify-start'
          )}
        >
          {message.role === 'assistant' && (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Bot size={18} className="text-primary" />
            </div>
          )}

          <div
            className={cn(
              'max-w-[80%] md:max-w-[60%]',
              message.role === 'user' ? 'order-first' : ''
            )}
          >
            {/* Thought Process (for assistant messages with thoughts) */}
            {message.type === 'thought' && message.metadata?.thoughtProcess && (
              <ThoughtProcess steps={message.metadata.thoughtProcess} />
            )}

            {/* Message Bubble */}
            <div
              className={cn(
                'rounded-2xl px-4 py-3',
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground ml-auto'
                  : 'glass-panel'
              )}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>

              {/* Timestamp */}
              <p
                className={cn(
                  'text-xs mt-2',
                  message.role === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'
                )}
              >
                {message.timestamp.toLocaleTimeString('de-DE', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            {/* Feedback Buttons (for assistant messages) */}
            {message.role === 'assistant' && (
              <div className="flex items-center gap-2 mt-2 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFeedback(message.id, 'positive')}
                  className={cn(
                    'h-7 px-2 text-xs',
                    message.feedback === 'positive' && 'bg-green-500/10 text-green-500'
                  )}
                >
                  <ThumbsUp size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNegativeFeedback(message.id)}
                  className={cn(
                    'h-7 px-2 text-xs',
                    message.feedback === 'negative' && 'bg-destructive/10 text-destructive'
                  )}
                >
                  <ThumbsDown size={14} />
                </Button>
                {message.feedback === 'positive' && (
                  <span className="text-xs text-muted-foreground">Danke für Ihr Feedback!</span>
                )}
                {message.correction && (
                  <span className="text-xs text-accent">Korrektur gespeichert</span>
                )}
              </div>
            )}
          </div>

          {message.role === 'user' && (
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
              <User size={18} className="text-accent" />
            </div>
          )}
        </div>
      ))}

      {/* Typing Indicator */}
      {isTyping && (
        <div className="flex gap-4 animate-fade-in">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot size={18} className="text-primary" />
          </div>
          <div className="glass-panel rounded-2xl px-4 py-3">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        onSubmit={handleFeedbackSubmit}
      />
    </div>
  );
}
