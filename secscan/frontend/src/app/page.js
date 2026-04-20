'use client';

import { useState, useEffect, useRef } from 'react';
import ScanForm from './components/ScanForm';
import ScanProgress from './components/ScanProgress';
import ScanResults from './components/ScanResults';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function Home() {
  const [scanState, setScanState] = useState('idle'); // idle, scanning, completed, error
  const [scanId, setScanId] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [progress, setProgress] = useState(0);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const eventSourceRef = useRef(null);

  // SSE bağlantısı
  useEffect(() => {
    if (scanState !== 'scanning') return;

    const es = new EventSource(`${API_BASE}/stream`);
    eventSourceRef.current = es;

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'connected') return;

        if (data.scan_id === scanId) {
          setProgress(data.progress || 0);
          setEvents(prev => [...prev, data]);

          if (data.status === 'completed' && data.module === 'all') {
            fetchResult(scanId);
          }
        }
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    };

    es.onerror = () => {
      console.log('SSE bağlantı yeniden deneniyor...');
    };

    return () => {
      es.close();
    };
  }, [scanState, scanId]);

  const startScan = async (url) => {
    setError(null);
    setEvents([]);
    setProgress(0);
    setScanResult(null);

    try {
      const res = await fetch(`${API_BASE}/api/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.details || data.error || 'Tarama başlatılamadı');
        setScanState('error');
        return;
      }

      setScanId(data.id);
      setScanState('scanning');
    } catch (err) {
      setError('Sunucuya bağlanılamadı. Backend çalışıyor mu?');
      setScanState('error');
    }
  };

  const fetchResult = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/scan/${id}`);
      const data = await res.json();
      setScanResult(data);
      setScanState('completed');
    } catch (err) {
      setError('Sonuçlar alınamadı');
      setScanState('error');
    }
  };

  const downloadPDF = () => {
    if (scanId) {
      window.open(`${API_BASE}/api/scan/${scanId}/pdf`, '_blank');
    }
  };

  const resetScan = () => {
    setScanState('idle');
    setScanId(null);
    setScanResult(null);
    setProgress(0);
    setEvents([]);
    setError(null);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-dark-700/50 glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue to-accent-green flex items-center justify-center text-white font-bold text-lg">
              S
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">SecScan</h1>
              <p className="text-xs text-dark-400">Web Security Scanner</p>
            </div>
          </div>
          {scanState !== 'idle' && (
            <button
              onClick={resetScan}
              className="px-4 py-2 rounded-lg bg-dark-800 border border-dark-600 text-dark-300 hover:text-white hover:border-dark-500 transition-all text-sm"
            >
              ← Yeni Tarama
            </button>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Idle — Scan Form */}
        {scanState === 'idle' && (
          <div className="animate-fadeIn">
            <div className="text-center mb-12 mt-16">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-accent-blue to-accent-green bg-clip-text text-transparent mb-4">
                Web Güvenlik Taraması
              </h2>
              <p className="text-dark-400 text-lg max-w-2xl mx-auto">
                7 modüllü güvenlik tarayıcı ile web sitenizi analiz edin.
                Port, Header, TLS, Directory, XSS, SQLi ve CVE taraması.
              </p>
            </div>
            <ScanForm onScan={startScan} />

            {/* Modül kartları */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
              {[
                { icon: '🔌', name: 'Port Scanner', desc: 'Açık port tespiti' },
                { icon: '🛡️', name: 'Headers', desc: 'HTTP güvenlik başlıkları' },
                { icon: '🔒', name: 'TLS/SSL', desc: 'Sertifika analizi' },
                { icon: '📂', name: 'Dir Fuzzer', desc: 'Hassas dosya tespiti' },
                { icon: '💉', name: 'XSS Test', desc: 'Cross-site scripting' },
                { icon: '🗃️', name: 'SQLi Test', desc: 'SQL injection' },
                { icon: '🐛', name: 'CVE Check', desc: 'Bilinen açıklar' },
                { icon: '📊', name: 'PDF Rapor', desc: 'Detaylı güvenlik raporu' },
              ].map((mod, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-dark-900 border border-dark-700/50 hover:border-accent-blue/30 transition-all group"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{mod.icon}</div>
                  <h3 className="font-semibold text-sm text-white">{mod.name}</h3>
                  <p className="text-xs text-dark-400 mt-1">{mod.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scanning — Progress */}
        {scanState === 'scanning' && (
          <ScanProgress progress={progress} events={events} scanId={scanId} />
        )}

        {/* Completed — Results */}
        {scanState === 'completed' && scanResult && (
          <ScanResults result={scanResult} onDownloadPDF={downloadPDF} />
        )}

        {/* Error */}
        {scanState === 'error' && (
          <div className="text-center mt-16 animate-fadeIn">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-red/10 mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Hata</h3>
            <p className="text-dark-400 mb-6">{error}</p>
            <button
              onClick={resetScan}
              className="px-6 py-3 rounded-lg bg-accent-blue text-white font-medium hover:bg-accent-blue/80 transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
