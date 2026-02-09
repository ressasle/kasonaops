import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Message } from '@/pages/Chat';

interface ChatResponse {
  content: string;
  type: 'text' | 'chart' | 'table' | 'earnings' | 'thought';
  metadata?: {
    ticker?: string;
    thoughtProcess?: string[];
    chartData?: any;
    tableData?: any;
    portfolioData?: any;
  };
  error?: string;
}

export function useChatWebhook() {
  const [isLoading, setIsLoading] = useState(false);
  const { profile } = useAuth();

  const sendMessage = async (
    content: string,
    conversationId: string,
    messageHistory: Message[]
  ): Promise<ChatResponse> => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-webhook', {
        body: {
          message: content,
          conversationId,
          account_id: profile?.account_id, // Multi-tenancy key for n8n
          messageHistory: messageHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        },
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message);
      }

      return {
        content: data.content,
        type: data.type || 'thought',
        metadata: data.metadata,
      };
    } catch (error) {
      console.error('Chat webhook error:', error);
      return {
        content: 'Es ist ein Fehler bei der Verbindung aufgetreten. Bitte versuche es erneut.',
        type: 'text',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    } finally {
      setIsLoading(false);
    }
  };

  return { sendMessage, isLoading };
}
