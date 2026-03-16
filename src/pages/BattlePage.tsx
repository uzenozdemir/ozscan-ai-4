import { useState } from 'react';
import { Zap, AlertCircle, Shield, Leaf, Scale, Star, Trophy } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend } from 'recharts';

// ─────────────────────────────────────────────────────────────────────────────
//  Gemini key (inherits the same env variable as ScannerPage)
// ─────────────────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const OZSCAN_GEMINI_KEY: string = (import.meta as any).env?.VITE_GEMINI_KEY ?? 'AIzaSyCUw2Bz2_3LQwPRjaIO7Bog-_ZX53i_RxA';

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// ─────────────────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────────────────
interface BattleResult {
  brand: string;
  supplyChainScore: number;
  carbonScore: number;
  laborGrade: string;
  sentimentScore: number;
  overallScore: number;
  notCommercial?: boolean;
  isSimulated?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Input validation helper
// ─────────────────────────────────────────────────────────────────────────────
function isValidInput(val: string): boolean {
  const isUrl = /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/i.test(val);
  const isBrandName = val.replace(/\s/g, '').length >= 3 && /[a-zA-ZğüşıöçĞÜŞİÖÇ]{3,}/.test(val);
  return isUrl || isBrandName;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Gemini scan for a single brand
// ─────────────────────────────────────────────────────────────────────────────
async function geminiScanBrand(brand: string, lang: string): Promise<BattleResult> {
  const outputLang = lang === 'tr' ? 'Turkish' : 'English';
  const keyPresent = Boolean(OZSCAN_GEMINI_KEY && OZSCAN_GEMINI_KEY.trim().length > 0);

  const prompt = `You are an enterprise sustainability intelligence analyst.

STEP 1 — ENTITY VERIFICATION:
Determine whether "${brand}" is a real, recognizable commercial entity (company, brand, retailer, or product line).
If it is NOT a real commercial entity (e.g. random letters like "asdasd", single chars, gibberish), return ONLY:
{"notCommercial": true}

STEP 2 — IF it IS a real commercial entity, return ONLY valid JSON (no markdown, no code blocks):
{
  "notCommercial": false,
  "supplyChainScore": <integer 0-100>,
  "carbonScore": <integer 0-100>,
  "laborGrade": "<A | B | C | D | F>",
  "sentimentScore": <integer 0-100>,
  "overallScore": <integer 0-100>
}
Use publicly available ESG data. Output ONLY the JSON object.
Summary language: ${outputLang}.`;

  if (keyPresent) {
    console.log(`[OzScan Battle] 🚀 Live scan for "${brand}"…`);
    try {
      const response = await fetch(`${GEMINI_ENDPOINT}?key=${OZSCAN_GEMINI_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 512 },
        }),
      });

      const rawBody = await response.text();

      if (!response.ok) {
        let apiError: unknown = rawBody;
        try { apiError = JSON.parse(rawBody); } catch { /* keep as string */ }
        console.error(`[OzScan Battle] ❌ Gemini HTTP ${response.status} for "${brand}":`, apiError);
        return buildFallback(brand);
      }

      let envelope: unknown;
      try { envelope = JSON.parse(rawBody); } catch {
        console.error(`[OzScan Battle] ❌ Failed to parse envelope for "${brand}":`, rawBody);
        return buildFallback(brand);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const text: string = (envelope as any)?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      if (!text) {
        console.error(`[OzScan Battle] ❌ Empty Gemini text for "${brand}". Envelope:`, envelope);
        return buildFallback(brand);
      }

      const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

      let parsed: Partial<BattleResult> & { notCommercial?: boolean };
      try { parsed = JSON.parse(cleaned); } catch (err) {
        console.error(`[OzScan Battle] ❌ JSON.parse failed for "${brand}":`, err, cleaned);
        return buildFallback(brand);
      }

      if (parsed.notCommercial === true) {
        console.warn(`[OzScan Battle] ⚠️ "${brand}" flagged as non-commercial by Gemini`);
        return { brand, supplyChainScore: 0, carbonScore: 0, laborGrade: 'F', sentimentScore: 0, overallScore: 0, notCommercial: true, isSimulated: false };
      }

      console.log(`%c[OzScan Battle] ✅ Live result for "${brand}"`, 'color:#22c55e;font-weight:bold', parsed);
      return {
        brand,
        supplyChainScore: parsed.supplyChainScore ?? 50,
        carbonScore:      parsed.carbonScore      ?? 50,
        laborGrade:       parsed.laborGrade       ?? 'C',
        sentimentScore:   parsed.sentimentScore   ?? 50,
        overallScore:     parsed.overallScore     ?? 50,
        notCommercial: false,
        isSimulated: false,
      };
    } catch (networkErr) {
      console.error(`[OzScan Battle] ❌ Network error for "${brand}":`, networkErr);
      return buildFallback(brand);
    }
  }

  // ── Simulation fallback ──
  console.warn(`[OzScan Battle] ⚠️ No API key — simulating for "${brand}"`);
  return buildFallback(brand);
}

function buildFallback(brand: string): BattleResult {
  const base = 40 + Math.floor(Math.random() * 50);
  const v = () => Math.floor((Math.random() - 0.5) * 20);
  const s    = Math.min(100, Math.max(10, base + v()));
  const c    = Math.min(100, Math.max(10, base + v()));
  const sent = Math.min(100, Math.max(10, base + 10 + v()));
  const overall = Math.round((s + c + sent) / 3);
  const grade = overall >= 80 ? 'A' : overall >= 65 ? 'B' : overall >= 50 ? 'C' : overall >= 35 ? 'D' : 'F';
  return { brand, supplyChainScore: s, carbonScore: c, laborGrade: grade, sentimentScore: sent, overallScore: overall, notCommercial: false, isSimulated: true };
}

function laborToNum(grade: string) {
  return grade === 'A' ? 90 : grade === 'B' ? 75 : grade === 'C' ? 60 : grade === 'D' ? 40 : 20;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Page
// ─────────────────────────────────────────────────────────────────────────────
export function BattlePage() {
  const { t, lang, isAuthenticated, user, setShowAuthModal, setAuthModalMode, spendCredit, setCurrentPage } = useApp();

  const [brandA, setBrandA] = useState('');
  const [brandB, setBrandB] = useState('');
  const [inputErrorA, setInputErrorA] = useState('');
  const [inputErrorB, setInputErrorB] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultA, setResultA] = useState<BattleResult | null>(null);
  const [resultB, setResultB] = useState<BattleResult | null>(null);
  const [authWarning, setAuthWarning] = useState(false);
  const [creditWarning, setCreditWarning] = useState(false);

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();

    // ── Input validation ───────────────────────────────────────────────────
    let valid = true;
    if (!isValidInput(brandA.trim())) {
      setInputErrorA(t('input_invalid'));
      valid = false;
    } else {
      setInputErrorA('');
    }
    if (!isValidInput(brandB.trim())) {
      setInputErrorB(t('input_invalid'));
      valid = false;
    } else {
      setInputErrorB('');
    }
    if (!valid) return;

    setAuthWarning(false);
    setCreditWarning(false);

    if (!isAuthenticated) { setAuthWarning(true); return; }
    if (!user || user.credits < 2) { setCreditWarning(true); return; }

    setLoading(true);
    setResultA(null);
    setResultB(null);

    const [a, b] = await Promise.all([
      geminiScanBrand(brandA.trim(), lang),
      geminiScanBrand(brandB.trim(), lang),
    ]);

    // ── Non-commercial entity checks ──
    if (a.notCommercial) { setInputErrorA(t('input_not_commercial')); }
    if (b.notCommercial) { setInputErrorB(t('input_not_commercial')); }
    if (a.notCommercial || b.notCommercial) { setLoading(false); return; }

    spendCredit();
    spendCredit();
    setResultA(a);
    setResultB(b);
    setLoading(false);
  };

  // ── Winner logic: require ≥5 pt gap to declare a winner ─────────────────
  const GAP_THRESHOLD = 5;
  const winner = resultA && resultB
    ? Math.abs(resultA.overallScore - resultB.overallScore) < GAP_THRESHOLD
      ? 'insufficient'
      : resultA.overallScore > resultB.overallScore
        ? resultA.brand
        : resultB.brand
    : null;

  const radarData = resultA && resultB ? [
    { subject: t('chart_supply'),    A: resultA.supplyChainScore, B: resultB.supplyChainScore },
    { subject: t('chart_carbon'),    A: resultA.carbonScore,      B: resultB.carbonScore },
    { subject: t('chart_labor'),     A: laborToNum(resultA.laborGrade), B: laborToNum(resultB.laborGrade) },
    { subject: t('chart_sentiment'), A: resultA.sentimentScore,   B: resultB.sentimentScore },
    { subject: t('chart_overall'),   A: resultA.overallScore,     B: resultB.overallScore },
  ] : [];

  const gradeColor: Record<string, string> = {
    A: 'text-green-400', B: 'text-blue-400', C: 'text-yellow-400', D: 'text-orange-400', F: 'text-red-400',
  };

  const metrics = resultA && resultB ? [
    { label: t('scanner_supply_score'),    icon: Shield, a: resultA.supplyChainScore, b: resultB.supplyChainScore },
    { label: t('scanner_carbon_est'),      icon: Leaf,   a: resultA.carbonScore,      b: resultB.carbonScore },
    { label: t('scanner_sentiment_live'),  icon: Star,   a: resultA.sentimentScore,   b: resultB.sentimentScore },
    { label: t('scanner_overall'),         icon: Zap,    a: resultA.overallScore,      b: resultB.overallScore },
  ] : [];

  const anySimulated = (resultA?.isSimulated || resultB?.isSimulated) ?? false;

  return (
    <div className="min-h-screen bg-black pt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

        {/* ── Header ── */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">{t('battle_title')}</h1>
          <p className="text-zinc-400 mt-1">{t('battle_desc')}</p>
          {anySimulated && (
            <div className="mt-3 inline-flex items-center gap-2 text-xs bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-3 py-1.5 rounded-full">
              ⚗ {lang === 'tr' ? 'Simülasyon modu — API anahtarı yok' : 'Simulation mode — no API key'}
            </div>
          )}
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleCompare} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4 items-start">

            {/* Brand A */}
            <div>
              <label className="block text-sm text-zinc-400 mb-2">{t('battle_brand_a')}</label>
              <input
                value={brandA}
                onChange={e => { setBrandA(e.target.value); if (inputErrorA) setInputErrorA(''); }}
                placeholder="Nike, Tesla, H&M..."
                className={`w-full bg-zinc-800 border focus:border-green-500 text-white rounded-xl px-4 py-3 text-sm outline-none transition-colors placeholder:text-zinc-600 ${inputErrorA ? 'border-red-500/60' : 'border-zinc-700'}`}
              />
              {inputErrorA && (
                <p className="flex items-center gap-1 text-red-400 text-xs mt-1.5">
                  <AlertCircle size={12} className="flex-shrink-0" /> {inputErrorA}
                </p>
              )}
            </div>

            {/* VS separator */}
            <div className="flex items-center justify-center sm:pt-7">
              <div className="bg-zinc-800 border border-zinc-700 text-zinc-400 font-bold text-lg w-12 h-12 flex items-center justify-center rounded-xl">
                {t('battle_vs')}
              </div>
            </div>

            {/* Brand B */}
            <div>
              <label className="block text-sm text-zinc-400 mb-2">{t('battle_brand_b')}</label>
              <input
                value={brandB}
                onChange={e => { setBrandB(e.target.value); if (inputErrorB) setInputErrorB(''); }}
                placeholder="Adidas, Ford, Zara..."
                className={`w-full bg-zinc-800 border focus:border-blue-500 text-white rounded-xl px-4 py-3 text-sm outline-none transition-colors placeholder:text-zinc-600 ${inputErrorB ? 'border-red-500/60' : 'border-zinc-700'}`}
              />
              {inputErrorB && (
                <p className="flex items-center gap-1 text-red-400 text-xs mt-1.5">
                  <AlertCircle size={12} className="flex-shrink-0" /> {inputErrorB}
                </p>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !brandA.trim() || !brandB.trim()}
            className="mt-5 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 disabled:from-zinc-700 disabled:to-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl transition-all"
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />{t('scanner_scanning')}</>
            ) : (
              <><Zap size={18} />{t('battle_compare')}</>
            )}
          </button>
          <p className="text-zinc-600 text-xs mt-2 text-center">
            {user ? `${user.credits} ${t('nav_credits')} · ` : ''}
            {lang === 'tr' ? '2 kredi harcar' : 'costs 2 credits'}
          </p>
        </form>

        {/* ── Auth / Credit warnings ── */}
        {authWarning && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-yellow-400" />
              <span className="text-yellow-400 text-sm">{t('scanner_auth_required')}</span>
            </div>
            <button
              onClick={() => { setAuthModalMode('login'); setShowAuthModal(true); }}
              className="text-xs bg-yellow-500 text-black font-semibold px-3 py-1.5 rounded-lg"
            >
              {t('nav_login')}
            </button>
          </div>
        )}

        {creditWarning && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-red-400" />
              <span className="text-red-400 text-sm">
                {t('scanner_credit_required')} {lang === 'tr' ? '(2 kredi gerekli)' : '(2 credits required)'}
              </span>
            </div>
            <button onClick={() => setCurrentPage('pricing')} className="text-xs bg-red-500 text-white font-semibold px-3 py-1.5 rounded-lg">
              {t('settings_buy_credits')}
            </button>
          </div>
        )}

        {/* ── Results ── */}
        {resultA && resultB && !loading && (
          <div className="space-y-5">

            {/* Winner banner */}
            <div className={`rounded-2xl p-5 flex items-center gap-4 border ${
              winner === 'insufficient'
                ? 'bg-zinc-800/50 border-zinc-700'
                : winner
                  ? 'bg-yellow-500/10 border-yellow-500/30'
                  : 'bg-zinc-800/50 border-zinc-700'
            }`}>
              <Trophy size={28} className={winner && winner !== 'insufficient' ? 'text-yellow-400' : 'text-zinc-500'} />
              <div>
                <div className="text-white font-bold text-lg">
                  {winner === 'insufficient'
                    ? t('battle_winner_insufficient')
                    : winner
                      ? `🏆 ${t('battle_winner')}: ${winner}`
                      : t('battle_tie')}
                </div>
                <div className="text-zinc-400 text-sm">
                  {resultA.overallScore} vs {resultB.overallScore} — {t('scanner_overall')}
                  {winner === 'insufficient' && (
                    <span className="ml-2 text-zinc-500 text-xs">
                      ({lang === 'tr' ? 'Fark < 5 puan' : 'Gap < 5 pts'})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Radar chart */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4">{t('chart_brand_comparison')}</h3>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#27272a" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 11 }} />
                  <Radar name={resultA.brand} dataKey="A" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} />
                  <Radar name={resultB.brand} dataKey="B" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.15} />
                  <Legend wrapperStyle={{ color: '#a1a1aa', fontSize: '12px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Metric bars */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
              {metrics.map(({ label, icon: Icon, a, b }) => {
                const aWins = a > b + 2;
                const bWins = b > a + 2;
                return (
                  <div key={label}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={14} className="text-zinc-500" />
                      <span className="text-zinc-400 text-sm">{label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold w-8 text-right ${aWins ? 'text-green-400' : 'text-zinc-400'}`}>{a}</span>
                      <div className="flex-1 flex gap-1 h-3 rounded-full overflow-hidden bg-zinc-800">
                        <div className="bg-green-500 h-full rounded-full transition-all duration-700" style={{ width: `${(a / (a + b)) * 100}%` }} />
                        <div className="bg-blue-500 h-full rounded-full transition-all duration-700" style={{ width: `${(b / (a + b)) * 100}%` }} />
                      </div>
                      <span className={`text-sm font-bold w-8 ${bWins ? 'text-blue-400' : 'text-zinc-400'}`}>{b}</span>
                    </div>
                    <div className="flex justify-between text-xs text-zinc-600 mt-0.5 px-11">
                      <span>{resultA.brand}</span>
                      <span>{resultB.brand}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Labor grades */}
            <div className="grid grid-cols-2 gap-4">
              {[resultA, resultB].map((r) => (
                <div key={r.brand} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-center">
                  <Scale size={20} className="text-zinc-500 mx-auto mb-2" />
                  <div className={`text-4xl font-black mb-1 ${gradeColor[r.laborGrade] ?? 'text-zinc-400'}`}>{r.laborGrade}</div>
                  <div className="text-zinc-500 text-xs">{t('scanner_labor_grade')}</div>
                  <div className="text-white text-sm font-medium mt-1">{r.brand}</div>
                </div>
              ))}
            </div>

            {/* Insufficient data notice */}
            {winner === 'insufficient' && (
              <div className="bg-zinc-800/60 border border-zinc-700 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle size={18} className="text-zinc-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-zinc-300 text-sm font-medium">{t('battle_insufficient_data')}</p>
                  <p className="text-zinc-500 text-xs mt-1">
                    {lang === 'tr'
                      ? 'İki markanın puanları birbirine çok yakın. Kesin bir sonuç belirlemek mümkün değil.'
                      : 'The two brands scored too closely together. No definitive conclusion can be drawn.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
