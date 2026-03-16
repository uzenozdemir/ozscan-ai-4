import { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function AuthModal() {
  const { t, showAuthModal, setShowAuthModal, authModalMode, setAuthModalMode, login, signup, setCurrentPage } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setName(''); setEmail(''); setPassword(''); setConfirmPassword('');
    setError(''); setSuccess(''); setLoading(false);
  };

  const handleClose = () => {
    setShowAuthModal(false);
    reset();
  };

  // ESC key closes the modal
  useEffect(() => {
    if (!showAuthModal) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAuthModal]);

  if (!showAuthModal) return null;

  const switchMode = (mode: 'login' | 'signup') => {
    reset();
    setAuthModalMode(mode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (authModalMode === 'signup') {
      if (!name || !email || !password || !confirmPassword) {
        setError(t('auth_error_fields')); setLoading(false); return;
      }
      if (password !== confirmPassword) {
        setError(t('auth_error_password')); setLoading(false); return;
      }
      if (password.length < 6) {
        setError(t('auth_error_short')); setLoading(false); return;
      }
      const result = signup(name, email, password);
      if (!result.success) {
        setError(result.error || t('error')); setLoading(false); return;
      }
      setSuccess(t('auth_success_signup'));
      setTimeout(() => {
        handleClose();
        setCurrentPage('dashboard');
      }, 1800);
    } else {
      if (!email || !password) {
        setError(t('auth_error_fields')); setLoading(false); return;
      }
      const result = login(email, password);
      if (!result.success) {
        setError(result.error || t('error')); setLoading(false); return;
      }
      handleClose();
      setCurrentPage('dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Overlay — click outside to close */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Top accent */}
        <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-400" />

        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {authModalMode === 'login' ? t('auth_login_title') : t('auth_signup_title')}
              </h2>
              <p className="text-zinc-400 text-sm mt-1">
                {authModalMode === 'login' ? t('auth_login_desc') : t('auth_signup_desc')}
              </p>
            </div>
            {/* X close button */}
            <button
              onClick={handleClose}
              aria-label={t('close')}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <X size={20} />
            </button>
          </div>

          {/* Free credits badge */}
          {authModalMode === 'signup' && (
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-2.5 mb-5">
              <Zap size={16} className="text-green-400 flex-shrink-0" />
              <span className="text-green-400 text-sm font-medium">{t('auth_free_credits')}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {authModalMode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">{t('auth_name')}</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text" value={name} onChange={e => setName(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-green-500 transition-colors placeholder:text-zinc-600"
                    placeholder="Özdemir Yılmaz"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">{t('auth_email')}</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-green-500 transition-colors placeholder:text-zinc-600"
                  placeholder="ozdemir@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">{t('auth_password')}</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-green-500 transition-colors placeholder:text-zinc-600"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {authModalMode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">{t('auth_confirm_password')}</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type={showPass ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-green-500 transition-colors placeholder:text-zinc-600"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-2.5">{error}</div>}
            {success && <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-lg px-4 py-2.5">{success}</div>}

            <button
              type="submit" disabled={loading}
              className="w-full bg-green-500 hover:bg-green-400 disabled:bg-zinc-700 disabled:cursor-not-allowed text-black font-semibold rounded-lg py-3 text-sm transition-all duration-200 mt-2"
            >
              {loading ? t('loading') : (authModalMode === 'login' ? t('auth_login_btn') : t('auth_signup_btn'))}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              onClick={() => switchMode(authModalMode === 'login' ? 'signup' : 'login')}
              className="text-sm text-zinc-400 hover:text-green-400 transition-colors"
            >
              {authModalMode === 'login' ? t('auth_switch_signup') : t('auth_switch_login')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
