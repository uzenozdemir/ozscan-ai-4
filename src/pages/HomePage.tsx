import { ArrowRight, Zap, Shield, Globe, Cpu, Star, TrendingUp, Users, CheckCircle, Activity, Leaf, Scale } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar
} from 'recharts';

const radarData = (t: (k: any) => string) => [
  { subject: t('chart_supply'),    A: 82, B: 65 },
  { subject: t('chart_carbon'),    A: 71, B: 88 },
  { subject: t('chart_labor'),     A: 90, B: 55 },
  { subject: t('chart_sentiment'), A: 78, B: 72 },
  { subject: t('chart_overall'),   A: 85, B: 68 },
];

const trendData = (t: (k: any) => string) => [
  { name: t('chart_month_jan'), score: 68 },
  { name: t('chart_month_feb'), score: 72 },
  { name: t('chart_month_mar'), score: 75 },
  { name: t('chart_month_apr'), score: 71 },
  { name: t('chart_month_may'), score: 80 },
  { name: t('chart_month_jun'), score: 85 },
];

const activityData = (t: (k: any) => string) => [
  { name: t('chart_month_jan'), scans: 120 },
  { name: t('chart_month_feb'), scans: 180 },
  { name: t('chart_month_mar'), scans: 150 },
  { name: t('chart_month_apr'), scans: 210 },
  { name: t('chart_month_may'), scans: 190 },
  { name: t('chart_month_jun'), scans: 260 },
];

