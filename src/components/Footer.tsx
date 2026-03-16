import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import { Shield } from 'lucide-react';

export function Footer() {
  const { t, setCurrentPage } = useApp();

  return (
    <footer className="bg-zinc-950 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo size="md" className="mb-3" />
            <p className="text-zinc-500 text-sm leading-relaxed mt-2">{t('footer_tagline')}</p>
            <div className="flex items-center gap-1.5 mt-4 text-xs text-zinc-600">
              <Shield size={12} className="text-green-600" />
              <span>Enterprise-grade security</span>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">{t('footer_product')}</h4>
            <ul className="space-y-2.5">
              {[
                { label: t('nav_scanner'), page: 'scanner' },
                { label: t('nav_battle'), page: 'battle' },
                { label: t('nav_watchlist'), page: 'watchlist' },
                { label: t('nav_pricing'), page: 'pricing' },
              ].map(item => (
                <li key={item.page}>
                  <button onClick={() => setCurrentPage(item.page)} className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">{t('footer_company')}</h4>
            <ul className="space-y-2.5">
              {[t('footer_about'), t('footer_blog'), t('footer_careers'), t('footer_contact')].map(item => (
                <li key={item}>
                  <span className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors cursor-pointer">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">{t('footer_legal')}</h4>
            <ul className="space-y-2.5">
              {[t('footer_privacy'), t('footer_terms'), t('footer_disclaimer')].map(item => (
                <li key={item}>
                  <span className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors cursor-pointer">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-2">
            <Shield size={14} className="text-zinc-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">{t('footer_disclaimer')} — </span>
              <span className="text-zinc-600 text-xs leading-relaxed">{t('footer_disclaimer_text')}</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-zinc-900">
          <p className="text-zinc-600 text-xs">
            © {new Date().getFullYear()} OzScan AI. {t('footer_rights')}
          </p>
          <div className="flex items-center gap-1 text-zinc-600 text-xs">
            <span>Powered by</span>
            <span className="text-green-600 font-medium">Gemini AI</span>
            <span>·</span>
            <span>Built for Enterprise</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
