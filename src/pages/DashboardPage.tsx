import { TrendingUp, Zap, Activity, Star, ArrowRight, Clock, ChevronRight } from 'lucide-react';
import { useApp, ScanResult } from '../context/AppContext';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts';

function ScoreRing({ score, size = 80, theme }: { score: number; size?: number; theme: string }) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#00d980' : score >= 60 ? '#eab308' : score >= 40 ? '#f97316' : '#ef4444';
  const isLight = theme === 'light';
  const trackColor = isLight ? '#e0e0e0' : '#222222';
  const textColor = isLight ? '#000000' : '#ffffff';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={6} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={color} strokeWidth={6}
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central"
        fill={textColor} fontSize={size * 0.22} fontWeight="bold">
        {score}
      </text>
    </svg>
  );
}

function ScanCard({ scan, t, theme }: { scan: ScanResult; t: (k: any) => string; theme: string }) {
  const isLight = theme === 'light';
  const gradeColor: Record<string, string> = {
    A: '#00d980', B: '#3b82f6', C: '#eab308', D: '#f97316', F: '#ef4444'
  };

  return (
    <div
      className="rounded-xl p-4 transition-all"
      style={{
        backgroundColor: isLight ? '#ffffff' : '#0f0f0f',
        border: `1px solid ${isLight ? '#e0e0e0' : '#1e1e1e'}`,
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{scan.brand}</h4>
          <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
            <Clock size={10} />
            {new Date(scan.date).toLocaleDateString()}
          </p>
        </div>
        <ScoreRing score={scan.overallScore} size={52} theme={theme} />
      </div>
      <div className="grid grid-cols-3 gap-2 mt-3">
        {[
          { label: t('dash_supply_chain'), value: scan.supplyChainScore },
          { label: t('dash_carbon'), value: scan.carbonScore },
          { label: t('dash_labor'), value: scan.laborGrade, isGrade: true },
        ].map(item => (
          <div
            key={item.label}
            className="rounded-lg p-2 text-center"
            style={{ backgroundColor: isLight ? '#f5f5f5' : '#1a1a1a' }}
          >
            <div className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>{item.label}</div>
            <div
              className="text-sm font-bold"
              style={{ color: item.isGrade ? gradeColor[String(item.value)] || 'var(--text-primary)' : 'var(--text-primary)' }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { t, user, theme, setCurrentPage } = useApp();
  const isLight = theme === 'light';

  if (!user) return null;

  const recentScans = user.scanHistory.slice(0, 6);
  const avgScore = recentScans.length > 0
    ? Math.round(recentScans.reduce((s, r) => s + r.overallScore, 0) / recentScans.length)
    : 0;

  const trendData = recentScans.slice(0, 6).reverse().map((s, i) => ({
    name: `#${i + 1}`,
    score: s.overallScore,
  }));

  const radarData = recentScans.length > 0 ? [
    { subject: t('chart_supply'), val: recentScans[0]?.supplyChainScore || 0 },
    { subject: t('chart_carbon'), val: recentScans[0]?.carbonScore || 0 },
    { subject: t('chart_labor'), val: recentScans[0]?.laborGrade === 'A' ? 90 : recentScans[0]?.laborGrade === 'B' ? 75 : 55 },
    { subject: t('chart_sentiment'), val: recentScans[0]?.sentimentScore || 0 },
    { subject: t('chart_overall'), val: recentScans[0]?.overallScore || 0 },
  ] : [];

  const stats = [
    { label: t('dash_total_scans'),    value: user.totalScans,       icon: Activity,   color: '#3b82f6',  bgColor: 'rgba(59,130,246,0.1)' },
    { label: t('dash_brands_tracked'), value: user.watchlist.length, icon: Star,       color: '#eab308',  bgColor: 'rgba(234,179,8,0.1)' },
    { label: t('dash_avg_score'),      value: avgScore || '—',       icon: TrendingUp, color: '#00d980',  bgColor: 'rgba(0,217,128,0.1)' },
    { label: t('dash_credits_left'),   value: user.credits,          icon: Zap,        color: '#a855f7',  bgColor: 'rgba(168,85,247,0.1)' },
  ];

  /* Chart colors */
  const gridColor    = isLight ? '#eeeeee' : '#1e1e1e';
  const tickColor    = isLight ? '#888888' : '#666666';
  const tooltipStyle = {
    backgroundColor: isLight ? '#ffffff' : '#111111',
    border: `1px solid ${isLight ? '#e0e0e0' : '#2a2a2a'}`,
    borderRadius: 8,
    color: isLight ? '#000000' : '#ffffff',
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: isLight ? '#ffffff' : '#0f0f0f',
    border: `1px solid ${isLight ? '#e0e0e0' : '#1e1e1e'}`,
    borderRadius: 16,
    padding: '1.5rem',
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-base)', minHeight: '100vh', paddingTop: '4rem' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {t('dash_welcome')}
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-muted)' }}>{t('dash_subtitle')}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(stat => (
            <div key={stat.label} style={cardStyle}>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: stat.bgColor }}
              >
                <stat.icon size={18} style={{ color: stat.color }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</div>
              <div className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Credits warning */}
        {user.credits === 0 && (
          <div
            className="rounded-xl p-4 mb-6 flex items-center justify-between"
            style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}
          >
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-red-400" />
              <span className="text-red-400 text-sm font-medium">{t('credits_zero')}</span>
            </div>
            <button
              onClick={() => setCurrentPage('pricing')}
              className="text-xs text-white px-3 py-1.5 rounded-lg font-medium transition-all"
              style={{ backgroundColor: '#ef4444' }}
            >
              {t('settings_buy_credits')}
            </button>
          </div>
        )}
        {user.credits > 0 && user.credits <= 2 && (
          <div
            className="rounded-xl p-4 mb-6 flex items-center justify-between"
            style={{ backgroundColor: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)' }}
          >
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-yellow-400" />
              <span className="text-yellow-400 text-sm font-medium">{t('credits_low')}</span>
            </div>
            <button
              onClick={() => setCurrentPage('pricing')}
              className="text-xs text-black px-3 py-1.5 rounded-lg font-semibold transition-all"
              style={{ backgroundColor: '#eab308' }}
            >
              {t('settings_buy_credits')}
            </button>
          </div>
        )}

        {/* Charts + Recent */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* Left: trend + quick actions */}
          <div className="lg:col-span-2 space-y-5">
            {trendData.length > 0 ? (
              <div style={cardStyle}>
                <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  {t('chart_score_trend')}
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#00d980" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#00d980" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="score" stroke="#00d980" fill="url(#dashGrad)" strokeWidth={2}
                      dot={{ fill: '#00d980', r: 4 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160 }}>
                <div className="text-center">
                  <Activity size={32} className="mx-auto mb-2" style={{ color: 'var(--text-faint)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('dash_no_scans')}</p>
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { page: 'scanner',   label: t('nav_scanner'),   icon: Activity, color: '#00d980' },
                { page: 'battle',    label: t('nav_battle'),    icon: Zap,      color: '#a855f7' },
                { page: 'watchlist', label: t('nav_watchlist'), icon: Star,     color: '#eab308' },
              ].map(a => (
                <button
                  key={a.page}
                  onClick={() => setCurrentPage(a.page)}
                  className="rounded-xl p-4 flex items-center justify-between transition-all group"
                  style={{
                    backgroundColor: isLight ? '#ffffff' : '#0f0f0f',
                    border: `1px solid ${isLight ? '#e0e0e0' : '#1e1e1e'}`,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = isLight ? '#cccccc' : '#333333')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = isLight ? '#e0e0e0' : '#1e1e1e')}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: a.color, color: '#000000' }}
                    >
                      <a.icon size={15} />
                    </div>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{a.label}</span>
                  </div>
                  <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                </button>
              ))}
            </div>
          </div>

          {/* Radar (last scan) */}
          <div style={cardStyle}>
            <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              {t('dash_last_scan_profile')}
            </h3>
            {radarData.length > 0 ? (
              <>
                <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{recentScans[0]?.brand}</p>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke={gridColor} />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: tickColor, fontSize: 11 }} />
                    <Radar dataKey="val" stroke="#00d980" fill="#00d980" fillOpacity={0.15} />
                  </RadarChart>
                </ResponsiveContainer>
                <div className="text-center mt-2">
                  <ScoreRing score={recentScans[0]?.overallScore || 0} size={72} theme={theme} />
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{t('scanner_overall')}</p>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-48">
                <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>{t('dash_no_scans')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Scans */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{t('dash_recent')}</h3>
            <button
              onClick={() => setCurrentPage('scanner')}
              className="text-sm flex items-center gap-1 transition-all hover:opacity-80"
              style={{ color: 'var(--accent)' }}
            >
              {t('scanner_btn')} <ArrowRight size={14} />
            </button>
          </div>
          {recentScans.length === 0 ? (
            <div
              className="rounded-2xl p-12 text-center"
              style={{
                backgroundColor: isLight ? '#ffffff' : '#0f0f0f',
                border: `1px solid ${isLight ? '#e0e0e0' : '#1e1e1e'}`,
              }}
            >
              <Activity size={40} className="mx-auto mb-3" style={{ color: 'var(--text-faint)' }} />
              <p style={{ color: 'var(--text-muted)' }}>{t('dash_no_scans')}</p>
              <button
                onClick={() => setCurrentPage('scanner')}
                className="mt-4 font-semibold px-6 py-2.5 rounded-xl text-sm transition-all hover:opacity-90"
                style={{ backgroundColor: 'var(--accent)', color: '#000000' }}
              >
                {t('scanner_btn')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentScans.map(scan => (
                <ScanCard key={scan.id} scan={scan} t={t} theme={theme} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
