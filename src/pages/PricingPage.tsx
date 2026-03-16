import { useState } from 'react';
import { Check, Zap, Star, Crown, CreditCard, TrendingDown, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Plan {
  key: string;
  monthlyPrice: number;   // raw numeric monthly price
  annualMonthly: number;  // numeric: monthly price when billed annually
  icon: typeof Zap;
  accentColor: string;    // CSS color for icon and badge
  borderColor: string;    // CSS border color
  bgStyle: React.CSSProperties;
  features: string[];
  highlighted?: boolean;
}

export function PricingPage() {
  const { t, theme, isAuthenticated, user, addCredits, setShowAuthModal, setAuthModalMode } = useApp();
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const [buying, setBuying] = useState<string | null>(null);
  const [creditBought, setCreditBought] = useState<string | null>(null);

  const isLight = theme === 'light';

  const plans: Plan[] = [
    {
      key: 'free',
      monthlyPrice: 0,
      annualMonthly: 0,
      icon: Zap,
      accentColor: isLight ? '#555555' : '#a0a0a0',
      borderColor: isLight ? '#e0e0e0' : '#2a2a2a',
      bgStyle: { backgroundColor: isLight ? '#ffffff' : '#0f0f0f' },
      features: ['pricing_feature_scans5', 'pricing_feature_basic', 'pricing_feature_email'],
    },
    {
      key: 'pro',
      monthlyPrice: 3.99,
      annualMonthly: 3.19,
      icon: Star,
      accentColor: '#3b82f6',
      borderColor: 'rgba(59,130,246,0.4)',
      bgStyle: {
        background: isLight
          ? 'linear-gradient(to bottom, rgba(59,130,246,0.05), #ffffff)'
          : 'linear-gradient(to bottom, rgba(59,130,246,0.08), #0f0f0f)',
      },
      highlighted: true,
      features: ['pricing_feature_scans100', 'pricing_feature_deep', 'pricing_feature_battle', 'pricing_feature_watchlist', 'pricing_feature_priority'],
    },
    {
      key: 'elite',
      monthlyPrice: 9.99,
      annualMonthly: 7.99,
      icon: Crown,
      accentColor: '#a855f7',
      borderColor: 'rgba(168,85,247,0.3)',
      bgStyle: {
        background: isLight
          ? 'linear-gradient(to bottom, rgba(168,85,247,0.05), #ffffff)'
          : 'linear-gradient(to bottom, rgba(168,85,247,0.08), #0f0f0f)',
      },
      features: ['pricing_feature_unlimited', 'pricing_feature_api', 'pricing_feature_team', 'pricing_feature_white', 'pricing_feature_dedicated'],
    },
  ];

  const creditPacks = [
    { key: 'pack1', label: t('credits_pack1'), amount: 10, price: '$0.99', borderColor: isLight ? '#e0e0e0' : '#2a2a2a' },
    { key: 'pack2', label: t('credits_pack2'), amount: 50, price: '$3.99', borderColor: 'rgba(59,130,246,0.3)' },
    { key: 'pack3', label: t('credits_pack3'), amount: 200, price: '$9.99', borderColor: 'rgba(168,85,247,0.3)' },
  ];

  const handlePlanClick = (planKey: string) => {
    if (!isAuthenticated) {
      setAuthModalMode('signup');
      setShowAuthModal(true);
      return;
    }
    if (planKey === 'elite') {
      alert(`${t('pricing_contact_sales')} sales@ozscan.ai`);
      return;
    }
    setBuying(planKey);
    setTimeout(() => {
      setBuying(null);
      alert(`${planKey.toUpperCase()} ${billing === 'annual' ? t('pricing_annual') : t('pricing_monthly')} — ${t('pricing_payment_note')}`);
    }, 1500);
  };

  const handleBuyCredits = (pack: typeof creditPacks[0]) => {
    if (!isAuthenticated) {
      setAuthModalMode('signup');
      setShowAuthModal(true);
      return;
    }
    setBuying(pack.key);
    setTimeout(() => {
      addCredits(pack.amount);
      setCreditBought(pack.key);
      setBuying(null);
      setTimeout(() => setCreditBought(null), 3000);
    }, 1500);
  };

  const currentPlan = user?.plan || null;

  /* ── Price display helpers ── */
  const displayPrice = (plan: Plan) => {
    if (plan.monthlyPrice === 0) return '$0';
    const price = billing === 'annual' ? plan.annualMonthly : plan.monthlyPrice;
    return `$${price.toFixed(2)}`;
  };

  const annualTotal = (plan: Plan) => {
    if (plan.monthlyPrice === 0) return null;
    const total = (plan.annualMonthly * 12).toFixed(2);
    const saved = ((plan.monthlyPrice - plan.annualMonthly) * 12).toFixed(2);
    return { total, saved };
  };

  /* ── Styles ── */
  const pageStyle: React.CSSProperties = {
    backgroundColor: 'var(--bg-base)',
    color: 'var(--text-primary)',
    minHeight: '100vh',
    paddingTop: '4rem',
  };

  const cardStyle = (plan: Plan): React.CSSProperties => ({
    ...plan.bgStyle,
    border: `1px solid ${plan.borderColor}`,
    borderRadius: 16,
    padding: '1.75rem',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    boxShadow: plan.highlighted
      ? `0 0 30px ${plan.borderColor}`
      : 'none',
  });

  const toggleBase: React.CSSProperties = {
    backgroundColor: isLight ? '#f0f0f0' : '#111111',
    border: `1px solid ${isLight ? '#e0e0e0' : '#2a2a2a'}`,
    borderRadius: 12,
    padding: 4,
    display: 'inline-flex',
  };

  const toggleActive: React.CSSProperties = {
    backgroundColor: isLight ? '#000000' : '#ffffff',
    color: isLight ? '#ffffff' : '#000000',
  };

  const toggleInactive: React.CSSProperties = {
    color: isLight ? '#666666' : '#888888',
    backgroundColor: 'transparent',
  };

  return (
    <div style={pageStyle}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            {t('pricing_title')}
          </h1>
          <p className="text-lg mb-8" style={{ color: 'var(--text-muted)' }}>
            {t('pricing_desc')}
          </p>

          {/* Billing toggle */}
          <div style={toggleBase}>
            <button
              onClick={() => setBilling('monthly')}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
              style={billing === 'monthly' ? toggleActive : toggleInactive}
            >
              {t('pricing_monthly')}
            </button>
            <button
              onClick={() => setBilling('annual')}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
              style={billing === 'annual' ? toggleActive : toggleInactive}
            >
              {t('pricing_annual')}
              {billing !== 'annual' && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--accent)', color: '#000000' }}
                >
                  -20%
                </span>
              )}
            </button>
          </div>

          {/* Annual active banner */}
          {billing === 'annual' && (
            <div
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl text-sm font-medium animate-fadeIn"
              style={{
                backgroundColor: isLight ? 'rgba(0,184,106,0.1)' : 'rgba(0,217,128,0.08)',
                border: `1px solid ${isLight ? 'rgba(0,184,106,0.25)' : 'rgba(0,217,128,0.2)'}`,
                color: 'var(--accent)',
              }}
            >
              <TrendingDown size={15} />
              {t('pricing_annual_active')}
            </div>
          )}
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {plans.map(plan => {
            const isCurrentPlan = currentPlan === plan.key;
            const annualInfo = billing === 'annual' ? annualTotal(plan) : null;

            return (
              <div key={plan.key} style={cardStyle(plan)}>

                {/* Most Popular badge */}
                {plan.highlighted && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1 rounded-full"
                    style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
                  >
                    {t('pricing_most_popular')}
                  </div>
                )}

                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    backgroundColor: plan.highlighted
                      ? 'rgba(59,130,246,0.15)'
                      : plan.key === 'elite'
                      ? 'rgba(168,85,247,0.15)'
                      : isLight ? '#f0f0f0' : '#1a1a1a',
                  }}
                >
                  <plan.icon size={22} style={{ color: plan.accentColor }} />
                </div>

                {/* Plan name */}
                <div className="mb-1">
                  <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {t(`pricing_${plan.key}` as any)}
                  </span>
                </div>

                {/* Price block */}
                <div className="mb-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black" style={{ color: 'var(--text-primary)' }}>
                      {displayPrice(plan)}
                    </span>
                    {plan.monthlyPrice > 0 && (
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {t('pricing_per_month')}
                      </span>
                    )}
                  </div>

                  {/* Annual total line — shown only when annual billing is active */}
                  {annualInfo && (
                    <div className="mt-1.5 animate-fadeIn">
                      <div
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
                        style={{
                          backgroundColor: isLight ? 'rgba(0,184,106,0.1)' : 'rgba(0,217,128,0.08)',
                          color: 'var(--accent)',
                          border: `1px solid ${isLight ? 'rgba(0,184,106,0.2)' : 'rgba(0,217,128,0.15)'}`,
                        }}
                      >
                        <TrendingDown size={11} />
                        <span>${annualInfo.total}{t('pricing_per_year')}</span>
                        <span style={{ color: 'var(--text-muted)' }}>·</span>
                        <span style={{ color: 'var(--accent)' }}>-${annualInfo.saved}</span>
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-sm mb-6 mt-1" style={{ color: 'var(--text-muted)' }}>
                  {t(`pricing_${plan.key}_desc` as any)}
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: isLight ? '#333333' : '#c0c0c0' }}>
                      <Check size={15} style={{ color: plan.accentColor, flexShrink: 0 }} />
                      {t(f as any)}
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handlePlanClick(plan.key)}
                  disabled={isCurrentPlan || buying === plan.key}
                  className="w-full py-3 rounded-xl font-semibold text-sm transition-all"
                  style={{
                    backgroundColor: isCurrentPlan
                      ? isLight ? '#e8e8e8' : '#1a1a1a'
                      : plan.highlighted
                      ? '#3b82f6'
                      : plan.key === 'elite'
                      ? '#a855f7'
                      : isLight ? '#111111' : '#e8e8e8',
                    color: isCurrentPlan
                      ? isLight ? '#999999' : '#555555'
                      : plan.highlighted || plan.key === 'elite'
                      ? '#ffffff'
                      : isLight ? '#ffffff' : '#000000',
                    cursor: isCurrentPlan ? 'not-allowed' : 'pointer',
                    opacity: buying === plan.key ? 0.8 : 1,
                  }}
                >
                  {buying === plan.key ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t('loading')}
                    </div>
                  ) : isCurrentPlan
                    ? t('pricing_current')
                    : plan.key === 'elite'
                    ? t('pricing_contact')
                    : t('pricing_get_started')}
                </button>

                {/* Annual total summary below button */}
                {annualInfo && !isCurrentPlan && (
                  <p className="text-center text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                    ${annualInfo.total}{t('pricing_per_year')} · {t('pricing_months_free')}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Credit packs */}
        <div style={{ borderTop: `1px solid ${isLight ? '#e0e0e0' : '#1e1e1e'}`, paddingTop: '3rem' }}>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {t('credits_title')}
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>{t('credits_desc')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {creditPacks.map(pack => (
              <div
                key={pack.key}
                className="rounded-2xl p-6 text-center"
                style={{
                  backgroundColor: isLight ? '#ffffff' : '#0f0f0f',
                  border: `1px solid ${pack.borderColor}`,
                }}
              >
                <CreditCard size={24} className="mx-auto mb-3" style={{ color: 'var(--accent)' }} />
                <div className="text-2xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>
                  {pack.label}
                </div>
                <div className="text-2xl font-bold mb-4" style={{ color: 'var(--accent)' }}>
                  {pack.price}
                </div>
                <button
                  onClick={() => handleBuyCredits(pack)}
                  disabled={buying === pack.key}
                  className="w-full font-bold py-3 rounded-xl text-sm transition-all"
                  style={{
                    backgroundColor: buying === pack.key ? (isLight ? '#e0e0e0' : '#1a1a1a') : 'var(--accent)',
                    color: '#000000',
                    opacity: buying === pack.key ? 0.7 : 1,
                  }}
                >
                  {buying === pack.key ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    </div>
                  ) : creditBought === pack.key
                    ? `✓ ${t('success')}`
                    : t('credits_buy')}
                </button>
                {creditBought === pack.key && (
                  <p className="text-xs mt-2" style={{ color: 'var(--accent)' }}>
                    {pack.amount} {t('pricing_credits_added')}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Payment note */}
          <div
            className="flex items-start gap-2 mt-6 p-4 rounded-xl text-xs"
            style={{
              backgroundColor: isLight ? '#f5f5f5' : '#0f0f0f',
              border: `1px solid ${isLight ? '#e0e0e0' : '#1e1e1e'}`,
              color: 'var(--text-muted)',
            }}
          >
            <Info size={14} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }} />
            <span>{t('pricing_payment_note')} Stripe / iyzico</span>
          </div>
        </div>
      </div>
    </div>
  );
}
