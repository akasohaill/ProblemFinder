import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Zap, ChevronRight, BarChart3, Globe, AlertTriangle, ArrowLeft, Target, Wallet, Clock, Rocket, AlertCircle, ShieldCheck, Save, Check, BookMarked, X, Trash2 } from 'lucide-react';
import { cn } from './lib/utils';
import { analyzeLocation } from './services/geminiService';
import { AnalysisResponse, Problem } from './types';


// --- Local Storage Helper ---
const STORAGE_KEY = 'problemfinder_saved_ideas';

interface SavedIdea {
  id: number;
  problem: Problem;
  location: string;
  savedAt: string;
}

const saveIdea = (problem: Problem, location: string) => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const newIdea: SavedIdea = {
      id: Date.now(),
      problem,
      location,
      savedAt: new Date().toISOString()
    };
    saved.push(newIdea);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    return true;
  } catch (error) {
    console.error('Failed to save idea:', error);
    return false;
  }
};

const getSavedIdeas = (): SavedIdea[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

const deleteSavedIdea = (id: number) => {
  try {
    const saved = getSavedIdeas().filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    return true;
  } catch {
    return false;
  }
};

const isIdeaSaved = (problemTitle: string): boolean => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return saved.some((item: any) => item.problem.title === problemTitle);
  } catch {
    return false;
  }
};

