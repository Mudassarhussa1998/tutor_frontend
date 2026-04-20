'use client';

import { useState } from 'react';

export default function Weather() {
    const [city, setCity] = useState('');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const fetchWeather = async () => {
        if (!city) return;

        setLoading(true);

        const res = await fetch(
            `http://127.0.0.1:8000/api/weather/?city=${city}`
        );

        const result = await res.json();
        setData(result);
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-cyan-400 font-mono flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Cyberpunk Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.1)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-50 z-0"></div>

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent,#050505)] z-0 pointer-events-none opacity-90"></div>

            <div className="z-10 w-full max-w-lg flex flex-col items-center relative">
                {/* Glitching Title Effect */}
                <h1 className="text-5xl md:text-6xl font-extrabold mb-10 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 drop-shadow-[0_0_15px_rgba(236,72,153,0.8)] tracking-widest uppercase relative  before:absolute before:left-[2px] before:text-cyan-400 before:top-0 before:z-[-1] before:opacity-70  after:absolute after:left-[-2px] after:text-pink-500 after:top-0 after:z-[-2] after:opacity-70">
                    WEATHER
                </h1>

                <div className="w-full relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-cyan-500 blur opacity-30 group-focus-within:opacity-100 transition duration-500"></div>
                    <input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="ENTER CITY DATA..."
                        className="relative w-full bg-gray-900/90 border border-cyan-500/50 text-cyan-300 px-6 py-4 outline-none focus:border-pink-500 focus:shadow-[0_0_20px_rgba(236,72,153,0.5)] transition-all duration-300 placeholder-cyan-800/70 text-lg uppercase tracking-widest rounded-none backdrop-blur-sm"
                        onKeyDown={(e) => e.key === 'Enter' && fetchWeather()}
                    />
                    {/* UI Accents */}
                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-pink-500"></div>
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-500"></div>
                </div>

                <button
                    onClick={fetchWeather}
                    className="mt-8 relative inline-flex items-center justify-center px-8 py-4 font-bold text-black uppercase tracking-widest bg-cyan-400 border-2 border-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.8)] hover:bg-pink-500 hover:border-pink-400 hover:shadow-[0_0_25px_rgba(236,72,153,1)] hover:text-white transition-all duration-300 active:translate-y-1 group overflow-hidden"
                >
                    <span className="absolute inset-0 w-full h-full bg-white/20 group-hover:animate-[pulse_1s_ease-in-out_infinite] pointer-events-none"></span>
                    <span className="relative z-10 whitespace-nowrap">Initialize Scan</span>
                </button>

                <div className="min-h-[200px] w-full mt-12 flex justify-center">
                    {loading && (
                        <div className="flex flex-col items-center justify-center">
                            <div className="w-16 h-16 border-4 border-cyan-500 border-t-pink-500 rounded-full animate-spin shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
                            <p className="mt-4 text-pink-500 tracking-[0.2em] uppercase font-bold text-sm drop-shadow-[0_0_5px_rgba(236,72,153,0.8)] animate-pulse">Decrypting Data...</p>
                        </div>
                    )}

                    {!loading && data && data.temp !== undefined && (
                        <div className="w-full relative bg-gray-900/60 border-l-4 border-pink-500 p-8 shadow-[0_0_30px_rgba(236,72,153,0.15)] backdrop-blur-md animate-[fadeIn_0.5s_ease-in]">
                            {/* Decorative Corner Metrics */}
                            <div className="absolute top-2 right-4 text-[10px] text-cyan-500/50 tracking-widest font-mono select-none">SYS.STAT.OK // ENV.TRK</div>

                            <h2 className="text-4xl text-cyan-300 font-bold uppercase tracking-widest drop-shadow-[0_0_8px_rgba(34,211,238,0.6)] mb-2">
                                {data.city}
                            </h2>
                            <div className="h-px w-full bg-gradient-to-r from-cyan-500/50 to-transparent my-4"></div>

                            <div className="flex items-end gap-4 mb-4">
                                <span className="text-7xl font-black text-pink-500 tracking-tighter drop-shadow-[0_0_15px_rgba(236,72,153,0.8)]">
                                    {Math.round(data.temp)}°
                                </span>
                                <span className="text-2xl text-cyan-500/80 tracking-widest mb-2 border-b border-cyan-500/30 pb-1">
                                    CELSIUS
                                </span>
                            </div>

                            <div className="inline-block px-4 py-2 bg-pink-500/10 border border-pink-500/30 text-pink-400 uppercase tracking-widest text-sm rounded-none shadow-[inset_0_0_10px_rgba(236,72,153,0.2)]">
                                &gt; {data.desc}
                            </div>

                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-pink-500"></div>
                            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-pink-500 to-cyan-500 opacity-50"></div>
                        </div>
                    )}
                </div>
            </div>

            {/* Scanline Effect Overlay */}
            <div className="pointer-events-none absolute inset-0 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20"></div>
        </div>
    );
}