'use client';

import { useState, useRef, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { DashboardHeader } from '../components/DashboardHeader';
import { Send, Bot, User, Clock } from 'lucide-react';
import { authedFetch } from '../lib/fetcher';

const API_BASE = '/api';

type Message = {
  id: number;
  prompt: string;
  response: string;
  created_at?: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function fetchHistory() {
    try {
      const res = await authedFetch(`${API_BASE}/history/`);
      const data = await res.json();
      setMessages(data.reverse());
    } catch {
      // ignore
    } finally {
      setHistoryLoading(false);
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const prompt = input.trim();
    setInput('');
    setLoading(true);

    try {
      const res = await authedFetch(`${API_BASE}/chat/`, {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages((prev) => [...prev, data]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), prompt, response: `Error: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title="AI Chat" subtitle="Ask your school teacher AI anything" />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto space-y-4">
            {historyLoading ? (
              <p className="text-sm text-muted text-center py-8">Loading history…</p>
            ) : messages.length === 0 ? (
              <div className="text-center py-16">
                <Bot className="w-12 h-12 text-muted mx-auto mb-4" />
                <p className="text-muted text-sm">No messages yet. Ask your teacher something!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="space-y-3">
                  {/* User message */}
                  <div className="flex items-start gap-3 justify-end">
                    <div className="bg-accent text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                      <p className="text-sm">{msg.prompt}</p>
                    </div>
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  {/* AI response */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#F0F0F0] rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-accent" />
                    </div>
                    <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                      <p className="text-sm text-accent whitespace-pre-wrap">{msg.response}</p>
                      {msg.created_at && (
                        <div className="flex items-center gap-1 mt-2">
                          <Clock className="w-3 h-3 text-muted" />
                          <p className="text-xs text-muted">
                            {new Date(msg.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#F0F0F0] rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-accent" />
                </div>
                <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 bg-muted rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 bg-muted rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </main>

        {/* Input */}
        <div className="border-t border-border bg-card px-8 py-4">
          <form onSubmit={sendMessage} className="max-w-3xl mx-auto flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your teacher something…"
              className="flex-1 px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="inline-flex items-center justify-center w-12 h-12 bg-accent text-white rounded-xl hover:bg-black transition disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
