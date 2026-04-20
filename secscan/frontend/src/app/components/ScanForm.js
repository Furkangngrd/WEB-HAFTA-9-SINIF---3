'use client';

import { useState } from 'react';

export default function ScanForm({ onScan }) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setIsLoading(true);
    await onScan(url.trim());
    setIsLoading(false);
  };

  const quickTargets = [
    'https://example.com',
    'https://httpbin.org',
    'https://scanme.nmap.org',
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="gradient-border p-1 rounded-2xl">
          <div className="flex bg-dark-900 rounded-xl overflow-hidden">
            <div className="flex items-center pl-5 text-dark-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 px-4 py-5 bg-transparent text-white text-lg placeholder-dark-500 outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="px-8 py-5 bg-gradient-to-r from-accent-blue to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-accent-blue transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Başlatılıyor...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Taramayı Başlat
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Hızlı hedefler */}
      <div className="flex items-center gap-2 mt-4 justify-center flex-wrap">
        <span className="text-dark-500 text-sm">Hızlı test:</span>
        {quickTargets.map((t) => (
          <button
            key={t}
            onClick={() => setUrl(t)}
            className="px-3 py-1 rounded-full text-xs bg-dark-800 border border-dark-700 text-dark-400 hover:text-accent-blue hover:border-accent-blue/30 transition-all"
          >
            {t.replace('https://', '')}
          </button>
        ))}
      </div>
    </div>
  );
}
