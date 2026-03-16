import { useState } from 'react';
import { Plus, Trash2, Activity, AlertCircle, Clock, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function WatchlistPage() {
  const { t, isAuthenticated, user, setShowAuthModal, setAuthModalMode, addToWatchlist, removeFromWatchlist, setCurrentPage } = useApp();
  const [input, setInput] = useState('');
  const [authWarning, setAuthWarning] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (!isAuthenticated) { setAuthWarning(true); return; }
    addToWatchlist(input.trim());
    setInput('');
  };

  const watchlist = user?.watchlist || [];

  const getScore = (brand: string) => {
    const scan = user?.scanHistory.find(s => s.brand.toLowerCase() === brand.toLowerCase());
    return scan?.overallScore || null;
  };

  const getLastScan = (brand: string) => {
    const scan = user?.scanHistory.find(s => s.brand.toLowerCase() === brand.toLowerCase());
    return scan ? new Date(scan.date).toLocaleDateString() : null;
  };

  const scoreColor = (s: number) =>
    s >= 80 ? 'text-green-400' : s >= 60 ? 'text-blue-400' : s >= 40 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="min-h-screen bg-black pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">{t('watch_title')}</h1>
          <p className="text-zinc-400 mt-1">{t('watch_desc')}</p>
        </div>

        {/* Add form */}
        <form onSubmit={handleAdd} className="flex gap-3 mb-6">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={t('watch_add_placeholder')}
            className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-green-500 text-white rounded-xl px-4 py-3 text-sm outline-none transition-colors placeholder:text-zinc-600"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-bold px-5 py-3 rounded-xl transition-colors"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">{t('watch_add')}</span>
          </button>
        </form>

        {authWarning && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-yellow-400" />
              <span className="text-yellow-400 text-sm">{t('scanner_auth_required')}</span>
            </div>
            <button onClick={() => { setAuthModalMode('login'); setShowAuthModal(true); }} className="text-xs bg-yellow-500 text-black font-semibold px-3 py-1.5 rounded-lg">
              {t('nav_login')}
            </button>
          </div>
        )}

        {/* Table */}
        {watchlist.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-16 text-center">
            <TrendingUp size={40} className="text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-400">{t('watch_empty')}</p>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-0 px-5 py-3 border-b border-zinc-800 text-xs text-zinc-500 font-medium uppercase tracking-wider">
              <span>Marka</span>
              <span className="text-center px-4">{t('watch_score')}</span>
              <span className="text-center px-4 hidden sm:block">{t('watch_last_scan')}</span>
              <span></span>
            </div>
            {watchlist.map((brand, i) => {
              const score = getScore(brand);
              const lastScan = getLastScan(brand);
              return (
                <div key={brand} className={`grid grid-cols-[1fr_auto_auto_auto] gap-0 px-5 py-4 items-center ${i < watchlist.length - 1 ? 'border-b border-zinc-800/60' : ''} hover:bg-zinc-800/30 transition-colors group`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                      {brand.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm">{brand}</div>
                      <div className="text-zinc-600 text-xs">{brand.toLowerCase().replace(/\s+/g, '')}.com</div>
                    </div>
                  </div>
                  <div className="text-center px-4">
                    {score !== null ? (
                      <span className={`text-lg font-bold ${scoreColor(score)}`}>{score}</span>
                    ) : (
                      <span className="text-zinc-600 text-sm">—</span>
                    )}
                  </div>
                  <div className="text-center px-4 hidden sm:flex items-center gap-1 text-zinc-500 text-xs">
                    {lastScan ? (
                      <><Clock size={11} />{lastScan}</>
                    ) : (
                      <span className="text-zinc-700">—</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage('scanner')}
                      className="p-1.5 text-zinc-600 hover:text-green-400 transition-colors"
                      title={t('watch_scan')}
                    >
                      <Activity size={15} />
                    </button>
                    <button
                      onClick={() => removeFromWatchlist(brand)}
                      className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors"
                      title={t('watch_remove')}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tips */}
        {watchlist.length > 0 && (
          <div className="mt-6 bg-green-500/5 border border-green-500/20 rounded-xl p-4 text-sm text-zinc-400">
            <span className="text-green-400 font-medium">💡 İpucu:</span> Takip listenizden herhangi bir markayı taramak için
            {' '}<button onClick={() => setCurrentPage('scanner')} className="text-green-400 hover:underline">Canlı Tarayıcı</button>'a gidin.
          </div>
        )}
      </div>
    </div>
  );
}
