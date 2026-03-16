import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, Lang, TranslationKey } from '../i18n/translations';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  plan: 'free' | 'pro' | 'elite';
  credits: number;
  totalScans: number;
  memberSince: string;
  company?: string;
  watchlist: string[];
  scanHistory: ScanResult[];
}

export interface ScanResult {
  id: string;
  brand: string;
  url: string;
  date: string;
  supplyChainScore: number;
  carbonScore: number;
  laborGrade: string;
  sentimentScore: number;
  overallScore: number;
  summary: string;
  strengths: string[];
  risks: string[];
  carbonEstimate: string;
}

export type Theme = 'dark' | 'light';

interface AppContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
  theme: Theme;
  toggleTheme: () => void;
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  signup: (name: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  spendCredit: () => boolean;
  addCredits: (amount: number) => void;
  addScanResult: (result: ScanResult) => void;
  addToWatchlist: (brand: string) => void;
  removeFromWatchlist: (brand: string) => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  showAuthModal: boolean;
  setShowAuthModal: (v: boolean) => void;
  authModalMode: 'login' | 'signup';
  setAuthModalMode: (m: 'login' | 'signup') => void;
  demoQuery: string;
  triggerDemo: (brand: string) => void;
  clearDemoQuery: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'ozscan_users';
const SESSION_KEY = 'ozscan_session';

function getUsers(): User[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveUsers(users: User[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function getSession(): User | null {
  try {
    const id = localStorage.getItem(SESSION_KEY);
    if (!id) return null;
    const users = getUsers();
    return users.find(u => u.id === id) || null;
  } catch {
    return null;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    return (localStorage.getItem('ozscan_lang') as Lang) || 'tr';
  });
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('ozscan_theme') as Theme) || 'dark';
  });
  const [user, setUser] = useState<User | null>(getSession);
  const [currentPage, setCurrentPage] = useState('home');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [demoQuery, setDemoQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('ozscan_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('ozscan_theme', theme);
    // Apply theme class to root html element
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    return translations[lang][key] || translations['en'][key] || key;
  }, [lang]);

  const login = useCallback((email: string, password: string) => {
    const users = getUsers();
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) {
      return { success: false, error: translations[lang].auth_error_invalid };
    }
    localStorage.setItem(SESSION_KEY, found.id);
    setUser(found);
    return { success: true };
  }, [lang]);

  const signup = useCallback((name: string, email: string, password: string) => {
    const users = getUsers();
    if (users.find(u => u.email === email)) {
      return { success: false, error: translations[lang].auth_error_exists };
    }
    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      email,
      password,
      plan: 'free',
      credits: 5,
      totalScans: 0,
      memberSince: new Date().toISOString().split('T')[0],
      watchlist: [],
      scanHistory: [],
    };
    users.push(newUser);
    saveUsers(users);
    localStorage.setItem(SESSION_KEY, newUser.id);
    setUser(newUser);
    return { success: true };
  }, [lang]);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    setCurrentPage('home');
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    const users = getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      users[idx] = updated;
      saveUsers(users);
    }
    setUser(updated);
  }, [user]);

  const spendCredit = useCallback((): boolean => {
    if (!user || user.credits <= 0) return false;
    updateUser({ credits: user.credits - 1 });
    return true;
  }, [user, updateUser]);

  const addCredits = useCallback((amount: number) => {
    if (!user) return;
    updateUser({ credits: user.credits + amount });
  }, [user, updateUser]);

  const addScanResult = useCallback((result: ScanResult) => {
    if (!user) return;
    const history = [result, ...user.scanHistory].slice(0, 50);
    updateUser({ scanHistory: history, totalScans: user.totalScans + 1 });
  }, [user, updateUser]);

  const addToWatchlist = useCallback((brand: string) => {
    if (!user) return;
    if (!user.watchlist.includes(brand)) {
      updateUser({ watchlist: [...user.watchlist, brand] });
    }
  }, [user, updateUser]);

  const removeFromWatchlist = useCallback((brand: string) => {
    if (!user) return;
    updateUser({ watchlist: user.watchlist.filter(b => b !== brand) });
  }, [user, updateUser]);

  const triggerDemo = useCallback((brand: string) => {
    setDemoQuery(brand);
    setCurrentPage('scanner');
  }, []);

  const clearDemoQuery = useCallback(() => {
    setDemoQuery('');
  }, []);

  return (
    <AppContext.Provider value={{
      lang, setLang, t,
      user, isAuthenticated: !!user,
      login, signup, logout, updateUser,
      spendCredit, addCredits, addScanResult,
      addToWatchlist, removeFromWatchlist,
      currentPage, setCurrentPage,
      showAuthModal, setShowAuthModal,
      authModalMode, setAuthModalMode,
      theme, toggleTheme,
      demoQuery, triggerDemo, clearDemoQuery,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
