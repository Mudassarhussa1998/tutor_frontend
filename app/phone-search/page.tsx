'use client';

import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { DashboardHeader } from '../components/DashboardHeader';
import { Search, ExternalLink, BarChart2, Globe } from 'lucide-react';
import { authedFetch } from '../lib/fetcher';

const API_BASE = '/api';

type SearchResult = {
  title: string;
  link: string;
  snippet: string;
};

type PriceAnalysis = {
  min?: number;
  max?: number;
  avg?: number;
};

type CountryPrices = {
  country: string;
  prices: number[];
  analysis: PriceAnalysis;
};

export default function PhoneSearchPage() {
  const [country, setCountry] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [priceData, setPriceData] = useState<CountryPrices | null>(null);
  const [compareCountries, setCompareCountries] = useState('');
  const [compareResults, setCompareResults] = useState<Record<string, PriceAnalysis>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!country.trim()) return;
    setLoading('search');
    setError(null);
    setSearchResults([]);
    try {
      const res = await authedFetch(`${API_BASE}/search-phone/`, {
        method: 'POST',
        body: JSON.stringify({ country: country.trim() }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSearchResults(data.results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  }

  async function handlePriceAnalysis(e: React.FormEvent) {
    e.preventDefault();
    if (!country.trim()) return;
    setLoading('price');
    setError(null);
    setPriceData(null);
    try {
      const res = await authedFetch(`${API_BASE}/iphone-price/`, {
        method: 'POST',
        body: JSON.stringify({ country: country.trim() }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPriceData({ country: country.trim(), prices: data.prices, analysis: data.analysis });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  }

  async function handleCompare(e: React.FormEvent) {
    e.preventDefault();
    const countries = compareCountries.split(',').map((c) => c.trim()).filter(Boolean);
    if (!countries.length) return;
    setLoading('compare');
    setError(null);
    setCompareResults({});
    try {
      const res = await authedFetch(`${API_BASE}/compare/`, {
        method: 'POST',
        body: JSON.stringify({ countries }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCompareResults(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title="Phone Search" subtitle="Search second-hand iPhone prices by country" />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto space-y-8">

            {/* Country input shared */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <p className="text-sm text-muted uppercase tracking-[0.18em]">Country</p>
              <h2 className="mt-2 text-2xl font-semibold text-accent">Search by country</h2>
              <form onSubmit={handleSearch} className="mt-4 flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. Pakistan, USA, UK"
                    className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading === 'search'}
                  className="px-5 py-3 bg-accent text-white text-sm font-medium rounded-xl hover:bg-black transition disabled:opacity-40"
                >
                  {loading === 'search' ? 'Searching…' : 'Search'}
                </button>
                <button
                  type="button"
                  onClick={handlePriceAnalysis}
                  disabled={loading === 'price'}
                  className="px-5 py-3 border border-border text-accent text-sm font-medium rounded-xl hover:bg-[#F0F0F0] transition disabled:opacity-40 flex items-center gap-2"
                >
                  <BarChart2 className="w-4 h-4" />
                  {loading === 'price' ? 'Analyzing…' : 'Price Analysis'}
                </button>
              </form>
              {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-accent mb-4">Search Results</h3>
                <div className="space-y-4">
                  {searchResults.map((r, i) => (
                    <div key={i} className="border border-border rounded-xl p-4 hover:bg-[#F7F7F2] transition">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-accent">{r.title}</p>
                          <p className="text-xs text-muted mt-1 line-clamp-2">{r.snippet}</p>
                        </div>
                        {r.link && (
                          <a href={r.link} target="_blank" rel="noopener noreferrer"
                            className="flex-shrink-0 text-muted hover:text-accent transition">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price Analysis */}
            {priceData && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-accent mb-4">
                  iPhone Price Analysis — {priceData.country}
                </h3>
                {Object.keys(priceData.analysis).length === 0 ? (
                  <p className="text-sm text-muted">No price data found for this country.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Min Price', value: priceData.analysis.min },
                      { label: 'Avg Price', value: priceData.analysis.avg },
                      { label: 'Max Price', value: priceData.analysis.max },
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-2xl bg-[#F7F7F2] p-5">
                        <p className="text-sm text-muted">{label}</p>
                        <p className="mt-2 text-2xl font-semibold text-accent">
                          {value != null ? value.toLocaleString() : '—'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                {priceData.prices.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-muted mb-2">Raw prices found:</p>
                    <div className="flex flex-wrap gap-2">
                      {priceData.prices.map((p, i) => (
                        <span key={i} className="px-3 py-1 bg-[#F0F0F0] rounded-full text-xs text-accent">
                          {p.toLocaleString()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Compare Countries */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Globe className="w-4 h-4 text-muted" />
                <p className="text-sm text-muted uppercase tracking-[0.18em]">Compare</p>
              </div>
              <h2 className="text-2xl font-semibold text-accent">Compare countries</h2>
              <form onSubmit={handleCompare} className="mt-4 flex gap-3">
                <input
                  type="text"
                  value={compareCountries}
                  onChange={(e) => setCompareCountries(e.target.value)}
                  placeholder="e.g. Pakistan, India, USA"
                  className="flex-1 px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button
                  type="submit"
                  disabled={loading === 'compare'}
                  className="px-5 py-3 bg-accent text-white text-sm font-medium rounded-xl hover:bg-black transition disabled:opacity-40"
                >
                  {loading === 'compare' ? 'Comparing…' : 'Compare'}
                </button>
              </form>

              {Object.keys(compareResults).length > 0 && (
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-muted font-medium">Country</th>
                        <th className="text-right py-3 px-4 text-muted font-medium">Min</th>
                        <th className="text-right py-3 px-4 text-muted font-medium">Avg</th>
                        <th className="text-right py-3 px-4 text-muted font-medium">Max</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(compareResults).map(([c, stats]) => (
                        <tr key={c} className="border-b border-border hover:bg-[#F7F7F2] transition">
                          <td className="py-3 px-4 font-medium text-accent">{c}</td>
                          <td className="py-3 px-4 text-right text-accent">{stats.min?.toLocaleString() ?? '—'}</td>
                          <td className="py-3 px-4 text-right text-accent">{stats.avg?.toLocaleString() ?? '—'}</td>
                          <td className="py-3 px-4 text-right text-accent">{stats.max?.toLocaleString() ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
