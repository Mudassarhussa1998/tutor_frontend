'use client';

import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { DashboardHeader } from '../components/DashboardHeader';
import { CheckCircle, XCircle, ArrowRight, Minimize2 } from 'lucide-react';
import { authedFetch } from '../lib/fetcher';

const API_BASE = '/api';

// ── helpers ──────────────────────────────────────────────────────────────────

function parseStates(val: string) {
  return val.split(',').map((s) => s.trim()).filter(Boolean);
}

function parseTransitions(val: string) {
  try { return JSON.parse(val); } catch { return null; }
}

// ── DFA Accept ───────────────────────────────────────────────────────────────

function DFAAcceptSection() {
  const [states, setStates] = useState('q0, q1');
  const [symbols, setSymbols] = useState('0, 1');
  const [transitions, setTransitions] = useState(
    JSON.stringify({ q0: { '0': 'q0', '1': 'q1' }, q1: { '0': 'q1', '1': 'q0' } }, null, 2)
  );
  const [initial, setInitial] = useState('q0');
  const [finals, setFinals] = useState('q1');
  const [inputStr, setInputStr] = useState('01');
  const [result, setResult] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = parseTransitions(transitions);
    if (!t) { setError('Invalid JSON in transitions'); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await authedFetch(`${API_BASE}/automata/dfa-accept/`, {
        method: 'POST',
        body: JSON.stringify({
          states: parseStates(states),
          input_symbols: parseStates(symbols),
          transitions: t,
          initial_state: initial.trim(),
          final_states: parseStates(finals),
          string: inputStr,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.accepted);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <p className="text-sm text-muted uppercase tracking-[0.18em]">DFA</p>
      <h2 className="mt-1 text-2xl font-semibold text-accent">Check if string is accepted</h2>
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="States (comma-separated)" value={states} onChange={setStates} placeholder="q0, q1" />
          <Field label="Input symbols" value={symbols} onChange={setSymbols} placeholder="0, 1" />
          <Field label="Initial state" value={initial} onChange={setInitial} placeholder="q0" />
          <Field label="Final states (comma-separated)" value={finals} onChange={setFinals} placeholder="q1" />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">Transitions (JSON)</label>
          <textarea
            value={transitions}
            onChange={(e) => setTransitions(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent resize-none"
          />
        </div>
        <Field label="Input string to test" value={inputStr} onChange={setInputStr} placeholder="01" />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-accent text-white text-sm font-medium rounded-xl hover:bg-black transition disabled:opacity-40"
        >
          {loading ? 'Checking…' : 'Check'}
        </button>
      </form>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {result !== null && (
        <div className={`mt-4 flex items-center gap-3 rounded-xl p-4 ${result ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          {result
            ? <CheckCircle className="w-5 h-5 text-green-600" />
            : <XCircle className="w-5 h-5 text-red-600" />}
          <p className={`text-sm font-medium ${result ? 'text-green-700' : 'text-red-700'}`}>
            String "{inputStr}" is {result ? 'accepted' : 'rejected'} by the DFA
          </p>
        </div>
      )}
    </div>
  );
}

// ── NFA to DFA ───────────────────────────────────────────────────────────────

function NFAToDFASection() {
  const [states, setStates] = useState('q0, q1, q2');
  const [symbols, setSymbols] = useState('0, 1');
  const [transitions, setTransitions] = useState(
    JSON.stringify({ q0: { '0': ['q0'], '1': ['q0', 'q1'] }, q1: { '0': ['q2'], '1': [] }, q2: { '0': [], '1': [] } }, null, 2)
  );
  const [initial, setInitial] = useState('q0');
  const [finals, setFinals] = useState('q2');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = parseTransitions(transitions);
    if (!t) { setError('Invalid JSON in transitions'); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await authedFetch(`${API_BASE}/automata/nfa-to-dfa/`, {
        method: 'POST',
        body: JSON.stringify({
          states: parseStates(states),
          input_symbols: parseStates(symbols),
          transitions: t,
          initial_state: initial.trim(),
          final_states: parseStates(finals),
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <p className="text-sm text-muted uppercase tracking-[0.18em]">NFA → DFA</p>
      <h2 className="mt-1 text-2xl font-semibold text-accent">Convert NFA to DFA</h2>
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="States" value={states} onChange={setStates} placeholder="q0, q1, q2" />
          <Field label="Input symbols" value={symbols} onChange={setSymbols} placeholder="0, 1" />
          <Field label="Initial state" value={initial} onChange={setInitial} placeholder="q0" />
          <Field label="Final states" value={finals} onChange={setFinals} placeholder="q2" />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">Transitions (JSON — values are arrays)</label>
          <textarea
            value={transitions}
            onChange={(e) => setTransitions(e.target.value)}
            rows={5}
            className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent resize-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white text-sm font-medium rounded-xl hover:bg-black transition disabled:opacity-40"
        >
          <ArrowRight className="w-4 h-4" />
          {loading ? 'Converting…' : 'Convert'}
        </button>
      </form>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {result && <AutomataResult title="Resulting DFA" data={result} />}
    </div>
  );
}

// ── Minimize DFA ─────────────────────────────────────────────────────────────

function MinimizeDFASection() {
  const [states, setStates] = useState('q0, q1, q2, q3');
  const [symbols, setSymbols] = useState('0, 1');
  const [transitions, setTransitions] = useState(
    JSON.stringify({ q0: { '0': 'q1', '1': 'q3' }, q1: { '0': 'q0', '1': 'q3' }, q2: { '0': 'q1', '1': 'q3' }, q3: { '0': 'q3', '1': 'q3' } }, null, 2)
  );
  const [initial, setInitial] = useState('q0');
  const [finals, setFinals] = useState('q1, q2');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = parseTransitions(transitions);
    if (!t) { setError('Invalid JSON in transitions'); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await authedFetch(`${API_BASE}/automata/minimize-dfa/`, {
        method: 'POST',
        body: JSON.stringify({
          states: parseStates(states),
          input_symbols: parseStates(symbols),
          transitions: t,
          initial_state: initial.trim(),
          final_states: parseStates(finals),
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <p className="text-sm text-muted uppercase tracking-[0.18em]">Minimize</p>
      <h2 className="mt-1 text-2xl font-semibold text-accent">Minimize a DFA</h2>
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="States" value={states} onChange={setStates} placeholder="q0, q1, q2, q3" />
          <Field label="Input symbols" value={symbols} onChange={setSymbols} placeholder="0, 1" />
          <Field label="Initial state" value={initial} onChange={setInitial} placeholder="q0" />
          <Field label="Final states" value={finals} onChange={setFinals} placeholder="q1, q2" />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">Transitions (JSON)</label>
          <textarea
            value={transitions}
            onChange={(e) => setTransitions(e.target.value)}
            rows={5}
            className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent resize-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white text-sm font-medium rounded-xl hover:bg-black transition disabled:opacity-40"
        >
          <Minimize2 className="w-4 h-4" />
          {loading ? 'Minimizing…' : 'Minimize'}
        </button>
      </form>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {result && <AutomataResult title="Minimized DFA" data={result} />}
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function Field({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-muted mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
      />
    </div>
  );
}

function AutomataResult({ title, data }: { title: string; data: any }) {
  return (
    <div className="mt-6 rounded-xl border border-border bg-[#F7F7F2] p-5">
      <p className="text-sm font-semibold text-accent mb-3">{title}</p>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-muted mb-1">States</p>
          <p className="text-accent font-mono">{data.states?.join(', ')}</p>
        </div>
        <div>
          <p className="text-xs text-muted mb-1">Input symbols</p>
          <p className="text-accent font-mono">{data.input_symbols?.join(', ')}</p>
        </div>
        <div>
          <p className="text-xs text-muted mb-1">Initial state</p>
          <p className="text-accent font-mono">{data.initial_state}</p>
        </div>
        <div>
          <p className="text-xs text-muted mb-1">Final states</p>
          <p className="text-accent font-mono">{data.final_states?.join(', ')}</p>
        </div>
      </div>
      <div className="mt-3">
        <p className="text-xs text-muted mb-1">Transitions</p>
        <pre className="text-xs font-mono text-accent bg-white border border-border rounded-lg p-3 overflow-x-auto">
          {JSON.stringify(data.transitions, null, 2)}
        </pre>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AutomataPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title="Automata Theory" subtitle="DFA acceptance, NFA→DFA conversion, and DFA minimization" />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <DFAAcceptSection />
            <NFAToDFASection />
            <MinimizeDFASection />
          </div>
        </main>
      </div>
    </div>
  );
}
