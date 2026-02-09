import { Plus, MessageSquare, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Conversation } from '@/pages/Chat';

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversation: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
}

export function ChatSidebar({
  conversations,
  activeConversation,
  onSelectConversation,
  onNewConversation,
}: ChatSidebarProps) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Heute';
    if (days === 1) return 'Gestern';
    return date.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="h-full flex flex-col p-4">
      {/* New Chat Button */}
      <Button
        onClick={onNewConversation}
        className="w-full mb-4 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
      >
        <Plus size={18} className="mr-2" />
        Neue Analyse
      </Button>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Suchen..."
          className="pl-9 bg-input/50 border-border text-sm"
        />
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {conversations.map((convo) => (
          <button
            key={convo.id}
            onClick={() => onSelectConversation(convo.id)}
            className={cn(
              'w-full text-left p-3 rounded-lg transition-all duration-200',
              'hover:bg-muted/50',
              activeConversation === convo.id
                ? 'bg-primary/10 border border-primary/20'
                : 'border border-transparent'
            )}
          >
            <div className="flex items-start gap-3">
              <MessageSquare
                size={16}
                className={cn(
                  'mt-0.5 flex-shrink-0',
                  activeConversation === convo.id ? 'text-primary' : 'text-muted-foreground'
                )}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      'font-medium text-sm truncate',
                      activeConversation === convo.id ? 'text-foreground' : 'text-foreground/80'
                    )}
                  >
                    {convo.title}
                  </span>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatDate(convo.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {convo.lastMessage}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
