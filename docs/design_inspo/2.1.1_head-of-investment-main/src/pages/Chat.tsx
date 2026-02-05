import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { ChatInput } from '@/components/chat/ChatInput';
import { ContextPanel } from '@/components/chat/ContextPanel';
import { AppNavbar } from '@/components/layout/AppNavbar';
import { Background } from '@/components/kasona/Background';
import { Menu, PanelRightOpen, PanelRightClose } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatWebhook } from '@/hooks/useChatWebhook';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'chart' | 'table' | 'earnings' | 'thought';
  metadata?: {
    ticker?: string;
    chartData?: any;
    tableData?: any;
    thoughtProcess?: string[];
  };
  feedback?: 'positive' | 'negative';
  correction?: string;
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

export default function Chat() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { sendMessage, isLoading } = useChatWebhook();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [contextPanelOpen, setContextPanelOpen] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations from DB
  const loadConversations = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Error loading conversations:', error);
      return;
    }
    
    const convos: Conversation[] = (data || []).map(c => ({
      id: c.id,
      title: c.title || 'Neue Analyse',
      lastMessage: '',
      timestamp: new Date(c.updated_at || c.created_at),
    }));
    
    setConversations(convos);
    setLoadingConversations(false);
    
    // If no conversations, create one
    if (convos.length === 0 && !conversationId) {
      handleNewConversation();
    } else if (conversationId) {
      setActiveConversation(conversationId);
    } else if (convos.length > 0 && !activeConversation) {
      setActiveConversation(convos[0].id);
    }
  }, [user, conversationId]);

  // Load messages for active conversation
  const loadMessages = useCallback(async () => {
    if (!activeConversation) return;
    
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', activeConversation)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error loading messages:', error);
      return;
    }
    
    const msgs: Message[] = (data || []).map(m => ({
      id: m.id,
      role: m.role as 'user' | 'assistant',
      content: m.content,
      timestamp: new Date(m.created_at),
      type: (m.type as Message['type']) || 'text',
      metadata: m.metadata as Message['metadata'],
      feedback: m.feedback as Message['feedback'],
      correction: m.correction || undefined,
    }));
    
    setMessages(msgs);
  }, [activeConversation]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (activeConversation) {
      loadMessages();
    }
  }, [activeConversation, loadMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string, type: 'text' | 'voice' | 'image' = 'text') => {
    if (!user || !activeConversation) return;
    
    // Save user message to DB
    const { data: savedUserMsg, error: userMsgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: activeConversation,
        role: 'user',
        content,
        type: 'text',
      })
      .select()
      .single();
    
    if (userMsgError) {
      console.error('Error saving user message:', userMsgError);
      toast({
        title: 'Fehler',
        description: 'Nachricht konnte nicht gespeichert werden.',
        variant: 'destructive',
      });
      return;
    }

    const userMessage: Message = {
      id: savedUserMsg.id,
      role: 'user',
      content,
      timestamp: new Date(savedUserMsg.created_at),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // Update conversation title if first message
    if (messages.length === 0) {
      const title = content.slice(0, 50) + (content.length > 50 ? '...' : '');
      await supabase
        .from('conversations')
        .update({ title, updated_at: new Date().toISOString() })
        .eq('id', activeConversation);
      
      setConversations(prev => prev.map(c => 
        c.id === activeConversation ? { ...c, title } : c
      ));
    }

    try {
      const response = await sendMessage(content, activeConversation, messages);

      // Save assistant message to DB
      const { data: savedBotMsg, error: botMsgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: activeConversation,
          role: 'assistant',
          content: response.content,
          type: response.type || 'thought',
          metadata: response.metadata,
        })
        .select()
        .single();

      if (botMsgError) {
        console.error('Error saving bot message:', botMsgError);
      }

      const botMessage: Message = {
        id: savedBotMsg?.id || (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        type: response.type || 'thought',
        metadata: response.metadata,
      };

      setMessages((prev) => [...prev, botMessage]);

      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', activeConversation);

      if (response.error) {
        toast({
          title: 'Verbindungsfehler',
          description: response.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Die Nachricht konnte nicht gesendet werden.',
        variant: 'destructive',
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleFeedback = async (messageId: string, feedback: 'positive' | 'negative', correction?: string) => {
    // Update in DB
    await supabase
      .from('messages')
      .update({ feedback, correction })
      .eq('id', messageId);
    
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, feedback, correction } : msg
      )
    );
  };

  const handleNewConversation = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        title: 'Neue Analyse',
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: 'Fehler',
        description: 'Konversation konnte nicht erstellt werden.',
        variant: 'destructive',
      });
      return;
    }
    
    const newConvo: Conversation = {
      id: data.id,
      title: data.title || 'Neue Analyse',
      lastMessage: '',
      timestamp: new Date(data.created_at),
    };
    
    setConversations((prev) => [newConvo, ...prev]);
    setActiveConversation(newConvo.id);
    setMessages([]);
    navigate(`/app/chat/${newConvo.id}`);
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversation(id);
    navigate(`/app/chat/${id}`);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Background />
      <AppNavbar />

      <div className="flex-1 flex overflow-hidden pt-16 relative z-10">
        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? 'w-72' : 'w-0'
          } transition-all duration-300 overflow-hidden border-r border-border bg-sidebar/50 backdrop-blur-xl`}
        >
          <ChatSidebar
            conversations={conversations}
            activeConversation={activeConversation || ''}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
          />
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header */}
          <div className="flex items-center gap-2 p-4 border-b border-border md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <span className="font-semibold truncate">
              {conversations.find((c) => c.id === activeConversation)?.title || 'Chat'}
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            <ChatMessages
              messages={messages}
              isTyping={isTyping}
              onFeedback={handleFeedback}
            />
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <ChatInput onSend={handleSendMessage} />
        </div>

        {/* Context Panel */}
        <div
          className={`${
            contextPanelOpen ? 'w-80' : 'w-0'
          } transition-all duration-300 overflow-hidden border-l border-border bg-sidebar/50 backdrop-blur-xl hidden lg:block`}
        >
          <ContextPanel
            activeTicker={messages.find((m) => m.metadata?.ticker)?.metadata?.ticker}
          />
        </div>

        {/* Context Panel Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setContextPanelOpen(!contextPanelOpen)}
          className="absolute right-4 top-20 z-20 hidden lg:flex"
        >
          {contextPanelOpen ? (
            <PanelRightClose className="h-5 w-5" />
          ) : (
            <PanelRightOpen className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
}
