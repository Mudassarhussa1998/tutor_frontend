'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, getUser, clearAuth } from '../../lib/auth';
import {
  Bot, Send, Plus, Trash2, Pencil, Check, X,
  LogOut, MessageSquare, Clock, ArrowLeft, Paperclip,
  FileText, FileImage, File, ChevronDown, ChevronUp,
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

type UploadedDoc = {
  id: number;
  filename: string;
  file_type: string;
  is_processed: boolean;
  char_count: number;
  created_at: string;
};

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function TutorChatPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);

  const [sessions, setSessions]           = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [messages, setMessages]           = useState<Message[]>([]);

  const [input, setInput]                 = useState('');
  const [sending, setSending]             = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const [editingId, setEditingId]   = useState<number | null>(null);
  const [editTitle, setEditTitle]   = useState('');

  // Upload state
  const [uploadFile, setUploadFile]       = useState<File | null>(null);
  const [uploading, setUploading]         = useState(false);
  const [uploadStatus, setUploadStatus]   = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Documents panel state
  const [docs, setDocs]                   = useState<UploadedDoc[]>([]);
  const [docsLoading, setDocsLoading]     = useState(false);
  const [docsOpen, setDocsOpen]           = useState(false);
  const [deletingDocId, setDeletingDocId] = useState<number | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  // ── Auth guard ───────────────────────────────────────────────────────────────

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

  // ── Sessions ─────────────────────────────────────────────────────────────────

  async function loadSessions() {
    setSessionsLoading(true);
    try {
      const res  = await authedFetch('/api/sessions/');
      const data = await res.json();
      // normalise: Django may return session_id instead of id
      const list = (Array.isArray(data) ? data : []).map((s: any) => ({
        id:           s.id ?? s.session_id,
        title:        s.title ?? 'Untitled',
        created_at:   s.created_at ?? '',
        updated_at:   s.updated_at ?? s.created_at ?? '',
        message_count: s.message_count,
      }));
      setSessions(list);
    } catch {
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  }

  async function createSession() {
    try {
      const res  = await authedFetch('/api/sessions/', {
        method: 'POST',
        body: JSON.stringify({ title: 'New Chat' }),
      });
      const raw  = await res.json();
      if (!res.ok) throw new Error(raw.error || 'Failed to create session');
      const data: Session = {
        id:         raw.id ?? raw.session_id,
        title:      raw.title ?? 'New Chat',
        created_at: raw.created_at ?? new Date().toISOString(),
        updated_at: raw.updated_at ?? new Date().toISOString(),
      };
      setSessions((prev) => [data, ...prev]);
      selectSession(data);
    } catch (err: any) {
      console.error('createSession error:', err.message);
    }
  }

  async function deleteSession(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await authedFetch(`/api/sessions/${id}/`, { method: 'DELETE' });
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (activeSession?.id === id) {
        setActiveSession(null);
        setMessages([]);
        setDocs([]);
        setDocsOpen(false);
      }
    } catch {}
  }

  async function renameSession(id: number) {
    if (!editTitle.trim()) return;
    try {
      const res  = await authedFetch(`/api/sessions/${id}/`, {
        method: 'PUT',
        body: JSON.stringify({ title: editTitle.trim() }),
      });
      const data = await res.json();
      setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, title: data.title } : s)));
      if (activeSession?.id === id) setActiveSession((prev) => prev ? { ...prev, title: data.title } : prev);
    } catch {}
    setEditingId(null);
  }

  async function selectSession(session: Session) {
    setActiveSession(session);
    setMessagesLoading(true);
    setMessages([]);
    try {
      const res  = await authedFetch(`/api/sessions/${session.id}/`);
      const data = await res.json();
      const msgs: Message[] = (data.messages || [])
        .filter((m: any) => m.id != null)
        .map((m: any) => ({
          id:         m.id,
          prompt:     m.prompt ?? '',
          response:   m.response ?? '',
          created_at: m.created_at ? String(m.created_at) : new Date().toISOString(),
        }));
      setMessages(msgs);
    } catch {
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
    // Load docs for this session too
    loadDocs(session.id);
  }

  // ── Documents ─────────────────────────────────────────────────────────────────

  async function loadDocs(sessionId: number) {
    setDocsLoading(true);
    try {
      const res  = await authedFetch(`/api/sessions/${sessionId}/documents/`);
      const data = await res.json();
      setDocs(Array.isArray(data) ? data : []);
    } catch {
      setDocs([]);
    } finally {
      setDocsLoading(false);
    }
  }

  async function deleteDoc(docId: number) {
    setDeletingDocId(docId);
    try {
      const res = await authedFetch(`/api/documents/${docId}/delete/`, { method: 'DELETE' });
      if (res.ok || res.status === 204) {
        setDocs((prev) => prev.filter((d) => d.id !== docId));
      } else {
        const data = await res.json();
        console.error('Delete doc failed:', data.error || data.detail);
      }
    } catch (err: any) {
      console.error('Delete doc error:', err.message);
    } finally {
      setDeletingDocId(null);
    }
  }

  // ── Messages ─────────────────────────────────────────────────────────────────

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending || !activeSession) return;

    const prompt = input.trim();
    setInput('');
    setSending(true);

    try {
      const res  = await authedFetch('/api/chat/', {
        method: 'POST',
        body: JSON.stringify({ prompt, session_id: activeSession.id }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Failed to send message');
      if (data.id == null) throw new Error('Invalid response from server');

      const newMessage: Message = {
        id:         data.id,
        prompt:     data.prompt ?? prompt,
        response:   data.response ?? '',
        created_at: data.created_at ? String(data.created_at) : new Date().toISOString(),
      };

      setMessages((prev) => [...prev, newMessage]);
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id
            ? { ...s, updated_at: new Date().toISOString() }
            : s
        )
      );
    } catch (err: any) {
      // ✅ error message gets a unique negative id so it never clashes with real ids
      const errorMessage: Message = {
        id:         -Date.now(),
        prompt,
        response:   `⚠️ Error: ${err.message}`,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setSending(false);
    }
  }

  async function deleteMessage(id: number) {
    // optimistic remove
    setMessages((prev) => prev.filter((m) => m.id !== id));
    try {
      await authedFetch(`/api/messages/${id}/delete/`, { method: 'DELETE' });
    } catch {
      // if delete fails, reload messages from server
      if (activeSession) selectSession(activeSession);
    }
  }

  // ── Upload ───────────────────────────────────────────────────────────────────

  async function handleUpload() {
    if (!uploadFile) return;
    setUploading(true);
    setUploadStatus(null);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      // session_id must be a FormData field — NOT JSON — so Django's
      // request.data (multipart parser) can read it alongside the file.
      if (activeSession) {
        formData.append('session_id', String(activeSession.id));
      }

      // authedFetch detects FormData and skips Content-Type: application/json,
      // letting the browser set the correct multipart/form-data boundary.
      const res = await authedFetch('/api/chat/upload/', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.detail || 'Upload failed');
      setUploadStatus(` "${uploadFile.name}" uploaded. You can now ask questions about it.`);
      setUploadFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      // Refresh the documents list so the new file appears immediately
      if (activeSession) loadDocs(activeSession.id);
    } catch (err: any) {
      setUploadStatus(`❌ ${err.message}`);
    } finally {
      setUploading(false);
    }
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

      {/* ── Sidebar ── */}
      <div className="w-64 bg-card border-r border-border flex flex-col flex-shrink-0">

        {/* Sidebar header */}
        <div className="p-4 border-b border-border flex items-center gap-2">
          <Link
            href="/"
            className="p-1.5 text-muted hover:text-accent transition rounded-lg hover:bg-[#F0F0F0]"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-accent">TutorMind AI</span>
        </div>

        {/* New chat */}
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
            // ✅ key={s.id} — always a real number from server
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
                    value={editTitle ?? ''}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter')  renameSession(s.id);
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
                      <button
                        onClick={(e) => { e.stopPropagation(); renameSession(s.id); }}
                        className="p-1 hover:text-accent"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingId(null); }}
                        className="p-1 hover:text-accent"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingId(s.id); setEditTitle(s.title); }}
                        className="p-1 hover:text-accent"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => deleteSession(s.id, e)}
                        className="p-1 hover:text-red-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
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
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 text-muted hover:text-red-500 transition flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Chat area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Chat header */}
        <div className="bg-card border-b border-border px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-accent">
                {activeSession ? activeSession.title : 'TutorMind AI'}
              </h2>
              <p className="text-xs text-muted mt-0.5">
                {activeSession
                  ? `${messages.length} message${messages.length !== 1 ? 's' : ''}`
                  : 'Select or create a chat to get started'}
              </p>
            </div>

            {/* Documents toggle — only shown when a session is active */}
            {activeSession && (
              <button
                onClick={() => {
                  setDocsOpen((v) => !v);
                  if (!docsOpen && activeSession) loadDocs(activeSession.id);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted border border-border rounded-lg hover:bg-[#F0F0F0] hover:text-accent transition"
              >
                <FileText className="w-3.5 h-3.5" />
                Documents
                {docs.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-accent text-white rounded-full text-[10px] font-semibold leading-none">
                    {docs.length}
                  </span>
                )}
                {docsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>

          {/* Documents panel — collapsible */}
          {activeSession && docsOpen && (
            <div className="mt-3 border border-border rounded-xl overflow-hidden">
              <div className="bg-[#F7F7F2] px-4 py-2 flex items-center justify-between">
                <p className="text-xs font-semibold text-accent uppercase tracking-wide">
                  Uploaded documents
                </p>
                <p className="text-xs text-muted">
                  {docsLoading ? 'Loading…' : `${docs.length} file${docs.length !== 1 ? 's' : ''}`}
                </p>
              </div>

              {docsLoading ? (
                <div className="px-4 py-3">
                  <p className="text-xs text-muted">Loading documents…</p>
                </div>
              ) : docs.length === 0 ? (
                <div className="px-4 py-3">
                  <p className="text-xs text-muted">No documents uploaded for this session yet.</p>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {docs.map((doc) => (
                    <li key={doc.id} className="flex items-center gap-3 px-4 py-2.5 bg-card hover:bg-[#F7F7F2] transition group">
                      {/* Icon by type */}
                      <div className="flex-shrink-0 text-muted">
                        {doc.file_type?.includes('image') ? (
                          <FileImage className="w-4 h-4" />
                        ) : doc.file_type?.includes('pdf') ? (
                          <FileText className="w-4 h-4 text-red-400" />
                        ) : (
                          <File className="w-4 h-4" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-accent truncate">{doc.filename}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-muted uppercase">{doc.file_type}</span>
                          {doc.char_count > 0 && (
                            <span className="text-[10px] text-muted">{doc.char_count.toLocaleString()} chars</span>
                          )}
                          <span className={`text-[10px] font-medium ${doc.is_processed ? 'text-green-600' : 'text-yellow-600'}`}>
                            {doc.is_processed ? '✓ indexed' : '⏳ processing'}
                          </span>
                        </div>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => deleteDoc(doc.id)}
                        disabled={deletingDocId === doc.id}
                        title="Remove document and its RAG chunks"
                        className="flex-shrink-0 p-1.5 text-muted hover:text-red-500 transition disabled:opacity-40 opacity-0 group-hover:opacity-100"
                      >
                        {deletingDocId === doc.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {!activeSession ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-[#F0F0F0] rounded-2xl flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-muted" />
              </div>
              <p className="text-sm font-medium text-accent">Start a new chat</p>
              <p className="text-xs text-muted mt-1">
                Click "New chat" to begin a session with your tutor
              </p>
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

              {/* ✅ key uses msg.id — guaranteed non-null from selectSession filter + sendMessage guard */}
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
                              {new Date(msg.created_at).toLocaleTimeString([], {
                                hour:   '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          {/* Only show delete for real messages (not error placeholders) */}
                          {msg.id > 0 && (
                            <button
                              onClick={() => deleteMessage(msg.id)}
                              className="opacity-0 group-hover:opacity-100 transition p-1 text-muted hover:text-red-500"
                              title="Delete message"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
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
                      {/* ✅ keys on static sibling spans */}
                      <span key="dot-1" className="w-2 h-2 bg-muted rounded-full animate-bounce [animation-delay:0ms]" />
                      <span key="dot-2" className="w-2 h-2 bg-muted rounded-full animate-bounce [animation-delay:150ms]" />
                      <span key="dot-3" className="w-2 h-2 bg-muted rounded-full animate-bounce [animation-delay:300ms]" />
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
          {/* Upload area */}
          <div className="max-w-3xl mx-auto mb-3">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-xl cursor-pointer hover:bg-[#F7F7F2] transition text-xs text-muted">
                <Paperclip className="w-4 h-4" />
                {uploadFile ? (
                  <span className="text-accent font-medium truncate max-w-[160px]">{uploadFile.name}</span>
                ) : (
                  <span>Attach PDF / image / TXT</span>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.png,.jpg,.jpeg,.webp"
                  className="hidden"
                  onChange={(e) => {
                    setUploadFile(e.target.files?.[0] ?? null);
                    setUploadStatus(null);
                  }}
                />
              </label>
              {uploadFile && (
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="px-3 py-2 bg-accent text-white text-xs font-medium rounded-xl hover:bg-black transition disabled:opacity-40"
                >
                  {uploading ? 'Uploading…' : 'Upload'}
                </button>
              )}
              {uploadFile && (
                <button
                  onClick={() => { setUploadFile(null); setUploadStatus(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="p-1.5 text-muted hover:text-red-500 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {uploadStatus && (
              <p className={`mt-2 text-xs ${uploadStatus.startsWith('true') ? 'text-green-600' : 'text-red-600'}`}>
                {uploadStatus}
              </p>
            )}
          </div>

          <form onSubmit={sendMessage} className="max-w-3xl mx-auto flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!activeSession || sending}
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