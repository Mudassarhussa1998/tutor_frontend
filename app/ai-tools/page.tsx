'use client';

import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { DashboardHeader } from '../components/DashboardHeader';
import { Send, Wrench, FileText, Bot, Clock } from 'lucide-react';
import { authedFetch } from '../lib/fetcher';

// ── AI Tool Use (function calling) ───────────────────────────────────────────

function UseToolSection() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await authedFetch('/api/usetool/', {
        method: 'POST',
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.detail || 'Request failed');
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <Wrench className="w-4 h-4 text-muted" />
        <p className="text-sm text-muted uppercase tracking-[0.18em]">Function Calling</p>
      </div>
      <h2 className="mt-1 text-2xl font-semibold text-accent">AI with Weather Tool</h2>
      <p className="mt-1 text-sm text-muted">
        Ask anything weather-related. The AI will call the weather tool automatically using Groq function calling.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 flex gap-3">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. What's the weather like in Tokyo right now?"
          className="flex-1 px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="px-5 py-3 bg-accent text-white text-sm font-medium rounded-xl hover:bg-black transition disabled:opacity-40 flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          {loading ? 'Thinking…' : 'Ask'}
        </button>
      </form>

      {error && (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      )}

      {result && (
        <div className="mt-6 rounded-xl border border-border bg-[#F7F7F2] p-5 space-y-4">
          {/* AI response */}
          {result.response && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-4 h-4 text-accent" />
                <p className="text-xs font-semibold text-accent uppercase tracking-wide">AI Response</p>
              </div>
              <p className="text-sm text-accent whitespace-pre-wrap">{result.response}</p>
            </div>
          )}

          {/* Tool calls made */}
          {result.tool_calls && result.tool_calls.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Tool Calls</p>
              <div className="space-y-2">
                {result.tool_calls.map((tc: any, i: number) => (
                  <div key={i} className="bg-white border border-border rounded-lg p-3">
                    <p className="text-xs font-mono font-semibold text-accent">{tc.name || tc.function?.name}</p>
                    <pre className="text-xs font-mono text-muted mt-1 overflow-x-auto">
                      {JSON.stringify(tc.arguments || tc.function?.arguments, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw result fallback */}
          {!result.response && !result.tool_calls && (
            <pre className="text-xs font-mono text-accent overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

// ── Text Endpoint ─────────────────────────────────────────────────────────────

function TextSection() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await authedFetch('/api/text/', {
        method: 'POST',
        body: JSON.stringify({ text: text.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.detail || 'Request failed');
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <FileText className="w-4 h-4 text-muted" />
        <p className="text-sm text-muted uppercase tracking-[0.18em]">Text Processing</p>
      </div>
      <h2 className="mt-1 text-2xl font-semibold text-accent">Text Endpoint</h2>
      <p className="mt-1 text-sm text-muted">
        Send any text to the AI for processing, summarization, or analysis.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder="Enter your text here…"
          className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
        />
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="px-5 py-3 bg-accent text-white text-sm font-medium rounded-xl hover:bg-black transition disabled:opacity-40 flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          {loading ? 'Processing…' : 'Process'}
        </button>
      </form>

      {error && (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      )}

      {result && (
        <div className="mt-6 rounded-xl border border-border bg-[#F7F7F2] p-5">
          {result.response ? (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-4 h-4 text-accent" />
                <p className="text-xs font-semibold text-accent uppercase tracking-wide">Response</p>
              </div>
              <p className="text-sm text-accent whitespace-pre-wrap">{result.response}</p>
            </div>
          ) : (
            <pre className="text-xs font-mono text-accent overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AIToolsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          title="AI Tools"
          subtitle="Function calling with weather tool and general text processing"
        />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <UseToolSection />
            <TextSection />
          </div>
        </main>
      </div>
    </div>
  );
}
