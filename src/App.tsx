import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { ScannerPage } from './pages/ScannerPage';
import { BattlePage } from './pages/BattlePage';
import { WatchlistPage } from './pages/WatchlistPage';
import { PricingPage } from './pages/PricingPage';
import { SettingsPage } from './pages/SettingsPage';

function AppContent() {
  const {
    currentPage, theme, isAuthenticated,
    setShowAuthModal, setAuthModalMode, setCurrentPage,
  } = useApp();

  const requireAuth = () => {
    if (!isAuthenticated) {
      setAuthModalMode('login');
      setShowAuthModal(true);
      return false;
    }
    return true;
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':      return <HomePage />;
      case 'dashboard':
        if (!requireAuth()) return <HomePage />;
        return <DashboardPage />;
      case 'scanner':   return <ScannerPage />;
      case 'battle':    return <BattlePage />;
      case 'watchlist': return <WatchlistPage />;
      case 'pricing':   return <PricingPage />;
      case 'settings':
        if (!requireAuth()) return <HomePage />;
        return <SettingsPage />;
      default:          return <HomePage />;
    }
  };

  const showFooter = !['dashboard', 'settings'].includes(currentPage);

  // Root background adapts to theme
  const rootBg = theme === 'light' ? 'min-h-screen bg-[#f8fafc] flex flex-col' : 'min-h-screen bg-black flex flex-col';

  return (
    <div className={rootBg}>
      <Navbar />
      <main className="flex-1">
        {/* Dashboard exit button — navigates back to home */}
        {currentPage === 'dashboard' && (
          <button
            onClick={() => setCurrentPage('home')}
            aria-label="Ana Sayfaya Dön"
            className={`fixed top-[72px] right-4 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shadow-lg border transition-all ${
              theme === 'light'
                ? 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
            {theme === 'light' ? 'Kapat' : 'Kapat'}
          </button>
        )}
        {renderPage()}
      </main>
      {showFooter && <Footer />}
      <AuthModal />
    </div>
  );
}

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
