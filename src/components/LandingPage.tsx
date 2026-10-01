import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { JARS, SPLIT_JARS, formatMoney } from '../constants/jars';
import {
  Check,
  ChevronDown,
  ArrowRight,
  TrendingDown,
  Layers,
  Sparkles,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Flame,
  PieChart,
  Target,
  FileSpreadsheet,
  Coins,
  Repeat,
  Compass,
  Users,
  Bell,
  HeartHandshake,
  Receipt,
  CheckCircle2,
} from 'lucide-react';

interface LandingPageProps {
  onOpenApp: () => void;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenApp, onOpenAuth }) => {
  const { state } = useApp();
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroIncome, setHeroIncome] = useState(3200);

  // Monitor scroll for nav styling
  useEffect(() => {
    const handleScroll = () => {
      setNavScrolled(window.scrollY > 24);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Compute live hero split values
  const heroSplit = React.useMemo(() => {
    const amt = Number(heroIncome) || 0;
    const res: Record<string, number> = {};
    let totalPct = 0;
    SPLIT_JARS.forEach((j) => {
      totalPct += state.pcts[j.key] || j.defaultPct;
    });
    let allocated = 0;
    SPLIT_JARS.forEach((j, i) => {
      const pct = state.pcts[j.key] || j.defaultPct;
      if (i === SPLIT_JARS.length - 1) {
        res[j.key] = Math.max(0, Math.round((amt - allocated) * 100) / 100);
      } else {
        const share = Math.round(((amt * pct) / totalPct) * 100) / 100;
        allocated += share;
        res[j.key] = share;
      }
    });
    return res;
  }, [heroIncome, state.pcts]);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF9] text-[#1A1220] selection:bg-teal-500 selection:text-white">
      {/* ============ NAVIGATION ============ */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          navScrolled
            ? 'bg-[#FDFBF9]/95 backdrop-blur-md shadow-sm border-b border-neutral-200/60 py-3.5'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between">
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 font-black text-xl tracking-tight cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-teal-500/30">
              D
            </div>
            <span className={navScrolled ? 'text-[#1A1220]' : 'text-white'}>
              Dudumo<span className="text-teal-400">.</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
            <button
              onClick={() => scrollToSection('jars')}
              className={`transition-colors cursor-pointer ${
                navScrolled ? 'text-neutral-600 hover:text-teal-600' : 'text-white/80 hover:text-white'
              }`}
            >
              The 8 Jars
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className={`transition-colors cursor-pointer ${
                navScrolled ? 'text-neutral-600 hover:text-teal-600' : 'text-white/80 hover:text-white'
              }`}
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('how')}
              className={`transition-colors cursor-pointer ${
                navScrolled ? 'text-neutral-600 hover:text-teal-600' : 'text-white/80 hover:text-white'
              }`}
            >
              How it works
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className={`transition-colors cursor-pointer ${
                navScrolled ? 'text-neutral-600 hover:text-teal-600' : 'text-white/80 hover:text-white'
              }`}
            >
              FAQ
            </button>
          </nav>

          <div className="flex items-center gap-3">
            {state.user ? (
              <button
                onClick={onOpenApp}
                className="py-2 px-5 rounded-full text-xs font-bold bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md shadow-teal-500/25 hover:shadow-teal-500/40 active:scale-95 transition-all cursor-pointer"
              >
                Launch App
              </button>
            ) : (
              <>
                <button
                  onClick={() => onOpenAuth('signin')}
                  className={`hidden sm:inline-block text-xs font-bold px-3 py-2 transition-colors cursor-pointer ${
                    navScrolled ? 'text-neutral-700 hover:text-teal-600' : 'text-white/80 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="py-2.5 px-5 rounded-full text-xs font-bold bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md shadow-teal-500/25 hover:shadow-teal-500/40 active:scale-95 transition-all cursor-pointer"
                >
                  Get Started Free
                </button>
              </>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-white bg-white/10 border border-white/20"
              aria-label="Toggle navigation menu"
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span className="h-0.5 bg-current rounded-full" />
                <span className="h-0.5 bg-current rounded-full" />
                <span className="h-0.5 bg-current rounded-full" />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#150D1F] border-b border-white/10 px-6 py-6 text-white space-y-4">
            <button
              onClick={() => scrollToSection('jars')}
              className="block w-full text-left font-semibold py-1.5 text-neutral-300 hover:text-white"
            >
              The 8 Jars
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="block w-full text-left font-semibold py-1.5 text-neutral-300 hover:text-white"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('how')}
              className="block w-full text-left font-semibold py-1.5 text-neutral-300 hover:text-white"
            >
              How it works
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="block w-full text-left font-semibold py-1.5 text-neutral-300 hover:text-white"
            >
              FAQ
            </button>
            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              {state.user ? (
                <button
                  onClick={onOpenApp}
                  className="w-full py-2.5 rounded-xl font-bold bg-teal-500 text-white text-center"
                >
                  Open App
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth('signup');
                    }}
                    className="w-full py-2.5 rounded-xl font-bold bg-teal-500 text-white text-center"
                  >
                    Get Started Free
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth('signin');
                    }}
                    className="w-full py-2.5 rounded-xl font-semibold bg-white/10 text-white text-center"
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ============ HERO SECTION ============ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0B0710] via-[#150D1F] to-[#1E1330] pt-32 pb-24 text-white">
        {/* Ambient background glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-24 right-0 w-[30rem] h-[30rem] bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-5 sm:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/15 text-xs font-semibold text-neutral-200">
              <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-teal-500 to-teal-400 text-white font-black text-[10px] uppercase tracking-wider">
                Free
              </span>
              <span>Forever · No card required · 8 Jars</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-balance">
              Every paycheck. <br />
              <span className="bg-gradient-to-r from-teal-300 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
                Every jar. Handled.
              </span>
            </h1>

            <p className="text-lg text-neutral-300 max-w-xl leading-relaxed">
              Dudumo splits your money across <strong>8 Jars the moment it lands</strong> — rent, bills,
              food, debt, emergencies, goals, guilt-free fun and retirement. You never budget again.
              You just live inside a system that already works.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={() => (state.user ? onOpenApp() : onOpenAuth('signup'))}
                className="py-4 px-8 rounded-full font-bold text-base text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 shadow-xl shadow-teal-500/30 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>{state.user ? 'Open Dashboard' : 'Get Started Free'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => scrollToSection('jars')}
                className="py-4 px-7 rounded-full font-bold text-base text-white/90 bg-white/10 hover:bg-white/15 border border-white/15 active:scale-95 transition-all cursor-pointer"
              >
                See how the Jars work
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-neutral-400 pt-2">
              <Check className="w-4 h-4 text-teal-400" />
              <span>Free forever</span>
              <span>·</span>
              <span>No card required</span>
              <span>·</span>
              <span>Instant auto-split</span>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10 max-w-lg">
              <div>
                <b className="block text-2xl lg:text-3xl font-black text-white">42,000+</b>
                <span className="text-xs text-neutral-400">People auto-sorting</span>
              </div>
              <div>
                <b className="block text-2xl lg:text-3xl font-black text-white">81%</b>
                <span className="text-xs text-neutral-400">Less money stress</span>
              </div>
              <div>
                <b className="block text-2xl lg:text-3xl font-black text-white">$19M+</b>
                <span className="text-xs text-neutral-400">Auto-sorted this year</span>
              </div>
            </div>
          </div>

          {/* Interactive Hero Simulator Mockup */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl bg-white/[0.08] backdrop-blur-xl border border-white/15 p-5 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-white/10">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-teal-400/80" />
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-teal-300">
                  Live Auto-Split Simulator
                </div>
              </div>

              {/* Income input pill */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-500/25 to-teal-400/10 border border-teal-400/30 mb-4">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-teal-300 mb-1">
                  <span>Paycheck Lands In Inbox</span>
                  <span className="text-[10px] text-white/70">Interactive</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{state.currency}</span>
                  <input
                    type="number"
                    value={heroIncome}
                    onChange={(e) => setHeroIncome(Number(e.target.value) || 0)}
                    className="w-full text-3xl font-black text-white bg-transparent focus:outline-none focus:ring-0 border-b border-teal-400/40 pb-0.5"
                    step="100"
                    min="100"
                  />
                </div>
                <div className="text-xs text-teal-200/90 mt-1 font-medium flex items-center justify-between">
                  <span>▲ Auto-splits in 0.4s across 7 funded jars</span>
                  <span>Try changing the number</span>
                </div>
              </div>

              {/* 7 jar split bars */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {SPLIT_JARS.map((j) => {
                  const share = heroSplit[j.key] || 0;
                  const pct = state.pcts[j.key] || j.defaultPct;
                  return (
                    <div
                      key={j.key}
                      className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5 flex items-center gap-3"
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs text-white shrink-0"
                        style={{ backgroundColor: j.color }}
                      >
                        {j.letter}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="font-semibold text-neutral-200 truncate">{j.name}</span>
                          <span className="font-black text-white">
                            {formatMoney(share, state.currency)}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, pct * 2.8)}%`, backgroundColor: j.color }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-neutral-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  <span>Rent & bills protected</span>
                </span>
                <span className="font-bold text-teal-300">100% of income assigned</span>
              </div>
            </div>

            {/* Floating floating card badge */}
            <div className="hidden sm:flex absolute -top-4 -left-6 items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#150D1F]/95 backdrop-blur-md border border-white/15 text-xs font-semibold text-white shadow-xl">
              <span>🏠 Rent funded</span>
              <span className="text-teal-300 font-bold">11 days early ✓</span>
            </div>
            <div className="hidden sm:flex absolute -bottom-4 -right-4 items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#150D1F]/95 backdrop-blur-md border border-white/15 text-xs font-semibold text-white shadow-xl">
              <span>🎯 Vacation goal</span>
              <span className="text-teal-300 font-bold">+$544 reserved</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ COMPANY STRIP ============ */}
      <div className="bg-[#F7F3EE] border-y border-neutral-200/80 py-8">
        <div className="max-w-6xl mx-auto px-5 text-center">
          <p className="text-xs uppercase tracking-widest font-bold text-neutral-400 mb-5">
            Designed for modern income earners & freelancers from
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 font-black text-lg text-neutral-400 tracking-tight">
            <span>STRIPE</span>
            <span>NOTION</span>
            <span>SHOPIFY</span>
            <span>FIGMA</span>
            <span>LINEAR</span>
            <span>VERCEL</span>
          </div>
        </div>
      </div>

      {/* ============ PROBLEM SECTION ============ */}
      <section className="py-24 max-w-6xl mx-auto px-5 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-600 mb-3">
            <span>The Real Problem</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-900 text-balance">
            You don't have a spending problem. <br />
            You have a sorting problem.
          </h2>
          <p className="text-neutral-500 mt-4 text-base leading-relaxed">
            Every month money comes in and evaporates into a single unorganized checking account.
            Traditional spreadsheets and restrictive budget apps fail because they ask you to
            remember 50 rules.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-7 rounded-3xl bg-gradient-to-b from-rose-50/50 to-white border border-rose-100 shadow-sm">
            <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-5">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Money evaporates in 72 hours</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Payday feels victorious on Friday. By Tuesday, rent, food, and miscellaneous debit
              charges have turned checking back into a countdown clock.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-gradient-to-b from-rose-50/50 to-white border border-rose-100 shadow-sm">
            <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-5">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Bills ambush you mid-month</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              You knew the quarterly insurance and electricity bills were coming, but no pile held
              their money aside. Now savings get cannibalized.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-gradient-to-b from-rose-50/50 to-white border border-rose-100 shadow-sm">
            <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-5">
              <TrendingDown className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Savings never survive</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              You move $300 to savings on the 1st. By the 23rd you quietly transfer $220 back to
              checking for "one small thing." The cycle repeats endlessly.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-gradient-to-b from-rose-50/50 to-white border border-rose-100 shadow-sm">
            <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Debt quietly compounds</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Minimum payments keep debt calm on the surface while high APR silently eats future
              income. Without dedicated auto-funding, the balance stays flat.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-gradient-to-b from-rose-50/50 to-white border border-rose-100 shadow-sm">
            <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-5">
              <PieChart className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">You don't actually know</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Ask yourself what you spent on dining out or subscriptions last month. Most people
              can't answer, so the same invisible leaks repeat.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-gradient-to-b from-rose-50/50 to-white border border-rose-100 shadow-sm">
            <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-5">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Every month is a fresh guess</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              No automated architecture. Just a mental math calculation rebuilt while standing in
              line at checkout. It is cognitively draining.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-xl font-bold text-neutral-800">
            It is not a willpower problem. It is a{' '}
            <span className="text-teal-600 underline decoration-teal-300 decoration-2">
              system architecture problem
            </span>
            .
          </p>
        </div>
      </section>

      {/* ============ EMOTIONAL PHOTO BAND ============ */}
      <section className="bg-[#0B0710] py-0 border-y border-white/10 overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative group overflow-hidden h-72 sm:h-80 bg-neutral-900">
            <img
              src="/src/assets/images/family_peaceful_evening_1790837295943.jpg"
              alt="Family relaxed and laughing together at home"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0710] via-black/40 to-transparent p-6 flex flex-col justify-end">
              <b className="text-white text-base font-bold">Rent was already handled.</b>
              <span className="text-xs text-neutral-300 mt-1">
                So the evening belonged to them — not to anxiety.
              </span>
            </div>
          </div>

          <div className="relative group overflow-hidden h-72 sm:h-80 bg-neutral-900">
            <img
              src="/src/assets/images/traveler_sunrise_journey_1790837308377.jpg"
              alt="Traveller enjoying a serene coastal sunrise"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0710] via-black/40 to-transparent p-6 flex flex-col justify-end">
              <b className="text-white text-base font-bold">The trip wasn't a splurge.</b>
              <span className="text-xs text-neutral-300 mt-1">
                It was funded quietly in the Goals jar, one split at a time.
              </span>
            </div>
          </div>

          <div className="relative group overflow-hidden h-72 sm:h-80 bg-neutral-900">
            <img
              src="/src/assets/images/relief_smiling_person_1790837281398.jpg"
              alt="Smiling person experiencing financial calm"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0710] via-black/40 to-transparent p-6 flex flex-col justify-end">
              <b className="text-white text-base font-bold">Unplanned cushion is intact.</b>
              <span className="text-xs text-neutral-300 mt-1">
                When the tire punctured, no one panicked.
              </span>
            </div>
          </div>

          <div className="relative group overflow-hidden h-72 sm:h-80 bg-neutral-900">
            <img
              src="/src/assets/images/couple_calm_finances_1790837320116.jpg"
              alt="Couple calmly and happily reviewing their budget"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0710] via-black/40 to-transparent p-6 flex flex-col justify-end">
              <b className="text-white text-base font-bold">Zero money arguments.</b>
              <span className="text-xs text-neutral-300 mt-1">
                The rules do the heavy lifting; you just enjoy life.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 8 JARS SYSTEM ============ */}
      <section id="jars" className="py-24 bg-gradient-to-b from-[#0B0710] to-[#150D1F] text-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-400">
              The Dudumo System
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mt-2 text-balance">
              Eight jars. One split. Zero guesswork.
            </h2>
            <p className="text-neutral-300 mt-4 text-base">
              Every time money lands in your Income Inbox, Dudumo immediately fans it out across the
              seven jars that keep your life running — including one you're explicitly commanded to
              enjoy.
            </p>
            <div className="mt-4 text-sm font-black tracking-[0.3em] text-teal-300">
              D · U · D · U · M · O · R
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {JARS.map((j) => (
              <div
                key={j.key}
                className="relative rounded-3xl bg-white/[0.05] border border-white/10 p-6 flex flex-col justify-between overflow-hidden hover:bg-white/[0.08] transition-colors"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: j.color }}
                />
                <div>
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl text-white mb-4 shadow-lg"
                    style={{ backgroundColor: j.color }}
                  >
                    {j.letter}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1.5">{j.name}</h3>
                  <p className="text-xs text-neutral-300 leading-relaxed">{j.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-400">
                    {j.key === 'inbox' ? 'Pass-through' : `Default ${j.defaultPct}%`}
                  </span>
                  <span
                    className="font-bold text-[11px] px-2 py-0.5 rounded-full bg-white/10 uppercase tracking-wider"
                    style={{ color: j.color }}
                  >
                    {j.short}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick CTA inside jars */}
          <div className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-teal-500/20 via-teal-400/10 to-emerald-500/20 border border-teal-400/30 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-xl font-bold text-white">
                Customize your percentages anytime
              </h4>
              <p className="text-sm text-neutral-300 mt-1">
                You know your life best. Adjust any jar to match your exact expenses. Dudumo ensures
                the total always equals 100%.
              </p>
            </div>
            <button
              onClick={() => (state.user ? onOpenApp() : onOpenAuth('signup'))}
              className="py-3.5 px-6 rounded-full font-bold text-sm bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-500/25 active:scale-95 transition-all whitespace-nowrap cursor-pointer shrink-0"
            >
              Get Started Free →
            </button>
          </div>
        </div>
      </section>

      {/* ============ FEATURES SECTION ============ */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
              Everything In The Box
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-900 mt-2 text-balance">
              Twelve tools. One calm system.
            </h2>
            <p className="text-neutral-500 mt-3 text-base">
              Dudumo is not a restrictive budget app. It is the complete personal finance operating
              system — built around the auto-split. And it is completely free.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-[#FDFBF9] border border-neutral-200/80 hover:border-teal-300 hover:shadow-lg transition-all group">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Coins className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 mb-1.5">
                Income Inbox & Auto-Split
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Every payment lands in one staging area, then divides instantly across your jars
                using your target formula.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FDFBF9] border border-neutral-200/80 hover:border-teal-300 hover:shadow-lg transition-all group">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 mb-1.5">The 8 Jars</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Seven funded life categories plus an inbox. You set the percentages; Dudumo
                handles the precision math.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FDFBF9] border border-neutral-200/80 hover:border-teal-300 hover:shadow-lg transition-all group">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <PieChart className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 mb-1.5">Smart Budgets per Jar</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Set monthly spending limits for each jar and monitor live spend-to-date and color
                warnings.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FDFBF9] border border-neutral-200/80 hover:border-teal-300 hover:shadow-lg transition-all group">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 mb-1.5">Named Savings Goals</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Set targets, deadlines, and live circular progress rings. Shows monthly amount
                needed to reach each finish line.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FDFBF9] border border-neutral-200/80 hover:border-teal-300 hover:shadow-lg transition-all group">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TrendingDown className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 mb-1.5">Debt Payoff Tracker</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Track balance, APR and minimum payments. See your debt-free projection date with
                Snowball or Avalanche strategies.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FDFBF9] border border-neutral-200/80 hover:border-teal-300 hover:shadow-lg transition-all group">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 mb-1.5">Recurring Bills Calendar</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Every recurring bill listed by due day. Mark paid in one tap to instantly log
                against your Bills jar.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FDFBF9] border border-neutral-200/80 hover:border-teal-300 hover:shadow-lg transition-all group">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Repeat className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 mb-1.5">Subscription Detector</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Flags forgotten streaming and recurring charges so you can cancel what you no longer
                use.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FDFBF9] border border-neutral-200/80 hover:border-teal-300 hover:shadow-lg transition-all group">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 mb-1.5">Net Worth Tracker</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Add assets and liabilities. Watch your net position march in the positive direction
                month after month.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FDFBF9] border border-neutral-200/80 hover:border-teal-300 hover:shadow-lg transition-all group">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 mb-1.5">Spending Insights</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Plain-language observations: "Daily Needs rose 14% this month." Actionable advice,
                no convoluted charts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FDFBF9] border border-neutral-200/80 hover:border-teal-300 hover:shadow-lg transition-all group">
              <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 mb-1.5">Shared Jars & Household</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Invite a partner or family member to shared jars so household finances stay clear
                and transparent.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FDFBF9] border border-neutral-200/80 hover:border-teal-300 hover:shadow-lg transition-all group">
              <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 mb-1.5">Smart Alerts</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Low jar balance warnings, bill due date nudges, and goal milestones to keep you
                in the flow.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FDFBF9] border border-neutral-200/80 hover:border-teal-300 hover:shadow-lg transition-all group">
              <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 mb-1.5">CSV Data Exports</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                One-click export for tax time, spreadsheets, or your accountant. Your financial
                data is always yours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how" className="py-24 bg-[#F7F3EE] border-t border-neutral-200/80">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-900 mt-2 text-balance">
              Set it up once. It runs forever.
            </h2>
            <p className="text-neutral-500 mt-3 text-base">
              Four steps from money anxiety to an automatic system that sorts your life while you sleep.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 text-white font-black text-lg flex items-center justify-center mx-auto mb-4 shadow-md shadow-teal-500/30">
                1
              </div>
              <h3 className="font-bold text-base text-neutral-900 mb-1">Create free account</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Sign up in under 30 seconds. No credit card required. Full instant access to all 8 Jars.
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 text-white font-black text-lg flex items-center justify-center mx-auto mb-4 shadow-md shadow-teal-500/30">
                2
              </div>
              <h3 className="font-bold text-base text-neutral-900 mb-1">Set jar percentages</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Choose how each paycheck splits. Defaults total 100% and can be adjusted at any time.
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 text-white font-black text-lg flex items-center justify-center mx-auto mb-4 shadow-md shadow-teal-500/30">
                3
              </div>
              <h3 className="font-bold text-base text-neutral-900 mb-1">Get paid & auto-split</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Money hits your Income Inbox and automatically distributes into all 7 jars in under a
                second.
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 text-white font-black text-lg flex items-center justify-center mx-auto mb-4 shadow-md shadow-teal-500/30">
                4
              </div>
              <h3 className="font-bold text-base text-neutral-900 mb-1">Live your life</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Rent is already funded. Emergencies are cushioned. Retirement is compounding. Spend
                your fun jar without guilt.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS & STATS ============ */}
      <section className="py-24 bg-white border-t border-neutral-200/80">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
              Real Results
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-900 mt-2 text-balance">
              People who stopped guessing
            </h2>
            <p className="text-neutral-500 mt-3 text-base">
              Thousands of people manage their finances with Dudumo. Here is what changed for them.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 rounded-3xl bg-[#FDFBF9] border border-neutral-200/80 flex flex-col justify-between">
              <div>
                <div className="text-amber-400 text-sm tracking-widest mb-3">★★★★★</div>
                <blockquote className="text-sm text-neutral-700 leading-relaxed">
                  "I used to move $300 to savings on the 1st and steal it back by the 20th. Now{' '}
                  <strong className="text-neutral-900">
                    Unplanned is funded before I can touch it.
                  </strong>{' '}
                  I haven't dipped into savings in 5 months."
                </blockquote>
              </div>
              <div className="flex items-center gap-3 mt-6 pt-5 border-t border-neutral-200/80">
                <div className="w-10 h-10 rounded-full bg-teal-500 text-white font-bold flex items-center justify-center text-xs">
                  AO
                </div>
                <div>
                  <b className="block text-xs font-bold text-neutral-900">Amara O.</b>
                  <span className="text-[11px] text-neutral-500">Product Designer · Lagos</span>
                </div>
              </div>
            </div>

            <div className="p-7 rounded-3xl bg-[#FDFBF9] border border-neutral-200/80 flex flex-col justify-between">
              <div>
                <div className="text-amber-400 text-sm tracking-widest mb-3">★★★★★</div>
                <blockquote className="text-sm text-neutral-700 leading-relaxed">
                  "Freelance income is unpredictable. Dudumo doesn't care — every invoice that lands
                  still splits correctly.{' '}
                  <strong className="text-neutral-900">
                    Rent is never late, and retirement is quietly compounding.
                  </strong>"
                </blockquote>
              </div>
              <div className="flex items-center gap-3 mt-6 pt-5 border-t border-neutral-200/80">
                <div className="w-10 h-10 rounded-full bg-purple-500 text-white font-bold flex items-center justify-center text-xs">
                  DK
                </div>
                <div>
                  <b className="block text-xs font-bold text-neutral-900">Daniel K.</b>
                  <span className="text-[11px] text-neutral-500">Freelance Developer · Nairobi</span>
                </div>
              </div>
            </div>

            <div className="p-7 rounded-3xl bg-[#FDFBF9] border border-neutral-200/80 flex flex-col justify-between">
              <div>
                <div className="text-amber-400 text-sm tracking-widest mb-3">★★★★★</div>
                <blockquote className="text-sm text-neutral-700 leading-relaxed">
                  "The Own Enjoyment jar was the true breakthrough.{' '}
                  <strong className="text-neutral-900">
                    I can spend on dinner without guilt spirals
                  </strong>{' '}
                  because I know bills and retirement are already funded."
                </blockquote>
              </div>
              <div className="flex items-center gap-3 mt-6 pt-5 border-t border-neutral-200/80">
                <div className="w-10 h-10 rounded-full bg-pink-500 text-white font-bold flex items-center justify-center text-xs">
                  FS
                </div>
                <div>
                  <b className="block text-xs font-bold text-neutral-900">Fatima S.</b>
                  <span className="text-[11px] text-neutral-500">Secondary Teacher · Accra</span>
                </div>
              </div>
            </div>
          </div>

          {/* Big stat banner */}
          <div className="mt-12 rounded-3xl bg-gradient-to-r from-[#150D1F] to-[#1E1330] p-8 text-white grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <b className="block text-3xl font-black text-teal-400">42,000+</b>
              <span className="text-xs text-neutral-400">People auto-sorting</span>
            </div>
            <div>
              <b className="block text-3xl font-black text-teal-400">81%</b>
              <span className="text-xs text-neutral-400">Less stress in 90 days</span>
            </div>
            <div>
              <b className="block text-3xl font-black text-teal-400">$19M+</b>
              <span className="text-xs text-neutral-400">Sorted this year</span>
            </div>
            <div>
              <b className="block text-3xl font-black text-teal-400">4.9 / 5</b>
              <span className="text-xs text-neutral-400">Community satisfaction</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FREE FOREVER CARD ============ */}
      <section className="py-24 bg-[#F7F3EE]">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <div className="rounded-3xl bg-white border-2 border-teal-500 p-8 sm:p-12 shadow-2xl text-center relative overflow-hidden">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 text-white text-xs font-black uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>100% Free Forever</span>
            </div>

            <h3 className="text-3xl font-black text-neutral-900 tracking-tight">
              Dudumo Complete
            </h3>
            <p className="text-sm text-neutral-500 mt-2">
              All 8 Jars, every tool, forever. No credit cards, no trial periods, no paywalls.
            </p>

            <div className="my-8">
              <span className="text-6xl font-black text-neutral-900">$0</span>
              <span className="text-neutral-500 text-sm font-semibold"> / forever</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-lg mx-auto mb-8 text-sm text-neutral-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
                <span>All 8 Jars + auto-split</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
                <span>Unlimited income entries</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
                <span>Goals, debts & bills tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
                <span>Net worth & smart insights</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
                <span>Paycheck forecaster</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
                <span>CSV & data export</span>
              </div>
            </div>

            <button
              onClick={() => (state.user ? onOpenApp() : onOpenAuth('signup'))}
              className="w-full sm:w-auto py-4 px-10 rounded-full font-bold text-base text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 shadow-xl shadow-teal-500/30 active:scale-95 transition-all cursor-pointer"
            >
              {state.user ? 'Open Dashboard' : 'Get Started Free →'}
            </button>
            <p className="text-xs text-neutral-400 mt-3 font-medium">
              Takes 30 seconds · No card required
            </p>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section id="faq" className="py-24 max-w-4xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">FAQ</span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-900 mt-2">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          <details className="group p-6 rounded-2xl bg-white border border-neutral-200/80 open:border-teal-500 open:shadow-md transition-all">
            <summary className="font-bold text-base text-neutral-900 cursor-pointer list-none flex items-center justify-between">
              <span>Is Dudumo really free?</span>
              <ChevronDown className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" />
            </summary>
            <p className="text-sm text-neutral-600 mt-3 leading-relaxed">
              Yes, 100%. Every single feature, every jar, and every calculation tool is free forever.
              There are no surprise trials, no credit card requirements, and no locked pro tiers.
            </p>
          </details>

          <details className="group p-6 rounded-2xl bg-white border border-neutral-200/80 open:border-teal-500 open:shadow-md transition-all">
            <summary className="font-bold text-base text-neutral-900 cursor-pointer list-none flex items-center justify-between">
              <span>How is this different from budgeting apps?</span>
              <ChevronDown className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" />
            </summary>
            <p className="text-sm text-neutral-600 mt-3 leading-relaxed">
              Traditional budget apps look backwards to tell you what you did wrong after you spent.
              Dudumo is an <strong>income-first sorting engine</strong>. The moment money lands, it is
              pre-allocated into separate jars. You only spend what is inside that jar, removing the
              guilt and cognitive overload.
            </p>
          </details>

          <details className="group p-6 rounded-2xl bg-white border border-neutral-200/80 open:border-teal-500 open:shadow-md transition-all">
            <summary className="font-bold text-base text-neutral-900 cursor-pointer list-none flex items-center justify-between">
              <span>Do I have to connect my bank account?</span>
              <ChevronDown className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" />
            </summary>
            <p className="text-sm text-neutral-600 mt-3 leading-relaxed">
              No. Dudumo does not ask for or require bank credentials. This ensures your financial
              data remains private, secure, and works seamlessly across any country, bank, or currency.
            </p>
          </details>

          <details className="group p-6 rounded-2xl bg-white border border-neutral-200/80 open:border-teal-500 open:shadow-md transition-all">
            <summary className="font-bold text-base text-neutral-900 cursor-pointer list-none flex items-center justify-between">
              <span>What if my income is irregular or freelance?</span>
              <ChevronDown className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" />
            </summary>
            <p className="text-sm text-neutral-600 mt-3 leading-relaxed">
              That is where Dudumo shines brightest. Whether you receive $40, $400, or $4,000, the
              percentages scale automatically. Rent, bills, and taxes get their proportional slice
              every single time.
            </p>
          </details>

          <details className="group p-6 rounded-2xl bg-white border border-neutral-200/80 open:border-teal-500 open:shadow-md transition-all">
            <summary className="font-bold text-base text-neutral-900 cursor-pointer list-none flex items-center justify-between">
              <span>Can I customize my jar percentages?</span>
              <ChevronDown className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" />
            </summary>
            <p className="text-sm text-neutral-600 mt-3 leading-relaxed">
              Absolutely. In the Settings tab, you can adjust each of the 7 split jars. The app provides
              live validation to ensure your total adds up to exactly 100%.
            </p>
          </details>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="py-24 bg-gradient-to-br from-[#0B0710] via-[#150D1F] to-[#1E1330] text-white text-center">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
            Your Next Paycheck
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mt-2 text-balance">
            Your next paycheck could sort itself.
          </h2>
          <p className="text-neutral-300 mt-4 text-base max-w-xl mx-auto leading-relaxed">
            Create your free account today. All 8 Jars. Every tool unlocked. No card required.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => (state.user ? onOpenApp() : onOpenAuth('signup'))}
              className="py-4 px-8 rounded-full font-bold text-base text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 shadow-xl shadow-teal-500/30 active:scale-95 transition-all cursor-pointer"
            >
              {state.user ? 'Open Dashboard' : 'Get Started Free'}
            </button>
            <button
              onClick={() => scrollToSection('jars')}
              className="py-4 px-7 rounded-full font-bold text-base text-white/80 bg-white/10 hover:bg-white/15 border border-white/15 transition-all cursor-pointer"
            >
              See How It Works
            </button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-teal-400" /> Free forever
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-teal-400" /> All features included
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-teal-400" /> No card required
            </span>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-[#0B0710] border-t border-white/10 text-neutral-400 py-16 text-sm">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5 font-black text-xl text-white">
              <div className="w-8 h-8 rounded-xl bg-teal-500 flex items-center justify-center text-white font-black text-base">
                D
              </div>
              <span>Dudumo.</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              The money system that funds your life before you can spend it. Eight jars, one split,
              zero guesswork. Free forever.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Product</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => scrollToSection('jars')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  The 8 Jars
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('features')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('how')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  How it works
                </button>
              </li>
              <li>
                <button onClick={onOpenApp} className="hover:text-teal-400 transition-colors font-bold cursor-pointer">
                  Launch App
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">System</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="text-neutral-500">Daily Needs (D)</span></li>
              <li><span className="text-neutral-500">Utilities & Bills (U)</span></li>
              <li><span className="text-neutral-500">Debt Payoff (D)</span></li>
              <li><span className="text-neutral-500">Unplanned Fund (U)</span></li>
              <li><span className="text-neutral-500">Money Goals (M)</span></li>
              <li><span className="text-neutral-500">Own Enjoyment (O)</span></li>
              <li><span className="text-neutral-500">Retirement (R)</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Privacy & Trust</h4>
            <p className="text-xs text-neutral-400 leading-relaxed mb-3">
              Your financial figures are processed and preserved in your browser. No third-party bank
              scraping, no selling data.
            </p>
            <div className="text-xs text-neutral-500">
              © {new Date().getFullYear()} Dudumo. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
