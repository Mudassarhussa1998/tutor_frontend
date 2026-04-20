'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Search, MapPin } from 'lucide-react';

type CitySuggestion = {
  properties: {
    city?: string;
    name?: string;
    country?: string;
    state?: string;
    formatted?: string;
  };
};

type WeatherData = {
  city: string;
  temp: string;
  desc: string;
} | {
  error: string;
};

async function fetchCitySuggestions(query: string): Promise<CitySuggestion[]> {
  if (!query || query.length < 2) return [];

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10&addressdetails=1`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch city suggestions');
    }

    const data = await response.json();
    return data.map((item: any) => ({
      properties: {
        city: item.address?.city || item.address?.town || item.address?.village,
        name: item.display_name,
        country: item.address?.country,
        state: item.address?.state,
        formatted: item.display_name
      }
    }));
  } catch (error) {
    console.error('Error fetching city suggestions:', error);
    return [];
  }
}

async function fetchWeather(city: string): Promise<WeatherData> {
  const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);

  if (!response.ok) {
    throw new Error('Unable to load weather data');
  }

  return response.json() as Promise<WeatherData>;
}

function getRandomCity() {
  // Fallback cities for random weather when no search has been performed
  const fallbackCities = [
    'New York', 'London', 'Tokyo', 'Paris', 'Sydney', 'Mumbai', 'Dubai', 'Toronto',
    'Berlin', 'Amsterdam', 'Singapore', 'Hong Kong', 'Los Angeles', 'Chicago'
  ];
  return fallbackCities[Math.floor(Math.random() * fallbackCities.length)];
}

export function WeatherApp() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [randomCity, setRandomCity] = useState(() => getRandomCity());
  const [randomWeather, setRandomWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [randomLoading, setRandomLoading] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced city suggestions
  const debouncedFetchSuggestions = useCallback(async (query: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      setSuggestionsLoading(true);
      try {
        const results = await fetchCitySuggestions(query);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setSuggestionsLoading(false);
      }
    }, 300); // 300ms debounce
  }, []);

  // Handle search query changes
  useEffect(() => {
    if (searchQuery.length >= 2) {
      debouncedFetchSuggestions(searchQuery);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, debouncedFetchSuggestions]);

  // Load weather when city is selected
  useEffect(() => {
    if (selectedCity) {
      async function loadCityWeather() {
        setLoading(true);
        setError(null);
        try {
          const data = await fetchWeather(selectedCity);
          setWeatherData(data);
        } catch (err) {
          setError('Failed to load selected city weather.');
        } finally {
          setLoading(false);
        }
      }

      loadCityWeather();
    }
  }, [selectedCity]);

  // Load random city weather
  useEffect(() => {
    async function loadRandomWeather() {
      setRandomLoading(true);
      setError(null);
      try {
        const data = await fetchWeather(randomCity);
        setRandomWeather(data);
      } catch (err) {
        setError('Failed to load random city weather.');
      } finally {
        setRandomLoading(false);
      }
    }

    loadRandomWeather();
  }, [randomCity]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSuggestionClick = (suggestion: CitySuggestion) => {
    const cityName = suggestion.properties.city || suggestion.properties.name || suggestion.properties.formatted || '';
    setSelectedCity(cityName);
    setSearchQuery(cityName);
    setShowSuggestions(false);
    if (searchRef.current) {
      searchRef.current.blur();
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSelectedCity(searchQuery.trim());
      setShowSuggestions(false);
    }
  };

  const handleRandomize = () => {
    setRandomCity(getRandomCity());
  };

  const handleSearchFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleSearchBlur = () => {
    // Delay hiding suggestions to allow click events
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const getSuggestionDisplayName = (suggestion: CitySuggestion) => {
    const { city, name, state, country, formatted } = suggestion.properties;

    // Try to build a nice display name
    if (city && country) {
      return state ? `${city}, ${state}, ${country}` : `${city}, ${country}`;
    }

    return formatted || name || 'Unknown location';
  };

  return (
    <div className="space-y-8">
      <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-muted uppercase tracking-[0.18em]">City weather lookup</p>
            <h2 className="mt-2 text-3xl font-semibold text-accent">Search weather by city</h2>
            <p className="mt-1 text-sm text-muted">Type a city name and select from suggestions.</p>
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearchSubmit} className="mt-6 relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              placeholder="Search for a city..."
              className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
            {suggestionsLoading && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Auto-suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-2 bg-card border border-border rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-[#F7F7F2] transition-colors flex items-center gap-3 first:rounded-t-xl last:rounded-b-xl"
                >
                  <MapPin className="w-4 h-4 text-muted flex-shrink-0" />
                  <span className="text-sm text-accent">{getSuggestionDisplayName(suggestion)}</span>
                </button>
              ))}
            </div>
          )}
        </form>

        {/* Selected City Weather */}
        {selectedCity && (
          <div className="mt-6 rounded-2xl border border-border bg-card p-6">
            {error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : loading || !weatherData ? (
              <p className="text-sm text-muted">Loading city weather…</p>
            ) : 'error' in weatherData ? (
              <p className="text-sm text-red-600">{weatherData.error}</p>
            ) : (
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-2xl bg-[#F7F7F2] p-5">
                  <p className="text-sm text-muted">City</p>
                  <p className="mt-2 text-2xl font-semibold text-accent">{weatherData.city}</p>
                </div>
                <div className="rounded-2xl bg-[#F7F7F2] p-5">
                  <p className="text-sm text-muted">Temperature</p>
                  <p className="mt-2 text-3xl font-semibold text-accent">{weatherData.temp}°C</p>
                </div>
                <div className="rounded-2xl bg-[#F7F7F2] p-5">
                  <p className="text-sm text-muted">Conditions</p>
                  <p className="mt-2 text-xl font-semibold text-accent">{weatherData.desc}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted uppercase tracking-[0.18em]">Random city weather</p>
            <h2 className="mt-2 text-2xl font-semibold text-accent">See a different city</h2>
          </div>
          <button
            type="button"
            onClick={handleRandomize}
            className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2 text-sm font-medium text-white transition hover:bg-black"
          >
            New random city
          </button>
        </div>

        <div className="mt-6">
          {randomLoading || !randomWeather ? (
            <p className="text-sm text-muted">Loading random city weather…</p>
          ) : 'error' in randomWeather ? (
            <p className="text-sm text-red-600">{randomWeather.error}</p>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-2xl bg-[#F7F7F2] p-5">
                <p className="text-sm text-muted">City</p>
                <p className="mt-2 text-xl font-semibold text-accent">{randomCity}</p>
              </div>
              <div className="rounded-2xl bg-[#F7F7F2] p-5">
                <p className="text-sm text-muted">Temperature</p>
                <p className="mt-2 text-xl font-semibold text-accent">{randomWeather.temp}°C</p>
              </div>
              <div className="rounded-2xl bg-[#F7F7F2] p-5">
                <p className="text-sm text-muted">Conditions</p>
                <p className="mt-2 text-xl font-semibold text-accent">{randomWeather.desc}</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}