// --- Saved Ideas Panel ---
const SavedIdeasPanel = ({
  onClose,
  onViewIdea,
}: {
  onClose: () => void;
  onViewIdea: (problem: Problem, location: string) => void;
}) => {
  const [ideas, setIdeas] = useState<SavedIdea[]>(getSavedIdeas());

  const handleDelete = (id: number) => {
    deleteSavedIdea(id);
    setIdeas(getSavedIdeas());
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      />

      {/* Drawer */}
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 250 }}
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-[#060d1a] border-l border-white/10 flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center">
              <BookMarked className="w-4 h-4 text-brand-primary" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base leading-none">Saved Ideas</h2>
              <span className="text-[11px] text-slate-500">{ideas.length} idea{ideas.length !== 1 ? 's' : ''} saved</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {ideas.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
                <BookMarked className="w-7 h-7 text-slate-600" />
              </div>
              <div>
                <p className="text-slate-400 font-semibold text-sm">No saved ideas yet</p>
                <p className="text-slate-600 text-xs mt-1">Explore a market and save ideas you like.</p>
              </div>
            </div>
          ) : (
            ideas.map((idea) => (
              <motion.div
                key={idea.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 40 }}
                className="group bg-white/[0.03] border border-white/5 rounded-2xl p-5 hover:border-brand-primary/30 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded font-bold uppercase tracking-widest text-slate-500">
                      {idea.location}
                    </span>
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-wider",
                      idea.problem.severity > 8 ? 'text-red-400' : idea.problem.severity > 5 ? 'text-orange-400' : 'text-emerald-400'
                    )}>
                      Priority {idea.problem.severity}/10
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(idea.id)}
                    className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 flex items-center justify-center transition-all shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>

                <h3 className="text-sm font-bold text-white mb-1 leading-snug">{idea.problem.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">{idea.problem.whoFaces}</p>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">{idea.problem.estAnnualRev}</span>
                  <button
                    onClick={() => {
                      onViewIdea(idea.problem, idea.location);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-brand-primary hover:text-white transition-colors"
                  >
                    View Details
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-3 pt-3 border-t border-white/5">
                  <span className="text-[10px] text-slate-600">
                    Saved {new Date(idea.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.aside>
    </>
  );
};

// --- Components ---

const Navbar = ({ savedCount, onOpenSaved }: { savedCount: number; onOpenSaved: () => void }) => (
  <nav className="fixed top-0 left-0 right-0 z-40 bg-[#030712]/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-between items-center">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
        <Zap className="w-5 h-5 text-black fill-black" />
      </div>
      <span className="font-bold text-xl tracking-tight text-white">ProblemFinder <span className="text-brand-primary">AI</span></span>
    </div>

    <button
      onClick={onOpenSaved}
      className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-brand-primary/30 transition-all text-sm font-semibold text-slate-300 hover:text-white"
    >
      <BookMarked className="w-4 h-4" />
      <span className="hidden sm:inline">Saved Ideas</span>
      {savedCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-brand-primary text-black text-[10px] font-black flex items-center justify-center">
          {savedCount > 9 ? '9+' : savedCount}
        </span>
      )}
    </button>
  </nav>
);

const SeverityBadge = ({ score }: { score: number }) => {
  const color = score > 8 ? 'text-red-400' : score > 5 ? 'text-orange-400' : 'text-emerald-400';
  return (
    <span className={cn("text-[11px] font-bold uppercase tracking-wider", color)}>
      Priority {score}/10
    </span>
  );
};

const ProblemCard = ({ problem, onClick }: { problem: Problem, onClick: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    onClick={onClick}
    className="bg-white/[0.03] p-6 rounded-2xl border border-white/5 hover:border-brand-primary/30 transition-all cursor-pointer group"
  >
    <div className="flex justify-between items-start mb-4">
      <SeverityBadge score={problem.severity} />
      <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-slate-500 font-bold uppercase tracking-widest">{problem.urgency}</span>
    </div>

    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-brand-primary transition-colors">{problem.title}</h3>
    <p className="text-sm text-slate-400 mb-6 line-clamp-2 leading-relaxed">{problem.whoFaces}</p>

    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
      <div className="flex flex-col">
        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Revenue Potential</span>
        <span className="text-sm font-bold text-emerald-400">{problem.estAnnualRev}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-brand-primary transform group-hover:translate-x-1 transition-all" />
    </div>
  </motion.div>
);

const DetailView = ({ problem, location, onBack, onSave }: { problem: Problem, location: string, onBack: () => void, onSave: () => void }) => {
  const [saved, setSaved] = useState(isIdeaSaved(problem.title));
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  const handleSave = () => {
    const success = saveIdea(problem, location);
    if (success) {
      setSaved(true);
      setShowSavedMessage(true);
      onSave(); // refresh navbar count
      setTimeout(() => setShowSavedMessage(false), 3000);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} className="space-y-12">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-semibold tracking-tight">
          <ArrowLeft className="w-4 h-4" /> Back to Market Report
        </button>

        <button
          onClick={handleSave}
          disabled={saved}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all",
            saved
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-not-allowed"
              : "bg-brand-primary text-black hover:bg-brand-primary/90"
          )}
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" />
              Saved
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Idea
            </>
          )}
        </button>
      </div>

      {showSavedMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl text-sm font-medium"
        >
          ✓ Idea saved! View it anytime from the <strong>Saved Ideas</strong> button in the top right.
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: Core Info */}
        <div className="lg:col-span-2 space-y-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {problem.type} Sector
              </span>
              <SeverityBadge score={problem.severity} />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-[1.1] mb-8">{problem.title}</h1>

            <div className="space-y-6">
              <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Problem Analysis</h2>
              <div className="grid gap-4">
                {problem.problemPoints.map((p, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/[0.01] border border-white/5">
                    <span className="text-brand-primary font-mono text-sm font-bold">0{i + 1}</span>
                    <p className="text-slate-300 text-sm leading-relaxed">{p}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <section className="bg-white/[0.02] border border-white/5 p-10 rounded-3xl space-y-8">
            <h2 className="text-xl font-bold text-white">Solution Architecture</h2>
            <div className="space-y-6">
              <p className="text-slate-400 leading-relaxed text-lg">{problem.solutionOverview}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block">Market Strategy</span>
                  <p className="text-sm text-slate-300 leading-relaxed">{problem.implementationStrategy}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block">Revenue Model</span>
                  <p className="text-sm text-slate-300 leading-relaxed">{problem.monetization}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-8">
            <h2 className="text-xl font-bold text-white">Minimum Viable Product</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {problem.mvpFeatures.map((f, i) => (
                <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.01] border border-white/5">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-primary shadow-[0_0_8px_rgba(0,136,204,0.4)]" />
                  <span className="text-sm text-slate-300 font-medium">{f}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right: Commercial Data */}
        <aside className="space-y-6">
          <div className="bg-gradient-to-br from-white/[0.03] to-white/[0.01] p-8 rounded-3xl border border-white/5 space-y-8">
            <h3 className="font-black text-slate-500 uppercase tracking-[0.2em] text-[10px]">Commercial Projections</h3>
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">Est. Monthly Rev</span>
                <span className="text-3xl font-bold text-white leading-none">{problem.estMonthlyRev}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">Est. Annual Rev</span>
                <span className="text-3xl font-bold text-brand-primary leading-none">{problem.estAnnualRev}</span>
              </div>
              <div className="pt-6 border-t border-white/5">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Market Verdict</span>
                <span className={cn("text-xs font-black px-3 py-1 rounded bg-white/5 inline-block", problem.profitabilityVerdict === "HIGHLY PROFITABLE" ? "text-emerald-400 border border-emerald-500/20" : "text-white border border-white/10")}>
                  {problem.profitabilityVerdict}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/[0.01] border border-white/5 p-8 rounded-3xl space-y-8">
            <h3 className="font-black text-slate-500 uppercase tracking-[0.2em] text-[10px]">Inertia & Friction</h3>
            <div className="space-y-6">
              <StatRow icon={<Clock className="w-4 h-4" />} label="Time to Profit" value={problem.timeToProfit} />
              <StatRow icon={<Rocket className="w-4 h-4" />} label="Market Competition" value={problem.competition} />
              <StatRow icon={<AlertCircle className="w-4 h-4" />} label="Operational Risk" value={problem.risk} />
              <StatRow icon={<Globe className="w-4 h-4" />} label="Global Scalability" value={problem.scalability} />
            </div>
          </div>
        </aside>
      </div>
    </motion.div>
  );
};

const StatRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3 text-slate-500">
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </div>
    <span className="text-xs font-bold text-slate-100">{value}</span>
  </div>
);

// --- Main App ---

export default function App() {
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [savedPanelOpen, setSavedPanelOpen] = useState(false);
  const [savedCount, setSavedCount] = useState(getSavedIdeas().length);

  const refreshSavedCount = () => setSavedCount(getSavedIdeas().length);

  const [suggestions, setSuggestions] = useState<{ name: string; display: string; type: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const abortRef = useRef<AbortController>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setLoadingSuggestions(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=6&addressdetails=1&accept-language=en`,
        { signal: abortRef.current.signal }
      );
      const data = await res.json();
      setSuggestions(
        data.map((r: any) => ({
          name: r.name || r.display_name.split(',')[0].trim(),
          display: r.display_name,
          type: r.type || r.class || 'place',
        }))
      );
    } catch {
      // aborted or network error — ignore
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  const handleLocationChange = (val: string) => {
    setLocation(val);
    setActiveSuggestion(-1);
    if (val.trim().length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    setShowSuggestions(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val.trim()), 350);
  };

  const handleSuggestionSelect = (name: string) => {
    setLocation(name);
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveSuggestion(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || !suggestions.length) {
      if (e.key === 'Enter') handleAnalyze();
      return;
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveSuggestion(p => Math.min(p + 1, suggestions.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveSuggestion(p => Math.max(p - 1, -1)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeSuggestion >= 0) handleSuggestionSelect(suggestions[activeSuggestion].name);
      else { setShowSuggestions(false); handleAnalyze(); }
    } else if (e.key === 'Escape') { setShowSuggestions(false); setActiveSuggestion(-1); }
  };

  React.useEffect(() => {

    const pushState = () => {
      window.history.pushState(
        { page: "problemfinder" },
        "",
        window.location.href
      );
    };

    // Push initial state
    pushState();

    const handlePopState = () => {

      const shouldLeave = window.confirm(
        "Are you sure you want to exit ProblemFinder AI?"
      );

      if (shouldLeave) {

        // Remove listener before going back
        window.removeEventListener("popstate", handlePopState);

        window.history.back();

      } else {

        // Keep user inside app
        pushState();
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };

  }, []);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedProblem, analysis]);

  const handleAnalyze = async () => {
    if (!location) return;
    setLoading(true);
    setError(null);
    setAnalysis(null);
    setSelectedProblem(null);
    try {
      const data = await analyzeLocation(location);
      setAnalysis(data);
    } catch (err: any) {
      setError(err.message || 'Market analysis unavailable. Please try a different location or check back soon.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewSavedIdea = (problem: Problem, loc: string) => {
    setSelectedProblem(problem);
    setSelectedLocation(loc);
    // Don't reset analysis so user can go back naturally
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-brand-primary/30">
      <Navbar savedCount={savedCount} onOpenSaved={() => setSavedPanelOpen(true)} />

      <AnimatePresence>
        {savedPanelOpen && (
          <SavedIdeasPanel
            onClose={() => { setSavedPanelOpen(false); refreshSavedCount(); }}
            onViewIdea={handleViewSavedIdea}
          />
        )}
      </AnimatePresence>

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {!analysis && !loading && !selectedProblem && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-primary" />
                Verified Market Intelligence
              </div>
              <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter leading-tight text-white">
                Find Real Problems.<br />
                <span className="text-brand-primary">Build Relentless Startups.</span>
              </h1>
              <p className="text-slate-400 text-xl max-w-3xl mb-14 leading-relaxed">
                ProblemFinder AI parses global market gaps, inefficiencies, and hidden pain points in any region on Earth. Build what people actually need.
              </p>

              <div className="w-full max-w-xl group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500" />
                <div className="relative flex items-center bg-[#090e1a] rounded-2xl border border-white/10">
                  <MapPin className="absolute left-6 w-5 h-5 text-brand-primary" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={location}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => { if (suggestions.length) setShowSuggestions(true); }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    placeholder="Search location (e.g. India, Japan, Berlin...)"
                    className="w-full pl-16 pr-32 py-5 rounded-2xl outline-none text-lg text-white bg-transparent"
                    autoComplete="off"
                  />
                  <button
                    onClick={handleAnalyze}
                    className="absolute right-2 bg-brand-primary text-black font-bold px-6 py-3 rounded-xl hover:bg-brand-primary/90 transition-all text-sm"
                  >
                    Analyze
                  </button>
                </div>

                {/* Autocomplete Dropdown */}
                {showSuggestions && (location.trim().length >= 2) && (
                  <div className="absolute top-[calc(100%+8px)] left-0 right-0 z-50 bg-[#0c1426] border border-white/8 rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
                    {loadingSuggestions && !suggestions.length ? (
                      <div className="flex items-center gap-3 px-5 py-4 text-slate-500 text-sm">
                        <div className="w-4 h-4 border-2 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
                        Searching locations…
                      </div>
                    ) : suggestions.length === 0 ? (
                      <div className="px-5 py-4 text-slate-500 text-sm">No locations found</div>
                    ) : (
                      <>
                        <div className="px-4 pt-3 pb-1 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Suggestions</div>
                        {suggestions.map((s, i) => (
                          <div
                            key={i}
                            onMouseDown={(e) => { e.preventDefault(); handleSuggestionSelect(s.name); }}
                            className={cn(
                              "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors",
                              i === activeSuggestion ? "bg-brand-primary/10" : "hover:bg-white/[0.04]"
                            )}
                          >
                            <div className="w-8 h-8 rounded-lg bg-brand-primary/10 border border-brand-primary/10 flex items-center justify-center shrink-0">
                              <MapPin className="w-3.5 h-3.5 text-brand-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-slate-200 truncate">{s.name}</div>
                              <div className="text-[11px] text-slate-500 truncate">{s.display.replace(s.name + ', ', '')}</div>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded shrink-0">
                              {s.type}
                            </span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {loading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-40">
              <div className="w-16 h-16 border-2 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mb-8" />
              <h2 className="text-xl font-bold mb-2">Reading Market Signals for {location}...</h2>
              <p className="text-slate-500 text-sm">Identifying pain points, inefficiency leaks, and ROI windows.</p>
            </motion.div>
          )}

          {analysis && !selectedProblem && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
              <header className="flex flex-col md:flex-row justify-between items-start border-b border-white/5 pb-10 gap-6">
                <div>
                  <button onClick={() => setAnalysis(null)} className="text-sm font-medium text-slate-500 hover:text-white mb-4 flex items-center gap-2 transition-colors">
                    <ChevronRight className="w-4 h-4 rotate-180" /> Change Location
                  </button>
                  <h1 className="text-4xl font-black text-white flex items-center gap-4">
                    <MapPin className="w-8 h-8 text-brand-primary" />
                    {location}
                  </h1>
                </div>
                <div className="flex gap-4">
                  <div className="bg-white/5 px-6 py-4 rounded-2xl border border-white/5 text-center min-w-[140px]">
                    <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Market Vibe</span>
                    <span className="text-lg font-bold text-brand-primary">{analysis.marketSummary.economicVibe}</span>
                  </div>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 glass p-8 rounded-3xl bg-brand-primary/5 border-brand-primary/10">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" /> Economic Intelligence
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed mb-6">{analysis.marketSummary.summary}</p>
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Hot Sectors</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.marketSummary.topSectors.map((s, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-slate-300">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {analysis.problems.map((prob, idx) => (
                    <ProblemCard key={idx} problem={prob} onClick={() => setSelectedProblem(prob)} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {selectedProblem && (
            <DetailView
              problem={selectedProblem}
              location={selectedLocation || location}
              onBack={() => setSelectedProblem(null)}
              onSave={refreshSavedCount}
            />
          )}
        </AnimatePresence>

        {error && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-sm glass border-red-500/30 p-6 rounded-2xl shadow-2xl flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
            <div>
              <h3 className="font-bold text-white mb-1">Analysis Error</h3>
              <p className="text-sm text-slate-400">{error}</p>
              <button onClick={() => setError(null)} className="mt-2 text-xs font-bold text-brand-primary">Dismiss</button>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-white/5 py-16 px-6 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-40">
            <Zap className="w-5 h-5 text-brand-primary" />
            <span className="font-bold text-sm">ProblemFinder AI © 2024</span>
          </div>
          <div className="flex gap-10 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Economic API</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Contact Intelligence</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
