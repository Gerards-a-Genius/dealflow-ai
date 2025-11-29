'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Send, User, Bot } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  createdAt: string;
  isFromAgent: boolean;
  isAI?: boolean;
}

export default function PortalMessagesPage() {
  const { token, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
  }, [token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    if (!token) return;

    try {
      const response = await apiClient.get<Message[]>('/api/messages', token);
      if (response.success && response.data) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      // Add some demo messages for UI testing
      setMessages([
        {
          id: '1',
          content: 'Welcome to DealFlow! I\'m your AI assistant. How can I help you today?',
          createdAt: new Date().toISOString(),
          isFromAgent: true,
          isAI: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !token) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);

    // Optimistically add user message
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      content: messageContent,
      createdAt: new Date().toISOString(),
      isFromAgent: false,
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      // Send message via AI chat endpoint
      const response = await apiClient.post<{ reply: string }>(
        '/api/ai/chat',
        { message: messageContent },
        token
      );

      if (response.success && response.data) {
        const aiReply: Message = {
          id: `ai-${Date.now()}`,
          content: response.data.reply,
          createdAt: new Date().toISOString(),
          isFromAgent: true,
          isAI: true,
        };
        setMessages((prev) => [...prev, aiReply]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Add a fallback response
      const fallbackReply: Message = {
        id: `fallback-${Date.now()}`,
        content: 'Thank you for your message! Your agent will get back to you shortly. In the meantime, feel free to check your transaction status or documents.',
        createdAt: new Date().toISOString(),
        isFromAgent: true,
        isAI: true,
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (d.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.createdAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  if (loading) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Messages</h1>
        <p className="text-neutral-500">Chat with your agent or our AI assistant</p>
      </div>

      <Card padding="none" className="h-[600px] flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              {/* Date Divider */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 h-px bg-neutral-200"></div>
                <span className="text-xs text-neutral-500 font-medium">{date}</span>
                <div className="flex-1 h-px bg-neutral-200"></div>
              </div>

              {/* Messages */}
              <div className="space-y-4">
                {msgs.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isFromAgent ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`flex items-end gap-2 max-w-[80%] ${
                        message.isFromAgent ? '' : 'flex-row-reverse'
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          message.isFromAgent
                            ? message.isAI
                              ? 'bg-secondary-100 text-secondary-600'
                              : 'bg-primary-100 text-primary-600'
                            : 'bg-neutral-200 text-neutral-600'
                        }`}
                      >
                        {message.isFromAgent ? (
                          message.isAI ? (
                            <Bot className="h-4 w-4" />
                          ) : (
                            <User className="h-4 w-4" />
                          )
                        ) : (
                          <span className="text-xs font-medium">
                            {user?.firstName?.[0]}
                          </span>
                        )}
                      </div>

                      {/* Message Bubble */}
                      <div>
                        <div
                          className={`px-4 py-2.5 rounded-2xl ${
                            message.isFromAgent
                              ? 'bg-neutral-100 text-neutral-900 rounded-bl-md'
                              : 'bg-primary-500 text-white rounded-br-md'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                        <p
                          className={`text-xs text-neutral-400 mt-1 ${
                            message.isFromAgent ? 'text-left' : 'text-right'
                          }`}
                        >
                          {formatTime(message.createdAt)}
                          {message.isAI && ' • AI Assistant'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Typing indicator when sending */}
          {sending && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-neutral-100 rounded-2xl rounded-bl-md">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-neutral-200 p-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                rows={1}
                className="input-base resize-none min-h-[44px] max-h-32"
                style={{ height: 'auto' }}
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={!newMessage.trim() || sending}
              icon={Send}
              className="flex-shrink-0"
            >
              Send
            </Button>
          </div>
          <p className="text-xs text-neutral-400 mt-2">
            Press Enter to send, Shift + Enter for new line
          </p>
        </div>
      </Card>
    </div>
  );
}
