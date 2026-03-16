import { useState } from 'react';
import { User, Lock, CreditCard, Bell, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';

type Tab = 'profile' | 'security' | 'billing' | 'notifications';

export function SettingsPage() {
  const { t, user, updateUser, setCurrentPage } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  // Profile
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [company, setCompany] = useState(user?.company || '');
  const [profileMsg, setProfileMsg] = useState('');

  // Security
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [passError, setPassError] = useState('');

  const handleSaveProfile = () => {
    if (!name || !email) { setProfileMsg(t('auth_error_fields')); return; }
    updateUser({ name, email, company });
    setProfileMsg(t('settings_saved'));
    setTimeout(() => setProfileMsg(''), 3000);
  };

  const handleUpdatePass = () => {
    setPassMsg(''); setPassError('');
    if (!currentPass || !newPass || !confirmPass) { setPassError(t('auth_error_fields')); return; }
    if (currentPass !== user?.password) { setPassError('Mevcut şifre yanlış'); return; }
    if (newPass !== confirmPass) { setPassError(t('auth_error_password')); return; }
    if (newPass.length < 6) { setPassError(t('auth_error_short')); return; }
    updateUser({ password: newPass });
    setPassMsg(t('settings_saved'));
    setCurrentPass(''); setNewPass(''); setConfirmPass('');
    setTimeout(() => setPassMsg(''), 3000);
  };

  const tabs = [
    { key: 'profile', label: t('settings_profile'), icon: User },
    { key: 'security', label: t('settings_security'), icon: Lock },
    { key: 'billing', label: t('settings_billing'), icon: CreditCard },
    { key: 'notifications', label: t('settings_notifications'), icon: Bell },
  ];

  const planBadge: Record<string, { color: string; label: string }> = {
    free: { color: 'bg-zinc-700 text-zinc-300', label: 'Free' },
    pro: { color: 'bg-blue-500/20 text-blue-400 border border-blue-500/30', label: 'Pro' },
    elite: { color: 'bg-purple-500/20 text-purple-400 border border-purple-500/30', label: 'Elite' },
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">{t('settings_title')}</h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          {/* Sidebar */}
          <div className="sm:w-52 flex-shrink-0">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-2 space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as Tab)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    activeTab === tab.key ? 'bg-green-500/10 text-green-400' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <tab.icon size={15} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* User card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mt-4 text-center">
              <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-black text-xl font-bold mx-auto mb-2">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <p className="text-white font-medium text-sm">{user.name}</p>
              <p className="text-zinc-500 text-xs mb-2">{user.email}</p>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${planBadge[user.plan]?.color}`}>
                {planBadge[user.plan]?.label}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <h2 className="text-white font-semibold text-lg mb-6">{t('settings_profile')}</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1.5">{t('settings_name')}</label>
                    <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 focus:border-green-500 text-white rounded-xl px-4 py-3 text-sm outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1.5">{t('settings_email')}</label>
                    <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full bg-zinc-800 border border-zinc-700 focus:border-green-500 text-white rounded-xl px-4 py-3 text-sm outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1.5">{t('settings_company')}</label>
                    <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Şirket adı (opsiyonel)" className="w-full bg-zinc-800 border border-zinc-700 focus:border-green-500 text-white rounded-xl px-4 py-3 text-sm outline-none transition-colors placeholder:text-zinc-600" />
                  </div>
                  {profileMsg && <div className="flex items-center gap-2 text-green-400 text-sm"><CheckCircle size={14} />{profileMsg}</div>}
                  <button onClick={handleSaveProfile} className="bg-green-500 hover:bg-green-400 text-black font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
                    {t('settings_save')}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <h2 className="text-white font-semibold text-lg mb-6">{t('settings_security')}</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1.5">{t('settings_current_pass')}</label>
                    <input type="password" value={currentPass} onChange={e => setCurrentPass(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 focus:border-green-500 text-white rounded-xl px-4 py-3 text-sm outline-none transition-colors" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1.5">{t('settings_new_pass')}</label>
                    <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 focus:border-green-500 text-white rounded-xl px-4 py-3 text-sm outline-none transition-colors" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1.5">{t('settings_confirm_pass')}</label>
                    <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 focus:border-green-500 text-white rounded-xl px-4 py-3 text-sm outline-none transition-colors" placeholder="••••••••" />
                  </div>
                  {passError && <div className="flex items-center gap-2 text-red-400 text-sm"><AlertCircle size={14} />{passError}</div>}
                  {passMsg && <div className="flex items-center gap-2 text-green-400 text-sm"><CheckCircle size={14} />{passMsg}</div>}
                  <button onClick={handleUpdatePass} className="bg-green-500 hover:bg-green-400 text-black font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
                    {t('settings_update_pass')}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="space-y-5">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                  <h2 className="text-white font-semibold text-lg mb-5">{t('settings_billing')}</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-zinc-800/60 rounded-xl p-4 text-center">
                      <div className={`text-2xl font-black mb-1 ${planBadge[user.plan]?.color.includes('blue') ? 'text-blue-400' : planBadge[user.plan]?.color.includes('purple') ? 'text-purple-400' : 'text-zinc-300'}`}>
                        {user.plan.toUpperCase()}
                      </div>
                      <div className="text-zinc-500 text-xs">{t('settings_plan')}</div>
                    </div>
                    <div className="bg-zinc-800/60 rounded-xl p-4 text-center">
                      <div className="text-2xl font-black text-yellow-400 mb-1 flex items-center justify-center gap-1">
                        <Zap size={18} />{user.credits}
                      </div>
                      <div className="text-zinc-500 text-xs">{t('settings_credits')}</div>
                    </div>
                    <div className="bg-zinc-800/60 rounded-xl p-4 text-center">
                      <div className="text-2xl font-black text-white mb-1">{user.totalScans}</div>
                      <div className="text-zinc-500 text-xs">{t('settings_total_scans')}</div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button onClick={() => setCurrentPage('pricing')} className="flex-1 bg-green-500 hover:bg-green-400 text-black font-semibold py-3 rounded-xl text-sm transition-colors">
                      {t('settings_buy_credits')}
                    </button>
                    <button onClick={() => setCurrentPage('pricing')} className="flex-1 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white font-medium py-3 rounded-xl text-sm transition-colors">
                      {t('settings_upgrade_plan')}
                    </button>
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                  <h3 className="text-white font-semibold mb-4">{t('settings_usage')}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">{t('settings_total_scans')}</span>
                      <span className="text-white font-medium">{user.totalScans}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">{t('watch_title')}</span>
                      <span className="text-white font-medium">{user.watchlist.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">{t('settings_member_since')}</span>
                      <span className="text-white font-medium">{user.memberSince}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <h2 className="text-white font-semibold text-lg mb-6">{t('settings_notifications')}</h2>
                <div className="space-y-4">
                  {['Watchlist uyarıları', 'Haftalık özet raporu', 'Kredi uyarıları', 'Yeni özellik duyuruları'].map(item => (
                    <div key={item} className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0">
                      <span className="text-zinc-300 text-sm">{item}</span>
                      <button className="relative w-11 h-6 bg-green-500 rounded-full transition-colors">
                        <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform" />
                      </button>
                    </div>
                  ))}
                </div>
                <button className="mt-6 bg-green-500 hover:bg-green-400 text-black font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
                  {t('settings_save')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
