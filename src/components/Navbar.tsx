import { useState } from 'react';
import { Menu, X, Globe, Zap, LogOut, Settings, ChevronDown, Sun, Moon } from 'lucide-react';
import { Logo } from './Logo';
import { useApp } from '../context/AppContext';

export function Navbar() {
  const {
    t, lang, setLang, theme, toggleTheme,
    user, isAuthenticated, logout,
    currentPage, setCurrentPage,
    setShowAuthModal, setAuthModalMode,
  } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isLight = theme === 'light';

  const navItems = [
    { key: 'home',      label: t('nav_home') },
    { key: 'dashboard', label: t('nav_dashboard') },
    { key: 'scanner',   label: t('nav_scanner') },
    { key: 'battle',    label: t('nav_battle') },
    { key: 'watchlist', label: t('nav_watchlist') },
    { key: 'pricing',   label: t('nav_pricing') },
  ];

  const handleNav = (page: string) => {
    setCurrentPage(page);
    setMobileOpen(false);
    setUserMenuOpen(false);
  };

  const handleLogin = () => {
    setAuthModalMode('login');
    setShowAuthModal(true);
    setMobileOpen(false);
  };

  const handleSignup = () => {
    setAuthModalMode('signup');
    setShowAuthModal(true);
    setMobileOpen(false);
  };

  /* ── Inline styles using CSS variables — guaranteed correctness ── */
  const navStyle: React.CSSProperties = {
    backgroundColor: isLight ? 'rgba(255,255,255,0.97)' : 'rgba(0,0,0,0.93)',
    borderBottomColor: isLight ? '#e0e0e0' : '#1e1e1e',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
  };

  const navItemStyle = (active: boolean): React.CSSProperties => ({
    color: active
      ? 'var(--accent)'
      : isLight ? '#333333' : '#a0a0a0',
    backgroundColor: active
      ? isLight ? 'rgba(0,184,106,0.08)' : 'rgba(0,217,128,0.08)'
      : 'transparent',
  });

  const iconBtnStyle: React.CSSProperties = {
    color: isLight ? '#444444' : '#a0a0a0',
  };

  const mobileMenuStyle: React.CSSProperties = {
    backgroundColor: isLight ? '#ffffff' : '#0a0a0a',
    borderTopColor: isLight ? '#e0e0e0' : '#1e1e1e',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
  };

  const dropdownStyle: React.CSSProperties = {
    backgroundColor: isLight ? '#ffffff' : '#111111',
    borderColor: isLight ? '#e0e0e0' : '#222222',
    borderWidth: 1,
    borderStyle: 'solid',
  };

  const dropdownItemStyle: React.CSSProperties = {
    color: isLight ? '#333333' : '#c0c0c0',
  };

  const userBtnStyle: React.CSSProperties = {
    borderColor: isLight ? '#e0e0e0' : '#2a2a2a',
    backgroundColor: isLight ? '#ffffff' : 'transparent',
    borderWidth: 1,
    borderStyle: 'solid',
  };

  const planBadgeStyle: React.CSSProperties = {
    free:  { backgroundColor: isLight ? '#f0f0f0' : '#2a2a2a', color: isLight ? '#555' : '#aaa' },
    pro:   { backgroundColor: isLight ? '#eff6ff' : 'rgba(59,130,246,0.15)', color: isLight ? '#2563eb' : '#60a5fa' },
    elite: { backgroundColor: isLight ? '#f5f3ff' : 'rgba(139,92,246,0.15)', color: isLight ? '#7c3aed' : '#a78bfa' },
  }[user?.plan || 'free'];

  const themeIconColor = isLight ? '#555555' : '#facc15';

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md"
      style={navStyle}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo — always navigates home */}
          <button
            onClick={() => handleNav('home')}
            className="flex-shrink-0 focus:outline-none"
            aria-label="OzScan AI — Ana Sayfa"
          >
            <Logo size="sm" />
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => handleNav(item.key)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={navItemStyle(currentPage === item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-1.5">

            {/* 🌙/☀️ Theme toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition-all hover:opacity-80"
              style={iconBtnStyle}
              title={isLight ? t('theme_toggle_dark') : t('theme_toggle_light')}
              aria-label={isLight ? t('theme_toggle_dark') : t('theme_toggle_light')}
            >
              {isLight
                ? <Moon size={17} style={{ color: '#4444aa' }} strokeWidth={2} />
                : <Sun  size={17} style={{ color: themeIconColor }} strokeWidth={2} />
              }
            </button>

            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition-all hover:opacity-80"
              style={iconBtnStyle}
              aria-label="Toggle language"
            >
              <Globe size={14} />
              <span className="uppercase font-semibold text-xs">{lang}</span>
            </button>

            {/* User menu or Login/Signup */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all hover:opacity-90"
                  style={userBtnStyle}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: 'var(--accent)', color: '#000000' }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-xs font-medium leading-none" style={{ color: 'var(--text-primary)' }}>
                      {user.name.split(' ')[0]}
                    </span>
                    <span
                      className="text-[10px] px-1 rounded font-medium mt-0.5"
                      style={planBadgeStyle}
                    >
                      {user.plan.toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <Zap size={12} style={{ color: '#facc15' }} />
                    <span>{user.credits}</span>
                  </div>
                  <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div
                      className="absolute right-0 top-full mt-2 w-52 rounded-xl shadow-2xl z-20 overflow-hidden"
                      style={dropdownStyle}
                    >
                      <div
                        className="px-4 py-3"
                        style={{ borderBottom: `1px solid ${isLight ? '#eeeeee' : '#222222'}` }}
                      >
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                        <div className="flex items-center gap-1 mt-1.5">
                          <Zap size={11} style={{ color: '#facc15' }} />
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {user.credits} {t('nav_credits')}
                          </span>
                        </div>
                      </div>
                      <div className="p-1.5 space-y-0.5">
                        <button
                          onClick={() => { handleNav('settings'); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all hover:opacity-80"
                          style={dropdownItemStyle}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = isLight ? '#f5f5f5' : '#1a1a1a')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <Settings size={14} />
                          {t('nav_settings')}
                        </button>
                        <button
                          onClick={() => { handleNav('pricing'); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all hover:opacity-80"
                          style={dropdownItemStyle}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = isLight ? '#f5f5f5' : '#1a1a1a')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <Zap size={14} style={{ color: '#facc15' }} />
                          {t('credits_buy')}
                        </button>
                        <button
                          onClick={() => { logout(); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 rounded-lg transition-all hover:opacity-80"
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = isLight ? '#fff5f5' : 'rgba(239,68,68,0.08)')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <LogOut size={14} />
                          {t('nav_logout')}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={handleLogin}
                  className="px-4 py-1.5 text-sm font-medium transition-all hover:opacity-80"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {t('nav_login')}
                </button>
                <button
                  onClick={handleSignup}
                  className="px-4 py-1.5 text-sm font-semibold rounded-lg transition-all hover:opacity-90"
                  style={{ backgroundColor: 'var(--accent)', color: '#000000' }}
                >
                  {t('nav_signup')}
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg transition-all hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden" style={mobileMenuStyle}>
          <div className="px-4 py-3 space-y-1">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => handleNav(item.key)}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={navItemStyle(currentPage === item.key)}
              >
                {item.label}
              </button>
            ))}

            {/* Theme + Lang in mobile */}
            <div
              className="flex gap-2 pt-2 mt-2"
              style={{ borderTop: `1px solid ${isLight ? '#e0e0e0' : '#1e1e1e'}` }}
            >
              <button
                onClick={toggleTheme}
                className="flex-1 flex items-center justify-center gap-2 py-2 text-sm rounded-lg font-medium transition-all"
                style={{
                  backgroundColor: isLight ? '#f0f0f0' : '#1a1a1a',
                  color: isLight ? '#333333' : '#c0c0c0',
                }}
              >
                {isLight
                  ? <Moon size={14} style={{ color: '#4444aa' }} />
                  : <Sun size={14} style={{ color: '#facc15' }} />
                }
                {isLight ? t('theme_toggle_dark') : t('theme_toggle_light')}
              </button>
              <button
                onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
                className="flex-1 flex items-center justify-center gap-2 py-2 text-sm rounded-lg font-medium transition-all"
                style={{
                  backgroundColor: isLight ? '#f0f0f0' : '#1a1a1a',
                  color: isLight ? '#333333' : '#c0c0c0',
                }}
              >
                <Globe size={14} />
                {lang === 'tr' ? 'EN' : 'TR'}
              </button>
            </div>

            {!isAuthenticated && (
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleLogin}
                  className="flex-1 py-2 text-sm rounded-lg font-medium border transition-all"
                  style={{
                    borderColor: isLight ? '#e0e0e0' : '#2a2a2a',
                    color: isLight ? '#333333' : '#c0c0c0',
                  }}
                >
                  {t('nav_login')}
                </button>
                <button
                  onClick={handleSignup}
                  className="flex-1 py-2 text-sm rounded-lg font-semibold transition-all"
                  style={{ backgroundColor: 'var(--accent)', color: '#000000' }}
                >
                  {t('nav_signup')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
