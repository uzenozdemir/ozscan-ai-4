import { useState, useEffect, useRef } from 'react';
import {
  Search, Zap, AlertCircle, CheckCircle, TrendingUp,
  Leaf, Scale, Star, Shield, Plus, FlaskConical, Play, X
} from 'lucide-react';
import { useApp, ScanResult } from '../context/AppContext';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

// ─────────────────────────────────────────────
//  🔑  GEMINI API KEY
//  Paste your Gemini API key between the quotes below,
//  OR set VITE_GEMINI_KEY in a .env file at the project root.
// ─────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const OZSCAN_GEMINI_KEY: string = (import.meta as any).env?.VITE_GEMINI_KEY ?? "AIzaSyCUw2Bz2_3LQwPRjaIO7Bog-_ZX53i_RxA";

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// ─────────────────────────────────────────────
//  Return type – carries an isSimulated flag
// ─────────────────────────────────────────────
interface AnalysisResult extends Partial<ScanResult> {
  isSimulated: boolean;
  notCommercial?: boolean;
}

// ─────────────────────────────────────────────
//  Core Gemini call
// ─────────────────────────────────────────────
async function analyzeWithGemini(brand: string, lang: string): Promise<AnalysisResult> {

  // ── Log key status once per call so the developer can see it in the console ──
  const keyPresent = Boolean(OZSCAN_GEMINI_KEY && OZSCAN_GEMINI_KEY.trim().length > 0);
  console.log(
    `%c[OzScan AI] analyzeWithGemini called`,
    'color:#22c55e;font-weight:bold',
    { brand, lang, geminiKeyPresent: keyPresent, keyPrefix: keyPresent ? OZSCAN_GEMINI_KEY.slice(0, 8) + '…' : '(empty)' }
  );

  const outputLang = lang === 'tr' ? 'Turkish' : 'English';
  const prompt = `You are an enterprise sustainability intelligence analyst.

STEP 1 — ENTITY VERIFICATION:
First, determine whether "${brand}" is a real, recognizable commercial entity (a company, brand, retailer, or product line).
- If it is NOT a real commercial entity (e.g. random letters like "asdasd", "abc", "xyz", single characters, gibberish, or a non-commercial word), you MUST return this exact JSON and nothing else:
{"notCommercial": true}

STEP 2 — IF it IS a real commercial entity, return ONLY a valid JSON object (no markdown, no code blocks, no trailing commas) with this exact structure:
{
  "notCommercial": false,
  "supplyChainScore": <integer 0-100>,
  "carbonScore": <integer 0-100>,
  "laborGrade": "<A | B | C | D | F>",
  "sentimentScore": <integer 0-100>,
  "overallScore": <integer 0-100>,
  "carbonEstimate": "<estimated CO2 e.g. '2.4M tonnes/year'>",
  "summary": "<2-3 sentence analysis in ${outputLang}>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "risks": ["<risk 1>", "<risk 2>", "<risk 3>"]
}
Base your analysis on publicly available ESG data, sustainability reports, and news.
Respond ONLY with the JSON object — no other text whatsoever.`;

  // ── LIVE API PATH ──────────────────────────────────────────────────────────
  if (keyPresent) {
    console.log('[OzScan AI] 🚀 Attempting LIVE Gemini API call…');
    try {
      const response = await fetch(`${GEMINI_ENDPOINT}?key=${OZSCAN_GEMINI_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
        }),
      });

      // Always read the body so we can log error details
      const rawBody = await response.text();

      if (!response.ok) {
        // Parse API error for a readable message
        let apiError: unknown = rawBody;
        try { apiError = JSON.parse(rawBody); } catch { /* keep as string */ }
        console.error(
          `[OzScan AI] ❌ Gemini API returned HTTP ${response.status} ${response.statusText}`,
          apiError
        );
        console.warn('[OzScan AI] ⚠️ Falling back to simulation because of API error above.');
        return buildSimulation(brand, lang);
      }

      // Parse the successful response
      let data: unknown;
      try {
        data = JSON.parse(rawBody);
      } catch (parseErr) {
        console.error('[OzScan AI] ❌ Failed to parse Gemini HTTP response as JSON:', parseErr, rawBody);
        return buildSimulation(brand, lang);
      }

      // Extract the text content from the Gemini response envelope
      const text: string =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (data as any)?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

      if (!text) {
        console.error('[OzScan AI] ❌ Gemini response contained no text. Full response:', data);
        return buildSimulation(brand, lang);
      }

      console.log('[OzScan AI] 📄 Raw Gemini text output:', text);

      // Strip any accidental markdown fences
      const cleaned = text
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      let parsed: Partial<ScanResult> & { notCommercial?: boolean };
      try {
        parsed = JSON.parse(cleaned);
      } catch (jsonErr) {
        console.error('[OzScan AI] ❌ JSON.parse of Gemini text failed:', jsonErr);
        console.error('[OzScan AI] ❌ Cleaned text that failed to parse:', cleaned);
        return buildSimulation(brand, lang);
      }

      // ── Commercial entity check ──────────────────────────────────────────
      if (parsed.notCommercial === true) {
        console.warn('[OzScan AI] ⚠️ Gemini flagged input as non-commercial entity:', brand);
        return { isSimulated: false, notCommercial: true };
      }

      console.log('%c[OzScan AI] ✅ LIVE Gemini result received', 'color:#22c55e;font-weight:bold', parsed);
      return { ...parsed, isSimulated: false, notCommercial: false };

    } catch (networkErr) {
      // Network-level failure (DNS, CORS, timeout, etc.)
      console.error('[OzScan AI] ❌ Network/fetch error during Gemini call:', networkErr);
      console.warn('[OzScan AI] ⚠️ Falling back to simulation due to network error.');
      return buildSimulation(brand, lang);
    }
  }

  // ── SIMULATION PATH ────────────────────────────────────────────────────────
  console.warn(
    '%c[OzScan AI] ⚠️ OZSCAN_GEMINI_KEY is empty — running in SIMULATION mode.',
    'color:#f59e0b;font-weight:bold',
    'To enable live AI analysis, set VITE_GEMINI_KEY in your .env file or paste the key directly into ScannerPage.tsx.'
  );
  return buildSimulation(brand, lang);
}

// ─────────────────────────────────────────────
//  Simulation builder (deterministic-ish)
// ─────────────────────────────────────────────
function buildSimulation(brand: string, lang: string): AnalysisResult {
  // Simulate network latency
  // (caller awaits, but this function is sync — we just return immediately;
  //  the fake delay was previously inside the main function — keeping it here
  //  would block the UI thread. Instead we show the spinner while real fetch runs.)
  const brandLower = brand.toLowerCase();
  const isKnownGreen = ['patagonia', 'tesla', 'ikea', 'unilever', 'microsoft'].some(b =>
    brandLower.includes(b)
  );
  const isKnownBad = ['shein', 'primark', 'boohoo', 'fast fashion'].some(b =>
    brandLower.includes(b)
  );

  const base = isKnownGreen ? 75 : isKnownBad ? 30 : 48 + Math.floor(Math.random() * 30);
  const v = () => Math.floor((Math.random() - 0.5) * 20);

  const supplyChainScore = clamp(base + v(), 10, 100);
  const carbonScore      = clamp(base + v(), 10, 100);
  const sentimentScore   = clamp(base + 10 + v(), 10, 100);
  const overallScore     = Math.round((supplyChainScore + carbonScore + sentimentScore) / 3);
  const laborGrade =
    overallScore >= 80 ? 'A' :
    overallScore >= 65 ? 'B' :
    overallScore >= 50 ? 'C' :
    overallScore >= 35 ? 'D' : 'F';

  const isTr = lang === 'tr';

  const summary = isTr
    ? `${brand}, sürdürülebilirlik performansı açısından ${overallScore >= 70 ? 'sektörün üst diliminde' : overallScore >= 50 ? 'ortalama düzeyde' : 'geliştirilmesi gereken alanlarda'} yer almaktadır. Tedarik zinciri şeffaflığı ${supplyChainScore >= 70 ? 'güçlü' : 'sınırlı'} görünürken, karbon emisyon yönetimi ${carbonScore >= 70 ? 'olumlu' : 'endişe verici'} sinyaller vermektedir. Kullanıcı duygu analizi ${sentimentScore >= 70 ? 'büyük ölçüde pozitif' : 'karışık'} sonuçlar göstermektedir.`
    : `${brand} ranks ${overallScore >= 70 ? 'in the top tier' : overallScore >= 50 ? 'at average levels' : 'in areas needing improvement'} for sustainability. Supply chain transparency is ${supplyChainScore >= 70 ? 'strong' : 'limited'}, while carbon management sends ${carbonScore >= 70 ? 'positive' : 'concerning'} signals. User sentiment analysis shows ${sentimentScore >= 70 ? 'largely positive' : 'mixed'} results.`;

  const strengths = isTr
    ? ['Güçlü marka bilinirliği ve tüketici güveni', 'Sürdürülebilirlik raporlama standartlarına uyum', 'Yenilenebilir enerji yatırımları']
    : ['Strong brand recognition and consumer trust', 'Compliance with sustainability reporting standards', 'Renewable energy investments'];

  const risks = isTr
    ? ['Tedarik zincirinde izlenemeyen alt yükleniciler', 'Scope 3 emisyonlarında yetersiz şeffaflık', 'Gelişmekte olan pazarlarda işçi hakları riskleri']
    : ['Untracked sub-contractors in supply chain', 'Insufficient Scope 3 emissions transparency', 'Labor rights risks in emerging markets'];

  return {
    supplyChainScore,
    carbonScore,
    laborGrade,
    sentimentScore,
    overallScore,
    carbonEstimate: `${(Math.random() * 5 + 0.5).toFixed(1)}M tonnes/year`,
    summary,
    strengths,
    risks,
    isSimulated: true,
  };
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

// ─────────────────────────────────────────────
//  Sub-components
// ─────────────────────────────────────────────
function ScoreBar({ label, score, max = 100 }: { label: string; score: number; max?: number }) {
  const pct = (score / max) * 100;
  const color =
    pct >= 80 ? 'bg-green-500' :
    pct >= 60 ? 'bg-blue-500' :
    pct >= 40 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-zinc-400">{label}</span>
        <span className="text-white font-semibold">{score}</span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Main Page
// ─────────────────────────────────────────────
export function ScannerPage() {
  const {
    t, lang, isAuthenticated, user,
    setShowAuthModal, setAuthModalMode,
    spendCredit, addScanResult, addToWatchlist, setCurrentPage,
    demoQuery, clearDemoQuery,
  } = useApp();

  const [query, setQuery]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [result, setResult]             = useState<ScanResult | null>(null);
  const [isSimulated, setIsSimulated]   = useState(false);
  const [error, setError]               = useState('');
  const [inputError, setInputError]     = useState('');
  const [authWarning, setAuthWarning]   = useState(false);
  const [creditWarning, setCreditWarning] = useState(false);
  const [addedToWatch, setAddedToWatch] = useState(false);
  const [isDemoMode, setIsDemoMode]     = useState(false);
  const [demoStep, setDemoStep]         = useState(0); // 0=idle, 1=typing, 2=scanning, 3=done
  const typewriterRef                   = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Log key status once on mount so the developer can check immediately
  useEffect(() => {
    const keyPresent = Boolean(OZSCAN_GEMINI_KEY && OZSCAN_GEMINI_KEY.trim().length > 0);
    if (keyPresent) {
      console.log(
        '%c[OzScan AI] 🔑 GEMINI KEY DETECTED on page load.',
        'color:#22c55e;font-weight:bold',
        'Prefix:', OZSCAN_GEMINI_KEY.slice(0, 8) + '…'
      );
    } else {
      console.warn(
        '%c[OzScan AI] ⚠️ No Gemini key found on page load.',
        'color:#f59e0b;font-weight:bold',
        'Set VITE_GEMINI_KEY in .env or paste directly into ScannerPage.tsx line ~17.'
      );
    }
  }, []);

  // ── Demo Engine ────────────────────────────────────────────────────────────
  // Triggered when HomePage's "Demo İzle" button sets demoQuery in context.
  useEffect(() => {
    if (!demoQuery) return;

    console.log('%c[OzScan AI] 🎬 Demo mode triggered for:', 'color:#22c55e;font-weight:bold', demoQuery);

    // Reset everything
    setResult(null);
    setError('');
    setInputError('');
    setAuthWarning(false);
    setCreditWarning(false);
    setIsSimulated(false);
    setIsDemoMode(true);
    setDemoStep(1);

    // ── Phase 1: Typewriter — type the brand name char by char ──
    const target = demoQuery;
    let currentText = '';
    let charIndex = 0;

    const typeChar = () => {
      if (charIndex < target.length) {
        currentText += target[charIndex];
        setQuery(currentText);
        charIndex++;
        typewriterRef.current = setTimeout(typeChar, 60);
      } else {
        // ── Phase 2: Trigger the scan after a short pause ──
        typewriterRef.current = setTimeout(() => {
          setDemoStep(2);
          setLoading(true);

          // ── Phase 3: Reveal the rich pre-built Zara result after 2.8s ──
          typewriterRef.current = setTimeout(() => {
            const isTr = lang === 'tr';
            const zaraDemo: ScanResult = {
              id: `demo_${Date.now()}`,
              brand: 'Zara (Inditex)',
              url: 'www.zara.com',
              date: new Date().toISOString(),
              supplyChainScore: 62,
              carbonScore: 54,
              laborGrade: 'C',
              sentimentScore: 71,
              overallScore: 61,
              carbonEstimate: '3.2M tonnes CO₂/year',
              summary: isTr
                ? 'Zara (Inditex), hızlı moda sektörünün en büyük oyuncularından biri olarak sürdürülebilirlik açısından karma bir performans sergilenmektedir. Tedarik zinciri şeffaflığı sektör ortalamasının üzerinde olsa da karbon emisyonları ve işçi hakları konularında önemli iyileştirme alanları mevcuttur. "Join Life" koleksiyonu gibi girişimler olumlu adımlar olarak değerlendirilmektedir.'
                : 'Zara (Inditex), one of the largest fast fashion players, presents a mixed sustainability profile. While its supply chain transparency is above the industry average, significant improvement areas exist in carbon emissions and labor rights. Initiatives like the "Join Life" collection represent positive steps forward.',
              strengths: isTr
                ? ['Sektör liderliğinde tedarik zinciri takip sistemi', '"Join Life" ekolojik koleksiyon girişimi', 'Kapsamlı ESG raporlama şeffaflığı']
                : ['Industry-leading supply chain traceability system', '"Join Life" ecological collection initiative', 'Comprehensive ESG reporting transparency'],
              risks: isTr
                ? ['Hızlı moda modeli yüksek tekstil atığı üretmektedir', 'Üretim ülkelerinde işçi ücretleri hâlâ tartışma konusu', 'Scope 3 emisyonları yetersiz raporlanmaktadır']
                : ['Fast fashion model generates significant textile waste', 'Worker wages in production countries remain debated', 'Scope 3 emissions are under-reported'],
            };

            setResult(zaraDemo);
            setIsSimulated(true); // demo data, not live API
            setLoading(false);
            setDemoStep(3);
            clearDemoQuery();

            console.log('%c[OzScan AI] ✅ Demo result rendered', 'color:#22c55e;font-weight:bold', zaraDemo);
          }, 2800);
        }, 500);
      }
    };

    // Kick off typewriter after a 300ms pause so the page renders first
    typewriterRef.current = setTimeout(typeChar, 300);

    return () => {
      if (typewriterRef.current) clearTimeout(typewriterRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoQuery]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    const raw = query.trim();

    // ── 1. Input validation: URL or brand name with ≥3 meaningful chars ──
    setInputError('');
    setAuthWarning(false);
    setCreditWarning(false);
    setError('');

    if (!raw) return;

    // Check: is it a URL (contains a dot and slash structure) OR a brand name of ≥3 real chars?
    const isUrl = /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/i.test(raw);
    const isBrandName = raw.replace(/\s/g, '').length >= 3 && /[a-zA-ZğüşıöçĞÜŞİÖÇ]{3,}/.test(raw);

    if (!isUrl && !isBrandName) {
      setInputError(t('input_invalid'));
      return;
    }

    if (!isAuthenticated) {
      setAuthWarning(true);
      return;
    }
    if (!user || user.credits <= 0) {
      setCreditWarning(true);
      return;
    }

    setLoading(true);
    setResult(null);
    setIsSimulated(false);

    try {
      // ── 2. Pass raw input — analyzeWithGemini's prompt includes entity verification ──
      const data = await analyzeWithGemini(raw, lang);

      // ── 3. Non-commercial entity detected by Gemini ──────────────────────
      if (data.notCommercial) {
        setInputError(t('input_not_commercial'));
        setLoading(false);
        return;
      }

      const scanResult: ScanResult = {
        id:               `scan_${Date.now()}`,
        brand:            query.trim(),
        url:              query.includes('.') ? query : `${query.toLowerCase().replace(/\s+/g, '')}.com`,
        date:             new Date().toISOString(),
        supplyChainScore: data.supplyChainScore ?? 50,
        carbonScore:      data.carbonScore      ?? 50,
        laborGrade:       data.laborGrade       ?? 'C',
        sentimentScore:   data.sentimentScore   ?? 50,
        overallScore:     data.overallScore     ?? 50,
        carbonEstimate:   data.carbonEstimate   ?? 'N/A',
        summary:          data.summary          ?? '',
        strengths:        data.strengths        ?? [],
        risks:            data.risks            ?? [],
      };

      spendCredit();
      addScanResult(scanResult);
      setResult(scanResult);
      setIsSimulated(data.isSimulated);
      setAddedToWatch(false);

      if (data.isSimulated) {
        console.warn(
          '%c[OzScan AI] ℹ️ Result rendered in SIMULATION mode.',
          'color:#f59e0b;font-weight:bold'
        );
      } else {
        console.log(
          '%c[OzScan AI] ✅ Result rendered from LIVE Gemini API.',
          'color:#22c55e;font-weight:bold'
        );
      }
    } catch (err) {
      // This catch is a final safety net — analyzeWithGemini handles errors internally.
      console.error('[OzScan AI] ❌ Unexpected top-level error in handleScan:', err);
      setError(t('error'));
    }

    setLoading(false);
  };

  const radarData = result
    ? [
        { subject: t('chart_supply'),    val: result.supplyChainScore },
        { subject: t('chart_carbon'),    val: result.carbonScore },
        {
          subject: t('chart_labor'),
          val: result.laborGrade === 'A' ? 90 : result.laborGrade === 'B' ? 75 : result.laborGrade === 'C' ? 60 : result.laborGrade === 'D' ? 40 : 20,
        },
        { subject: t('chart_sentiment'), val: result.sentimentScore },
        { subject: t('chart_overall'),   val: result.overallScore },
      ]
    : [];

  const handleAddToWatchlist = () => {
    if (result) { addToWatchlist(result.brand); setAddedToWatch(true); }
  };

  const gradeColor: Record<string, string> = {
    A: 'text-green-400', B: 'text-blue-400', C: 'text-yellow-400', D: 'text-orange-400', F: 'text-red-400',
  };
  const overallColor = result
    ? result.overallScore >= 80 ? 'text-green-400'
    : result.overallScore >= 60 ? 'text-blue-400'
    : result.overallScore >= 40 ? 'text-yellow-400'
    : 'text-red-400'
    : '';

  return (
    <div className="min-h-screen bg-black pt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

        {/* ── Header ── */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">{t('scanner_title')}</h1>
          <p className="text-zinc-400 mt-1">{t('scanner_desc')}</p>

          {/* Key status indicator */}
          {OZSCAN_GEMINI_KEY && OZSCAN_GEMINI_KEY.trim() ? (
            <div className="mt-3 inline-flex items-center gap-2 text-xs bg-green-500/10 border border-green-500/30 text-green-400 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              {t('scanner_api_connected')}
            </div>
          ) : (
            <div className="mt-3 inline-flex items-center gap-2 text-xs bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-3 py-1.5 rounded-full">
              <FlaskConical size={12} />
              {t('scanner_demo_mode_label')}
            </div>
          )}
        </div>

        {/* ── Demo Mode Banner ── */}
        {isDemoMode && (
          <div className="mb-6 relative overflow-hidden bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-green-500/10 border border-green-500/40 rounded-2xl p-4">
            {/* Animated shimmer line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <Play size={16} className="text-green-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 font-semibold text-sm">
                      {demoStep === 1 ? t('demo_phase_typing') :
                       demoStep === 2 ? t('demo_phase_scanning') :
                       t('demo_phase_done')}
                    </span>
                    {demoStep < 3 && (
                      <span className="flex gap-0.5">
                        <span className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    )}
                  </div>
                   <p className="text-zinc-400 text-xs mt-0.5">{t('demo_discover')}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (typewriterRef.current) clearTimeout(typewriterRef.current);
                  setIsDemoMode(false);
                  setDemoStep(0);
                  setLoading(false);
                  setQuery('');
                  clearDemoQuery();
                }}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors flex-shrink-0"
                title={t('demo_skip')}
              >
                <X size={16} />
              </button>
            </div>
            {/* Progress bar */}
            <div className="mt-3 h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-700"
                style={{ width: demoStep === 1 ? '33%' : demoStep === 2 ? '66%' : '100%' }}
              />
            </div>
          </div>
        )}

        {/* ── Search Form ── */}
        <form onSubmit={handleScan} className="mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                value={query}
                onChange={e => {
                  if (isDemoMode && demoStep < 3) return; // block manual input during typewriter
                  setQuery(e.target.value);
                  if (inputError) setInputError('');
                  if (isDemoMode) { setIsDemoMode(false); setDemoStep(0); }
                }}
                readOnly={isDemoMode && demoStep < 3}
                placeholder={t('scanner_placeholder')}
                className={`w-full bg-zinc-900 border text-white rounded-xl pl-12 pr-4 py-4 text-base transition-colors placeholder:text-zinc-600 outline-none
                  ${inputError ? 'border-red-500/60' :
                    isDemoMode && demoStep < 3 ? 'border-green-500/60 caret-green-400' :
                    isDemoMode && demoStep === 3 ? 'border-green-500/40' :
                    'focus:border-green-500 border-zinc-800'}`}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-400 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-black font-bold px-6 py-4 rounded-xl transition-all min-w-[140px] justify-center"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  {t('scanner_scanning')}
                </>
              ) : (
                <>
                  <Zap size={18} />
                  {t('scanner_btn')}
                </>
              )}
            </button>
          </div>
          <p className="text-zinc-600 text-xs mt-2 ml-1">
            {user ? `${user.credits} kredi mevcut · ` : ''}{t('scanner_cost')}
          </p>
          {/* Input validation error */}
          {inputError && (
            <div className="flex items-center gap-2 mt-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
              <AlertCircle size={15} className="flex-shrink-0" />
              {inputError}
            </div>
          )}
        </form>

        {/* ── Warnings ── */}
        {authWarning && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-yellow-400 flex-shrink-0" />
              <span className="text-yellow-400 text-sm">{t('scanner_auth_required')}</span>
            </div>
            <button
              onClick={() => { setAuthModalMode('login'); setShowAuthModal(true); }}
              className="text-xs bg-yellow-500 text-black font-semibold px-3 py-1.5 rounded-lg hover:bg-yellow-400 transition-colors"
            >
              {t('nav_login')}
            </button>
          </div>
        )}

        {creditWarning && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              <span className="text-red-400 text-sm">{t('scanner_credit_required')}</span>
            </div>
            <button
              onClick={() => setCurrentPage('pricing')}
              className="text-xs bg-red-500 text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-red-400 transition-colors"
            >
              {t('settings_buy_credits')}
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400" />
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center mb-6">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 border-4 border-green-500/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-t-green-500 rounded-full animate-spin" />
              <div
                className="absolute inset-2 border-4 border-t-emerald-300 rounded-full animate-spin"
                style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}
              />
            </div>
            <p className="text-white font-medium">{t('scanner_scanning')}</p>
            <p className="text-zinc-500 text-sm mt-1">
              {OZSCAN_GEMINI_KEY && OZSCAN_GEMINI_KEY.trim()
                ? 'Gemini AI ile canlı analiz yapılıyor…'
                : 'Demo verisi hazırlanıyor…'}
            </p>
          </div>
        )}

        {/* ── Results ── */}
        {result && !loading && (
          <div className="space-y-5">

            {/* Result header + simulation badge */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold text-white">
                  {t('scanner_results')} — {result.brand}
                </h2>
                {isDemoMode ? (
                  <span className="inline-flex items-center gap-1.5 text-xs bg-blue-500/10 border border-blue-500/30 text-blue-400 px-2.5 py-1 rounded-full">
                    <Play size={11} />
                    {lang === 'tr' ? 'DEMO · Örnek Analiz' : 'DEMO · Sample Analysis'}
                  </span>
                ) : isSimulated ? (
                  <span className="inline-flex items-center gap-1.5 text-xs bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-2.5 py-1 rounded-full">
                    <FlaskConical size={11} />
                    {lang === 'tr' ? 'SİMÜLASYON · API anahtarı yok' : 'SIMULATION · No API key'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs bg-green-500/10 border border-green-500/30 text-green-400 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    {lang === 'tr' ? 'CANLI · Gemini AI' : 'LIVE · Gemini AI'}
                  </span>
                )}
              </div>
              <button
                onClick={handleAddToWatchlist}
                disabled={addedToWatch}
                className="flex items-center gap-1.5 text-sm border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {addedToWatch
                  ? <CheckCircle size={14} className="text-green-400" />
                  : <Plus size={14} />}
                {addedToWatch ? t('watch_add') + ' ✓' : t('nav_watchlist')}
              </button>
            </div>

            {/* Overall score banner */}
            <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 border border-zinc-700 rounded-2xl p-6 flex items-center gap-6">
              <div className="text-center">
                <div className={`text-5xl font-black ${overallColor}`}>{result.overallScore}</div>
                <div className="text-zinc-500 text-xs mt-1">{t('scanner_overall')}</div>
              </div>
              <div className="flex-1">
                <p className="text-zinc-300 text-sm leading-relaxed">{result.summary}</p>
              </div>
            </div>

            {/* Score grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Shield, label: t('scanner_supply_score'), value: result.supplyChainScore, sub: undefined,                  type: 'score' },
                { icon: Leaf,   label: t('scanner_carbon_est'),   value: result.carbonScore,      sub: result.carbonEstimate,       type: 'score' },
                { icon: Scale,  label: t('scanner_labor_grade'),  value: result.laborGrade,        sub: undefined,                  type: 'grade' },
                { icon: Star,   label: t('scanner_sentiment_live'), value: result.sentimentScore,  sub: undefined,                  type: 'score' },
              ].map(({ icon: Icon, label, value, sub, type }) => (
                <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-center">
                  <Icon size={20} className="text-green-400 mx-auto mb-2" />
                  <div className={`text-3xl font-black mb-1 ${type === 'grade' ? gradeColor[value as string] || 'text-white' : 'text-white'}`}>
                    {value}
                  </div>
                  {sub && <div className="text-zinc-500 text-xs mb-1">{sub}</div>}
                  <div className="text-zinc-500 text-xs">{label}</div>
                </div>
              ))}
            </div>

            {/* Charts + Score bars */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4">{t('chart_brand_comparison')}</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#27272a" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 11 }} />
                    <Radar dataKey="val" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-white font-semibold mb-2">{t('scanner_results')}</h3>
                <ScoreBar label={t('scanner_supply_score')}    score={result.supplyChainScore} />
                <ScoreBar label={t('scanner_carbon_est')}      score={result.carbonScore} />
                <ScoreBar label={t('scanner_sentiment_live')}  score={result.sentimentScore} />
                <ScoreBar label={t('scanner_overall')}         score={result.overallScore} />
              </div>
            </div>

            {/* Strengths & Risks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-6">
                <h3 className="text-green-400 font-semibold flex items-center gap-2 mb-4">
                  <TrendingUp size={16} /> {t('scanner_strengths')}
                </h3>
                <ul className="space-y-2">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                      <CheckCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
                <h3 className="text-red-400 font-semibold flex items-center gap-2 mb-4">
                  <AlertCircle size={16} /> {t('scanner_risks')}
                </h3>
                <ul className="space-y-2">
                  {result.risks.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                      <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
