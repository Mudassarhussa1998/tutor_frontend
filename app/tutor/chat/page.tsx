'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, getUser, clearAuth } from '../../lib/auth';
import {
  Bot, Send, Plus, Trash2, Pencil, Check, X,
  LogOut, MessageSquare, Clock, ArrowLeft,
} from 'lucide-react';
import { authedFetch } from '../../lib/fetcher';
import Link from 'next/link';

// ── Types ─────────────────────────────────────────────────────────────────────

type Session = {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
};

type Message = {
  id: number;
  prompt: string;
  response: string;
  created_at: string;
};

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function TutorChatPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const bottomRef = useRef<HTMLDivElement>(null);

  // Auth guard
  useEffect(() => {
    const u = getUser();
    const t = getToken();
    if (!u || !t) {
      router.replace('/tutor/login');
      return;
    }
    setUser(u);
    loadSessions();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  // ── Sessions ────────────────────────────────────────────────────────────────

  async function loadSessions() {
    setSessionsLoading(true);
    try {
      const res = await authedFetch('/api/sessions/');
      const data = await res.json();
      setSessions(Array.isArray(data) ? data : []);
    } catch {
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  }

  async function createSession() {
    try {
      const res = await authedFetch('/api/sessions/', {
        method: 'POST',
        body: JSON.stringify({ title: 'New Chat' }),
      });
      const data = await res.json();
      setSessions((prev) => [data, ...prev]);
      selectSession(data);
    } catch {}
  }

  async function deleteSession(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await authedFetch(`/api/sessions/${id}/`, { method: 'DELETE' });
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (activeSession?.id === id) {
        setActiveSession(null);
        setMessages([]);
      }
    } catch {}
  }

  async function renameSession(id: number) {
    if (!editTitle.trim()) return;
    try {
      const res = await authedFetch(`/api/sessions/${id}/`, {
        method: 'PUT',
        body: JSON.stringify({ title: editTitle.trim() }),
      });
      const data = await res.json();
      setSessions((prev) => prev.map((s) => (s.id === id ? data : s)));
      if (activeSession?.id === id) setActiveSession(data);
    } catch {}
    setEditingId(null);
  }

  async function selectSession(session: Session) {
    setActiveSession(session);
    setMessagesLoading(true);
    setMessages([]);
    try {
      const res = await authedFetch(`/api/sessions/${session.id}/`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch {
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  }

  // ── Messages ────────────────────────────────────────────────────────────────

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending || !activeSession) return;

    const prompt = input.trim();
    setInput('');
    setSending(true);

    try {
      const res = await authedFetch('/api/chat/', {
        method: 'POST',
        body: JSON.stringify({ prompt, session_id: activeSession.id }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages((prev) => [...prev, data]);
      // bump session updated_at in list
      setSessions((prev) =>
        prev.map((s) => (s.id === activeSession.id ? { ...s, updated_at: new Date().toISOString() } : s))
      );
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), prompt, response: `Error: ${err.message}`, created_at: new Date().toISOString() },
      ]);
    } finally {
      setSending(false);
    }
  }

  async function deleteMessage(id: number) {
    try {
      await authedFetch(`/api/messages/${id}/delete/`, { method: 'DELETE' });
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch {}
  }

  // ── Logout ───────────────────────────────────────────────────────────────────

  async function logout() {
    try {
      await authedFetch('/api/auth/logout/', { method: 'POST' });
    } catch {}
    clearAuth();
    router.replace('/tutor/login');
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen bg-background overflow-hidden">

      {/* ── Sessions sidebar ── */}
      <div className="w-64 bg-card border-r border-border flex flex-col flex-shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center gap-2">
          <Link href="/" className="p-1.5 text-muted hover:text-accent transition rounded-lg hover:bg-[#F0F0F0]">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-accent">TutorMind AI</span>
        </div>

        {/* New chat button */}
        <div className="p-3">
          <button
            onClick={createSession}
            className="w-full flex items-center gap-2 px-3 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-black transition"
          >
            <Plus className="w-4 h-4" />
            New chat
          </button>
        </div>

        {/* Session list */}
        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
          {sessionsLoading ? (
            <p className="text-xs text-muted text-center py-6">Loading…</p>
          ) : sessions.length === 0 ? (
            <p className="text-xs text-muted text-center py-6">No chats yet</p>
          ) : (
            sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => selectSession(s)}
                className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition ${
                  activeSession?.id === s.id
                    ? 'bg-[#F0F0F0] text-accent'
                    : 'text-muted hover:bg-[#F7F7F2] hover:text-accent'
                }`}
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0" />

                {editingId === s.id ? (
                  <input
                    autoFocus
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') renameSession(s.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 text-xs bg-white border border-border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                ) : (
                  <span className="flex-1 text-xs truncate">{s.title}</span>
                )}

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  {editingId === s.id ? (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); renameSession(s.id); }}
                        className="p-1 hover:text-accent"><Check className="w-3 h-3" /></button>
                      <button onClick={(e) => { e.stopPropagation(); setEditingId(null); }}
                        className="p-1 hover:text-accent"><X className="w-3 h-3" /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); setEditingId(s.id); setEditTitle(s.title); }}
                        className="p-1 hover:text-accent"><Pencil className="w-3 h-3" /></button>
                      <button onClick={(e) => deleteSession(s.id, e)}
                        className="p-1 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* User footer */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
              {user?.username?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-accent truncate">{user?.username}</p>
              <p className="text-xs text-muted truncate">{user?.email}</p>
            </div>
            <button onClick={logout} title="Logout"
              className="p-1.5 text-muted hover:text-red-500 transition flex-shrink-0">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Chat area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Chat header */}
        <div className="bg-card border-b border-border px-6 py-4 flex-shrink-0">
          <h2 className="text-base font-semibold text-accent">
            {activeSession ? activeSession.title : 'ChatWithTutor'}
          </h2>
          <p className="text-xs text-muted mt-0.5">
            {activeSession ? `${messages.length} messages` : 'Select or create a chat to get started'}
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {!activeSession ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-[#F0F0F0] rounded-2xl flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-muted" />
              </div>
              <p className="text-sm font-medium text-accent">Start a new chat</p>
              <p className="text-xs text-muted mt-1">Click "New chat" to begin a session with your tutor</p>
            </div>
          ) : messagesLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted">Loading messages…</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <Bot className="w-10 h-10 text-muted mb-3" />
              <p className="text-sm text-muted">No messages yet. Ask your tutor anything!</p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-3 group">
                  {/* User bubble */}
                  <div className="flex items-start gap-3 justify-end">
                    <div className="bg-accent text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[75%]">
                      <p className="text-sm whitespace-pre-wrap">{msg.prompt}</p>
                    </div>
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-semibold">
                      {user?.username?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                  </div>

                  {/* AI bubble */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#F0F0F0] rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-accent" />
                    </div>
                    <div className="flex-1 max-w-[75%]">
                      <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                        <p className="text-sm text-accent whitespace-pre-wrap">{msg.response}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-muted" />
                            <span className="text-xs text-muted">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <button
                            onClick={() => deleteMessage(msg.id)}
                            className="opacity-0 group-hover:opacity-100 transition p-1 text-muted hover:text-red-500"
                            title="Delete message"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {sending && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#F0F0F0] rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-accent" />
                  </div>
                  <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1 items-center h-4">
                      <span className="w-2 h-2 bg-muted rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 bg-muted rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 bg-muted rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="border-t border-border bg-card px-6 py-4 flex-shrink-0">
          <form onSubmit={sendMessage} className="max-w-3xl mx-auto flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!activeSession}
              placeholder={activeSession ? 'Ask your tutor anything…' : 'Select a chat first'}
              className="flex-1 px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={sending || !input.trim() || !activeSession}
              className="w-12 h-12 bg-accent text-white rounded-xl hover:bg-black transition disabled:opacity-40 flex items-center justify-center flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
