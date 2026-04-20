'use client';

export default function ScanResults({ result, onDownloadPDF }) {
  if (!result) return null;

  const severityColors = {
    critical: 'bg-red-500/10 text-red-500 border-red-500/30',
    high: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
    medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
    low: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
    info: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
  };

  const getGradeColor = (grade) => {
    if (grade.startsWith('A')) return 'text-accent-green';
    if (grade.startsWith('B')) return 'text-blue-400';
    if (grade.startsWith('C')) return 'text-yellow-400';
    if (grade.startsWith('D')) return 'text-orange-400';
    return 'text-red-500';
  };

  const summary = {
    critical: result.findings.filter(f => f.severity === 'critical').length,
    high: result.findings.filter(f => f.severity === 'high').length,
    medium: result.findings.filter(f => f.severity === 'medium').length,
    low: result.findings.filter(f => f.severity === 'low').length,
    info: result.findings.filter(f => f.severity === 'info').length,
  };

  return (
    <div className="max-w-5xl mx-auto mt-12 animate-fadeIn">
      {/* Header / Score */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex-1 p-6 rounded-2xl bg-dark-900 border border-dark-700/50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Tarama Tamamlandı</h2>
            <p className="text-dark-400 text-sm overflow-hidden text-ellipsis max-w-xs">{result.url}</p>
          </div>
          <div className="text-right">
            <div className={`text-5xl font-black ${getGradeColor(result.grade)} drop-shadow-md`}>
              {result.grade}
            </div>
            <div className="text-dark-400 text-sm mt-1">Güvenlik Skoru: {result.score}/100</div>
          </div>
        </div>

        <div className="flex-1 p-6 rounded-2xl bg-dark-900 border border-dark-700/50 flex flex-col justify-center">
          <div className="flex gap-4 justify-between mb-2">
            {Object.entries(summary).filter(([k, v]) => v > 0 || k === 'critical').map(([sev, count]) => (
              <div key={sev} className="text-center">
                <div className={`text-2xl font-bold ${severityColors[sev].split(' ')[1]}`}>{count}</div>
                <div className="text-xs text-dark-400 uppercase">{sev}</div>
              </div>
            ))}
          </div>
          <button 
            onClick={onDownloadPDF}
            className="mt-4 w-full py-2 rounded-lg bg-accent-blue/10 hover:bg-accent-blue/20 text-accent-blue border border-accent-blue/30 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            PDF Raporunu İndir
          </button>
        </div>
      </div>

      {/* Findings List */}
      <h3 className="text-xl font-bold text-white mb-6">Bulgular ve Zafiyetler</h3>
      <div className="space-y-4">
        {result.findings.length === 0 ? (
          <div className="p-8 text-center text-dark-400 bg-dark-900 rounded-xl border border-dark-700/50">
            Harika! Kritik seviyede bir güvenlik açığı tespit edilmedi.
          </div>
        ) : (
          result.findings.map((finding, idx) => (
            <div key={idx} className="p-5 rounded-xl bg-dark-900 border border-dark-700/50 hover:border-dark-600 transition-colors">
              <div className="flex items-start gap-4">
                <div className={`px-3 py-1 text-xs font-semibold uppercase rounded-md border ${severityColors[finding.severity]}`}>
                  {finding.severity}
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-medium mb-1">{finding.title}</h4>
                  <p className="text-dark-400 text-sm mb-3">
                    Modül: <span className="text-dark-300">{finding.module}</span>
                  </p>
                  <div className="text-dark-300 text-sm mb-3 whitespace-pre-wrap font-mono bg-dark-800 p-3 rounded-lg border border-dark-700/50">
                    {finding.detail}
                  </div>
                  {finding.fix && (
                    <div className="text-sm bg-accent-green/5 text-accent-green/90 p-3 rounded-lg border border-accent-green/20">
                      <strong>Öneri:</strong> {finding.fix}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
