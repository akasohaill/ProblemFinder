
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Zap, ChevronRight, BarChart3, Globe, AlertTriangle, ArrowLeft, Target, Wallet, Clock, Rocket, AlertCircle, ShieldCheck } from 'lucide-react';
import { cn } from './lib/utils';
import { analyzeLocation } from './services/geminiService';
import { AnalysisResponse, Problem } from './types';

// --- Components ---

const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030712]/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-between items-center">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
        <Zap className="w-5 h-5 text-black fill-black" />
      </div>
      <span className="font-bold text-xl tracking-tight text-white">ProblemFinder <span className="text-brand-primary">AI</span></span>
    </div>
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

const DetailView = ({ problem, onBack }: { problem: Problem, onBack: () => void }) => (
  <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} className="space-y-12">
    <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-semibold tracking-tight">
      <ArrowLeft className="w-4 h-4" /> Back to Market Report
    </button>

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
                  <span className="text-brand-primary font-mono text-sm font-bold">0{i+1}</span>
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
  const [error, setError] = useState<string | null>(null);

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
    } catch (err) {
      setError('Market analysis unavailable. Please try a different location or check back soon.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-brand-primary/30">
      <Navbar />

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
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
                <div className="relative flex items-center bg-[#090e1a] rounded-2xl border border-white/10">
                  <MapPin className="absolute left-6 w-5 h-5 text-brand-primary" />
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                    placeholder="Search location (e.g. India, Japan, Berlin...)"
                    className="w-full pl-16 pr-32 py-5 rounded-2xl outline-none text-lg text-white bg-transparent"
                  />
                  <button 
                    onClick={handleAnalyze}
                    className="absolute right-2 bg-brand-primary text-black font-bold px-6 py-3 rounded-xl hover:bg-brand-primary/90 transition-all text-sm"
                  >
                    Analyze
                  </button>
                </div>
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
            <DetailView problem={selectedProblem} onBack={() => setSelectedProblem(null)} />
          )}
        </AnimatePresence>

        {error && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-sm glass border-red-500/30 p-6 rounded-2xl shadow-2xl flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
            <div>
              <h3 className="font-bold text-white mb-1">Analysis Error</h3>
              <p className="text-sm text-slate-400">{error}</p>
              <button onClick={() => setError(null)} className="mt-2 text-xs font-bold text-brand-primary">Retry</button>
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
