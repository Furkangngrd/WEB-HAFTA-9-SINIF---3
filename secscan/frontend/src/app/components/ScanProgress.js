'use client';

export default function ScanProgress({ progress, events, scanId }) {
  const modules = [
    { name: 'Port Scanner', icon: '🔌' },
    { name: 'Security Headers', icon: '🛡️' },
    { name: 'TLS Analyzer', icon: '🔒' },
    { name: 'Directory Fuzzer', icon: '📂' },
    { name: 'XSS Scanner', icon: '💉' },
    { name: 'SQLi Scanner', icon: '🗃️' },
    { name: 'CVE Checker', icon: '🐛' },
  ];

  const getModuleStatus = (moduleName) => {
    const moduleEvents = events.filter(e => e.module === moduleName);
    if (moduleEvents.length === 0) return 'pending';
    const last = moduleEvents[moduleEvents.length - 1];
    return last.status;
  };

  return (
    <div className="max-w-3xl mx-auto mt-12 animate-fadeIn">
      {/* Scan ID */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-sm mb-4">
          <span className="w-2 h-2 rounded-full bg-accent-blue animate-pulse" />
          Tarama ID: {scanId}
        </div>
        <h2 className="text-2xl font-bold text-white">Tarama Devam Ediyor...</h2>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-dark-400 mb-2">
          <span>İlerleme</span>
          <span>{progress}%</span>
        </div>
        <div className="h-3 bg-dark-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent-blue to-accent-green rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Modül durumları */}
      <div className="space-y-3">
        {modules.map((mod, i) => {
          const status = getModuleStatus(mod.name);
          const isRunning = status === 'running';
          const isCompleted = status === 'completed';
          const isPending = status === 'pending';

          return (
            <div
              key={mod.name}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                isRunning
                  ? 'bg-accent-blue/5 border-accent-blue/30'
                  : isCompleted
                  ? 'bg-accent-green/5 border-accent-green/30'
                  : 'bg-dark-900 border-dark-700/30'
              }`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span className="text-2xl">{mod.icon}</span>
              <div className="flex-1">
                <span className={`font-medium ${isCompleted ? 'text-accent-green' : isRunning ? 'text-accent-blue' : 'text-dark-400'}`}>
                  {mod.name}
                </span>
              </div>
              <div>
                {isRunning && (
                  <div className="flex items-center gap-2 text-accent-blue text-sm">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Taranıyor...
                  </div>
                )}
                {isCompleted && (
                  <span className="text-accent-green text-sm flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Tamamlandı
                  </span>
                )}
                {isPending && (
                  <span className="text-dark-500 text-sm">Bekliyor</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Event log */}
      <div className="mt-6 p-4 rounded-xl bg-dark-900 border border-dark-700/30 max-h-40 overflow-y-auto">
        <h4 className="text-xs font-semibold text-dark-400 uppercase mb-2">Canlı Log</h4>
        {events.map((e, i) => (
          <div key={i} className="text-xs text-dark-400 py-1 border-b border-dark-800 last:border-0 animate-slideIn">
            <span className={`font-mono ${e.status === 'completed' ? 'text-accent-green' : 'text-accent-blue'}`}>
              [{e.status}]
            </span>{' '}
            {e.message}
          </div>
        ))}
        {events.length === 0 && (
          <div className="text-xs text-dark-500 italic">Bekleniyor...</div>
        )}
      </div>
    </div>
  );
}