export function HomePage() {
  const { t, theme, lang, setCurrentPage, isAuthenticated, setShowAuthModal, setAuthModalMode, triggerDemo } = useApp();
  const isLight = theme === 'light';

  const handleStart = () => {
    if (isAuthenticated) {
      setCurrentPage('scanner');
    } else {
      setAuthModalMode('signup');
      setShowAuthModal(true);
    }
  };

  const features = [
    { icon: Activity, key: 'feat1', color: '#00d980',  bgColor: 'rgba(0,217,128,0.1)' },
    { icon: Leaf,     key: 'feat2', color: '#10b981',  bgColor: 'rgba(16,185,129,0.1)' },
    { icon: Star,     key: 'feat3', color: '#eab308',  bgColor: 'rgba(234,179,8,0.1)' },
    { icon: Scale,    key: 'feat4', color: '#3b82f6',  bgColor: 'rgba(59,130,246,0.1)' },
    { icon: Zap,      key: 'feat5', color: '#a855f7',  bgColor: 'rgba(168,85,247,0.1)' },
    { icon: Shield,   key: 'feat6', color: '#ef4444',  bgColor: 'rgba(239,68,68,0.1)' },
  ];

  const stats = [
    { value: '50K+', key: 'hero_stat1' },
    { value: '120+', key: 'hero_stat2' },
    { value: '97%',  key: 'hero_stat3' },
    { value: '12K+', key: 'hero_stat4' },
  ];

  /* Chart shared styles */
  const gridColor   = isLight ? '#eeeeee' : '#1e1e1e';
  const tickColor   = isLight ? '#888888' : '#666666';
  const tooltipBg   = isLight ? '#ffffff' : '#111111';
  const tooltipBorder = isLight ? '#e0e0e0' : '#2a2a2a';
  const tooltipStyle = {
    backgroundColor: tooltipBg,
    border: `1px solid ${tooltipBorder}`,
    borderRadius: 8,
    color: isLight ? '#000000' : '#ffffff',
  };
  const cardStyle: React.CSSProperties = {
    backgroundColor: isLight ? '#ffffff' : '#0f0f0f',
    border: `1px solid ${isLight ? '#e0e0e0' : '#1e1e1e'}`,
    borderRadius: 16,
    padding: '1.5rem',
  };
  const sectionBorder = isLight ? '#e0e0e0' : '#111111';

  return (
    <div style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>

      {/* ── Hero ── */}
      <section className="min-h-screen flex items-center relative overflow-hidden pt-16">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl"
            style={{ backgroundColor: isLight ? 'rgba(0,184,106,0.04)' : 'rgba(0,217,128,0.05)' }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl"
            style={{ backgroundColor: isLight ? 'rgba(0,184,106,0.03)' : 'rgba(0,217,128,0.04)' }} />
          <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full blur-3xl"
            style={{ backgroundColor: isLight ? 'rgba(0,184,106,0.03)' : 'rgba(0,217,128,0.03)' }} />
          {/* Grid */}
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(var(--accent) 1px, transparent 1px), linear-gradient(90deg, var(--accent) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
            opacity: isLight ? 0.02 : 0.03,
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 relative">
          <div className="text-center max-w-4xl mx-auto">

            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full mb-8"
              style={{
                backgroundColor: 'var(--accent-dim)',
                border: `1px solid rgba(0,217,128,0.25)`,
                color: 'var(--accent)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent)' }} />
              {t('hero_badge')}
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6">
              <span style={{ color: 'var(--text-primary)' }}>{t('hero_title')}</span>
              <br />
              <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                {t('hero_title2')}
              </span>
            </h1>

            <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {t('hero_desc')}
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button
                onClick={handleStart}
                className="flex items-center gap-2 font-bold px-8 py-4 rounded-xl text-base transition-all duration-200 hover:scale-105"
                style={{ backgroundColor: 'var(--accent)', color: '#000000', boxShadow: '0 8px 25px rgba(0,217,128,0.25)' }}
              >
                {t('hero_cta_primary')}
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => triggerDemo('www.zara.com')}
                className="flex items-center gap-2 font-medium px-8 py-4 rounded-xl text-base transition-all duration-200 group"
                style={{
                  border: `1px solid ${isLight ? '#cccccc' : '#2a2a2a'}`,
                  color: 'var(--text-secondary)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(0,217,128,0.5)';
                  e.currentTarget.style.color = 'var(--accent)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = isLight ? '#cccccc' : '#2a2a2a';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent)' }} />
                {t('hero_cta_secondary')}
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map(stat => (
                <div
                  key={stat.key}
                  className="rounded-2xl p-5 backdrop-blur-sm"
                  style={{
                    backgroundColor: isLight ? 'rgba(255,255,255,0.8)' : 'rgba(15,15,15,0.7)',
                    border: `1px solid ${isLight ? '#e0e0e0' : '#1e1e1e'}`,
                  }}
                >
                  <div className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{stat.value}</div>
                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{t(stat.key as any)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24" style={{ borderTop: `1px solid ${sectionBorder}` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              {t('features_title')}
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
              {t('features_desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, key, color, bgColor }) => (
              <div
                key={key}
                className="rounded-2xl p-6 transition-all duration-300"
                style={{
                  backgroundColor: isLight ? '#ffffff' : '#0f0f0f',
                  border: `1px solid ${isLight ? '#e0e0e0' : '#1e1e1e'}`,
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = isLight ? '#cccccc' : '#2a2a2a')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = isLight ? '#e0e0e0' : '#1e1e1e')}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform"
                  style={{ backgroundColor: bgColor }}
                >
                  <Icon size={22} style={{ color }} />
                </div>
                <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
                  {t(`${key}_title` as any)}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {t(`${key}_desc` as any)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Charts / Bento Grid ── */}
      <section className="py-24" style={{ borderTop: `1px solid ${sectionBorder}` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              {t('chart_brand_comparison')}
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>{t('features_desc')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Radar */}
            <div className="lg:col-span-1" style={cardStyle}>
              <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                {t('chart_brand_comparison')}
              </h3>
              <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Nike vs Adidas</p>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData(t)}>
                  <PolarGrid stroke={gridColor} />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: tickColor, fontSize: 11 }} />
                  <Radar name="Nike"   dataKey="A" stroke="#00d980" fill="#00d980" fillOpacity={0.15} />
                  <Radar name="Adidas" dataKey="B" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
                </RadarChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2 justify-center">
                <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#00d980' }} />Nike
                </div>
                <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span className="w-2 h-2 rounded-full bg-blue-400" />Adidas
                </div>
              </div>
            </div>

            {/* Trend Area */}
            <div className="lg:col-span-2" style={cardStyle}>
              <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                {t('chart_score_trend')}
              </h3>
              <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>2024</p>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={trendData(t)}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#00d980" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00d980" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[60, 90]} tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="score" stroke="#00d980" fill="url(#scoreGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Bar activity */}
            <div className="lg:col-span-2" style={cardStyle}>
              <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                {t('chart_scan_activity')}
              </h3>
              <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                {lang === 'tr' ? 'Platform geneli tarama sayısı' : 'Platform-wide scan count'}
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={activityData(t)}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="scans" fill="#00d980" radius={[4, 4, 0, 0]} opacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* AI CTA mini card */}
            <div
              className="rounded-2xl p-6 flex flex-col justify-between"
              style={{
                background: isLight
                  ? 'linear-gradient(135deg, rgba(0,184,106,0.08), rgba(0,184,106,0.02))'
                  : 'linear-gradient(135deg, rgba(0,217,128,0.08), rgba(0,217,128,0.02))',
                border: `1px solid ${isLight ? 'rgba(0,184,106,0.2)' : 'rgba(0,217,128,0.15)'}`,
              }}
            >
              <div>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'var(--accent)', color: '#000000' }}
                >
                  <Cpu size={20} />
                </div>
                <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
                  AI-Powered
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {lang === 'tr' ? 'Gemini Pro destekli gerçek zamanlı analiz motoru' : 'Gemini Pro-powered real-time analysis engine'}
                </p>
              </div>
              <div className="mt-6 space-y-2">
                {['Supply Chain Intelligence', 'Carbon Footprint AI', 'Sentiment Engine'].map(item => (
                  <div key={item} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <CheckCircle size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                    {item}
                  </div>
                ))}
              </div>
              <button
                onClick={handleStart}
                className="mt-6 w-full font-semibold py-3 rounded-xl text-sm transition-all hover:opacity-90"
                style={{ backgroundColor: 'var(--accent)', color: '#000000' }}
              >
                {t('hero_cta_primary')} →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <section className="py-16" style={{ borderTop: `1px solid ${sectionBorder}` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-8" style={{ opacity: isLight ? 0.2 : 0.25 }}>
            {['GOOGLE', 'MICROSOFT', 'AMAZON', 'NIKE', 'UNILEVER', 'H&M'].map(brand => (
              <span key={brand} className="font-bold text-lg tracking-widest" style={{ color: 'var(--text-primary)' }}>
                {brand}
              </span>
            ))}
          </div>
          <p className="text-center text-sm mt-4" style={{ color: 'var(--text-faint)' }}>
            {lang === 'tr' ? 'Küresel lider markalar tarafından güvenilen' : 'Trusted by leading global brands'}
          </p>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-24" style={{ borderTop: `1px solid ${sectionBorder}` }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div
            className="rounded-3xl p-12"
            style={{
              background: isLight
                ? 'linear-gradient(135deg, rgba(0,184,106,0.06), rgba(0,184,106,0.02))'
                : 'linear-gradient(135deg, rgba(0,217,128,0.08), rgba(0,217,128,0.02))',
              border: `1px solid ${isLight ? 'rgba(0,184,106,0.2)' : 'rgba(0,217,128,0.15)'}`,
            }}
          >
            <Globe size={48} className="mx-auto mb-6" style={{ color: 'var(--accent)' }} />
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              {lang === 'tr' ? 'Markaları Mercek Altına Al' : 'Put Brands Under the Microscope'}
            </h2>
            <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
              {lang === 'tr'
                ? 'Ücretsiz başla, 5 kredi ile ilk analizini yap. Kredi kartı gerekmez.'
                : 'Start free, run your first analysis with 5 credits. No credit card required.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleStart}
                className="flex items-center justify-center gap-2 font-bold px-8 py-4 rounded-xl transition-all hover:scale-105"
                style={{ backgroundColor: 'var(--accent)', color: '#000000' }}
              >
                <Users size={18} />
                {t('hero_cta_primary')}
              </button>
              <button
                onClick={() => setCurrentPage('pricing')}
                className="flex items-center justify-center gap-2 font-medium px-8 py-4 rounded-xl transition-all"
                style={{
                  border: `1px solid ${isLight ? '#cccccc' : '#2a2a2a'}`,
                  color: 'var(--text-secondary)',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = isLight ? '#aaaaaa' : '#444444')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = isLight ? '#cccccc' : '#2a2a2a')}
              >
                <TrendingUp size={18} />
                {t('pricing_title')}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
